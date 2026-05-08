import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Build a WireGuard .conf for a given device + server
function buildWireGuardConfig(device, server, vpnIp) {
  return `[Interface]
PrivateKey = ${device.vpn_profile_key || 'REPLACE_WITH_YOUR_PRIVATE_KEY'}
Address = ${vpnIp || device.ip_address || '10.8.0.2'}/32
DNS = 8.8.8.8, 1.1.1.1

[Peer]
PublicKey = ${server?.public_key || 'REPLACE_WITH_SERVER_PUBLIC_KEY'}
Endpoint = ${server?.ip_address || 'vpn.voxvpn.net'}:${server?.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;
}

// Build a simple OpenVPN .ovpn for fallback
function buildOpenVPNConfig(server, email) {
  return `client
dev tun
proto ${server?.proto || 'udp'}
remote ${server?.ip_address || 'vpn.voxvpn.net'} ${server?.port || 1194}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
redirect-gateway def1 bypass-dhcp
cipher AES-256-CBC
auth SHA256
verb 3
# VoxVPN | User: ${email}
# Generated: ${new Date().toISOString()}
auth-user-pass
# Use your VoxVPN email + password to authenticate.
${server?.ca_cert ? `\n<ca>\n${server.ca_cert.trim()}\n</ca>` : ''}
${server?.tls_auth_key ? `\n<tls-auth>\n${server.tls_auth_key.trim()}\n</tls-auth>\nkey-direction 1` : ''}
`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = body.token;

    if (!token) {
      return Response.json({ error: 'Missing token' }, { status: 400 });
    }

    // The token is the Stripe checkout session ID — look up the subscription by it
    const allSubs = await base44.asServiceRole.entities.VPNSubscription.list('-created_date', 500);
    const subscription = allSubs.find(s =>
      s.stripe_subscription_id === token || s.id === token
    );

    const email = subscription?.user_email || null;

    // Get servers
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    const server = servers?.length > 0
      ? servers.reduce((best, s) => {
          const load = (s.active_connections || 0) / (s.max_connections || 1000);
          const bestLoad = (best.active_connections || 0) / (best.max_connections || 1000);
          return load < bestLoad ? s : best;
        })
      : null;

    // Get user's linked devices if we have email
    let devices = [];
    if (email && subscription) {
      devices = await base44.asServiceRole.entities.LinkedDevice.filter({
        subscription_id: subscription.id,
      });
    }

    const PLATFORMS = [
      { os: 'windows', label: 'Windows', deviceType: 'windows' },
      { os: 'macos', label: 'macOS', deviceType: 'macos' },
      { os: 'linux', label: 'Linux', deviceType: 'linux' },
      { os: 'android', label: 'Android', deviceType: 'android' },
      { os: 'ios', label: 'iPhone/iPad', deviceType: 'ios' },
    ];

    const profiles = await Promise.all(PLATFORMS.map(async ({ os, label, deviceType }) => {
      // Find the user's device for this platform
      const device = devices.find(d => d.device_type === deviceType);

      // Build WireGuard config (device may be null)
      const wgConfig = buildWireGuardConfig(device || {}, server, device?.ip_address);
      const wgFile = new File([wgConfig], `VoxVPN-${label}.conf`, { type: 'text/plain' });

      let wgUrl = null;
      try {
        const upload = await base44.asServiceRole.integrations.Core.UploadFile({ file: wgFile });
        wgUrl = upload.file_url;
      } catch (_) { /* non-fatal */ }

      // Build OpenVPN config
      const ovpnConfig = buildOpenVPNConfig(server, email || 'user@voxvpn.net');
      const ovpnFile = new File([ovpnConfig], `VoxVPN-${label}.ovpn`, { type: 'text/plain' });

      let ovpnUrl = null;
      try {
        const upload = await base44.asServiceRole.integrations.Core.UploadFile({ file: ovpnFile });
        ovpnUrl = upload.file_url;
      } catch (_) { /* non-fatal */ }

      return {
        os,
        label,
        fileName: `VoxVPN-${label}.conf`,
        downloadUrl: wgUrl,         // WireGuard config (primary)
        ovpnUrl: ovpnUrl,           // OpenVPN config (secondary)
        serverName: server ? `${server.city || server.region} (${server.country || ''})` : 'VoxVPN Server',
        hasPersonalizedConfig: !!device?.vpn_profile_key,
      };
    }));

    return Response.json({
      email: email || 'user',
      orderId: token,
      plan: subscription?.plan || 'Basic',
      serverRegion: server ? `${server.city || server.region}, ${server.country || ''}` : 'Auto-selected',
      profiles,
    });

  } catch (error) {
    console.error('setupPortal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});