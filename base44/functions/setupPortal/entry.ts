import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * OpenVPN — one .ovpn with ALL servers listed as `remote` directives.
 * The OpenVPN GUI lets the user right-click → "Select Server" to pick one,
 * or it auto-connects to the first reachable one.
 */
function buildOpenVPNConfig(servers, user, device) {
  const remoteLines = servers.map(s =>
    `remote ${s.ip_address} ${s.port || 1194} ${s.proto || 'udp'}  # ${s.city || s.region || 'Server'}, ${s.country || ''}`
  ).join('\n');

  const hasClientCert = device?.client_cert && device?.vpn_profile_key;
  const firstServer = servers[0] || {};

  return `# ╔══════════════════════════════════════════════════════════╗
# ║        VoxVPN — All-Servers OpenVPN Config                ║
# ║        Import into OpenVPN Connect / Tunnelblick / etc.   ║
# ║        Switch servers via the app's server list.          ║
# ╚══════════════════════════════════════════════════════════╝
# User: ${user.email}
# Generated: ${new Date().toISOString()}
# Servers included: ${servers.length}

client
dev tun
proto ${firstServer.proto || 'udp'}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
redirect-gateway def1 bypass-dhcp
cipher AES-256-CBC
auth SHA256
verb 3
keepalive 10 60

# ── Server List (${servers.length} locations) ──────────────────────
# OpenVPN connects to the first available server.
# To force a specific server, move it to the top or remove others.
${remoteLines}

${hasClientCert
  ? `<cert>\n${device.client_cert.trim()}\n</cert>\n\n<key>\n${device.vpn_profile_key.trim()}\n</key>`
  : `auth-user-pass\n# Log in with your VoxVPN email and password.`
}
${firstServer.ca_cert ? `\n<ca>\n${firstServer.ca_cert.trim()}\n</ca>` : ''}
${firstServer.tls_auth_key ? `\n<tls-auth>\n${firstServer.tls_auth_key.trim()}\n</tls-auth>\nkey-direction 1` : ''}
`;
}

/**
 * WireGuard — a shell/batch script that writes individual .conf files
 * for each server and lets the user activate whichever one they want
 * via the WireGuard app's tunnel list.
 * On Windows: a .bat that creates each tunnel file in the WireGuard config dir.
 * On other platforms: a .sh that does the same via wg-quick.
 *
 * The WireGuard app lists all imported tunnels and the user clicks to connect.
 */
function buildWireGuardBundle(servers, device, platform) {
  const privateKey = device?.vpn_profile_key || 'PASTE_YOUR_PRIVATE_KEY_HERE';
  const vpnIp = device?.ip_address || '10.8.0.2';

  if (platform === 'windows') {
    const blocks = servers.map((s, i) => {
      const label = (s.city || s.region || `Server${i + 1}`).replace(/[^a-zA-Z0-9]/g, '-');
      const conf = [
        `[Interface]`,
        `PrivateKey = ${privateKey}`,
        `Address = ${vpnIp}/32`,
        `DNS = 8.8.8.8, 1.1.1.1`,
        ``,
        `[Peer]`,
        `PublicKey = ${s.public_key || 'SERVER_PUBLIC_KEY'}`,
        `Endpoint = ${s.ip_address}:${s.port || 51820}`,
        `AllowedIPs = 0.0.0.0/0, ::/0`,
        `PersistentKeepalive = 25`,
      ].join('\r\n');
      return `echo Creating tunnel: VoxVPN-${label}
(
${conf.split('\n').map(l => `echo ${l}`).join('\n')}
) > "%APPDATA%\\WireGuard\\Configurations\\VoxVPN-${label}.conf"`;
    }).join('\n\n');

    return `@echo off
:: VoxVPN WireGuard — All Servers Setup (Windows)
:: Run as Administrator. This creates one tunnel per server in WireGuard.
:: Open WireGuard app → click any VoxVPN tunnel → Activate.
echo.
echo ====================================================
echo  VoxVPN WireGuard — Installing ${servers.length} Server Tunnels
echo ====================================================
echo.

