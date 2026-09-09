import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * VoxVPN MCP Server
 * Exposes VPN server/network data as Model Context Protocol tools so that
 * AI clients (Claude Desktop, Cursor, etc.) can query the VoxVPN network.
 *
 *  GET  /mcpServer        -> server discovery (capabilities + tool list)
 *  POST /mcpServer        -> invoke a tool: { tool, arguments }
 *      tools: list_servers, recommend_server, get_server, server_status
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const TOOLS = [
  {
    name: 'list_servers',
    description: 'List all online VoxVPN servers, optionally limited to a count.',
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'number', description: 'Max servers to return (default 50, max 200)' } },
    },
  },
  {
    name: 'recommend_server',
    description: 'Return the least-loaded server, optionally filtered by ISO country code (e.g. US, GB).',
    inputSchema: {
      type: 'object',
      properties: { country: { type: 'string', description: 'ISO 2-letter country code' } },
    },
  },
  {
    name: 'get_server',
    description: 'Fetch a single server by its id.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
  {
    name: 'server_status',
    description: 'Return an overall network health summary (online count, countries, avg load).',
    inputSchema: { type: 'object' },
  },
];

function mapServer(s) {
  return {
    id: s.id,
    name: `VoxVPN ${s.city || s.region || s.country}`,
    region: s.region,
    country: s.country,
    city: s.city,
    ip_address: s.ip_address,
    port: s.port || 1194,
    load: s.current_load || 0,
    status: s.status,
    uptime: s.uptime_percentage || 99.9,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const base44 = createClientFromRequest(req);

  try {
    // GET -> MCP discovery document
    if (req.method === 'GET') {
      return Response.json(
        {
          server: { name: 'voxvpn', version: '1.0.0', title: 'VoxVPN MCP Server' },
          protocol: 'mcp/1.0',
          capabilities: { tools: true },
          tools: TOOLS,
        },
        { headers: CORS }
      );
    }

    // POST -> tool invocation
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const tool = body.tool || body.method;
      const args = body.arguments || body.params || {};

      const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });

      let result;
      switch (tool) {
        case 'list_servers': {
          const limit = Math.min(parseInt(args.limit) || 50, 200);
          const mapped = servers.map(mapServer).sort((a, b) => (a.load || 0) - (b.load || 0));
          result = { servers: mapped.slice(0, limit), total: mapped.length };
          break;
        }
        case 'recommend_server': {
          const country = String(args.country || '').toUpperCase();
          const pool = country ? servers.filter((s) => String(s.country || '').toUpperCase() === country) : servers;
          const sorted = pool.map(mapServer).sort((a, b) => (a.load || 0) - (b.load || 0));
          result = sorted.length ? sorted[0] : { message: 'No servers available for that country' };
          break;
        }
        case 'get_server': {
          if (!args.id) return Response.json({ error: 'id is required' }, { status: 400, headers: CORS });
          const s = servers.find((x) => x.id === args.id);
          result = s ? mapServer(s) : { error: 'Server not found' };
          break;
        }
        case 'server_status': {
          const online = servers.length;
          const avgLoad = online ? Math.round(servers.reduce((a, s) => a + (s.current_load || 0), 0) / online) : 0;
          const countries = new Set(servers.map((s) => s.country).filter(Boolean)).size;
          result = {
            online_servers: online,
            countries,
            avg_load: avgLoad,
            status: online > 0 ? 'operational' : 'degraded',
            timestamp: new Date().toISOString(),
          };
          break;
        }
        default:
          return Response.json({ error: `Unknown tool: ${tool}`, tools: TOOLS.map((t) => t.name) }, { status: 400, headers: CORS });
      }

      return Response.json({ tool, result }, { headers: CORS });
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: CORS });
  } catch (error) {
    console.error('mcpServer error:', error.message);
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});