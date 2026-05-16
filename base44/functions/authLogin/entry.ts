import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required.',
        email: null,
        subscriptionActive: false,
      }), { status: 400, headers: corsHeaders });
    }

    // Authenticate using email + password via Base44 auth
    let token;
    try {
      const loginResult = await base44.auth.loginWithEmailPassword(email, password);
      token = loginResult?.token || loginResult?.access_token || null;
    } catch (authErr) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email or password.',
        email: null,
        subscriptionActive: false,
      }), { status: 401, headers: corsHeaders });
    }

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication failed. Please try again.',
        email: null,
        subscriptionActive: false,
      }), { status: 401, headers: corsHeaders });
    }

    // Re-initialize client with the returned token to fetch user data
    const authedBase44 = createClientFromRequest(
      new Request(req.url, {
        headers: { ...Object.fromEntries(req.headers), Authorization: `Bearer ${token}` },
      })
    );

    const user = await authedBase44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Could not retrieve user profile.',
        email: null,
        subscriptionActive: false,
      }), { status: 401, headers: corsHeaders });
    }

    // Check for an active VPN subscription
    const subs = await authedBase44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => ['active', 'trial'].includes(s.status)) || null;
    const subscriptionActive = !!activeSub;

    return new Response(JSON.stringify({
      success: true,
      message: subscriptionActive
        ? 'Login successful.'
        : 'Login successful, but no active subscription found.',
      email: user.email,
      name: user.full_name,
      subscriptionActive,
      token,
      subscription: activeSub ? {
        plan: activeSub.plan,
        status: activeSub.status,
        renewal_date: activeSub.renewal_date,
        max_devices: activeSub.max_devices,
      } : null,
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error: ' + error.message,
      email: null,
      subscriptionActive: false,
    }), { status: 500, headers: corsHeaders });
  }
});