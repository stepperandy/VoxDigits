import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ─── Security constants ────────────────────────────────────────────────────
const CONFIG_TTL_HOURS  = 24;   // config comment expires after 24h (informational)
const MAX_DOWNLOADS_PER_HOUR = 10; // rate limit per user
const ACTIVE_STATUSES   = ['active', 'trial'];
const INACTIVE_STATUSES = ['expired', 'cancelled', 'paused'];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── HMAC signature (SHA-256) for config integrity ─────────────────────────
async function signConfig(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── .ovpn builder ────────────────────────────────────────────────────────
async function generateOvpn({ server, user, device, proto, signature, expiresAt }) {
  const ip    = server.ip_address;
  const port  = server.port || 1194;
  const label = server.city || server.region || 'VoxVPN';

  const hasClientCert = device?.client_cert && device?.vpn_profile_key;
  const hasCa         = !!server.ca_cert;
  const hasTlsAuth    = !!server.tls_auth_key;

  const lines = [
    `# ╔══════════════════════════════════════════════════════════════╗`,
    `# ║          VoxVPN Secure VPN — Official Configuration          ║`,
    `# ╚══════════════════════════════════════════════════════════════╝`,
    `#`,
    `# Server    : ${label} (${server.country || ''})`,
    `# User      : ${user.email}`,
    `# Device    : ${device?.device_name || 'Desktop App'} [${device?.device_id || 'unregistered'}]`,
    `# Proto     : ${proto.toUpperCase()}`,
    `# Generated : ${new Date().toISOString()}`,
    `# Expires   : ${expiresAt}`,
    `# Sig       : ${signature}`,
    `# Support   : https://voxvpn.net/contact`,
    `#`,
    `# WARNING: This configuration is issued to ${user.email} only.`,
    `# Do not share this file. Each user receives a unique config.`,
    `#`,
    `client`,
    `dev tun`,
    `proto ${proto}`,
    `remote ${ip} ${port}`,
    `resolv-retry infinite`,
    `nobind`,
    `persist-key`,
    `persist-tun`,
    `remote-cert-tls server`,
    `redirect-gateway def1 bypass-dhcp`,
    `cipher AES-256-GCM`,
    `auth SHA256`,
    `tls-version-min 1.2`,
    `compress lz4-v2`,
    `verb 3`,
    `keepalive 10 60`,
    `connect-retry 5 30`,
  ];

  // CA certificate (inline)
  if (hasCa) {
    lines.push(``, `<ca>`, server.ca_cert.trim(), `</ca>`);
  } else {
    lines.push(``, `# NOTE: No CA certificate on server record — add ca_cert to the VPNServer entity.`);
  }

  // Per-user client cert + key OR fall back to auth-user-pass
  if (hasClientCert) {
    lines.push(``, `<cert>`, device.client_cert.trim(), `</cert>`);
    lines.push(``, `<key>`, device.vpn_profile_key.trim(), `</key>`);
  } else {
    lines.push(``, `auth-user-pass`);
    lines.push(`# Enter your VoxVPN email and password when prompted.`);
  }

  // TLS auth / tls-crypt
  if (hasTlsAuth) {
    lines.push(``, `<tls-auth>`, server.tls_auth_key.trim(), `</tls-auth>`);
    lines.push(`key-direction 1`);
  }

  return lines.join('\n') + '\n';
}

// ─── Rate limit check ─────────────────────────────────────────────────────
function isRateLimited(device) {
  if (!device) return false;
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000; // 1 hour window
  const lastDownload = device.last_connected ? new Date(device.last_connected).getTime() : 0;
  // We track download_count in description field as a simple counter with timestamp
  // Format: "dl_count:N:timestamp"
  const desc = device.description || '';
  const match = desc.match(/dl_count:(\d+):(\d+)/);
  if (match) {
    const count = parseInt(match[1]);
    const windowTs = parseInt(match[2]);
    if (windowTs > windowStart && count >= MAX_DOWNLOADS_PER_HOUR) return true;
  }
  return false;
}

function buildRateLimitDesc(device) {
  const desc = device?.description || '';
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;
  const match = desc.match(/dl_count:(\d+):(\d+)/);
  let count = 1;
  if (match) {
    const prevCount = parseInt(match[1]);
    const prevTs    = parseInt(match[2]);
    count = prevTs > windowStart ? prevCount + 1 : 1;
  }
  // Replace or append the rate limit marker
  const marker = `dl_count:${count}:${now}`;
  return desc.replace(/dl_count:\d+:\d+/, marker).includes('dl_count')
    ? desc.replace(/dl_count:\d+:\d+/, marker)
    : (desc + (desc ? ' ' : '') + marker).trim();
}

// ─── Main handler ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
    }

    const body = await req.json().catch(() => ({}));
    const { platform = 'windows', server_id = null, proto = 'udp', device_id = null } = body;

    // ── 1. Subscription enforcement ─────────────────────────────────────
    let activeSub = null;
    if (user.role !== 'admin') {
      const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
      activeSub = subs?.find(s => ACTIVE_STATUSES.includes(s.status));
      if (!activeSub) {
        const blocked = subs?.find(s => INACTIVE_STATUSES.includes(s.status));
        return Response.json({
          error: blocked
            ? `Subscription is ${blocked.status}. Please renew at voxvpn.net.`
            : 'No active subscription found.',
        }, { status: 403, headers: CORS });
      }
    } else {
      const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
      activeSub = subs?.[0] || null;
    }

    // ── 2. Device fingerprint verification ──────────────────────────────
    let device = null;
    if (activeSub) {
      const allDevices = await base44.entities.LinkedDevice.filter({
        subscription_id: activeSub.id,
        status: 'active',
      });

      if (device_id) {
        device = allDevices.find(d => d.device_id === device_id) || null;
        if (!device) {
          return Response.json({
            error: 'Device not recognized. Please log in again to re-register this device.',
          }, { status: 403, headers: CORS });
        }
      } else {
        // Fallback: find device by platform type
        device = allDevices.find(d => d.device_type === platform) || allDevices[0] || null;
      }
    }

    // ── 3. Rate limiting ────────────────────────────────────────────────
    if (device && isRateLimited(device)) {
      return Response.json({
        error: `Config download limit reached (${MAX_DOWNLOADS_PER_HOUR}/hour). Please wait before downloading again.`,
      }, { status: 429, headers: CORS });
    }

    // ── 4. Server selection (by ID or lowest-load) ──────────────────────
    let server;
    if (server_id) {
      const results = await base44.asServiceRole.entities.VPNServer.filter({ id: server_id, status: 'online' });
      server = results?.[0];
    }
    if (!server) {
      const online = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
      if (!online?.length) {
        return Response.json({ error: 'No VPN servers available.' }, { status: 503, headers: CORS });
      }
      server = online.reduce((best, s) => {
        const load     = (s.active_connections || 0) / (s.max_connections || 1000);
        const bestLoad = (best.active_connections || 0) / (best.max_connections || 1000);
        return load < bestLoad ? s : best;
      });
    }

    // ── 5. Generate HMAC signature ──────────────────────────────────────
    const expiresAt  = new Date(Date.now() + CONFIG_TTL_HOURS * 3600 * 1000).toISOString();
    const sigPayload = `${user.email}|${server.ip_address}|${expiresAt}|${device?.device_id || 'none'}`;
    const appId      = Deno.env.get('BASE44_APP_ID') || 'voxvpn';
    const signature  = await signConfig(sigPayload, appId);

    // ── 6. Build the config ─────────────────────────────────────────────
    const ovpnContent = await generateOvpn({ server, user, device, proto, signature, expiresAt });

    // ── 7. Update device rate limit counter ─────────────────────────────
    if (device) {
      await base44.entities.LinkedDevice.update(device.id, {
        last_connected: new Date().toISOString(),
        description: buildRateLimitDesc(device),
      });
    }

    const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
    const serverLabel   = (server.city || server.region || 'Server').replace(/\s+/g, '-');
    const fileName      = `VoxVPN-${serverLabel}-${platformLabel}.ovpn`;

    return new Response(ovpnContent, {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': 'application/x-openvpn-profile',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Config-Expires': expiresAt,
        'X-Config-Signature': signature,
      },
    });

  } catch (error) {
    console.error('downloadVpnConfig error:', error.message);
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});