import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getLicenseInfo — returns full license/device visibility for the authenticated user.
 * Used by Electron app to display subscription and device count in the dashboard.
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
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: CORS });
    }

    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs?.find(s => ACTIVE_STATUSES.includes(s.status)) || subs?.[0] || null;

    if (!activeSub) {
      return new Response(JSON.stringify({
        success: true,
        subscriptionActive: false,
        devices: [],
        message: 'No subscription found.',
      }), { status: 200, headers: CORS });
    }

    const allDevices = await base44.entities.LinkedDevice.filter({ subscription_id: activeSub.id });
    const activeDevices = allDevices.filter(d => d.status === 'active');

    return new Response(JSON.stringify({
      success: true,
      subscriptionActive: ACTIVE_STATUSES.includes(activeSub.status),
      subscription: {
        plan: activeSub.plan,
        status: activeSub.status,
        billing_cycle: activeSub.billing_cycle,
        start_date: activeSub.start_date,
        renewal_date: activeSub.renewal_date,
        max_devices: activeSub.max_devices,
        devices_used: activeDevices.length,
        devices_remaining: Math.max(0, (activeSub.max_devices || 1) - activeDevices.length),
      },
      devices: allDevices.map(d => ({
        id: d.id,
        device_name: d.device_name,
        device_type: d.device_type,
        device_id: d.device_id,
        status: d.status,
        last_connected: d.last_connected,
        ip_address: d.ip_address,
      })),
    }), { status: 200, headers: CORS });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: CORS });
  }
});