import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * connectionStats — get user's connection history and statistics
 * Returns: { connections: [], total_data_gb, avg_uptime, last_connected }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    if (!subs || subs.length === 0) {
      return Response.json({ connections: [], total_data_gb: 0, last_connected: null });
    }

    const sub = subs[0];

    // Get linked devices (represents connections)
    const devices = await base44.entities.LinkedDevice.filter({ subscription_id: sub.id });

    return Response.json({
      subscription_plan: sub.plan,
      max_devices: sub.max_devices,
      connected_devices: devices.filter(d => d.status === 'active').length,
      devices: devices.map(d => ({
        id: d.id,
        name: d.device_name,
        type: d.device_type,
        status: d.status,
        last_connected: d.last_connected,
        ip_address: d.ip_address,
      })),
      total_devices: devices.length,
    });
  } catch (error) {
    console.error('connectionStats error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});