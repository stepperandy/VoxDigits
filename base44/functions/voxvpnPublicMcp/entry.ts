// VoxVPN Public MCP — stateless streamable-HTTP JSON-RPC server for the
// public "VoxVPN" ChatGPT plugin. Serves ONLY static content that is already
// public on the website (plans, server locations, setup guidance).
// No entity reads, no service role, no secrets, no credentials, no write ops.

const SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const LATEST_PROTOCOL_VERSION = "2025-06-18";
const SERVER_NAME = "voxvpn-public-mcp";
const SERVER_VERSION = "1.0.0";
const SITE = "https://voxvpn.net";
// Date the static catalog below was copied from the public website.
// Distinct from retrieved_at (the per-request timestamp) so a fresh response
// never implies prices/locations were freshly fetched live.
const CONTENT_AS_OF = "2026-10-21";

const DISCLAIMER =
  "VoxVPN is not enabled by chatting with this tool; a subscription and the " +
  "app on your device are required. Security and privacy statements (AES-256, " +
  "no-logs, kill switch) are vendor claims, not independently audited guarantees. " +
  "Prices are in USD; the website is authoritative.";

// ── Public catalog data (verbatim from the public website) ──────────────────

const PLANS = [
  {
    name: "1 Month",
    duration: "30 days",
    price_usd: 2.59,
    price_per_month_usd: 2.59,
    savings_percent: 0,
    badge: null,
    features: ["Unlimited Bandwidth", "AES-256 Encryption", "No-Logs Policy", "All Server Locations", "Kill Switch"]
  },
  {
    name: "3 Months",
    duration: "90 days",
    price_usd: 6.99,
    price_per_month_usd: 2.33,
    savings_percent: 10,
    badge: null,
    features: ["Unlimited Bandwidth", "AES-256 Encryption", "No-Logs Policy", "All Server Locations", "Kill Switch", "Split Tunneling"]
  },
  {
    name: "6 Months",
    duration: "180 days",
    price_usd: 13.99,
    price_per_month_usd: 2.33,
    savings_percent: 10,
    badge: "Most Popular",
    features: ["Unlimited Bandwidth", "AES-256 Encryption", "No-Logs Policy", "All Server Locations", "Kill Switch", "Split Tunneling", "DNS Leak Protection", "Priority Support"]
  },
  {
    name: "1 Year",
    duration: "365 days",
    price_usd: 24.99,
    price_per_month_usd: 2.08,
    savings_percent: 20,
    badge: "Best Value",
    features: ["Unlimited Bandwidth", "AES-256 Encryption", "No-Logs Policy", "All Server Locations", "Kill Switch", "Split Tunneling", "DNS & IPv6 Leak Protection", "Dedicated IP Address", "24/7 Priority Support"]
  },
  {
    name: "2 Years",
    duration: "730 days",
    price_usd: 45.99,
    price_per_month_usd: 1.92,
    savings_percent: 26,
    badge: null,
    features: ["Unlimited Bandwidth", "AES-256 Encryption", "No-Logs Policy", "All Server Locations", "Kill Switch", "Split Tunneling", "DNS & IPv6 Leak Protection", "Static Dedicated IP", "Double VPN (Multi-hop)", "Dedicated Account Manager"]
  }
];

// City/country only — hostnames, IPs, ports, keys and configs are never exposed.
const LOCATIONS = [
  { city: "Amsterdam", country: "Netherlands", region: "Europe" },
  { city: "Atlanta", country: "United States", region: "Americas" },
  { city: "Chicago", country: "United States", region: "Americas" },
  { city: "Frankfurt", country: "Germany", region: "Europe" },
  { city: "Johannesburg", country: "South Africa", region: "Africa" },
  { city: "London", country: "United Kingdom", region: "Europe" },
  { city: "Los Angeles", country: "United States", region: "Americas" },
  { city: "Madrid", country: "Spain", region: "Europe" },
  { city: "Manchester", country: "United Kingdom", region: "Europe" },
  { city: "Melbourne", country: "Australia", region: "Asia Pacific" },
  { city: "Miami", country: "United States", region: "Americas" },
  { city: "Milan", country: "Italy", region: "Europe" },
  { city: "New Jersey", country: "United States", region: "Americas" },
  { city: "Paris", country: "France", region: "Europe" },
  { city: "Seattle", country: "United States", region: "Americas" },
  { city: "Silicon Valley", country: "United States", region: "Americas" },
  { city: "Singapore", country: "Singapore", region: "Asia Pacific" },
  { city: "Sydney", country: "Australia", region: "Asia Pacific" },
  { city: "Tokyo", country: "Japan", region: "Asia Pacific" },
  { city: "Toronto", country: "Canada", region: "Americas" }
];
const REGIONS = ["Americas", "Europe", "Asia Pacific", "Africa"];

