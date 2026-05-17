import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * adminDeviceManager — Item 5 (device management) + Item 6 (device hardening guidance)
 * Admin-only endpoint for full device + user management.
 *
 * POST body:
 *   { action: "list_devices" | "revoke_device" | "list_users" | "update_sub_status" | "server_health"
 *     user_email?: string,
 *     device_id?: string,
 *     subscription_id?: string,
 *     new_status?: string }
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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

    const body = await req.json().catch(() => ({}));
    const { action, user_email, device_id, subscription_id, new_status } = body;

    // ── LIST ALL DEVICES (optionally filter by user) ───────────────────
    if (action === 'list_devices') {
      const query = subscription_id ? { subscription_id } : {};
      const devices = await base44.asServiceRole.entities.LinkedDevice.filter(query);

      // If user_email given, find their sub first
      if (user_email && !subscription_id) {
        const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email });
        const subIds = subs.map(s => s.id);
        const filtered = devices.filter(d => subIds.includes(d.subscription_id));
        return Response.json({ devices: filtered, count: filtered.length }, { headers: CORS });
      }

      return Response.json({ devices, count: devices.length }, { headers: CORS });
    }

    // ── REVOKE A DEVICE ────────────────────────────────────────────────
    if (action === 'revoke_device') {
      if (!device_id) return Response.json({ error: 'device_id required' }, { status: 400, headers: CORS });

      const all = await base44.asServiceRole.entities.LinkedDevice.filter({ device_id });
      if (!all?.length) return Response.json({ error: 'Device not found' }, { status: 404, headers: CORS });

      await base44.asServiceRole.entities.LinkedDevice.update(all[0].id, {
        status: 'inactive',
        description: (all[0].description || '') + ' [REVOKED by admin]',
      });

      return Response.json({ success: true, message: `Device ${device_id} revoked.` }, { headers: CORS });
    }

    // ── LIST USERS WITH SUBSCRIPTION STATUS ───────────────────────────
    if (action === 'list_users') {
      const [allUsers, allSubs] = await Promise.all([
        base44.asServiceRole.entities.User.list(),
        base44.asServiceRole.entities.VPNSubscription.filter({}),
      ]);

      const subMap = allSubs.reduce((acc, s) => {
        if (!acc[s.user_email]) acc[s.user_email] = [];
        acc[s.user_email].push(s);
        return acc;
      }, {});

      const result = allUsers.map(u => {
        const subs = subMap[u.email] || [];
        const active = subs.find(s => ['active', 'trial'].includes(s.status));
        return {
          id: u.id,
          email: u.email,
          name: u.full_name,
          role: u.role,
          created_date: u.created_date,
          subscription: active ? {
            plan: active.plan,
            status: active.status,
            renewal_date: active.renewal_date,
            max_devices: active.max_devices,
          } : null,
        };
      });

      return Response.json({ users: result, count: result.length }, { headers: CORS });
    }

    // ── UPDATE SUBSCRIPTION STATUS ─────────────────────────────────────
    if (action === 'update_sub_status') {
      if (!subscription_id || !new_status) {
        return Response.json({ error: 'subscription_id and new_status required' }, { status: 400, headers: CORS });
      }
      const allowed = ['active', 'trial', 'expired', 'cancelled', 'paused'];
      if (!allowed.includes(new_status)) {
        return Response.json({ error: `new_status must be one of: ${allowed.join(', ')}` }, { status: 400, headers: CORS });
      }
      await base44.asServiceRole.entities.VPNSubscription.update(subscription_id, { status: new_status });
      return Response.json({ success: true, message: `Subscription ${subscription_id} set to ${new_status}.` }, { headers: CORS });
    }

    // ── LIVE SERVER HEALTH ─────────────────────────────────────────────
    if (action === 'server_health') {
      const servers = await base44.asServiceRole.entities.VPNServer.filter({});
      const health = servers.map(s => ({
        id: s.id,
        region: s.region,
        city: s.city,
        country: s.country,
        ip_address: s.ip_address,
        status: s.status,
        active_connections: s.active_connections || 0,
        max_connections: s.max_connections || 1000,
        load_pct: s.max_connections
          ? Math.round(((s.active_connections || 0) / s.max_connections) * 100)
          : 0,
        bandwidth_gb: s.bandwidth_used_gb || 0,
        uptime_pct: s.uptime_percentage || 0,
        health: s.status === 'online'
          ? (((s.active_connections || 0) / (s.max_connections || 1000)) < 0.8 ? 'healthy' : 'high_load')
          : s.status,
      }));

      return Response.json({
        servers: health,
        summary: {
          total: servers.length,
          online: health.filter(s => s.status === 'online').length,
          offline: health.filter(s => s.status === 'offline').length,
          maintenance: health.filter(s => s.status === 'maintenance').length,
          high_load: health.filter(s => s.health === 'high_load').length,
        },
      }, { headers: CORS });
    }

    return Response.json({
      error: 'Unknown action. Valid actions: list_devices, revoke_device, list_users, update_sub_status, server_health',
    }, { status: 400, headers: CORS });

  } catch (error) {
    console.error('adminDeviceManager error:', error.message);
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});