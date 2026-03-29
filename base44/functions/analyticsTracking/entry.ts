import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { action, data } = await req.json().catch(() => ({}));

    if (action === 'record_analytics') {
      // Record daily analytics
      const today = new Date().toISOString().split('T')[0];

      const servers = await base44.asServiceRole.entities.VPNServer.list();
      const totalConnections = servers.reduce((sum, s) => sum + (s.active_connections || 0), 0);
      const totalBandwidth = servers.reduce((sum, s) => sum + (s.bandwidth_used_gb || 0), 0);

      const subscriptions = await base44.asServiceRole.entities.VPNSubscription.list();
      const newSubs = data?.new_subscriptions || 0;
      const cancelledSubs = data?.cancelled_subscriptions || 0;

      const serverConnections = {};
      servers.forEach(s => {
        serverConnections[s.region] = s.active_connections || 0;
      });

      const analytics = await base44.asServiceRole.entities.Analytics.filter({ date: today });

      if (analytics.length > 0) {
        await base44.asServiceRole.entities.Analytics.update(analytics[0].id, {
          total_active_connections: totalConnections,
          total_bandwidth_gb: totalBandwidth,
          new_subscriptions: newSubs,
          cancelled_subscriptions: cancelledSubs,
          server_connections: serverConnections,
          peak_connections: Math.max(...servers.map(s => s.active_connections || 0)),
        });
      } else {
        await base44.asServiceRole.entities.Analytics.create({
          date: today,
          total_active_connections: totalConnections,
          total_bandwidth_gb: totalBandwidth,
          new_subscriptions: newSubs,
          cancelled_subscriptions: cancelledSubs,
          server_connections: serverConnections,
          peak_connections: Math.max(...servers.map(s => s.active_connections || 0)),
        });
      }

      return Response.json({ success: true, message: 'Analytics recorded' });
    }

    if (action === 'get_analytics') {
      // Get analytics for date range
      const { start_date, end_date } = data || {};
      let analytics = await base44.asServiceRole.entities.Analytics.list('-date', 100);

      if (start_date && end_date) {
        analytics = analytics.filter(a => a.date >= start_date && a.date <= end_date);
      }

      return Response.json({ success: true, analytics });
    }

    if (action === 'get_subscription_trends') {
      // Get subscription sign-up trends
      const analytics = await base44.asServiceRole.entities.Analytics.list('-date', 365);
      
      const trends = analytics.map(a => ({
        date: a.date,
        new_subscriptions: a.new_subscriptions || 0,
        cancelled_subscriptions: a.cancelled_subscriptions || 0,
      }));

      return Response.json({ success: true, trends });
    }

    if (action === 'get_live_metrics') {
      // Get real-time metrics across all servers
      const servers = await base44.asServiceRole.entities.VPNServer.list();
      const subscriptions = await base44.asServiceRole.entities.VPNSubscription.list();

      const totalConnections = servers.reduce((sum, s) => sum + (s.active_connections || 0), 0);
      const totalBandwidth = servers.reduce((sum, s) => sum + (s.bandwidth_used_gb || 0), 0);
      const activeServers = servers.filter(s => s.status === 'online').length;
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

      return Response.json({
        success: true,
        metrics: {
          total_connections: totalConnections,
          total_bandwidth_gb: totalBandwidth,
          active_servers: activeServers,
          total_servers: servers.length,
          active_subscriptions: activeSubscriptions,
          total_subscriptions: subscriptions.length,
          server_breakdown: servers.map(s => ({
            region: s.region,
            connections: s.active_connections || 0,
            load: s.current_load || 0,
            status: s.status,
          })),
        },
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});