if not exist "%APPDATA%\\WireGuard\\Configurations" mkdir "%APPDATA%\\WireGuard\\Configurations"

${blocks}

echo.
echo Done! Open WireGuard and pick any VoxVPN server to connect.
pause
`;
  }

  // Linux / macOS / Android / iOS — produce a zip-comment .conf guide
  // Best approach: one .conf per server, bundled in a shell script that
  // creates all of them so users can import each into the WireGuard app.
  const blocks = servers.map((s, i) => {
    const label = (s.city || s.region || `Server${i + 1}`).replace(/[^a-zA-Z0-9]/g, '-');
    return `
# ── ${s.city || s.region}, ${s.country || ''} ────────────────────────────
cat > ~/VoxVPN-${label}.conf << 'CONF'
[Interface]
PrivateKey = ${privateKey}
Address = ${vpnIp}/32
DNS = 8.8.8.8, 1.1.1.1

[Peer]
PublicKey = ${s.public_key || 'SERVER_PUBLIC_KEY'}
Endpoint = ${s.ip_address}:${s.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
CONF`;
  }).join('\n');

  return `#!/bin/bash
# VoxVPN WireGuard — All Servers Setup
# Run this script once. It creates one .conf per server in your home directory.
# Then import each into your WireGuard app or use: wg-quick up ~/VoxVPN-<City>.conf
# ======================================================
echo "VoxVPN: Creating ${servers.length} WireGuard tunnel configs..."
${blocks}

echo ""
echo "Done! Import any VoxVPN-*.conf into WireGuard to connect."
`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { token, platform, proto } = body;

    if (!token) {
      return Response.json({ error: 'Missing token' }, { status: 400 });
    }

    // Resolve subscription
    const allSubs = await base44.asServiceRole.entities.VPNSubscription.list('-created_date', 500);
    const subscription = allSubs.find(s =>
      s.stripe_subscription_id === token || s.id === token
    );
    const email = subscription?.user_email || 'user@voxvpn.net';
    const user = { email };

    // Get all online servers
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    if (!servers || servers.length === 0) {
      return Response.json({ error: 'No VPN servers available' }, { status: 503 });
    }

    // If platform + proto provided → generate and return the all-servers config
    if (platform && proto) {
      // Find user's linked device for personalized keys
      let device = null;
      if (subscription) {
        const devices = await base44.asServiceRole.entities.LinkedDevice.filter({
          subscription_id: subscription.id,
          device_type: platform.toLowerCase(),
          status: 'active',
        });
        device = devices?.[0] || null;
      }

      let fileContent, fileName, mimeType;

      if (proto === 'openvpn') {
        fileContent = buildOpenVPNConfig(servers, user, device);
        fileName = `VoxVPN-AllServers-${platform}.ovpn`;
        mimeType = 'application/x-openvpn-profile';
      } else {
        // wireguard
        fileContent = buildWireGuardBundle(servers, device, platform);
        const ext = platform === 'windows' ? 'bat' : 'sh';
        fileName = `VoxVPN-AllServers-${platform}.${ext}`;
        mimeType = 'text/plain';
      }

      const file = new File([fileContent], fileName, { type: mimeType });
      const upload = await base44.asServiceRole.integrations.Core.UploadFile({ file });

      return Response.json({
        url: upload.file_url,
        fileName,
        serverCount: servers.length,
      });
    }

    // No platform/proto → return server summary for info display only
    return Response.json({
      email,
      plan: subscription?.plan || 'Basic',
      serverCount: servers.length,
      servers: servers.map(s => ({
        name: s.city || s.region,
        country: s.country || '',
        load: s.current_load || Math.round((s.active_connections || 0) / (s.max_connections || 100) * 100),
      })),
    });

  } catch (error) {
    console.error('setupPortal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});