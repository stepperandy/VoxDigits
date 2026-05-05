import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cache bust: add query param to check for fresh data
    const body = await req.json().catch(() => ({}));
    const forceFresh = body.force_fresh || false;

    // Get servers sorted by load (lowest first)
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    
    if (!servers || servers.length === 0) {
      return Response.json({ servers: [], message: 'No online servers available' });
    }

    const result = servers
      .map(s => ({
        id: s.id,
        name: `VoxVPN ${s.city || s.region}`,
        region: s.region,
        country: s.country,
        city: s.city,
        ip_address: s.ip_address,
        port: s.port || 1194,
        load: s.current_load || Math.round(((s.active_connections || 0) / (s.max_connections || 1000)) * 100),
        status: s.status,
        uptime: s.uptime_percentage || 99.9,
        flag: countryFlag(s.country),
      }))
      .sort((a, b) => a.load - b.load); // Sort by load ascending

    return Response.json({ 
      servers: result,
      timestamp: new Date().toISOString(),
      total_servers: result.length,
    });
  } catch (error) {
    console.error('getServers error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function countryFlag(country) {
  const flags = {
    US: '🇺🇸', UK: '🇬🇧', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺',
    DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', SG: '🇸🇬', NL: '🇳🇱',
    IT: '🇮🇹', ES: '🇪🇸', ZA: '🇿🇦', CH: '🇨🇭', SE: '🇸🇪', NO: '🇳🇴', BR: '🇧🇷', IN: '🇮🇳',
  };
  return flags[country?.toUpperCase()] || '🌐';
}