import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const APP_ID = Deno.env.get('BASE44_APP_ID');
const BASE44_API = 'https://base44.app/api';

async function passwordLogin(email, password) {
  const res = await fetch(`${BASE44_API}/apps/${APP_ID}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, data, text };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required.',
      }), { status: 400, headers: CORS });
    }

    // Step 1: Authenticate against Base44
    const attempt = await passwordLogin(email, password);

    if (!attempt.ok) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid login or inactive subscription',
      }), { status: 401, headers: CORS });
    }

    const token = attempt.data?.access_token || attempt.data?.token || null;
    const authUser = attempt.data?.user || null;
    const userEmail = authUser?.email || email;

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication failed. Please try again.',
      }), { status: 500, headers: CORS });
    }

    // Step 2: Check active subscription
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: userEmail });
    const activeSub = subs?.find(s => ['active', 'trial'].includes(s.status)) || null;

    if (!activeSub) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid login or inactive subscription',
      }), { status: 403, headers: CORS });
    }

    // Step 3: Check subscription expiry timer
    if (activeSub.renewal_date && new Date(activeSub.renewal_date) < new Date()) {
      await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, { status: 'expired' });
      return new Response(JSON.stringify({
        success: false,
        message: 'Subscription expired. Please renew at voxvpn.net.',
      }), { status: 403, headers: CORS });
    }

    const expiresAt = activeSub.renewal_date
      ? new Date(activeSub.renewal_date).toISOString().split('T')[0]
      : null;

    return new Response(JSON.stringify({
      success: true,
      token,
      email: userEmail,
      subscription_status: activeSub.status,
      plan: activeSub.plan,
      expires_at: expiresAt,
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('[vpnLogin] error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
    }), { status: 500, headers: CORS });
  }
});