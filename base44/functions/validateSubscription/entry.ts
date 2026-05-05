import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * validateSubscription — verify user has active subscription
 * Returns: { valid: boolean, plan, renewal_date, devices_used, max_devices }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ valid: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Admin always has access
    if (user.role === 'admin') {
      return Response.json({
        valid: true,
        plan: 'Admin',
        renewal_date: null,
        devices_used: 0,
        max_devices: 999,
      });
    }

    // Check active subscription
    const subs = await base44.entities.VPNSubscription.filter({
      user_email: user.email,
      status: 'active',
    });

    if (!subs || subs.length === 0) {
      return Response.json({
        valid: false,
        error: 'No active subscription',
        message: 'Please purchase a plan to connect.',
      });
    }

    const sub = subs[0];

    // Count connected devices
    const devices = await base44.entities.LinkedDevice.filter({ subscription_id: sub.id });
    const connectedCount = devices.filter(d => d.status === 'active').length;

    return Response.json({
      valid: true,
      plan: sub.plan,
      renewal_date: sub.renewal_date,
      devices_used: connectedCount,
      max_devices: sub.max_devices,
      billing_cycle: sub.billing_cycle,
    });
  } catch (error) {
    console.error('validateSubscription error:', error.message);
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});