const SETUP_PLATFORMS = ["windows", "macos", "linux", "ios", "android", "router"];
const SETUP_GUIDE = {
  windows: "Create a VoxVPN account, then get the Windows installer from the Downloads page and run the setup. Detailed steps are in the setup portal.",
  macos: "Create a VoxVPN account, then download the macOS installer from the Downloads page and follow the setup portal steps.",
  linux: "Create a VoxVPN account, download the Linux configuration files from the Downloads page, and import one into OpenVPN. The setup portal has per-distro steps.",
  ios: "Install the VoxVPN app from the App Store, sign in with your VoxVPN account, choose a server and connect. Sign-up can be done in-app.",
  android: "Install the VoxVPN app from Google Play, sign in with your VoxVPN account, choose a server and connect. Sign-up can be done in-app.",
  router: "Supported on OpenVPN-compatible routers. Create an account, download the router configuration from the Downloads page, and follow the setup portal guide for your router model."
};

// ── Tool definitions (strict, bounded, read-only) ───────────────────────────

const ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

const TOOLS = [
  {
    name: "get_vpn_plans",
    title: "Get VoxVPN plans and prices",
    description:
      "Returns VoxVPN's consumer subscription plans with USD prices, billing durations, savings and included features. " +
      "Use when someone asks about VoxVPN pricing. Prices come from the public pricing page and are in USD; " +
      "it does not subscribe or enable VPN protection for anyone.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: ANNOTATIONS
  },
  {
    name: "get_vpn_server_locations",
    title: "Get VoxVPN server locations",
    description:
      "Returns the public list of VoxVPN server cities and countries, optionally filtered by region. " +
      "Use when someone asks where VoxVPN has servers. Only city/country/region are returned; " +
      "hostnames, IP addresses, ports, keys and connection configs are never exposed.",
    inputSchema: {
      type: "object",
      properties: {
        region: {
          type: "string",
          enum: REGIONS,
          description: "Optional filter by region. Omit to list all locations."
        }
      },
      additionalProperties: false
    },
    annotations: ANNOTATIONS
  },
  {
    name: "get_setup_help",
    title: "Get VoxVPN setup guidance",
    description:
      "Returns public setup guidance for VoxVPN apps per platform (windows, macos, linux, ios, android, router) with links to the setup portal, downloads and help center. " +
      "Use when someone asks how to install or set up VoxVPN. An account is required to download; chatting does not enable protection.",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: SETUP_PLATFORMS,
          description: "Optional platform filter. Omit for an overview of all platforms."
        }
      },
      additionalProperties: false
    },
    annotations: ANNOTATIONS
  }
];
const TOOL_NAMES = TOOLS.map((tool) => tool.name);

// ── JSON-RPC helpers ────────────────────────────────────────────────────────

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Authorization"
};

const jsonResponse = (body, status) =>
  new Response(body === null ? null : JSON.stringify(body), { status: status || 200, headers: jsonHeaders });

const rpcResult = (id, result) => jsonResponse({ jsonrpc: "2.0", id: id, result: result });
const rpcError = (id, code, message, status) =>
  jsonResponse({ jsonrpc: "2.0", id: id, error: { code: code, message: message } }, status || 200);

const errorText = (code, message) => ({ code: code, message: message });

// ── Tool implementations ────────────────────────────────────────────────────

function buildPlansPayload() {
  return {
    currency: "USD",
    content_as_of: CONTENT_AS_OF,
    retrieved_at: new Date().toISOString(),
    source: SITE + "/#pricing",
    plans: PLANS,
    disclaimer: DISCLAIMER
  };
}

function buildLocationsPayload(regionFilter) {
  const locations = regionFilter ? LOCATIONS.filter((loc) => loc.region === regionFilter) : LOCATIONS;
  return {
    content_as_of: CONTENT_AS_OF,
    retrieved_at: new Date().toISOString(),
    source: SITE + "/#servers",
    regions: regionFilter ? [regionFilter] : REGIONS,
    location_count: locations.length,
    locations: locations,
    note: "City and country only; hostnames, IP addresses, ports, keys and connection configs are not exposed by this tool.",
    disclaimer: DISCLAIMER
  };
}

function buildSetupPayload(platformFilter) {
  const platforms = platformFilter ? [platformFilter] : SETUP_PLATFORMS;
  return {
    content_as_of: CONTENT_AS_OF,
    retrieved_at: new Date().toISOString(),
    source: SITE + "/setup-guide",
    account_required: true,
    platforms: platforms.map((platform) => ({
      platform: platform,
      summary: SETUP_GUIDE[platform]
    })),
    links: {
      setup_portal: SITE + "/setup-guide",
      downloads: SITE + "/download",
      help_center: SITE + "/help-center",
      contact: SITE + "/contact"
    },
    note: "An account and subscription are required to download and connect; chatting with this tool does not enable VPN protection.",
    disclaimer: DISCLAIMER
  };
}

