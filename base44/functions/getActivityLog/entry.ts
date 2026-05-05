import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getActivityLog — get user's account activity history
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock activity log (in production, store real activities)
    const activities = [
      { type: 'login', description: 'Logged in from Chrome', device: 'Windows PC', ip: '192.0.2.1', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { type: 'vpn_connect', description: 'Connected to New York server', device: 'iPhone', ip: '192.0.2.2', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { type: 'vpn_disconnect', description: 'Disconnected from VPN', device: 'iPhone', ip: '192.0.2.2', timestamp: new Date(Date.now() - 5400000).toISOString() },
      { type: 'settings_updated', description: 'Updated notification preferences', device: 'Windows PC', ip: '192.0.2.1', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { type: 'payment', description: 'Payment processed ($9.99)', device: 'Web', ip: '192.0.2.3', timestamp: new Date(Date.now() - 172800000).toISOString() },
      { type: '2fa_enabled', description: 'Two-factor authentication enabled', device: 'Windows PC', ip: '192.0.2.1', timestamp: new Date(Date.now() - 259200000).toISOString() },
      { type: 'device_added', description: 'New device linked: Android Phone', device: 'Android Phone', ip: '192.0.2.4', timestamp: new Date(Date.now() - 604800000).toISOString() },
      { type: 'password_changed', description: 'Password changed', device: 'Web', ip: '192.0.2.3', timestamp: new Date(Date.now() - 1209600000).toISOString() },
    ];

    return Response.json({
      activities: activities.slice(0, 20),
      total: activities.length,
    });
  } catch (error) {
    console.error('getActivityLog error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});