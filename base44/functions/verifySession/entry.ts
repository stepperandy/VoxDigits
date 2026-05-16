import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * verifySession — called by the Electron app on launch to validate a stored token.
 * Returns whether the session is still valid and subscription is active.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const ACTIVE_STATUSES = ['active', 'trial'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({
        valid: false,
        reason: 'token_expired',
        message: 'Session expired. Please log in again.',
      }), { status: 401, headers: CORS });
    }

    // Admin bypass
    if (user.role === 'admin') {
      return new Response(JSON.stringify({
        valid: true,
        subscriptionActive: true,
        user: { email: user.email, name: user.full_name },
        plan: 'Admin',
      }), { status: 200, headers: CORS });
    }

    // Check subscription status
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs?.find(s => ACTIVE_STATUSES.includes(s.status)) || null;

    if (!activeSub) {
      const blocked = subs?.find(s => ['expired', 'cancelled', 'paused'].includes(s.status));
      return new Response(JSON.stringify({
        valid: true,           // token is valid
        subscriptionActive: false,
        reason: blocked?.status || 'no_subscription',
        message: blocked
          ? `Subscription is ${blocked.status}. Please renew at voxvpn.net.`
          : 'No subscription found.',
      }), { status: 200, headers: CORS });
    }

    // Count active devices
    const devices = await base44.entities.LinkedDevice.filter({
      subscription_id: activeSub.id,
      status: 'active',
    });

    return new Response(JSON.stringify({
      valid: true,
      subscriptionActive: true,
      user: { email: user.email, name: user.full_name },
      subscription: {
        plan: activeSub.plan,
        status: activeSub.status,
        renewal_date: activeSub.renewal_date,
        max_devices: activeSub.max_devices,
        devices_used: devices.length,
      },
    }), { status: 200, headers: CORS });

  } catch (error) {
    return new Response(JSON.stringify({
      valid: false,
      reason: 'server_error',
      message: error.message,
    }), { status: 500, headers: CORS });
  }
});