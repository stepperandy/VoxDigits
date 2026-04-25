import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }
    const subscription = subs[0];
    if (subscription.status !== 'active') {
      return Response.json({ error: 'Subscription is not active' }, { status: 403 });
    }

    // Get user's device(s) for credentials
    const devices = await base44.entities.LinkedDevice.filter({ subscription_id: subscription.id });
    const device = devices.find(d => d.status === 'active') || devices[0] || null;

    // Get all online servers
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });

    const serverList = servers.map(s => ({
      id: s.id,
      region: s.region,
      country: s.country,
      city: s.city,
      ip_address: s.ip_address,
      port: s.port || 51820,
      public_key: s.public_key,
      status: s.status,
      current_load: s.current_load || 0,
      active_connections: s.active_connections || 0,
      max_connections: s.max_connections || 1000,
      uptime_percentage: s.uptime_percentage || 99.9,
    }));

    return Response.json({
      servers: serverList,
      device: device ? {
        id: device.id,
        vpn_profile_key: device.vpn_profile_key,
        ip_address: device.ip_address,
        device_type: device.device_type,
      } : null,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error('getVpnServersForUser error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});