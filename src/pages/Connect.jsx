import { useMemo, useState } from 'react';
import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Plug, Copy, Check, MessageSquare, Bot, Code2, Terminal, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';

const CLIENTS = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    Icon: MessageSquare,
    steps: [
      'Open ChatGPT and go to Settings → turn on Developer mode (accept the risk warning ChatGPT shows).',
      'Go to Apps → Create app, give it a name (e.g. "VoxTelephony"), and paste the server URL below as the custom MCP server URL.',
      'Click Create, then open a new chat and enable your app from the composer before prompting it.',
    ],
    note: 'ChatGPT caches the tool list. If we add or change tools later, refresh the connector so ChatGPT picks up the latest.',
  },
  {
    id: 'claude',
    label: 'Claude',
    Icon: Bot,
    steps: [
      'In Claude, open the profile menu → Settings → Connectors.',
      'Click "Add custom connector", name it (e.g. "VoxTelephony"), paste the server URL below, and click Add.',
      'Start a chat and enable the connector from the tools menu before prompting it.',
    ],
    note: 'Claude caches the tool list. If we add or change tools later, refresh the connector so Claude picks up the latest.',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    Icon: Code2,
    steps: [
      'In Cursor, open Settings → Tools & Integrations → "New MCP Server" (this opens mcp.json).',
      'Add an entry whose "url" is the server URL below, save the file, and toggle the server on.',
    ],
    note: 'Cursor caches the tool list. If we add or change tools later, reload the window so Cursor picks up the latest.',
  },
  {
    id: 'custom',
    label: 'Custom',
    Icon: Terminal,
    steps: [
      'Copy the server URL below and add it as a streamable HTTP MCP server in any client that supports MCP over HTTP.',
      'Name + URL is all most clients need — no headers or auth required for this public server. Reload the client after adding.',
    ],
    note: 'MCP over streamable HTTP uses JSON-RPC 2.0 envelopes. Most clients auto-discover tools on connect.',
  },
];

export default function Connect() {
  const [active, setActive] = useState('chatgpt');
  const [copied, setCopied] = useState(false);

  const serverUrl = useMemo(
    () => new URL('/api/mcp', window.location.origin).toString(),
    []
  );

  const copy = () => {
    navigator.clipboard.writeText(serverUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const current = CLIENTS.find((c) => c.id === active) || CLIENTS[0];
  const CurrentIcon = current.Icon;

  return (
    <div className="bg-[#080c18] min-h-screen text-slate-200">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-12 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">
          <Plug size={14} /> MCP · Model Context Protocol
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
          Connect your AI assistant to <span className="text-cyan-400">VoxTelephony</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Point any MCP-compatible client (ChatGPT, Claude, Cursor, or a custom one) at our live MCP server to query the VoxTelephony platform in real time.
        </p>
      </section>

      {/* Server URL */}
      <section className="px-4 sm:px-6 max-w-3xl mx-auto pb-12">
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[11px] font-medium">● Public · Live</span>
            <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-400 text-[11px] font-mono">Read-only</span>
          </div>
          <p className="text-xs text-slate-400 mb-2">MCP server URL</p>
          <div className="flex items-stretch gap-2">
            <code className="flex-1 bg-[#080c18] border border-white/10 rounded-lg px-3 py-2.5 text-cyan-300 text-xs sm:text-sm font-mono break-all">
              {serverUrl}
            </code>
            <button
              onClick={copy}
              className="shrink-0 px-3.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 transition-colors flex items-center justify-center"
              title="Copy URL"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            No authentication required. The server exposes safe, read-only data — never credentials, IPs, or customer PII.
          </p>
        </div>
      </section>

      {/* Client tabs */}
      <section className="px-4 sm:px-6 max-w-3xl mx-auto pb-20">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {CLIENTS.map((c) => {
            const Icon = c.Icon;
            const isActive = c.id === active;
            return (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                  isActive
                    ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon size={16} /> {c.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <CurrentIcon size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Connect {current.label}</h2>
              <p className="text-slate-400 text-xs">Follow these steps to add the VoxTelephony MCP server.</p>
            </div>
          </div>

          <ol className="space-y-4">
            {current.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-slate-300 text-sm leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex items-start gap-2 p-4 rounded-xl border border-white/5 bg-[#080c18]">
            <RefreshCw size={16} className="text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-slate-400 text-xs leading-relaxed">{current.note}</p>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto pb-24">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">What your assistant can do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <ShieldCheck size={22} className="text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Read-only & safe</h3>
            <p className="text-slate-400 text-sm">Your assistant queries public VoxTelephony data. No writes, no credentials, no PII exposed.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <Terminal size={22} className="text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Standard MCP</h3>
            <p className="text-slate-400 text-sm">Streamable HTTP transport with JSON-RPC 2.0. Works with any MCP-compatible client out of the box.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <ExternalLink size={22} className="text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Live data</h3>
            <p className="text-slate-400 text-sm">Every tool call hits the live platform — servers, plans, and status update in real time.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}