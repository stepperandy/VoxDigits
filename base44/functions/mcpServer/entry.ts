import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * VoxVPN public MCP server.
 *
 * The server is anonymous and read-only. It exposes only public location and
 * network-health information. It never returns customer records, credentials,
 * VPN configuration files, private addresses, browsing activity, or traffic.
 */

const SERVER_VERSION = '1.1.0';
const MODERN_PROTOCOL_VERSION = '2026-07-28';
const LEGACY_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26'];
const SUPPORTED_PROTOCOL_VERSIONS = [MODERN_PROTOCOL_VERSION, ...LEGACY_PROTOCOL_VERSIONS];
const LOGO_URL = 'https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/13431de73_VoxICON.png';
const MAX_REQUEST_BYTES = 64 * 1024;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': [
    'Content-Type',
    'Accept',
    'Authorization',
    'MCP-Protocol-Version',
    'Mcp-Session-Id',
    'Mcp-Method',
    'Mcp-Name',
  ].join(', '),
  'Access-Control-Expose-Headers': 'MCP-Protocol-Version, Mcp-Session-Id',
};

const SERVER_INFO = {
  name: 'voxvpn',
  title: 'VoxVPN',
  version: SERVER_VERSION,
  description: 'Public, read-only discovery for VoxVPN locations and network status.',
  websiteUrl: 'https://voxvpn.net/mcp',
  icons: [{ src: LOGO_URL, mimeType: 'image/png' }],
};

const SERVER_INSTRUCTIONS =
  'Use these read-only tools to compare public VoxVPN locations and network health. ' +
  'The tools cannot connect or disconnect a VPN, access customer accounts, reveal credentials, ' +
  'return configuration files, or expose private server addresses. Direct connection tasks to the VoxVPN app.';

const PUBLIC_SERVER_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Public VoxVPN location name.' },
    country: { type: 'string', pattern: '^[A-Z]{2}$', description: 'ISO 3166-1 alpha-2 country code.' },
    region: { type: 'string', description: 'Public region name when available.' },
    city: { type: 'string', description: 'Public city name when available.' },
    load_percent: { type: 'integer', minimum: 0, maximum: 100 },
    uptime_percent: { type: 'number', minimum: 0, maximum: 100 },
    status: { type: 'string', enum: ['online'] },
  },
  required: ['name', 'load_percent', 'uptime_percent', 'status'],
  additionalProperties: false,
};

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
};

const TOOLS = [
  {
    name: 'list_voxvpn_servers',
    title: 'List VoxVPN locations',
    description:
      'Use when the user wants to browse or compare public VoxVPN locations that are currently online. ' +
      'Optionally filter by a two-letter country code and limit the result count. Never returns IP addresses or credentials.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 50,
          default: 20,
          description: 'Maximum number of online locations to return. Defaults to 20.',
        },
        country: {
          type: 'string',
          pattern: '^[A-Za-z]{2}$',
          description: 'Optional ISO 3166-1 alpha-2 country code, such as US, GB, CA, or GH.',
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        servers: { type: 'array', items: PUBLIC_SERVER_SCHEMA },
        total: { type: 'integer', minimum: 0 },
        returned: { type: 'integer', minimum: 0 },
        country_filter: { type: 'string', pattern: '^[A-Z]{2}$' },
        checked_at: { type: 'string', format: 'date-time' },
      },
      required: ['servers', 'total', 'returned', 'checked_at'],
      additionalProperties: false,
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'recommend_voxvpn_server',
    title: 'Recommend a VoxVPN location',
    description:
      'Use when the user wants the currently least-loaded public VoxVPN location, globally or in a specified country. ' +
      'This is an informational recommendation and does not start a VPN connection.',
    inputSchema: {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          pattern: '^[A-Za-z]{2}$',
          description: 'Optional ISO 3166-1 alpha-2 country code, such as US or GB.',
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        server: PUBLIC_SERVER_SCHEMA,
        message: { type: 'string' },
        country_filter: { type: 'string', pattern: '^[A-Z]{2}$' },
        checked_at: { type: 'string', format: 'date-time' },
      },
      required: ['available', 'checked_at'],
      additionalProperties: false,
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'get_voxvpn_network_status',
    title: 'Check VoxVPN network status',
    description:
      'Use when the user wants a current public summary of VoxVPN availability, including online location count, ' +
      'country count, and average load. Does not expose customer or server-administration data.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        online_locations: { type: 'integer', minimum: 0 },
        countries: { type: 'integer', minimum: 0 },
        average_load_percent: { type: 'integer', minimum: 0, maximum: 100 },
        status: { type: 'string', enum: ['operational', 'degraded'] },
        checked_at: { type: 'string', format: 'date-time' },
      },
      required: ['online_locations', 'countries', 'average_load_percent', 'status', 'checked_at'],
      additionalProperties: false,
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
];

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function finiteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePublicCountry(value) {
  const country = String(value || '').trim().toUpperCase();
  return country === 'UK' ? 'GB' : country;
}

