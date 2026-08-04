import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function isWireGuardPublicKey(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]{43}=$/.test(value)) return false;
  try {
    return Uint8Array.from(atob(value), c => c.charCodeAt(0)).length === 32;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });

    const body = await req.json().catch(() => ({}));
    const { platform = 'ios', server_id = null, client_public_key } = body;

    if (String(platform).toLowerCase() !== 'ios') {
      return Response.json({ error: 'This endpoint supports the VoxVPN iOS app only' }, { status: 400, headers: CORS });
    }
    if (!isWireGuardPublicKey(client_public_key)) {
      return Response.json({ error: 'A valid WireGuard client public key is required' }, { status: 400, headers: CORS });
    }

    const appleEntitlements = await base44.asServiceRole.entities.AppleSubscriptionEntitlement.filter({
      user_email: user.email,
      status: 'active',
    });
    const activeApple = (appleEntitlements || []).find(item =>
      item.expires_at && new Date(item.expires_at).getTime() > Date.now()
    );

    const online = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    const eligible = (online || []).filter(s => s.api_token && s.ip_address && s.public_key);
    if (!eligible.length) {
      return Response.json({ error: 'No provisionable VPN servers are available' }, { status: 503, headers: CORS });
    }

    let server = server_id ? eligible.find(s => s.id === server_id) : null;
    if (!server) {
      server = eligible.reduce((best, candidate) => {
        const candidateLoad = (candidate.active_connections || 0) / (candidate.max_connections || 100);
        const bestLoad = (best.active_connections || 0) / (best.max_connections || 100);
        return candidateLoad < bestLoad ? candidate : best;
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let peerRes;
    try {
      peerRes = await fetch(`http://${server.ip_address}:3000/create-peer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${server.api_token}`,
        },
        body: JSON.stringify({ publicKey: client_public_key }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!peerRes.ok) {
      const detail = (await peerRes.text()).slice(0, 200);
      console.error('[vpnProvision] peer registration failed', peerRes.status, detail);
      return Response.json({ error: 'VPN server could not register this device' }, { status: 502, headers: CORS });
    }

    const peer = await peerRes.json();
    if (typeof peer?.ip !== 'string' || !/^\d{1,3}(\.\d{1,3}){3}$/.test(peer.ip)) {
      return Response.json({ error: 'VPN server returned an invalid tunnel address' }, { status: 502, headers: CORS });
    }

    await base44.asServiceRole.entities.VPNServer.update(server.id, {
      active_connections: (server.active_connections || 0) + 1,
    });

    return Response.json({
      success: true,
      access: {
        tier: activeApple ? 'premium' : 'free',
        status: 'active',
        product_id: activeApple?.product_id || null,
        expires_at: activeApple?.expires_at || null,
      },
      server: {
        id: server.id,
        name: `VoxVPN ${server.city || server.region || server.country || 'Server'}`,
        region: server.region || null,
        country: server.country || null,
      },
      tunnel: {
        address: `${peer.ip}/32`,
        dns: '1.1.1.1, 1.0.0.1',
        endpoint: `${server.ip_address}:${server.port || 51820}`,
        server_public_key: server.public_key,
        allowed_ips: '0.0.0.0/0, ::/0',
        persistent_keepalive: 25,
      },
    }, { headers: CORS });
  } catch (error) {
    const message = error?.name === 'AbortError'
      ? 'VPN server provisioning timed out'
      : 'Unable to provision the VPN tunnel';
    console.error('[vpnProvision]', error?.message || error);
    return Response.json({ error: message }, { status: 500, headers: CORS });
  }
});
