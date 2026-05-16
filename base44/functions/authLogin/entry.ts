import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    const { email, password } = await req.json().catch(() => ({}));

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

    // Step 2: Fetch user profile using the returned token
    const authedClient = createClientFromRequest(
      new Request(req.url, {
        headers: { ...Object.fromEntries(req.headers), Authorization: `Bearer ${token}` },
      })
    );
    const user = await authedClient.auth.me();

    // Step 3: Check for active VPN subscription
    const subs = await authedClient.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => ['active', 'trial'].includes(s.status)) || null;
    const subscriptionActive = !!activeSub;

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