import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify active subscription (admins bypass)
    if (user.role !== 'admin') {
      const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
      const active = subs?.find(s => s.status === 'active');
      if (!active) {
        return Response.json({ error: 'No active subscription found' }, { status: 403 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const { server_id = null } = body;

    // Pick server — by ID if provided, otherwise lowest-load online server
    let server;
    if (server_id) {
      const results = await base44.asServiceRole.entities.VPNServer.filter({ id: server_id, status: 'online' });
      server = results?.[0];
    }

    if (!server) {
      const online = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
      if (!online || online.length === 0) {
        return Response.json({ error: 'No VPN servers available' }, { status: 503 });
      }
      server = online.reduce((best, s) => {
        const load = (s.active_connections || 0) / (s.max_connections || 1000);
        const bestLoad = (best.active_connections || 0) / (best.max_connections || 1000);
        return load < bestLoad ? s : best;
      });
    }

    // Get user's linked device for private key
    let privateKey = null;
    let clientAddress = '10.8.0.2/32';

    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    if (subs?.length > 0) {
      const devices = await base44.entities.LinkedDevice.filter({
        subscription_id: subs[0].id,
        device_type: 'android',
        status: 'active',
      });
      const device = devices?.[0];
      if (device?.vpn_profile_key) {
        privateKey = device.vpn_profile_key;
      }
      if (device?.ip_address) {
        clientAddress = device.ip_address.includes('/') ? device.ip_address : `${device.ip_address}/32`;
      }
    }

    if (!privateKey) {
      return Response.json({ error: 'No WireGuard profile found for this device. Please contact support.' }, { status: 404 });
    }

    const port = server.port || 51820;
    const endpoint = `${server.ip_address}:${port}`;
    const serverPublicKey = server.public_key || '';
    const dns = '1.1.1.1, 1.0.0.1';

    // Return structured WireGuard config
    return Response.json({
      success: true,
      server: {
        id: server.id,
        region: server.region,
        country: server.country,
        city: server.city,
      },
      wireguard: {
        privateKey,
        address: clientAddress,
        dns,
        endpoint,
        publicKey: serverPublicKey,
        allowedIPs: '0.0.0.0/0, ::/0',
        persistentKeepalive: 25,
      },
      // Also provide as a ready-to-use .conf string
      config: [
        '[Interface]',
        `PrivateKey = ${privateKey}`,
        `Address = ${clientAddress}`,
        `DNS = ${dns}`,
        '',
        '[Peer]',
        `PublicKey = ${serverPublicKey}`,
        `Endpoint = ${endpoint}`,
        'AllowedIPs = 0.0.0.0/0, ::/0',
        'PersistentKeepalive = 25',
      ].join('\n'),
    });

  } catch (error) {
    console.error('getWireguardConfig error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});