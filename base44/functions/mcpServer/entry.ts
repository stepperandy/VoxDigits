import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * VoxVPN Streamable HTTP MCP server.
 * Public, read-only network discovery; it never exposes VPN credentials,
 * customer data, internal server addresses, or management endpoints.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

const PROTOCOL_VERSION = '2025-03-26';

const TOOLS = [
  {
    name: 'list_voxvpn_servers',
    description: 'List public VoxVPN server locations that are currently online. Results never include VPN credentials or server IP addresses.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 50, description: 'Maximum locations to return (default 20).' },
        country: { type: 'string', description: 'Optional ISO 3166-1 alpha-2 country code, for example US or GB.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'recommend_voxvpn_server',
    description: 'Recommend the least-loaded public VoxVPN location, optionally in a requested country.',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'Optional ISO 3166-1 alpha-2 country code.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_voxvpn_network_status',
    description: 'Get the public VoxVPN network health summary, including online location count and average load.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

function publicServer(server) {
  return {
    id: server.id,
    name: `VoxVPN ${server.city || server.region || server.country || 'Location'}`,
    country: server.country || null,
    region: server.region || null,
    city: server.city || null,
    load_percent: Math.round(Number(server.current_load) || 0),
    uptime_percent: Number(server.uptime_percentage) || 99.9,
    status: server.status || 'online',
  };
}

function rpcResult(id, result) {
  return Response.json({ jsonrpc: '2.0', id, result }, { headers: { ...CORS, 'Content-Type': 'application/json' } });
}

function rpcError(id, code, message) {
  return Response.json(
    { jsonrpc: '2.0', id: id ?? null, error: { code, message } },
    { headers: { ...CORS, 'Content-Type': 'application/json' } }
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('MCP endpoint: send JSON-RPC requests with POST.', { status: 405, headers: { ...CORS, Allow: 'POST, OPTIONS' } });

  let request;
  try {
    request = await req.json();
  } catch {
    return rpcError(null, -32700, 'Parse error');
  }

  if (!request || request.jsonrpc !== '2.0' || typeof request.method !== 'string') {
    return rpcError(request?.id, -32600, 'Invalid JSON-RPC request');
  }

  const isNotification = request.id === undefined;
  const respond = (result) => (isNotification ? new Response(null, { status: 202, headers: CORS }) : rpcResult(request.id, result));

  try {
    if (request.method === 'initialize') {
      const requestedVersion = request.params?.protocolVersion;
      if (!requestedVersion) return rpcError(request.id, -32602, 'protocolVersion is required');
      return respond({
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'voxvpn', version: '1.0.0', title: 'VoxVPN' },
        instructions: 'Use these public, read-only tools to compare VoxVPN server locations and network status. Never request or expose credentials.',
      });
    }

    if (request.method === 'notifications/initialized' || request.method === 'ping') {
      return respond({});
    }

    if (request.method === 'tools/list') {
      return respond({ tools: TOOLS });
    }

    if (request.method !== 'tools/call') return rpcError(request.id, -32601, 'Method not found');

    const name = request.params?.name;
    const args = request.params?.arguments || {};
    const base44 = createClientFromRequest(req);
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    const sorted = servers.map(publicServer).sort((a, b) => a.load_percent - b.load_percent);

    if (name === 'list_voxvpn_servers') {
      const country = String(args.country || '').trim().toUpperCase();
      const limit = Math.max(1, Math.min(Number.parseInt(args.limit, 10) || 20, 50));
      const locations = country ? sorted.filter((server) => String(server.country || '').toUpperCase() === country) : sorted;
      return respond({ content: [{ type: 'text', text: JSON.stringify({ servers: locations.slice(0, limit), total: locations.length }) }] });
    }

    if (name === 'recommend_voxvpn_server') {
      const country = String(args.country || '').trim().toUpperCase();
      const candidate = (country ? sorted.filter((server) => String(server.country || '').toUpperCase() === country) : sorted)[0];
      const result = candidate || { message: country ? 'No online VoxVPN location is currently available in that country.' : 'No online VoxVPN locations are currently available.' };
      return respond({ content: [{ type: 'text', text: JSON.stringify(result) }] });
    }

    if (name === 'get_voxvpn_network_status') {
      const loads = sorted.map((server) => server.load_percent);
      const status = {
        online_locations: sorted.length,
        countries: new Set(sorted.map((server) => server.country).filter(Boolean)).size,
        average_load_percent: loads.length ? Math.round(loads.reduce((total, load) => total + load, 0) / loads.length) : 0,
        status: sorted.length ? 'operational' : 'degraded',
        checked_at: new Date().toISOString(),
      };
      return respond({ content: [{ type: 'text', text: JSON.stringify(status) }] });
    }

    return rpcError(request.id, -32602, 'Unknown tool');
  } catch (error) {
    console.error('mcpServer error:', error);
    return rpcError(request.id, -32603, 'Internal server error');
  }
});