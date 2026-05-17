import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * recommendServer — Item 7
 * Returns the best server for a user based on:
 *   1. Geo-nearest (by country/region hint from client)
 *   2. Lowest load among candidates
 *   3. Automatic failover (skips overloaded / offline servers)
 *
 * Request body (optional):
 *   { country_hint: "US", region_hint: "North America", preferred_server_id: "xxx" }
 *
 * Returns: { primary, fallback[] } — primary is the best match, fallback is ordered list.
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const PLAN_REGIONS = {
  1: ['US', 'UK', 'CA'],
  2: ['US', 'UK', 'CA', 'AU', 'DE', 'FR'],
  3: ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'SG', 'NL', 'NO', 'SE'],
  4: null, // all regions
  5: null, // all regions
};

const PLAN_TIERS = {
  'Free Trial': 1, 'Basic': 1, 'Standard': 2,
  'Pro Monthly': 3, 'Pro Annual': 3, 'Advanced': 3,
  'Premium': 4, 'Business': 5, 'Enterprise': 5,
};

function serverScore(server, countryHint, regionHint) {
  const load = server.max_connections
    ? (server.active_connections || 0) / server.max_connections
    : 0;

  let geoBonus = 0;
  if (countryHint && server.country?.toUpperCase() === countryHint.toUpperCase()) geoBonus = 2;
  else if (regionHint && server.region?.toLowerCase().includes(regionHint.toLowerCase())) geoBonus = 1;

  // Lower score = better (lower load, closer geo)
  return load - (geoBonus * 0.5);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });

    const body = await req.json().catch(() => ({}));
    const { country_hint = null, region_hint = null, preferred_server_id = null } = body;

    // Get user's plan tier
    let planTier = 5; // admin gets all
    if (user.role !== 'admin') {
      const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
      const active = subs?.find(s => ['active', 'trial'].includes(s.status));
      if (!active) return Response.json({ error: 'No active subscription.' }, { status: 403, headers: CORS });
      planTier = PLAN_TIERS[active.plan] || 1;
    }

    // Fetch online servers
    const allOnline = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    if (!allOnline?.length) return Response.json({ error: 'No servers available.' }, { status: 503, headers: CORS });

    // Filter by plan-allowed regions
    const allowedCountries = PLAN_REGIONS[planTier];
    const eligible = allowedCountries
      ? allOnline.filter(s => allowedCountries.includes(s.country?.toUpperCase()))
      : allOnline;

    // Filter out overloaded servers (>85% capacity)
    const available = eligible.filter(s => {
      if (!s.max_connections) return true;
      return (s.active_connections || 0) / s.max_connections < 0.85;
    });

    const pool = available.length > 0 ? available : eligible; // fallback to overloaded if nothing else

    // Check if preferred server is available and eligible
    let primary = null;
    if (preferred_server_id) {
      primary = pool.find(s => s.id === preferred_server_id) || null;
    }

    // Sort by score
    const sorted = [...pool].sort((a, b) =>
      serverScore(a, country_hint, region_hint) - serverScore(b, country_hint, region_hint)
    );

    if (!primary) primary = sorted[0];
    const fallbacks = sorted.filter(s => s.id !== primary.id).slice(0, 4);

    const fmt = s => ({
      id: s.id,
      region: s.region,
      city: s.city,
      country: s.country,
      ip_address: s.ip_address,
      port: s.port || 1194,
      proto: s.proto || 'udp',
      load_pct: s.max_connections
        ? Math.round(((s.active_connections || 0) / s.max_connections) * 100)
        : 0,
      uptime_pct: s.uptime_percentage || 99,
      status: s.status,
    });

    return Response.json({
      primary: fmt(primary),
      fallbacks: fallbacks.map(fmt),
      recommendation_basis: country_hint || region_hint || 'lowest_load',
    }, { headers: CORS });

  } catch (error) {
    console.error('recommendServer error:', error.message);
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});