import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);

    // Validate the Bearer token / session
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Unauthorized. Please log in.',
      }), { status: 401, headers: CORS });
    }

    // Fetch subscription for this user
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs?.find(s => ['active', 'trial'].includes(s.status)) || subs?.[0] || null;

    if (!activeSub) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No subscription found.',
      }), { status: 404, headers: CORS });
    }

    // Check expiry
    if (activeSub.renewal_date && new Date(activeSub.renewal_date) < new Date()) {
      await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, { status: 'expired' });
      return new Response(JSON.stringify({
        success: false,
        message: 'Subscription expired',
      }), { status: 403, headers: CORS });
    }

    const expiresAt = activeSub.renewal_date
      ? new Date(activeSub.renewal_date).toISOString().split('T')[0]
      : null;

    return new Response(JSON.stringify({
      success: true,
      subscription_status: activeSub.status,
      plan: activeSub.plan,
      expires_at: expiresAt,
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('[vpnSubscription] error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
    }), { status: 500, headers: CORS });
  }
});