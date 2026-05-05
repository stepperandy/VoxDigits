import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * healthCheck — monitor server health and backend status
 * Returns: { status, timestamp, servers_online, uptime, response_time }
 */
Deno.serve(async (req) => {
  const startTime = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get online servers
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    const totalConnections = servers.reduce((sum, s) => sum + (s.active_connections || 0), 0);
    const totalCapacity = servers.reduce((sum, s) => sum + (s.max_connections || 1000), 0);

    const responseTime = Date.now() - startTime;

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      servers_online: servers.length,
      total_connections: totalConnections,
      capacity_used: Math.round((totalConnections / totalCapacity) * 100),
      response_time_ms: responseTime,
    });
  } catch (error) {
    console.error('healthCheck error:', error.message);
    return Response.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
});