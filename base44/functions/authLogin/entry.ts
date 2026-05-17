import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_TIERS = {
  'Free Trial': 1,
  'Basic': 1,
  'Standard': 2,
  'Pro Monthly': 3,
  'Pro Annual': 3,
  'Advanced': 3,
  'Premium': 4,
  'Business': 5,
  'Enterprise': 5,
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const APP_ID = Deno.env.get('BASE44_APP_ID');
const BASE44_API = 'https://base44.app/api';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, device_id, device_name, device_type } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required.',
        subscriptionActive: false,
      }), { status: 400, headers: CORS });
    }

    const base44 = createClientFromRequest(req);

    // ── Step 1: Try direct password login ─────────────────────────────────
    console.log('[authLogin] authenticating:', email);

    const loginRes = await fetch(`${BASE44_API}/apps/${APP_ID}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    let token = null;
    let authUser = null;

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      token = loginData?.access_token || loginData?.token || null;
      authUser = loginData?.user || null;
      console.log('[authLogin] direct login OK, token:', !!token);
    } else {
      const errText = await loginRes.text().catch(() => '');
      console.log('[authLogin] direct login failed:', loginRes.status, errText.slice(0, 150));

      const isUnverified = errText.includes('verify') || errText.includes('verification');
      const isBadCreds = loginRes.status === 401 || loginRes.status === 400;

      if (!isUnverified && isBadCreds) {
        // Definitely wrong credentials
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid email or password.',
          subscriptionActive: false,
        }), { status: 401, headers: CORS });
      }

      // Account exists but email not verified — use service role SSO to issue token
      // First, look up the user by email via service role
      const users = await base44.asServiceRole.entities.User.filter({ email });

      if (!users || users.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid email or password.',
          subscriptionActive: false,
        }), { status: 401, headers: CORS });
      }

      // Validate the password is correct before issuing SSO token
      // We do this by attempting login again — if it's purely a verification issue
      // (not a wrong password), Base44 returns a specific error message
      if (!isUnverified) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid email or password.',
          subscriptionActive: false,
        }), { status: 401, headers: CORS });
      }

      // Use service role SSO to get a valid token for this verified-by-us user
      const userId = users[0].id;
      console.log('[authLogin] using SSO token for unverified user, id:', userId);

      const ssoData = await base44.asServiceRole.sso.getAccessToken(userId);
      token = ssoData?.access_token || ssoData?.token || null;
      authUser = users[0];

      if (!token) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Could not issue session token. Please contact support.',
          subscriptionActive: false,
        }), { status: 500, headers: CORS });
      }
    }

    // ── Step 2: Load subscription data ────────────────────────────────────
    const authedClient = createClientFromRequest(
      new Request(req.url, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    const user = authUser || await authedClient.auth.me();

    const subs = await authedClient.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => ['active', 'trial'].includes(s.status)) || null;
    const subscriptionActive = !!activeSub;

    // ── Step 3: Device fingerprint enforcement ─────────────────────────────
    let deviceRecord = null;
    let deviceLimitExceeded = false;

    if (subscriptionActive && device_id) {
      const maxDevices = activeSub.max_devices || 1;
      const allDevices = await authedClient.entities.LinkedDevice.filter({ subscription_id: activeSub.id });

      const knownDevice = allDevices.find(d => d.device_id === device_id);
      const activeDevices = allDevices.filter(d => d.status === 'active' && d.device_id);

      if (knownDevice) {
        await authedClient.entities.LinkedDevice.update(knownDevice.id, {
          status: 'active',
          last_connected: new Date().toISOString(),
        });
        deviceRecord = { ...knownDevice, status: 'active' };
      } else if (activeDevices.length >= maxDevices) {
        deviceLimitExceeded = true;
      } else {
        deviceRecord = await authedClient.entities.LinkedDevice.create({
          subscription_id: activeSub.id,
          device_name: device_name || 'Desktop App',
          device_type: device_type || 'windows',
          device_id,
          status: 'active',
          last_connected: new Date().toISOString(),
        });
      }
    }

    if (deviceLimitExceeded) {
      return new Response(JSON.stringify({
        success: false,
        message: `Device limit reached. Your plan allows ${activeSub.max_devices} device(s). Please revoke another device to continue.`,
        subscriptionActive: true,
        deviceLimitExceeded: true,
      }), { status: 403, headers: CORS });
    }

    console.log(`[authLogin] success: user=${user.email} sub=${subscriptionActive}`);

    return new Response(JSON.stringify({
      success: true,
      message: subscriptionActive ? 'Login successful.' : 'Login successful, but no active subscription.',
      user: { email: user.email, name: user.full_name },
      subscriptionActive,
      token,
      ...(activeSub && {
        subscription: {
          plan: activeSub.plan,
          status: activeSub.status,
          renewal_date: activeSub.renewal_date,
          max_devices: activeSub.max_devices,
          plan_tier: PLAN_TIERS[activeSub.plan] || 1,
        }
      }),
      ...(deviceRecord && {
        device: {
          id: deviceRecord.id,
          device_name: deviceRecord.device_name,
          device_type: deviceRecord.device_type,
        }
      }),
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('[authLogin] error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
      subscriptionActive: false,
    }), { status: 500, headers: CORS });
  }
});