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

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, device_id, device_name, device_type } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required.',
        subscriptionActive: false,
      }), { status: 400, headers: corsHeaders });
    }

    // Step 1: Authenticate with Base44
    const base44 = createClientFromRequest(req);
    let token;
    try {
      const result = await base44.auth.loginWithEmailPassword(email, password);
      token = result?.token || result?.access_token || null;
    } catch {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email or password.',
        subscriptionActive: false,
      }), { status: 401, headers: corsHeaders });
    }

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication failed.',
        subscriptionActive: false,
      }), { status: 401, headers: corsHeaders });
    }

    // Step 2: Load user profile
    const authedClient = createClientFromRequest(
      new Request(req.url, {
        headers: { ...Object.fromEntries(req.headers), Authorization: `Bearer ${token}` },
      })
    );
    const user = await authedClient.auth.me();

    // Step 3: Check subscription
    const subs = await authedClient.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => ['active', 'trial'].includes(s.status)) || null;
    const subscriptionActive = !!activeSub;

    // Step 4: Device fingerprint enforcement (only if subscription active and device_id provided)
    let deviceRecord = null;
    let deviceLimitExceeded = false;

    if (subscriptionActive && device_id) {
      const maxDevices = activeSub.max_devices || 1;
      const existingDevices = await authedClient.entities.LinkedDevice.filter({
        subscription_id: activeSub.id,
        status: 'active',
      });

      // Check if this device is already registered
      const knownDevice = existingDevices.find(d => d.device_id === device_id);

      if (knownDevice) {
        // Update last_connected
        await authedClient.entities.LinkedDevice.update(knownDevice.id, {
          last_connected: new Date().toISOString(),
        });
        deviceRecord = knownDevice;
      } else if (existingDevices.length >= maxDevices) {
        deviceLimitExceeded = true;
      } else {
        // Register new device
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
      }), { status: 403, headers: corsHeaders });
    }

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
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
      subscriptionActive: false,
    }), { status: 500, headers: corsHeaders });
  }
});