import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Server, Activity, Zap, ShieldCheck, Loader2, Terminal, Sparkles, Globe, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

const PROTOCOL_VERSION = '2025-03-26';

// Mirror of the TOOLS exposed by base44/functions/mcpServer/entry.ts
const TOOLS = [
  {
    name: 'list_voxvpn_servers',
    title: 'List VoxVPN servers',
    desc: 'List public VoxVPN server locations that are currently online. Results never include VPN credentials or server IP addresses.',
    argsExample: { limit: 10 },
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: 'Maximum locations to return (1–50, default 20).' },
        country: { type: 'string', description: 'Optional ISO 3166-1 alpha-2 country code, e.g. US or GB.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'recommend_voxvpn_server',
    title: 'Recommend a VoxVPN server',
    desc: 'Recommend the least-loaded public VoxVPN location, optionally in a requested country.',
    argsExample: { country: 'US' },
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
    title: 'Get VoxVPN network status',
    desc: 'Get the public VoxVPN network health summary, including online location count and average load.',
    argsExample: {},
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-xl border border-white/5 bg-[#0d1120] overflow-hidden">
      {label && <div className="px-4 py-3 border-b border-white/5 text-xs text-slate-400 font-mono flex items-center justify-between">{label}</div>}
      <div className="relative">
        <pre className="p-4 text-xs text-slate-300 font-mono overflow-auto whitespace-pre-wrap break-all">{code}</pre>
        <button onClick={copy} className="absolute top-2 right-2 p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          {copied ? <Check size={14} className="text-cyan-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

function ToolCard({ tool, onTry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-5 rounded-xl border border-white/5 bg-[#0d1120]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-cyan-300 font-mono text-sm mb-1">{tool.name}</h3>
          <p className="text-white text-xs font-semibold mb-1">{tool.title}</p>
          <p className="text-slate-400 text-sm">{tool.desc}</p>
        </div>
        <button onClick={() => onTry(tool)} className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 transition-colors">
          Try
        </button>
      </div>
      <button onClick={() => setOpen(!open)} className="mt-3 flex items-center gap-1 text-slate-500 hover:text-white text-xs">
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Input schema
      </button>
      {open && (
        <pre className="mt-2 text-xs text-slate-400 font-mono bg-[#080c18] rounded p-3 overflow-auto">{JSON.stringify(tool.inputSchema, null, 2)}</pre>
      )}
    </div>
  );
}

export default function McpHub() {
  const [ai, setAi] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);
  const [demo, setDemo] = useState({
    tool: 'get_voxvpn_network_status',
    args: '{}',
    running: false,
    result: null,
    request: null,
    error: null,
  });

  useEffect(() => {
    base44.integrations.Core.InvokeLLM({
      prompt: `You are the marketing copywriter for VoxVPN, a global VPN service. We just launched an MCP (Model Context Protocol) server that lets AI assistants query our live server network. Write marketing + educational content for the launch page. Return JSON with exactly these fields:
- hero_headline: string (max 9 words, no quotes)
- hero_sub: string (1 sentence, max 28 words) explaining MCP for a non-technical reader
- intro: string (2-3 sentences, max 60 words) on why VoxVPN exposing its network to AI tools matters
- benefits: array of exactly 4 objects { title (3-5 words), desc (1 sentence, max 22 words) }
- use_cases: array of exactly 3 objects { title (3-5 words), desc (1 sentence, max 22 words) }
- faq: array of exactly 4 objects { q (question, max 12 words), a (answer, max 30 words) }`,
      response_json_schema: {
        type: 'object',
        properties: {
          hero_headline: { type: 'string' },
          hero_sub: { type: 'string' },
          intro: { type: 'string' },
          benefits: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, desc: { type: 'string' } } } },
          use_cases: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, desc: { type: 'string' } } } },
          faq: { type: 'array', items: { type: 'object', properties: { q: { type: 'string' }, a: { type: 'string' } } } },
        },
      },
    })
      .then(setAi)
      .finally(() => setLoadingAi(false));
  }, []);

  useEffect(() => {
    runDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildRequest = (toolName, argsObj) => ({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: toolName, arguments: argsObj },
  });

  const runDemo = async () => {
    setDemo((d) => ({ ...d, running: true, error: null, result: null, request: null }));
    let args = {};
    try { args = JSON.parse(demo.args || '{}'); } catch { setDemo((d) => ({ ...d, running: false, error: 'Invalid JSON arguments' })); return; }
    const request = buildRequest(demo.tool, args);
    try {
      const res = await base44.functions.invoke('mcpServer', request);
      const body = res?.data || res;
      // The MCP server returns a JSON-RPC envelope; the tool payload is in result.content[0].text
      const text = body?.result?.content?.[0]?.text;
      const parsed = text ? JSON.parse(text) : body;
      if (body?.error) throw new Error(body.error.message || 'MCP error');
      setDemo((d) => ({ ...d, running: false, result: parsed, request }));
    } catch (e) {
      setDemo((d) => ({ ...d, running: false, error: e.message || 'Request failed', request }));
    }
  };

  const tryTool = (tool) => {
    setDemo({ tool: tool.name, args: JSON.stringify(tool.argsExample, null, 2), running: false, result: null, request: null, error: null });
    setTimeout(runDemo, 50);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.example';
  const endpoint = `${origin}/functions/mcpServer`;

  const initializeReq = JSON.stringify({
    jsonrpc: '2.0', id: 0, method: 'initialize',
    params: { protocolVersion: PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: 'demo', version: '1.0.0' } },
  }, null, 2);
  const initializeRes = JSON.stringify({
    jsonrpc: '2.0', id: 0,
    result: {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: 'voxvpn', version: '1.0.0', title: 'VoxVPN' },
      instructions: 'Use these public, read-only tools to compare VoxVPN server locations and network status. Never request or expose credentials.',
    },
  }, null, 2);

  const listToolsReq = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, null, 2);

  const callReq = JSON.stringify(buildRequest('recommend_voxvpn_server', { country: 'US' }), null, 2);
  const callRes = JSON.stringify({
    jsonrpc: '2.0', id: 1,
    result: { content: [{ type: 'text', text: '{\n  "id": "...",\n  "name": "VoxVPN New York",\n  "country": "US",\n  "city": "New York",\n  "load_percent": 12,\n  "uptime_percent": 99.9,\n  "status": "online"\n}' }] },
  }, null, 2);

  const curlExample = `# 1. Initialize the session
curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '${JSON.stringify({ jsonrpc: '2.0', id: 0, method: 'initialize', params: { protocolVersion: PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: 'curl', version: '1.0' } } })}'

# 2. List available tools
curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }'

# 3. Call a tool
curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(buildRequest('recommend_voxvpn_server', { country: 'US' }))}'`;

  const claudeConfig = JSON.stringify({
    mcpServers: {
      voxvpn: { url: endpoint, transport: 'http' },
    },
  }, null, 2);

  return (
    <div className="bg-[#080c18] min-h-screen text-slate-200">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">
          <Sparkles size={14} /> MCP · Model Context Protocol
        </div>
        {loadingAi ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 size={32} className="text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Generating content…</p>
          </div>
        ) : (
          <>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
              {ai?.hero_headline?.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-cyan-400">{ai?.hero_headline?.split(' ').slice(-1)}</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{ai?.hero_sub}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 font-mono">POST {endpoint}</span>
              <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300">Protocol {PROTOCOL_VERSION}</span>
              <span className="px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">● Live</span>
            </div>
          </>
        )}
      </section>

      {/* Intro */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto pb-16">
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8">
          <p className="text-slate-300 leading-relaxed">{ai?.intro}</p>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Why it matters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {(ai?.benefits || []).map((b, i) => {
            const Icon = [ShieldCheck, Zap, Globe, Activity][i % 4];
            return (
              <div key={i} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
                <Icon size={22} className="text-cyan-400 mb-3" />
                <h3 className="text-white font-semibold mb-2">{b.title}</h3>
                <p className="text-slate-400 text-sm">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live demo */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Live demo</h2>
        <p className="text-slate-400 text-sm text-center mb-8">Run an MCP tool against the live VoxVPN network — real JSON-RPC, real data.</p>
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0a0f1c]">
            <Terminal size={16} className="text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono">POST {endpoint}</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={demo.tool}
                onChange={(e) => {
                  const t = TOOLS.find((x) => x.name === e.target.value);
                  setDemo((d) => ({ ...d, tool: e.target.value, args: JSON.stringify(t?.argsExample ?? {}, null, 2), result: null, error: null }));
                }}
                className="bg-[#080c18] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
              >
                {TOOLS.map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
              <input
                value={demo.args}
                onChange={(e) => setDemo((d) => ({ ...d, args: e.target.value }))}
                placeholder='{"limit": 10}'
                className="flex-1 bg-[#080c18] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono outline-none"
              />
              <button
                onClick={runDemo}
                disabled={demo.running}
                className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                {demo.running ? 'Running…' : 'Run'}
              </button>
            </div>
            <p className="text-xs text-slate-500">{TOOLS.find((t) => t.name === demo.tool)?.desc}</p>

            {demo.request && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Request</p>
                <pre className="text-xs text-slate-400 font-mono bg-[#080c18] border border-white/5 rounded p-3 overflow-auto">{JSON.stringify(demo.request, null, 2)}</pre>
              </div>
            )}

            <div className="rounded-lg bg-[#080c18] border border-white/5 p-4 min-h-32 max-h-96 overflow-auto">
              {demo.running ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 size={16} className="animate-spin" /> Calling MCP server…</div>
              ) : demo.error ? (
                <pre className="text-red-400 text-xs whitespace-pre-wrap">{demo.error}</pre>
              ) : (
                <pre className="text-cyan-300 text-xs font-mono whitespace-pre-wrap">{JSON.stringify(demo.result, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tool metadata */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Tool metadata</h2>
        <p className="text-slate-400 text-sm text-center mb-8">The three read-only tools exposed by the VoxVPN MCP server.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TOOLS.map((t) => (
            <ToolCard key={t.name} tool={t} onTry={tryTool} />
          ))}
          <div className="p-5 rounded-xl border border-white/5 bg-[#0d1120]">
            <h3 className="text-cyan-300 font-mono text-sm mb-1">notifications/initialized</h3>
            <p className="text-white text-xs font-semibold mb-1">Complete handshake</p>
            <p className="text-slate-400 text-sm">Send after <code className="text-slate-300">initialize</code> to confirm the client is ready. The server responds with an empty result.</p>
          </div>
        </div>
      </section>

      {/* Developer docs */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Developer documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <h3 className="text-white font-semibold mb-2">Endpoint</h3>
            <code className="text-cyan-300 text-xs font-mono break-all">{endpoint}</code>
          </div>
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <h3 className="text-white font-semibold mb-2">Authentication</h3>
            <p className="text-slate-400 text-sm">No auth required. The server reads public server data with a service-role client and never exposes credentials, IPs, or customer data.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <h3 className="text-white font-semibold mb-2">Transport</h3>
            <p className="text-slate-400 text-sm">Streamable HTTP with JSON-RPC 2.0 envelopes. Protocol version <span className="text-cyan-300 font-mono">{PROTOCOL_VERSION}</span>.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <h3 className="text-white font-semibold mb-2">Response shape</h3>
            <p className="text-slate-400 text-sm">Tool results arrive as <code className="text-slate-300">result.content[0].text</code> containing a JSON string you parse on the client.</p>
          </div>
        </div>

        <div className="space-y-5">
          <CodeBlock label="1. Initialize — client → server" code={initializeReq} />
          <CodeBlock label="Initialize — server → client" code={initializeRes} />
          <CodeBlock label="2. List tools — client → server" code={listToolsReq} />
          <CodeBlock label="3. Call a tool — client → server" code={callReq} />
          <CodeBlock label="Call a tool — server → client" code={callRes} />
          <CodeBlock label="Full curl walkthrough" code={curlExample} />
        </div>
      </section>

      {/* Connect a client */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Connect a client</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CodeBlock label="Claude Desktop / Claude Code (mcp.json)" code={claudeConfig} />
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <h3 className="text-white font-semibold mb-2">ChatGPT</h3>
            <p className="text-slate-400 text-sm mb-3">Apps → enable Developer mode → Create app → paste the endpoint as a custom MCP server URL → Create → enable from the composer.</p>
            <h3 className="text-white font-semibold mb-2 mt-4">Cursor</h3>
            <p className="text-slate-400 text-sm">Settings → Tools &amp; Integrations → New MCP Server → add an entry with <code className="text-cyan-300">"url": "{endpoint}"</code> → save → toggle on.</p>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Use cases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {(ai?.use_cases || []).map((u, i) => (
            <div key={i} className="p-6 rounded-xl border border-white/5 bg-[#0d1120] text-center">
              <Server size={22} className="text-cyan-400 mb-3 mx-auto" />
              <h3 className="text-white font-semibold mb-2">{u.title}</h3>
              <p className="text-slate-400 text-sm">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 max-w-3xl mx-auto pb-24">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">FAQ</h2>
        <div className="space-y-4">
          {(ai?.faq || []).map((f, i) => (
            <div key={i} className="p-5 rounded-xl border border-white/5 bg-[#0d1120]">
              <h3 className="text-white font-semibold mb-2">{f.q}</h3>
              <p className="text-slate-400 text-sm">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}