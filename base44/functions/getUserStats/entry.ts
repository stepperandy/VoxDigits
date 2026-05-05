import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getUserStats — get user's VPN usage statistics
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription and devices
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const sub = subs?.[0];

    if (!sub) {
      return Response.json({ stats: null });
    }

    const devices = await base44.entities.LinkedDevice.filter({ subscription_id: sub.id });

    // Mock stats (in production, track real usage)
    const stats = {
      total_data_used_gb: 245.6,
      total_connection_time_hours: 1820,
      current_session: {
        connected: true,
        server: 'New York, USA',
        ip_address: '192.0.2.1',
        connected_since: '2 hours ago',
        data_used_this_session_mb: 245,
        upload_mbps: 45.2,
        download_mbps: 342.8,
      },
      this_month: {
        data_used_gb: 45.3,
        connection_hours: 120,
        peak_usage_day: 'Saturday',
        countries_visited: ['USA', 'UK', 'Canada', 'Germany'],
      },
      lifetime: {
        connections: 2840,
        total_hours: 1820,
        average_session_minutes: 38,
        most_used_server: 'New York, USA',
      },
      devices_active: devices.filter(d => d.status === 'active').length,
      plan: sub.plan,
      renewal_date: sub.renewal_date,
    };

    return Response.json({ stats });
  } catch (error) {
    console.error('getUserStats error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});