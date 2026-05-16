import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Servers unlocked per plan tier
const PLAN_TIERS = {
  'Free Trial': 1,
  'Basic': 1,
  'Standard': 2,
  'Pro Monthly': 3,
  'Pro Annual': 3,
  'Advanced': 3,
  'Premium': 4,
  'Business': 5,
  'Enterprise': 5,
};

// Regions available per tier (cumulative)
const TIER_REGIONS = {
  1: ['Americas'],                                      // Free/Basic
  2: ['Americas', 'Europe'],                            // Standard
  3: ['Americas', 'Europe', 'Asia Pacific'],            // Pro
  4: ['Americas', 'Europe', 'Asia Pacific', 'Africa'],  // Premium
  5: null,                                              // Business/Enterprise = all
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // Check subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => ['active', 'trial'].includes(s.status)) || null;

    if (!activeSub) {
      return new Response(JSON.stringify({ success: false, error: 'No active subscription found.' }), { status: 403, headers: corsHeaders });
    }

    // Determine plan tier and allowed regions
    const tier = PLAN_TIERS[activeSub.plan] || 1;
    const allowedRegions = TIER_REGIONS[tier]; // null = all regions

    // Fetch online servers (optionally scoped by device_id for fingerprint validation)
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const { device_id } = body;

    // If device_id provided, verify it's a registered device
    if (device_id) {
      const devices = await base44.entities.LinkedDevice.filter({
        subscription_id: activeSub.id,
        status: 'active',
      });
      const knownDevice = devices.find(d => d.device_id === device_id);
      if (!knownDevice) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Device not recognized. Please log in again.',
        }), { status: 403, headers: corsHeaders });
      }
      // Update last_connected
      await base44.entities.LinkedDevice.update(knownDevice.id, {
        last_connected: new Date().toISOString(),
      });
    }

    // Fetch all online servers
    const allServers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });

    // Filter by allowed regions based on plan tier
    const filteredServers = allowedRegions
      ? allServers.filter(s => {
          // Match by region field or country broadly
          const serverRegion = s.region || '';
          return allowedRegions.some(r => serverRegion.toLowerCase().includes(r.toLowerCase()) || _regionMatch(s.country, r));
        })
      : allServers;

    const serverList = filteredServers.map(s => ({
      id: s.id,
      region: s.region,
      country: s.country,
      city: s.city,
      ip_address: s.ip_address,
      port: s.port || 1194,
      proto: s.proto || 'udp',
      status: s.status,
      current_load: s.current_load || 0,
      active_connections: s.active_connections || 0,
      max_connections: s.max_connections || 1000,
      uptime_percentage: s.uptime_percentage || 99.9,
    }));

    return new Response(JSON.stringify({
      success: true,
      plan: activeSub.plan,
      plan_tier: tier,
      server_count: serverList.length,
      servers: serverList,
      subscription: {
        plan: activeSub.plan,
        status: activeSub.status,
        renewal_date: activeSub.renewal_date,
        max_devices: activeSub.max_devices,
      },
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: corsHeaders });
  }
});

// Helper: map country codes to broad regions
function _regionMatch(country, region) {
  const COUNTRY_REGIONS = {
    Americas: ['US', 'CA', 'BR', 'MX', 'AR'],
    Europe: ['GB', 'DE', 'FR', 'NL', 'SE', 'NO', 'CH', 'IT', 'ES'],
    'Asia Pacific': ['JP', 'SG', 'AU', 'IN', 'HK', 'KR'],
    Africa: ['ZA', 'NG', 'KE', 'EG'],
  };
  return (COUNTRY_REGIONS[region] || []).includes((country || '').toUpperCase());
}