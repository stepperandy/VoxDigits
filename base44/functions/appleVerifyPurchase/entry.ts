import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const BUNDLE_ID = 'com.base69c84f61d5543b54fe26e1e5.app';
const PRODUCT_IDS = new Set([
  'com.voxvpn.mobile.premium.monthly',
  'com.voxvpn.mobile.premium.yearly',
]);

function base64Url(value: Uint8Array | string): string {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function decodeJwsPayload<T>(signedJws: string): T {
  const parts = signedJws.split('.');
  if (parts.length !== 3) throw new Error('Apple returned an invalid signed transaction.');
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1]))) as T;
}

function privateKeyBytes(pem: string): Uint8Array {
  const body = pem.replace(/\\n/g, '\n')
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  return decodeBase64Url(body.replace(/\+/g, '-').replace(/\//g, '_'));
}

async function createAppleApiToken(): Promise<string> {
  const issuerID = Deno.env.get('APPLE_APP_STORE_ISSUER_ID');
  const keyID = Deno.env.get('APPLE_APP_STORE_KEY_ID');
  const privateKey = Deno.env.get('APPLE_APP_STORE_PRIVATE_KEY');
  if (!issuerID || !keyID || !privateKey) {
    throw new Error('Apple App Store Server API credentials are not configured.');
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'ES256', kid: keyID, typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    iss: issuerID,
    iat: issuedAt,
    exp: issuedAt + 300,
    aud: 'appstoreconnect-v1',
    bid: BUNDLE_ID,
  }));
  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes(privateKey),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${base64Url(new Uint8Array(signature))}`;
}

async function fetchTransaction(transactionID: string, token: string) {
  const configuredEnvironment = Deno.env.get('APPLE_APP_STORE_ENVIRONMENT') || 'Production';
  const endpoints = configuredEnvironment === 'Sandbox'
    ? ['https://api.storekit-sandbox.itunes.apple.com']
    : ['https://api.storekit.itunes.apple.com', 'https://api.storekit-sandbox.itunes.apple.com'];

  for (const endpoint of endpoints) {
    const response = await fetch(`${endpoint}/inApps/v1/transactions/${encodeURIComponent(transactionID)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      return {
        environment: endpoint.includes('sandbox') ? 'Sandbox' : 'Production',
        payload: await response.json(),
      };
    }
    if (response.status !== 404) {
      const message = await response.text().catch(() => '');
      throw new Error(`Apple transaction lookup failed (${response.status}): ${message.slice(0, 180)}`);
    }
  }
  throw new Error('Apple transaction was not found.');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS });

    const body = await req.json().catch(() => ({}));
    const transactionID = String(body.transaction_id || '');
    const productID = String(body.product_id || '');
    const appAccountToken = String(body.app_account_token || '').toLowerCase();
    if (!transactionID || !PRODUCT_IDS.has(productID) || !/^[0-9a-f-]{36}$/.test(appAccountToken)) {
      return new Response(JSON.stringify({ error: 'Invalid Apple purchase data.' }), { status: 400, headers: CORS });
    }

    const appleToken = await createAppleApiToken();
    const lookup = await fetchTransaction(transactionID, appleToken);
    const signedTransaction = lookup.payload?.signedTransactionInfo;
    if (typeof signedTransaction !== 'string') throw new Error('Apple did not return signed transaction information.');

    const transaction = decodeJwsPayload<{
      transactionId?: string;
      originalTransactionId?: string;
      bundleId?: string;
      productId?: string;
      appAccountToken?: string;
      expiresDate?: number;
      revocationDate?: number;
      environment?: string;
    }>(signedTransaction);

    if (
      transaction.transactionId !== transactionID ||
      transaction.bundleId !== BUNDLE_ID ||
      transaction.productId !== productID ||
      transaction.appAccountToken?.toLowerCase() !== appAccountToken
    ) {
      return new Response(JSON.stringify({ error: 'Apple transaction does not match this account or app.' }), { status: 403, headers: CORS });
    }

    const expiresAt = transaction.expiresDate ? new Date(transaction.expiresDate) : null;
    const active = !transaction.revocationDate && !!expiresAt && expiresAt.getTime() > Date.now();
    const originalTransactionID = transaction.originalTransactionId || transaction.transactionId || transactionID;
    const entitlementData = {
      user_email: user.email,
      original_transaction_id: originalTransactionID,
      product_id: productID,
      app_account_token: appAccountToken,
      status: active ? 'active' : (transaction.revocationDate ? 'revoked' : 'expired'),
      expires_at: (expiresAt || new Date(0)).toISOString(),
      environment: transaction.environment || lookup.environment,
      last_verified_at: new Date().toISOString(),
    };

    const existing = await base44.asServiceRole.entities.AppleSubscriptionEntitlement.filter({
      original_transaction_id: originalTransactionID,
    });
    if (existing?.[0]?.id) {
      await base44.asServiceRole.entities.AppleSubscriptionEntitlement.update(existing[0].id, entitlementData);
    } else {
      await base44.asServiceRole.entities.AppleSubscriptionEntitlement.create(entitlementData);
    }

    return new Response(JSON.stringify({
      success: true,
      active,
      product_id: productID,
      expires_date: entitlementData.expires_at,
    }), { status: 200, headers: CORS });
  } catch (error) {
    console.error('[appleVerifyPurchase] error:', error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || 'Apple purchase verification failed.' }), { status: 502, headers: CORS });
  }
});