function normalizeCountryArgument(value) {
  const country = String(value || '').trim().toUpperCase();
  if (!country) return '';
  if (!/^[A-Z]{2}$/.test(country)) {
    throw new Error('country must be a two-letter ISO country code, for example US or GB.');
  }
  return country === 'UK' ? 'GB' : country;
}

function publicServer(server) {
  const country = normalizePublicCountry(server.country);
  const region = String(server.region || '').trim();
  const city = String(server.city || '').trim();
  const location = city || region || country || 'Location';

  const result = {
    name: `VoxVPN ${location}`,
    load_percent: Math.round(clamp(finiteNumber(server.current_load, 0), 0, 100)),
    uptime_percent: Math.round(clamp(finiteNumber(server.uptime_percentage, 99.9), 0, 100) * 10) / 10,
    status: 'online',
  };

  if (/^[A-Z]{2}$/.test(country)) result.country = country;
  if (region) result.region = region;
  if (city) result.city = city;
  return result;
}

function responseHeaders(extra = {}) {
  return {
    ...CORS_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    ...extra,
  };
}

function rpcResult(id, result, status = 200) {
  return Response.json(
    { jsonrpc: '2.0', id, result },
    { status, headers: responseHeaders() }
  );
}

function rpcError(id, code, message, status = 200) {
  return Response.json(
    { jsonrpc: '2.0', id: id ?? null, error: { code, message } },
    { status, headers: responseHeaders() }
  );
}

function isModernRequest(req, request) {
  const headerVersion = req.headers.get('MCP-Protocol-Version');
  const metaVersion = request?.params?._meta?.['io.modelcontextprotocol/protocolVersion'];
  return (
    request?.method === 'server/discover' ||
    headerVersion === MODERN_PROTOCOL_VERSION ||
    metaVersion === MODERN_PROTOCOL_VERSION
  );
}

function completeResult(result, modern) {
  return modern ? { resultType: 'complete', ...result } : result;
}

function toolSuccess(data, summary, modern) {
  return completeResult(
    {
      content: [
        {
          type: 'text',
          text: `${summary}\n\n${JSON.stringify(data)}`,
        },
      ],
      structuredContent: data,
      isError: false,
    },
    modern
  );
}

function toolFailure(message, modern) {
  return completeResult(
    {
      content: [{ type: 'text', text: message }],
      isError: true,
    },
    modern
  );
}

