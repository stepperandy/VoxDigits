import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Server, Activity, Zap, ShieldCheck, Loader2, Terminal, Sparkles, Globe } from 'lucide-react';

const TOOLS = [
  { name: 'list_servers', desc: 'List all online VoxVPN servers, optionally limited.', args: '{ "limit": 10 }' },
  { name: 'recommend_server', desc: 'Return the least-loaded server, optionally by country.', args: '{ "country": "US" }' },
  { name: 'get_server', desc: 'Fetch a single server by id.', args: '{ "id": "<server_id>" }' },
  { name: 'server_status', desc: 'Overall network health summary.', args: '{}' },
];

export default function McpHub() {
  const [ai, setAi] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);
  const [demo, setDemo] = useState({ tool: 'server_status', args: '{}', running: false, result: null, error: null });

  // Generate AI marketing content once
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

  // Auto-run the default demo on mount
  useEffect(() => {
    runDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runDemo = async () => {
    setDemo((d) => ({ ...d, running: true, error: null, result: null }));
    try {
      let args = {};
      try { args = JSON.parse(demo.args || '{}'); } catch {}
      const res = await base44.functions.mcpServer({ tool: demo.tool, arguments: args });
      setDemo((d) => ({ ...d, running: false, result: res }));
    } catch (e) {
      setDemo((d) => ({ ...d, running: false, error: e.message || 'Request failed' }));
    }
  };

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
        <p className="text-slate-400 text-sm text-center mb-8">Run an MCP tool against the live VoxVPN network.</p>
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0a0f1c]">
            <Terminal size={16} className="text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono">POST /functions/mcpServer</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={demo.tool}
                onChange={(e) => setDemo((d) => ({ ...d, tool: e.target.value }))}
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

            <div className="rounded-lg bg-[#080c18] border border-white/5 p-4 min-h-32 max-h-80 overflow-auto">
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

      {/* Developer docs */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Developer documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <h3 className="text-white font-semibold mb-2">Base URL</h3>
            <code className="text-cyan-300 text-xs font-mono break-all">{window.location.origin}/functions/mcpServer</code>
          </div>
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <h3 className="text-white font-semibold mb-2">Authentication</h3>
            <p className="text-slate-400 text-sm">No auth required for read-only network queries. The server reads public server data with a service-role client.</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-[#0d1120] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 text-xs text-slate-400 font-mono">GET / — discovery</div>
          <pre className="p-4 text-xs text-slate-300 font-mono overflow-auto">{`# Discover available tools
curl {origin}/functions/mcpServer

# Response
{
  "server": { "name": "voxvpn", "version": "1.0.0" },
  "protocol": "mcp/1.0",
  "capabilities": { "tools": true },
  "tools": [ { "name": "list_servers", ... } ]
}`}</pre>
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-[#0d1120] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 text-xs text-slate-400 font-mono">POST / — invoke a tool</div>
          <pre className="p-4 text-xs text-slate-300 font-mono overflow-auto">{`# Recommend a US server
curl -X POST {origin}/functions/mcpServer \\
  -H "Content-Type: application/json" \\
  -d '{ "tool": "recommend_server", "arguments": { "country": "US" } }'

# Response
{
  "tool": "recommend_server",
  "result": {
    "id": "...", "name": "VoxVPN New York",
    "country": "US", "city": "New York",
    "load": 12, "uptime": 99.9, "status": "online"
  }
}`}</pre>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {TOOLS.map((t) => (
            <div key={t.name} className="p-5 rounded-xl border border-white/5 bg-[#0d1120]">
              <h3 className="text-cyan-300 font-mono text-sm mb-1">{t.name}</h3>
              <p className="text-slate-400 text-sm mb-3">{t.desc}</p>
              <code className="block text-xs text-slate-500 font-mono bg-[#080c18] rounded p-2">arguments: {t.args}</code>
            </div>
          ))}
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