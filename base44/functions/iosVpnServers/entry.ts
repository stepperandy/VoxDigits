import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    const safe = (servers || [])
      .filter(s => s.api_token && s.ip_address && s.public_key)
      .map(s => ({
        id: s.id,
        name: `VoxVPN ${s.city || s.region || s.country || 'Server'}`,
        country: s.country || null,
        city: s.city || null,
        region: s.region || null,
        load: Math.round(((s.active_connections || 0) / (s.max_connections || 100)) * 100),
      }))
      .sort((a, b) => a.load - b.load);

    return Response.json({ success: true, servers: safe });
  } catch (error) {
    console.error('[iosVpnServers]', error?.message || error);
    return Response.json({ error: 'Unable to load VPN servers' }, { status: 500 });
  }
});
