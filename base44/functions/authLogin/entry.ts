import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Plans that unlock premium/all servers
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

    // ── Step 1: Authenticate directly against Base44 REST auth API ─────────
    // This works server-side (no browser/localStorage needed)
    let token = null;
    let authUser = null;

    console.log('[authLogin] calling login API for:', email, 'appId:', APP_ID);
    let loginRes;
    try {
      loginRes = await fetch(`${BASE44_API}/apps/${APP_ID}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID,
        },
        body: JSON.stringify({ email, password }),
      });
    } catch (fetchErr) {
      console.error('[authLogin] fetch error:', fetchErr.message);
      throw new Error('Auth API unreachable: ' + fetchErr.message);
    }

    console.log('[authLogin] login API status:', loginRes.status);

    if (!loginRes.ok) {
      const errBody = await loginRes.text().catch(() => '');
      console.log('[authLogin] login failed body:', errBody.slice(0, 200));
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email or password.',
        subscriptionActive: false,
      }), { status: 401, headers: CORS });
    }

    const loginData = await loginRes.json();
    token = loginData?.access_token || loginData?.token || null;
    authUser = loginData?.user || null;

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication failed — no token returned.',
        subscriptionActive: false,
      }), { status: 401, headers: CORS });
    }

    // ── Step 2: Load full user profile using the obtained token ────────────
    const authedClient = createClientFromRequest(
      new Request(req.url, {
        headers: { ...Object.fromEntries(req.headers), Authorization: `Bearer ${token}` },
      })
    );

    const user = authUser || await authedClient.auth.me();

    // ── Step 3: Check subscription ─────────────────────────────────────────
    const subs = await authedClient.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => ['active', 'trial'].includes(s.status)) || null;
    const subscriptionActive = !!activeSub;

    // ── Step 4: Device fingerprint enforcement ─────────────────────────────
    let deviceRecord = null;
    let deviceLimitExceeded = false;

    if (subscriptionActive && device_id) {
      const maxDevices = activeSub.max_devices || 1;

      // Fetch ALL devices for this subscription (active + inactive) to find known device
      const allDevices = await authedClient.entities.LinkedDevice.filter({
        subscription_id: activeSub.id,
      });

      const knownDevice = allDevices.find(d => d.device_id === device_id);
      const activeDevices = allDevices.filter(d => d.status === 'active' && d.device_id);

      if (knownDevice) {
        // Returning device — mark active and update timestamp
        await authedClient.entities.LinkedDevice.update(knownDevice.id, {
          status: 'active',
          last_connected: new Date().toISOString(),
        });
        deviceRecord = { ...knownDevice, status: 'active' };
      } else if (activeDevices.length >= maxDevices) {
        deviceLimitExceeded = true;
      } else {
        // New device — register it
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

    console.log(`[authLogin] success: user=${user.email} sub=${subscriptionActive} device=${device_id || 'none'}`);

    return new Response(JSON.stringify({
      success: true,
      message: subscriptionActive ? 'Login successful.' : 'Login successful, but no active subscription.',
      user: {
        email: user.email,
        name: user.full_name,
      },
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