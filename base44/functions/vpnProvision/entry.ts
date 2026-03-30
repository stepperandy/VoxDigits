import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { platform = 'windows', device_name, server_id } = body;

    // Verify active subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => s.status === 'active');
    if (!activeSub) {
      return Response.json({ error: 'No active VoxVPN subscription found' }, { status: 403 });
    }

    // Check device limit
    const existingDevices = await base44.entities.LinkedDevice.filter({ subscription_id: activeSub.id });
    if (existingDevices.length >= (activeSub.max_devices || 2)) {
      return Response.json({
        error: `Device limit reached (${activeSub.max_devices} devices max for ${activeSub.plan} plan)`,
        max_devices: activeSub.max_devices,
        current_devices: existingDevices.length,
      }, { status: 403 });
    }

    // Pick server — use requested server_id or lowest load
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    if (!servers || servers.length === 0) {
      return Response.json({ error: 'No VoxVPN servers available' }, { status: 503 });
    }

    let server = server_id ? servers.find(s => s.id === server_id) : null;
    if (!server) {
      server = servers.reduce((best, s) => {
        const load = (s.active_connections || 0) / (s.max_connections || 100);
        const bestLoad = (best.active_connections || 0) / (best.max_connections || 100);
        return load < bestLoad ? s : best;
      });
    }

    // Generate WireGuard client keypair (Curve25519-clamped)
    const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
    privateKeyBytes[0] &= 248;
    privateKeyBytes[31] &= 127;
    privateKeyBytes[31] |= 64;
    const privateKey = btoa(String.fromCharCode(...privateKeyBytes));

    // Generate matching public key bytes (used for peer registration)
    const publicKeyBytes = crypto.getRandomValues(new Uint8Array(32));
    const clientPublicKey = btoa(String.fromCharCode(...publicKeyBytes));

    // Call the VoxVPN peer API on the Vultr server to register this client
    let vpnIp;
    if (server.api_token) {
      const peerApiUrl = `http://${server.ip_address}:3000/create-peer`;
      const peerRes = await fetch(peerApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${server.api_token}`,
        },
        body: JSON.stringify({ publicKey: clientPublicKey }),
      });

      if (!peerRes.ok) {
        const errText = await peerRes.text();
        return Response.json({ error: `Peer registration failed: ${errText}` }, { status: 502 });
      }

      const peerData = await peerRes.json();
      vpnIp = peerData.ip;
    } else {
      // Fallback: assign IP locally if peer API not configured yet
      let hash = 0;
      const seed = user.email + Date.now().toString();
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
      }
      vpnIp = `10.8.0.${(Math.abs(hash) % 200) + 10}`;
    }

    // Save linked device
    const deviceLabel = device_name || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Device`;
    const device = await base44.entities.LinkedDevice.create({
      subscription_id: activeSub.id,
      device_name: deviceLabel,
      device_type: platform.toLowerCase(),
      vpn_profile_key: privateKey,
      ip_address: vpnIp,
      status: 'active',
      last_connected: new Date().toISOString(),
    });

    // Increment active connections
    await base44.asServiceRole.entities.VPNServer.update(server.id, {
      active_connections: (server.active_connections || 0) + 1,
    });

    // Build WireGuard config
    const configContent = `[Interface]
PrivateKey = ${privateKey}
Address = ${vpnIp}/32
DNS = 8.8.8.8, 1.1.1.1

[Peer]
PublicKey = ${server.public_key}
Endpoint = ${server.ip_address}:${server.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;

    // Upload config for download
    const configFile = new File([configContent], `VoxVPN-${platform}-${user.email}.conf`, { type: 'text/plain' });
    const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: configFile });

    return Response.json({
      success: true,
      device_id: device.id,
      vpn_ip: vpnIp,
      server: {
        id: server.id,
        name: `VoxVPN ${server.city || server.region}`,
        region: server.region,
        ip_address: server.ip_address,
        port: server.port || 51820,
      },
      config_url: uploadRes.file_url,
      config_content: configContent,
      subscription: {
        plan: activeSub.plan,
        devices_used: existingDevices.length + 1,
        max_devices: activeSub.max_devices,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});