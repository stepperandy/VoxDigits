import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { serverId, platform } = body;

    if (!serverId) {
      return Response.json({ error: 'serverId is required' }, { status: 400 });
    }

    // Verify subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    if (!subs || subs.length === 0) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }
    const subscription = subs[0];
    if (subscription.status !== 'active') {
      return Response.json({ error: 'Subscription is not active' }, { status: 403 });
    }

    // Get user's device credentials
    const devices = await base44.entities.LinkedDevice.filter({ subscription_id: subscription.id });
    let device = devices.find(d => d.device_type === (platform || '').toLowerCase() && d.status === 'active')
      || devices.find(d => d.status === 'active')
      || devices[0];

    // If no device exists, provision one
    if (!device) {
      const provisionRes = await base44.functions.invoke('provisionVpnUser', {
        email: user.email,
        platform: platform || 'windows',
        deviceName: `${platform || 'Windows'} Device`,
      });
      if (provisionRes.data?.configContent) {
        return new Response(provisionRes.data.configContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="VoxVPN.conf"`,
          },
        });
      }
      return Response.json({ error: 'Failed to provision VPN profile' }, { status: 500 });
    }

    // Get the specific server
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    const server = servers.find(s => s.id === serverId);

    if (!server) {
      return Response.json({ error: 'Server not found or offline' }, { status: 404 });
    }

    const configContent = `[Interface]
PrivateKey = ${device.vpn_profile_key}
Address = ${device.ip_address}/32
DNS = 1.1.1.1, 8.8.8.8

[Peer]
# VoxVPN Server — ${server.region} (${server.city || server.country})
PublicKey = ${server.public_key}
Endpoint = ${server.ip_address}:${server.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;

    const serverLabel = (server.city || server.region || 'Server').replace(/\s+/g, '-');
    const fileName = `VoxVPN-${serverLabel}.conf`;

    await base44.entities.LinkedDevice.update(device.id, {
      last_connected: new Date().toISOString(),
    });

    return new Response(configContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('downloadVpnConfigForServer error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});