// Strict argument validation: no unknown keys, no operator inputs of any kind.
function validateToolCall(name, args) {
  if (args === undefined || args === null) args = {};
  if (typeof args !== "object" || Array.isArray(args)) {
    return errorText(-32602, "Invalid params: 'arguments' must be an object");
  }
  const keys = Object.keys(args);
  if (name === "get_vpn_plans") {
    if (keys.length > 0) return errorText(-32602, "Invalid params: get_vpn_plans takes no arguments");
    return null;
  }
  if (name === "get_vpn_server_locations") {
    if (keys.length > 1 || (keys.length === 1 && keys[0] !== "region")) {
      return errorText(-32602, "Invalid params: only 'region' is accepted");
    }
    const region = args.region;
    if (region !== undefined && !REGIONS.includes(region)) {
      return errorText(-32602, "Invalid params: 'region' must be one of " + REGIONS.join(", "));
    }
    return null;
  }
  if (name === "get_setup_help") {
    if (keys.length > 1 || (keys.length === 1 && keys[0] !== "platform")) {
      return errorText(-32602, "Invalid params: only 'platform' is accepted");
    }
    const platform = args.platform;
    if (platform !== undefined && !SETUP_PLATFORMS.includes(platform)) {
      return errorText(-32602, "Invalid params: 'platform' must be one of " + SETUP_PLATFORMS.join(", "));
    }
    return null;
  }
  return errorText(-32602, "Unknown tool: " + name);
}

function runTool(name, args) {
  let payload;
  if (name === "get_vpn_plans") payload = buildPlansPayload();
  else if (name === "get_vpn_server_locations") payload = buildLocationsPayload(args.region);
  else if (name === "get_setup_help") payload = buildSetupPayload(args.platform);
  else return rpcError(null, -32602, "Unknown tool: " + name);
  return {
    content: [{ type: "text", text: JSON.stringify(payload) }],
    structuredContent: payload,
    isError: false
  };
}

// ── Request routing ────────────────────────────────────────────────────────

function handleRpcMessage(msg) {
  if (msg === null || typeof msg !== "object" || Array.isArray(msg) || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return rpcError(null, -32600, "Invalid Request");
  }
  const id = msg.id;
  const hasId = id !== undefined && id !== null;
  const isNotification = !hasId;

  // Notifications get no response body (HTTP 202)
  if (isNotification) {
    return new Response(null, { status: 202, headers: jsonHeaders });
  }
  if (typeof id !== "string" && typeof id !== "number") {
    return rpcError(null, -32600, "Invalid Request: 'id' must be a string or number");
  }

  switch (msg.method) {
    case "initialize": {
      const requested = msg.params && msg.params.protocolVersion;
      const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : LATEST_PROTOCOL_VERSION;
      return rpcResult(id, {
        protocolVersion: protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION, title: "VoxVPN Public Catalog" },
        instructions:
          "Public read-only catalog of VoxVPN consumer plans (USD), server city/country locations, and per-platform setup guidance. " +
          "No accounts, credentials, subscriptions or connection configs are accessible here."
      });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: TOOLS });
    case "tools/call": {
      const params = msg.params;
      if (params === null || typeof params !== "object" || Array.isArray(params) || typeof params.name !== "string") {
        return rpcError(id, -32602, "Invalid params: 'name' (string) is required");
      }
      if (!TOOL_NAMES.includes(params.name)) {
        return rpcError(id, -32602, "Unknown tool: " + params.name);
      }
      const validationError = validateToolCall(params.name, params.arguments);
      if (validationError) {
        return rpcError(id, validationError.code, validationError.message);
      }
      return rpcResult(id, runTool(params.name, params.arguments || {}));
    }
    default:
      return rpcError(id, -32601, "Method not found: " + msg.method);
  }
}

export default async function (req) {
  try {
    // Stateless server: GET (SSE stream) is not supported → 405
    if (req.method !== "POST") {
      const status = req.method === "OPTIONS" ? 204 : 405;
      return new Response(null, { status: status, headers: { ...jsonHeaders, Allow: "POST, OPTIONS" } });
    }

    let body;
    let parsed;
    try {
      body = await req.text();
      parsed = JSON.parse(body);
    } catch (parseError) {
      return rpcError(null, -32700, "Parse error", 400);
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return rpcError(null, -32600, "Invalid Request");
    }
    return handleRpcMessage(parsed);
  } catch (error) {
    return rpcError(null, -32603, "Internal error: " + error.message);
  }
}