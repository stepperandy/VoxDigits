import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const PLAY_REVIEW_EMAIL = 'playreview@voxvpn.net';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401, headers: CORS });
    }

    // Only admins can provision the review account
    if (user.role !== 'admin') {
      return new Response(JSON.stringify({ success: false, message: 'Admin access required' }), { status: 403, headers: CORS });
    }

    // Find the playreview user
    const users = await base44.asServiceRole.entities.User.filter({ email: PLAY_REVIEW_EMAIL });

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: `User ${PLAY_REVIEW_EMAIL} not found. They must register first at /auth-signup.`,
      }), { status: 404, headers: CORS });
    }

    const reviewUser = users[0];

    // Set admin role and verified status
    await base44.asServiceRole.entities.User.update(reviewUser.id, {
      role: 'admin',
      is_verified: true,
      full_name: reviewUser.full_name || 'Google Play Review',
    });

    // Ensure they have an active subscription (bypass payment)
    const existingSubs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: PLAY_REVIEW_EMAIL });
    const activeSub = existingSubs?.find(s => ['active', 'trial'].includes(s.status));

    if (!activeSub) {
      await base44.asServiceRole.entities.VPNSubscription.create({
        user_email: PLAY_REVIEW_EMAIL,
        plan: 'Enterprise',
        status: 'active',
        billing_cycle: 'yearly',
        start_date: new Date().toISOString(),
        renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        max_devices: 10,
        price: 0,
        notes: 'Google Play review account — admin access, no payment required.',
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Account ${PLAY_REVIEW_EMAIL} provisioned with admin privileges and active subscription.`,
      user: { email: PLAY_REVIEW_EMAIL, role: 'admin', is_verified: true },
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('[setupPlayReviewAccount] error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
    }), { status: 500, headers: CORS });
  }
});