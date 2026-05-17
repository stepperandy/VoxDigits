import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getSessionAnalytics — Item 3
 * Returns real-time session metrics: online users, active devices,
 * per-server load, bandwidth, and basic abuse detection flags.
 * Admin-only endpoint.
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403, headers: CORS });
    }

    // Parallel fetch of all relevant data
    const [allDevices, allSubs, allServers] = await Promise.all([
      base44.asServiceRole.entities.LinkedDevice.filter({ status: 'active' }),
      base44.asServiceRole.entities.VPNSubscription.filter({}),
      base44.asServiceRole.entities.VPNServer.filter({}),
    ]);

    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    const ONE_DAY  = 24 * ONE_HOUR;

    // Active sessions = devices connected in last 24h
    const recentlyActive = allDevices.filter(d => {
      if (!d.last_connected) return false;
      return (now - new Date(d.last_connected).getTime()) < ONE_DAY;
    });

    // Online right now = connected in last 15 minutes
    const onlineNow = allDevices.filter(d => {
      if (!d.last_connected) return false;
      return (now - new Date(d.last_connected).getTime()) < 15 * 60 * 1000;
    });

    // Per-server active connections
    const serverMetrics = allServers.map(s => ({
      id: s.id,
      region: s.region,
      city: s.city,
      country: s.country,
      status: s.status,
      active_connections: s.active_connections || 0,
      max_connections: s.max_connections || 1000,
      load_pct: s.max_connections
        ? Math.round(((s.active_connections || 0) / s.max_connections) * 100)
        : 0,
      bandwidth_used_gb: s.bandwidth_used_gb || 0,
      uptime_pct: s.uptime_percentage || 0,
    }));

    // Bandwidth totals
    const totalBandwidthGb = allServers.reduce((sum, s) => sum + (s.bandwidth_used_gb || 0), 0);

    // Subscription breakdown
    const activeSubs   = allSubs.filter(s => ['active', 'trial'].includes(s.status));
    const expiredSubs  = allSubs.filter(s => s.status === 'expired');
    const cancelledSubs = allSubs.filter(s => s.status === 'cancelled');

    // Abuse detection: devices with suspiciously high download counts
    const abuseFlags = allDevices.filter(d => {
      const desc = d.description || '';
      const match = desc.match(/dl_count:(\d+):/);
      return match && parseInt(match[1]) > 8; // >8 config downloads in a window
    }).map(d => ({
      device_id: d.device_id,
      device_name: d.device_name,
      subscription_id: d.subscription_id,
      last_connected: d.last_connected,
      flag: 'high_config_download_rate',
    }));

    // Device type breakdown
    const deviceTypes = allDevices.reduce((acc, d) => {
      acc[d.device_type] = (acc[d.device_type] || 0) + 1;
      return acc;
    }, {});

    return Response.json({
      timestamp: new Date().toISOString(),
      sessions: {
        online_now: onlineNow.length,
        active_last_24h: recentlyActive.length,
        total_registered_devices: allDevices.length,
        device_type_breakdown: deviceTypes,
      },
      subscriptions: {
        total: allSubs.length,
        active: activeSubs.length,
        expired: expiredSubs.length,
        cancelled: cancelledSubs.length,
      },
      bandwidth: {
        total_gb: parseFloat(totalBandwidthGb.toFixed(2)),
        per_server: serverMetrics.map(s => ({
          region: s.region,
          city: s.city,
          bandwidth_gb: s.bandwidth_used_gb,
        })),
      },
      servers: serverMetrics,
      abuse_flags: abuseFlags,
    });

  } catch (error) {
    console.error('getSessionAnalytics error:', error.message);
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});