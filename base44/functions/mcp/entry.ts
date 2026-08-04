/**
 * VoxTelefony public MCP server v1.2.0.
 *
 * This endpoint is deliberately self-contained. It does not import the Base44
 * SDK, so public plugin availability does not depend on npm package resolution
 * or access to private Base44 entities. All tools are read-only.
 */

const SERVER_INFO = {
  name: 'voxtelefony',
  title: 'VoxTelefony',
  version: '1.2.0',
  description: 'Find virtual phone numbers, eSIM plans, and retail voice or messaging rates from VoxTelefony.',
};

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

const PUBLIC_PRICING = {
  number_local: {
    US: 4.99,
    CA: 5.99,
    GB: 6.99,
    AU: 7.99,
    DE: 5.99,
    FR: 5.99,
    NL: 5.99,
    SE: 5.99,
    ES: 6.99,
    IT: 6.99,
    '*': 6.99,
  },
  number_tollfree: {
    US: 9.99,
    '*': 12.99,
  },
  number_mobile: {
    US: 6.99,
    '*': 8.99,
  },
  call_outbound: {
    US: 0.03,
    CA: 0.04,
    GB: 0.05,
    AU: 0.06,
    DE: 0.05,
    '*': 0.014,
  },
  call_inbound: {
    US: 0.008,
    '*': 0.01,
  },
  sms_outbound: {
    US: 0.03,
    CA: 0.04,
    GB: 0.05,
    AU: 0.06,
    '*': 0.007,
  },
  sms_inbound: {
    US: 0.005,
    '*': 0.005,
  },
  esim_data: {
    '*': null,
  },
};

const ESIM_PLANS = [
  { plan_id: 'esim_us_1gb', name: 'USA 1GB', country: 'United States', country_code: 'US', data_gb: 1, duration_days: 7, retail_price: 4.99 },
  { plan_id: 'esim_us_5gb', name: 'USA 5GB', country: 'United States', country_code: 'US', data_gb: 5, duration_days: 30, retail_price: 14.99 },
  { plan_id: 'esim_us_10gb', name: 'USA 10GB', country: 'United States', country_code: 'US', data_gb: 10, duration_days: 30, retail_price: 19.99 },
  { plan_id: 'esim_ca_1gb', name: 'Canada 1GB', country: 'Canada', country_code: 'CA', data_gb: 1, duration_days: 7, retail_price: 4.99 },
  { plan_id: 'esim_ca_5gb', name: 'Canada 5GB', country: 'Canada', country_code: 'CA', data_gb: 5, duration_days: 30, retail_price: 14.99 },
  { plan_id: 'esim_uk_1gb', name: 'UK 1GB', country: 'United Kingdom', country_code: 'GB', data_gb: 1, duration_days: 7, retail_price: 4.99 },
  { plan_id: 'esim_uk_5gb', name: 'UK 5GB', country: 'United Kingdom', country_code: 'GB', data_gb: 5, duration_days: 30, retail_price: 14.99 },
  { plan_id: 'esim_au_1gb', name: 'Australia 1GB', country: 'Australia', country_code: 'AU', data_gb: 1, duration_days: 7, retail_price: 5.99 },
  { plan_id: 'esim_au_5gb', name: 'Australia 5GB', country: 'Australia', country_code: 'AU', data_gb: 5, duration_days: 30, retail_price: 15.99 },
  { plan_id: 'europe_3gb', name: 'Europe 3GB', country: 'Europe', country_code: 'EU', data_gb: 3, duration_days: 15, retail_price: 9.99 },
  { plan_id: 'europe_10gb', name: 'Europe 10GB', country: 'Europe', country_code: 'EU', data_gb: 10, duration_days: 30, retail_price: 24.99 },
  { plan_id: 'global_1gb', name: 'Global 1GB', country: 'Global', country_code: 'GL', data_gb: 1, duration_days: 30, retail_price: 12 },
  { plan_id: 'global_2gb', name: 'Global 2GB', country: 'Global', country_code: 'GL', data_gb: 2, duration_days: 30, retail_price: 16.99 },
  { plan_id: 'africa_5gb', name: 'Africa 5GB', country: 'Africa', country_code: 'AF', data_gb: 5, duration_days: 30, retail_price: 20 },
];

