import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });

    const result = servers.map(s => ({
      id: s.id,
      name: `VoxVPN ${s.city || s.region}`,
      region: s.region,
      country: s.country,
      city: s.city,
      ip_address: s.ip_address,
      port: s.port || 51820,
      load: s.current_load || Math.round(((s.active_connections || 0) / (s.max_connections || 100)) * 100),
      status: s.status,
      flag: countryFlag(s.country),
    }));

    return Response.json({ servers: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function countryFlag(country) {
  const flags = {
    US: '🇺🇸', UK: '🇬🇧', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺',
    DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', SG: '🇸🇬', NL: '🇳🇱',
    CH: '🇨🇭', SE: '🇸🇪', NO: '🇳🇴', BR: '🇧🇷', IN: '🇮🇳',
  };
  return flags[country?.toUpperCase()] || '🌐';
}