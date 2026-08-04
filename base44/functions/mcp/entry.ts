/**
 * VoxTelefony public MCP server.
 *
 * This first marketplace release is intentionally read-only. It exposes public
 * availability and retail-pricing information only; it does not expose account
 * data, credentials, call or message content, or tools that create side effects.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SERVER_INFO = {
  name: 'voxtelefony',
  title: 'VoxTelefony',
  version: '1.1.0',
  description: 'Find virtual phone numbers, eSIM plans, and retail voice or messaging rates from VoxTelefony.',
};

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  // Results come from live carrier and product catalogues outside ChatGPT.
  openWorldHint: true,
};

const TOOLS = [
  {
    name: 'search_virtual_numbers',
    title: 'Search virtual numbers',
    description: 'Search the live VoxTelefony catalogue for virtual phone numbers available in a specified country. This only checks availability and does not reserve or purchase a number.',
    annotations: READ_ONLY_ANNOTATIONS,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        country_code: {
          type: 'string',
          pattern: '^[A-Za-z]{2}$',
          description: 'ISO 3166-1 alpha-2 country code, such as US, GB, or CA.',
        },
        number_type: {
          type: 'string',
          enum: ['local', 'toll_free', 'mobile', 'national'],
          default: 'local',
          description: 'The type of virtual number to search for.',
        },
        area_code: {
          type: 'string',
          pattern: '^[0-9]{1,8}$',
          description: 'Optional numeric area or destination code, without spaces or punctuation.',
        },
      },
      required: ['country_code'],
    },
    outputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        country_code: { type: 'string' },
        number_type: { type: 'string' },
        count: { type: 'integer' },
        currency: { type: 'string' },
        numbers: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              phone_number: { type: 'string' },
              country_code: { type: 'string' },
              number_type: { type: 'string' },
              locality: { type: 'string' },
              voice_enabled: { type: 'boolean' },
              sms_enabled: { type: 'boolean' },
              monthly_price: { type: ['number', 'null'] },
            },
            required: ['phone_number', 'country_code', 'number_type', 'locality', 'voice_enabled', 'sms_enabled', 'monthly_price'],
          },
        },
      },
      required: ['country_code', 'number_type', 'count', 'currency', 'numbers'],
    },
  },
  {
    name: 'get_service_pricing',
    title: 'Get service pricing',
    description: 'Get current VoxTelefony retail pricing for a supported number, calling, messaging, or eSIM category in a country. This only retrieves pricing and does not start a purchase.',
    annotations: READ_ONLY_ANNOTATIONS,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        category: {
          type: 'string',
          enum: ['number_local', 'number_tollfree', 'number_mobile', 'call_outbound', 'call_inbound', 'sms_outbound', 'sms_inbound', 'esim_data'],
          description: 'The service category whose retail price should be retrieved.',
        },
        country_code: {
          type: 'string',
          pattern: '^([A-Za-z]{2}|\\*)$',
          description: 'ISO 3166-1 alpha-2 country code, or * for a global default where supported.',
        },
      },
      required: ['category', 'country_code'],
    },
    outputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        category: { type: 'string' },
        country_code: { type: 'string' },
        currency: { type: 'string' },
        retail_price: { type: ['number', 'null'] },
        activation_fee: { type: ['number', 'null'] },
        billing_increment_seconds: { type: ['number', 'null'] },
      },
      required: ['category', 'country_code', 'currency', 'retail_price', 'activation_fee', 'billing_increment_seconds'],
    },
  },
  {
    name: 'list_esim_plans',
    title: 'List eSIM plans',
    description: 'List active VoxTelefony eSIM data plans, optionally filtered by country. This only retrieves plan information and does not order or activate an eSIM.',
    annotations: READ_ONLY_ANNOTATIONS,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        country_code: {
          type: 'string',
          pattern: '^[A-Za-z]{2}$',
          description: 'Optional ISO 3166-1 alpha-2 country code.',
        },
      },
    },
    outputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        country_code: { type: ['string', 'null'] },
        count: { type: 'integer' },
        currency: { type: 'string' },
        plans: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              plan_id: { type: 'string' },
              name: { type: 'string' },
              country: { type: 'string' },
              country_code: { type: 'string' },
              data_gb: { type: ['number', 'null'] },
              duration_days: { type: ['number', 'null'] },
              retail_price: { type: ['number', 'null'] },
            },
            required: ['plan_id', 'name', 'country', 'country_code', 'data_gb', 'duration_days', 'retail_price'],
          },
        },
      },
      required: ['country_code', 'count', 'currency', 'plans'],
    },
  },
  {
    name: 'get_call_rates',
    title: 'Get call rates',
    description: 'Get current VoxTelefony retail inbound and outbound per-minute calling rates for a country. This only retrieves rates and does not place a call.',
    annotations: READ_ONLY_ANNOTATIONS,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        country_code: {
          type: 'string',
          pattern: '^[A-Za-z]{2}$',
          description: 'ISO 3166-1 alpha-2 country code, such as US or GB.',
        },
      },
      required: ['country_code'],
    },
    outputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        country_code: { type: 'string' },
        currency: { type: 'string' },
        outbound_per_minute: { type: ['number', 'null'] },
        inbound_per_minute: { type: ['number', 'null'] },
        billing_increment_seconds: { type: 'number' },
      },
      required: ['country_code', 'currency', 'outbound_per_minute', 'inbound_per_minute', 'billing_increment_seconds'],
    },
  },
];

const ALLOWED_NUMBER_TYPES = new Set(['local', 'toll_free', 'mobile', 'national']);
const ALLOWED_CATEGORIES = new Set(['number_local', 'number_tollfree', 'number_mobile', 'call_outbound', 'call_inbound', 'sms_outbound', 'sms_inbound', 'esim_data']);

function normalizeCountryCode(value, allowGlobal = false) {
  const countryCode = String(value || '').trim().toUpperCase();
  if (allowGlobal && countryCode === '*') return countryCode;
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    throw new Error('country_code must be a two-letter ISO country code.');
  }
  return countryCode;
}

function asNullableNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

async function handleSearchVirtualNumbers(base44, input) {
  const countryCode = normalizeCountryCode(input.country_code);
  const numberType = String(input.number_type || 'local');
  if (!ALLOWED_NUMBER_TYPES.has(numberType)) {
    throw new Error('number_type is not supported.');
  }

  const areaCode = input.area_code == null ? '' : String(input.area_code).trim();
  if (areaCode && !/^[0-9]{1,8}$/.test(areaCode)) {
    throw new Error('area_code must contain 1 to 8 digits.');
  }

  const carrierApiKey = Deno.env.get('TELNYX_API_KEY');
  if (!carrierApiKey) {
    throw new Error('Number availability is temporarily unavailable.');
  }

  const params = new URLSearchParams({
    'filter[country_code]': countryCode,
    'filter[number_type]': numberType,
    'page[size]': '10',
  });
  if (areaCode) params.set('filter[national_destination_code]', areaCode);

  const response = await fetch(`https://api.telnyx.com/v2/available_phone_numbers?${params.toString()}`, {
    headers: { Authorization: `Bearer ${carrierApiKey}` },
  });
  if (!response.ok) {
    console.error('[mcp] carrier availability request failed', response.status);
    throw new Error('Number availability could not be retrieved right now.');
  }

  const payload = await response.json();
  const pricing = await base44.asServiceRole.functions.invoke('pricingEngine', {
    action: 'lookup',
    category: `number_${numberType === 'toll_free' ? 'tollfree' : numberType}`,
    country_code: countryCode,
  });
  const monthlyPrice = asNullableNumber(pricing?.sell_price);

  const numbers = (payload?.data || []).slice(0, 10).map((item) => ({
    phone_number: String(item?.phone_number || ''),
    country_code: String(item?.country_code || countryCode),
    number_type: String(item?.number_type || numberType),
    locality: String(item?.locality || item?.administrative_area || ''),
    voice_enabled: Array.isArray(item?.features) && item.features.some((feature) => feature?.name === 'voice'),
    sms_enabled: Array.isArray(item?.features) && item.features.some((feature) => feature?.name === 'sms'),
    monthly_price: monthlyPrice,
  }));

  return {
    country_code: countryCode,
    number_type: numberType,
    count: numbers.length,
    currency: 'USD',
    numbers,
  };
}

async function handleGetServicePricing(base44, input) {
  const category = String(input.category || '').trim();
  if (!ALLOWED_CATEGORIES.has(category)) {
    throw new Error('category is not supported.');
  }
  const countryCode = normalizeCountryCode(input.country_code, true);
  const pricing = await base44.asServiceRole.functions.invoke('pricingEngine', {
    action: 'lookup',
    category,
    country_code: countryCode,
  });

  if (!pricing?.success) {
    throw new Error('Pricing is not available for that category and country.');
  }

  return {
    category: String(pricing.category || category),
    country_code: String(pricing.country_code || countryCode),
    currency: 'USD',
    retail_price: asNullableNumber(pricing.sell_price),
    activation_fee: asNullableNumber(pricing.activation_fee),
    billing_increment_seconds: asNullableNumber(pricing.billing_increment_secs),
  };
}

async function handleListEsimPlans(base44, input) {
  const countryCode = input.country_code == null ? null : normalizeCountryCode(input.country_code);
  const filter = countryCode ? { country_code: countryCode, is_active: true } : { is_active: true };
  const plans = await base44.asServiceRole.entities.ESimProduct.filter(filter, 'price', 20);
  const publicPlans = (plans || []).map((plan) => ({
    plan_id: String(plan?.product_id || plan?.id || ''),
    name: String(plan?.name || ''),
    country: String(plan?.country || ''),
    country_code: String(plan?.country_code || ''),
    data_gb: asNullableNumber(plan?.data_gb),
    duration_days: asNullableNumber(plan?.duration_days),
    retail_price: asNullableNumber(plan?.price),
  }));

  return {
    country_code: countryCode,
    count: publicPlans.length,
    currency: 'USD',
    plans: publicPlans,
  };
}

async function handleGetCallRates(base44, input) {
  const countryCode = normalizeCountryCode(input.country_code);
  const [outbound, inbound] = await Promise.all([
    base44.asServiceRole.functions.invoke('pricingEngine', {
      action: 'lookup',
      category: 'call_outbound',
      country_code: countryCode,
    }),
    base44.asServiceRole.functions.invoke('pricingEngine', {
      action: 'lookup',
      category: 'call_inbound',
      country_code: countryCode,
    }),
  ]);

  return {
    country_code: countryCode,
    currency: 'USD',
    outbound_per_minute: asNullableNumber(outbound?.sell_price),
    inbound_per_minute: asNullableNumber(inbound?.sell_price),
    billing_increment_seconds: asNullableNumber(outbound?.billing_increment_secs) || 6,
  };
}

async function callTool(base44, name, args) {
  switch (name) {
    case 'search_virtual_numbers':
      return await handleSearchVirtualNumbers(base44, args);
    case 'get_service_pricing':
      return await handleGetServicePricing(base44, args);
    case 'list_esim_plans':
      return await handleListEsimPlans(base44, args);
    case 'get_call_rates':
      return await handleGetCallRates(base44, args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function dispatch(base44, method, params) {
  switch (method) {
    case 'initialize': {
      const requested = String(params?.protocolVersion || '');
      const supported = new Set(['2025-06-18', '2025-03-26', '2024-11-05']);
      const protocolVersion = supported.has(requested) ? requested : '2025-06-18';
      return {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: 'Use these read-only tools to retrieve public VoxTelefony number availability, eSIM plans, and retail rates. Never imply that a number or plan has been reserved or purchased.',
      };
    }

    case 'notifications/initialized':
      return null;

    case 'ping':
      return {};

    case 'tools/list':
      return { tools: TOOLS };

    case 'tools/call': {
      const name = String(params?.name || '');
      const args = params?.arguments && typeof params.arguments === 'object' ? params.arguments : {};
      try {
        const result = await callTool(base44, name, args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
          isError: false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'The requested information could not be retrieved.';
        console.error(`[mcp] tool failed: ${name}`, message);
        return {
          content: [{ type: 'text', text: message }],
          isError: true,
        };
      }
    }

    default:
      return { __rpcError: { code: -32601, message: `Method not found: ${method}` } };
  }
}

function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

Deno.serve(async (request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version',
    'Access-Control-Expose-Headers': 'Mcp-Session-Id',
    'Cache-Control': 'no-store',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method === 'GET') {
    return jsonResponse({
      name: SERVER_INFO.name,
      title: SERVER_INFO.title,
      version: SERVER_INFO.version,
      description: SERVER_INFO.description,
      protocol: 'Model Context Protocol',
      transport: 'Streamable HTTP',
      authentication: 'none',
      access: 'public read-only catalogue data',
      tools: TOOLS.map((tool) => ({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        annotations: tool.annotations,
      })),
      website: 'https://voxtelefony.com',
      support: 'https://voxtelefony.com/support',
      privacy: 'https://voxtelefony.com/privacypolicy',
      terms: 'https://voxtelefony.com/termsofservice',
    }, 200, corsHeaders);
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, 400, corsHeaders);
  }

  const base44 = createClientFromRequest(request);

  async function handleMessage(message) {
    if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
      return { jsonrpc: '2.0', id: message?.id ?? null, error: { code: -32600, message: 'Invalid Request' } };
    }

    const isNotification = message.id === undefined;
    const result = await dispatch(base44, message.method, message.params || {});
    if (isNotification || result === null) return null;
    if (result?.__rpcError) {
      return { jsonrpc: '2.0', id: message.id, error: result.__rpcError };
    }
    return { jsonrpc: '2.0', id: message.id, result };
  }

  try {
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return jsonResponse({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid Request' } }, 400, corsHeaders);
      }
      const responses = (await Promise.all(body.map(handleMessage))).filter(Boolean);
      if (responses.length === 0) return new Response(null, { status: 202, headers: corsHeaders });
      return jsonResponse(responses, 200, corsHeaders);
    }

    const response = await handleMessage(body);
    if (response === null) return new Response(null, { status: 202, headers: corsHeaders });
    return jsonResponse(response, 200, corsHeaders);
  } catch (error) {
    console.error('[mcp] fatal error', error instanceof Error ? error.message : error);
    return jsonResponse({ jsonrpc: '2.0', id: body?.id ?? null, error: { code: -32603, message: 'Internal error' } }, 500, corsHeaders);
  }
});