const TOOLS = [
  {
    name: 'search_virtual_numbers',
    title: 'Search virtual numbers',
    description: 'Use this when a user wants to check live VoxTelefony virtual-number availability by country, number type, or area code. It does not reserve or purchase a number.',
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
        availability_status: { type: 'string', enum: ['live', 'unavailable'] },
        message: { type: 'string' },
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
      required: ['country_code', 'number_type', 'count', 'currency', 'availability_status', 'message', 'numbers'],
    },
  },
  {
    name: 'get_service_pricing',
    title: 'Get service pricing',
    description: 'Use this when a user wants current VoxTelefony retail pricing for a supported number, calling, messaging, or eSIM category. It does not start a purchase.',
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
          description: 'ISO 3166-1 alpha-2 country code, or * for the global default.',
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
    description: 'Use this when a user wants to browse active VoxTelefony eSIM data plans, optionally filtered by country or region. It does not order or activate an eSIM.',
    annotations: READ_ONLY_ANNOTATIONS,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        country_code: {
          type: 'string',
          pattern: '^[A-Za-z]{2}$',
          description: 'Optional two-letter country or regional catalogue code, such as US, CA, GB, EU, GL, or AF.',
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
    description: 'Use this when a user wants current VoxTelefony retail inbound and outbound per-minute calling rates for a country. It does not place a call.',
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
const ALLOWED_CATEGORIES = new Set(Object.keys(PUBLIC_PRICING));

function normalizeCountryCode(value, allowGlobal = false) {
  const countryCode = String(value || '').trim().toUpperCase();
  if (allowGlobal && countryCode === '*') return countryCode;
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    throw new Error('country_code must be a two-letter ISO country code.');
  }
  return countryCode;
}

function asNullableNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function lookupRetailPrice(category, countryCode) {
  const table = PUBLIC_PRICING[category];
  if (!table) return null;
  if (Object.prototype.hasOwnProperty.call(table, countryCode)) {
    return asNullableNumber(table[countryCode]);
  }
  return asNullableNumber(table['*']);
}

function numberPricingCategory(numberType) {
  if (numberType === 'toll_free') return 'number_tollfree';
  if (numberType === 'mobile') return 'number_mobile';
  return 'number_local';
}

async function handleSearchVirtualNumbers(input) {
  const countryCode = normalizeCountryCode(input.country_code);
  const numberType = String(input.number_type || 'local').trim();
  if (!ALLOWED_NUMBER_TYPES.has(numberType)) {
    throw new Error('number_type is not supported.');
  }

  const areaCode = input.area_code == null ? '' : String(input.area_code).trim();
  if (areaCode && !/^[0-9]{1,8}$/.test(areaCode)) {
    throw new Error('area_code must contain 1 to 8 digits.');
  }

  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const typeMap = {
    local: 'Local',
    toll_free: 'TollFree',
    mobile: 'Mobile',
    national: 'National',
  };

  let availabilityStatus = 'unavailable';
  let message = 'Live carrier availability is temporarily unavailable.';
  let carrierNumbers = [];

  if (accountSid && authToken) {
    const params = new URLSearchParams({ PageSize: '10' });
    if (areaCode) params.set('AreaCode', areaCode);

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/AvailablePhoneNumbers/${countryCode}/${typeMap[numberType]}.json?${params.toString()}`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const payload = await response.json();
        carrierNumbers = Array.isArray(payload?.available_phone_numbers)
          ? payload.available_phone_numbers
          : [];
        availabilityStatus = 'live';
        message = carrierNumbers.length > 0
          ? 'Live matching numbers were returned by the carrier.'
          : 'The carrier currently has no matching numbers in this search.';
      } else {
        console.error('[mcp] carrier availability request failed', response.status);
      }
    } catch (error) {
      console.error('[mcp] carrier availability request failed', error instanceof Error ? error.message : error);
    }
  } else {
    console.error('[mcp] carrier credentials are not configured');
  }

  const monthlyPrice = lookupRetailPrice(numberPricingCategory(numberType), countryCode);
  const numbers = carrierNumbers.slice(0, 10).map((item) => ({
    phone_number: String(item?.phone_number || ''),
    country_code: countryCode,
    number_type: numberType,
    locality: String(item?.locality || item?.region || ''),
    voice_enabled: Boolean(item?.capabilities?.voice),
    sms_enabled: Boolean(item?.capabilities?.SMS || item?.capabilities?.sms),
    monthly_price: monthlyPrice,
  }));

  return {
    country_code: countryCode,
    number_type: numberType,
    count: numbers.length,
    currency: 'USD',
    availability_status: availabilityStatus,
    message,
    numbers,
  };
}

function handleGetServicePricing(input) {
  const category = String(input.category || '').trim();
  if (!ALLOWED_CATEGORIES.has(category)) {
    throw new Error('category is not supported.');
  }

  const countryCode = normalizeCountryCode(input.country_code, true);
  const retailPrice = lookupRetailPrice(category, countryCode);
  const isNumberCategory = category.startsWith('number_');
  const isCallCategory = category.startsWith('call_');

  return {
    category,
    country_code: countryCode,
    currency: 'USD',
    retail_price: retailPrice,
    activation_fee: isNumberCategory ? 0 : null,
    billing_increment_seconds: isCallCategory ? 60 : null,
  };
}

function handleListEsimPlans(input) {
  const countryCode = input.country_code == null
    ? null
    : normalizeCountryCode(input.country_code);

  const plans = countryCode
    ? ESIM_PLANS.filter((plan) => plan.country_code === countryCode)
    : ESIM_PLANS;

  return {
    country_code: countryCode,
    count: plans.length,
    currency: 'USD',
    plans,
  };
}

function handleGetCallRates(input) {
  const countryCode = normalizeCountryCode(input.country_code);
  return {
    country_code: countryCode,
    currency: 'USD',
    outbound_per_minute: lookupRetailPrice('call_outbound', countryCode),
    inbound_per_minute: lookupRetailPrice('call_inbound', countryCode),
    billing_increment_seconds: 60,
  };
}

async function callTool(name, args) {
  switch (name) {
    case 'search_virtual_numbers':
      return await handleSearchVirtualNumbers(args);
    case 'get_service_pricing':
      return handleGetServicePricing(args);
    case 'list_esim_plans':
      return handleListEsimPlans(args);
    case 'get_call_rates':
      return handleGetCallRates(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function dispatch(method, params) {
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
      const args = params?.arguments && typeof params.arguments === 'object'
        ? params.arguments
        : {};

      try {
        const result = await callTool(name, args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
          isError: false,
        };
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'The requested information could not be retrieved.';
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
    headers: {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8',
    },
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
    return jsonResponse({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error' },
    }, 400, corsHeaders);
  }

  async function handleMessage(message) {
    if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
      return {
        jsonrpc: '2.0',
        id: message?.id ?? null,
        error: { code: -32600, message: 'Invalid Request' },
      };
    }

    const isNotification = message.id === undefined;
    const result = await dispatch(message.method, message.params || {});
    if (isNotification || result === null) return null;

    if (result?.__rpcError) {
      return { jsonrpc: '2.0', id: message.id, error: result.__rpcError };
    }

    return { jsonrpc: '2.0', id: message.id, result };
  }

  try {
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return jsonResponse({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32600, message: 'Invalid Request' },
        }, 400, corsHeaders);
      }

      const responses = (await Promise.all(body.map(handleMessage))).filter(Boolean);
      if (responses.length === 0) {
        return new Response(null, { status: 202, headers: corsHeaders });
      }
      return jsonResponse(responses, 200, corsHeaders);
    }

    const response = await handleMessage(body);
    if (response === null) {
      return new Response(null, { status: 202, headers: corsHeaders });
    }
    return jsonResponse(response, 200, corsHeaders);
  } catch (error) {
    console.error('[mcp] fatal error', error instanceof Error ? error.message : error);
    return jsonResponse({
      jsonrpc: '2.0',
      id: body?.id ?? null,
      error: { code: -32603, message: 'Internal error' },
    }, 500, corsHeaders);
  }
});
