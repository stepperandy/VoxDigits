import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * validateSubscription — verify user has active subscription
 * Returns: { valid: boolean, plan, renewal_date, devices_used, max_devices }
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const ACTIVE_STATUSES = ['active', 'trial'];
const INACTIVE_REASONS = {
  expired: 'Your subscription has expired. Please renew at voxvpn.net.',
  cancelled: 'Your subscription has been cancelled.',
  paused: 'Your subscription is paused. Please contact support.',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ valid: false, error: 'Unauthorized' }), { status: 401, headers: CORS });
    }

    // Admin always has access
    if (user.role === 'admin') {
      return new Response(JSON.stringify({
        valid: true,
        plan: 'Admin',
        renewal_date: null,
        devices_used: 0,
        max_devices: 999,
      }), { status: 200, headers: CORS });
    }

    // Fetch all subscriptions for this user
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });

    const active = subs?.find(s => ACTIVE_STATUSES.includes(s.status));
    if (!active) {
      const blocked = subs?.find(s => INACTIVE_REASONS[s.status]);
      return new Response(JSON.stringify({
        valid: false,
        status: blocked?.status || 'none',
        error: blocked ? INACTIVE_REASONS[blocked.status] : 'No subscription found. Please purchase a plan at voxvpn.net.',
      }), { status: 403, headers: CORS });
    }

    // Count connected devices
    const devices = await base44.entities.LinkedDevice.filter({ subscription_id: active.id });
    const connectedCount = devices.filter(d => d.status === 'active').length;

    return new Response(JSON.stringify({
      valid: true,
      plan: active.plan,
      status: active.status,
      renewal_date: active.renewal_date,
      devices_used: connectedCount,
      max_devices: active.max_devices,
      billing_cycle: active.billing_cycle,
    }), { status: 200, headers: CORS });

  } catch (error) {
    return new Response(JSON.stringify({ valid: false, error: error.message }), { status: 500, headers: CORS });
  }
});