function validateModernHeaders(req, request, modern) {
  if (!modern) return null;

  const methodHeader = req.headers.get('Mcp-Method');
  if (methodHeader && methodHeader !== request.method) {
    return 'Mcp-Method header does not match the JSON-RPC method.';
  }

  const nameHeader = req.headers.get('Mcp-Name');
  if (nameHeader && request.method === 'tools/call' && nameHeader !== request.params?.name) {
    return 'Mcp-Name header does not match the requested tool name.';
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('This MCP endpoint accepts JSON-RPC requests over HTTP POST.', {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        Allow: 'POST, OPTIONS',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  const contentLength = Number(req.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return rpcError(null, -32600, 'Request body is too large.', 413);
  }

  const protocolHeader = req.headers.get('MCP-Protocol-Version');
  if (protocolHeader && !SUPPORTED_PROTOCOL_VERSIONS.includes(protocolHeader)) {
    return rpcError(null, -32600, `Unsupported MCP protocol version: ${protocolHeader}`, 400);
  }

  let request;
  try {
    request = await req.json();
  } catch {
    return rpcError(null, -32700, 'Parse error', 400);
  }

  if (Array.isArray(request)) {
    return rpcError(null, -32600, 'JSON-RPC batch requests are not supported.', 400);
  }

  if (!request || request.jsonrpc !== '2.0' || typeof request.method !== 'string') {
    return rpcError(request?.id, -32600, 'Invalid JSON-RPC request', 400);
  }

  const modern = isModernRequest(req, request);
  const headerError = validateModernHeaders(req, request, modern);
  if (headerError) return rpcError(request.id, -32600, headerError, 400);

  const isNotification = request.id === undefined;
  const respond = (result) =>
    isNotification
      ? new Response(null, { status: 202, headers: CORS_HEADERS })
      : rpcResult(request.id, result);

  try {
    if (request.method === 'server/discover') {
      return respond({
        resultType: 'complete',
        supportedVersions: SUPPORTED_PROTOCOL_VERSIONS,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: SERVER_INSTRUCTIONS,
      });
    }

    if (request.method === 'initialize') {
      const requestedVersion = request.params?.protocolVersion;
      if (!requestedVersion) {
        return rpcError(request.id, -32602, 'protocolVersion is required');
      }

      const negotiatedVersion = LEGACY_PROTOCOL_VERSIONS.includes(requestedVersion)
        ? requestedVersion
        : LEGACY_PROTOCOL_VERSIONS[0];

      return respond({
        protocolVersion: negotiatedVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: SERVER_INSTRUCTIONS,
      });
    }

    if (
      request.method === 'notifications/initialized' ||
      request.method === 'notifications/cancelled'
    ) {
      return new Response(null, { status: 202, headers: CORS_HEADERS });
    }

    if (request.method === 'ping') {
      return respond(completeResult({}, modern));
    }

    if (request.method === 'tools/list') {
      const result = { tools: TOOLS };
      if (modern) {
        result.resultType = 'complete';
        result.ttlMs = 60000;
        result.cacheScope = 'public';
      }
      return respond(result);
    }

    if (request.method !== 'tools/call') {
      return rpcError(request.id, -32601, 'Method not found', modern ? 404 : 200);
    }

    const name = request.params?.name;
    const args = request.params?.arguments ?? {};

    if (typeof name !== 'string' || !name) {
      return rpcError(request.id, -32602, 'Tool name is required');
    }

    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      return rpcError(request.id, -32602, 'Tool arguments must be an object');
    }

    if (!TOOLS.some((tool) => tool.name === name)) {
      return rpcError(request.id, -32602, `Unknown tool: ${name}`);
    }

    const allowedArgumentKeys =
      name === 'get_voxvpn_network_status'
        ? []
        : name === 'recommend_voxvpn_server'
          ? ['country']
          : ['limit', 'country'];

    const unknownKeys = Object.keys(args).filter((key) => !allowedArgumentKeys.includes(key));
    if (unknownKeys.length) {
      return respond(
        toolFailure(
          `Unsupported argument${unknownKeys.length > 1 ? 's' : ''}: ${unknownKeys.join(', ')}`,
          modern
        )
      );
    }

    let country = '';
    try {
      country = normalizeCountryArgument(args.country);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid country value.';
      return respond(toolFailure(message, modern));
    }

    let limit = 20;
    if (name === 'list_voxvpn_servers' && args.limit !== undefined) {
      if (!Number.isInteger(args.limit) || args.limit < 1 || args.limit > 50) {
        return respond(toolFailure('limit must be an integer from 1 to 50.', modern));
      }
      limit = args.limit;
    }

    const base44 = createClientFromRequest(req);
    const records = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    const onlineServers = (Array.isArray(records) ? records : [])
      .map(publicServer)
      .sort((a, b) => a.load_percent - b.load_percent || a.name.localeCompare(b.name));

    const matchingServers = country
      ? onlineServers.filter((server) => server.country === country)
      : onlineServers;
    const checkedAt = new Date().toISOString();

    if (name === 'list_voxvpn_servers') {
      const selected = matchingServers.slice(0, limit);
      const data = {
        servers: selected,
        total: matchingServers.length,
        returned: selected.length,
        checked_at: checkedAt,
      };
      if (country) data.country_filter = country;

      return respond(
        toolSuccess(
          data,
          `Found ${matchingServers.length} online VoxVPN location${matchingServers.length === 1 ? '' : 's'}${country ? ` in ${country}` : ''}; returning ${selected.length}.`,
          modern
        )
      );
    }

    if (name === 'recommend_voxvpn_server') {
      const candidate = matchingServers[0];
      const data = candidate
        ? { available: true, server: candidate, checked_at: checkedAt }
        : {
            available: false,
            message: country
              ? `No online VoxVPN location is currently available in ${country}.`
              : 'No online VoxVPN locations are currently available.',
            checked_at: checkedAt,
          };
      if (country) data.country_filter = country;

      return respond(
        toolSuccess(
          data,
          candidate
            ? `Recommended ${candidate.name} at ${candidate.load_percent}% reported load.`
            : data.message,
          modern
        )
      );
    }

    const loads = onlineServers.map((server) => server.load_percent);
    const data = {
      online_locations: onlineServers.length,
      countries: new Set(onlineServers.map((server) => server.country).filter(Boolean)).size,
      average_load_percent: loads.length
        ? Math.round(loads.reduce((total, load) => total + load, 0) / loads.length)
        : 0,
      status: onlineServers.length ? 'operational' : 'degraded',
      checked_at: checkedAt,
    };

    return respond(
      toolSuccess(
        data,
        `VoxVPN network status is ${data.status} with ${data.online_locations} online location${data.online_locations === 1 ? '' : 's'}.`,
        modern
      )
    );
  } catch (error) {
    console.error('mcpServer error:', error);
    return rpcError(request.id, -32603, 'Internal server error', 500);
  }
});