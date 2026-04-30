import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Direct download URLs per platform — all OpenVPN based
const PLATFORM_DOWNLOADS = {
  windows: 'https://voxvpn.net/downloads/VoxVPN-Setup.exe',
  macos:   null, // served from ovpn config
  linux:   null,
  ios:     null,
  android: null,
  router:  null,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { platform = 'windows' } = body;

    // Check active subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    if (!subs || subs.length === 0 || subs[0].status !== 'active') {
      return Response.json({ error: 'No active subscription found' }, { status: 403 });
    }

    // Windows — redirect to direct .exe download
    if (platform === 'windows') {
      return Response.json({ directUrl: PLATFORM_DOWNLOADS.windows });
    }

    // For other platforms — serve an OpenVPN .ovpn config
    // Get best available server
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    if (!servers || servers.length === 0) {
      return Response.json({ error: 'No VPN servers available' }, { status: 503 });
    }

    const server = servers.reduce((best, s) => {
      const load = (s.active_connections || 0) / (s.max_connections || 1000);
      const bestLoad = (best.active_connections || 0) / (best.max_connections || 1000);
      return load < bestLoad ? s : best;
    });

    // Build OpenVPN .ovpn config (no WireGuard)
    const ovpnConfig = `client
dev tun
proto udp
remote ${server.ip_address} ${server.port || 1194}
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert client.crt
key client.key
cipher AES-256-CBC
auth SHA256
verb 3
# VoxVPN OpenVPN Config
# Server: ${server.region || server.city || 'VoxVPN'}
# Generated for: ${user.email}
`;

    const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
    const fileName = `VoxVPN-${platformLabel}.ovpn`;

    return new Response(ovpnConfig, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});