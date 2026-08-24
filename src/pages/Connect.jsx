import { useEffect, useState } from 'react';
import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Plug, Copy, Check, MessageSquare, Code2, MousePointer2, Terminal, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';

const CLIENTS = [
  { id: 'chatgpt', label: 'ChatGPT', Icon: MessageSquare },
  { id: 'claude', label: 'Claude', Icon: Terminal },
  { id: 'cursor', label: 'Cursor', Icon: MousePointer2 },
  { id: 'custom', label: 'Custom', Icon: Code2 },
];

function UrlBox({ url }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-stretch gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="flex-1 bg-[#0d1120] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cyan-300 font-mono outline-none"
      />
      <button
        onClick={copy}
        className="px-4 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 transition-colors flex items-center gap-2 text-sm font-semibold"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function Step({ n, children }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold flex items-center justify-center">{n}</span>
      <div className="text-sm text-slate-300 leading-relaxed pt-0.5">{children}</div>
    </li>
  );
}

export default function Connect() {
  const [url, setUrl] = useState('');
  const [active, setActive] = useState('chatgpt');

  useEffect(() => {
    setUrl(new URL('/api/mcp', window.location.origin).toString());
  }, []);

  const cursorConfig = JSON.stringify({
    mcpServers: {
      voxtelefony: { url, transport: 'http' },
    },
  }, null, 2);

  return (
    <div className="bg-[#080c18] min-h-screen text-slate-200">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-12 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">
          <Plug size={14} /> MCP · Model Context Protocol · Live
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
          Connect this app to <span className="text-cyan-400">ChatGPT</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Point any Model Context Protocol client at the live VoxTelefony MCP server below. No keys, no demo — real, read-only access to public app data straight from ChatGPT.
        </p>
      </section>

      {/* Server URL */}
      <section className="px-4 sm:px-6 max-w-3xl mx-auto pb-12">
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h2 className="text-white font-semibold text-sm">MCP server URL</h2>
            <span className="ml-auto text-xs text-emerald-400">● Public · read-only</span>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            This is the live endpoint. Copy it and paste it into your AI client as a <span className="text-slate-200">streamable HTTP</span> MCP server.
          </p>
          {!url ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 size={16} className="animate-spin" /> Resolving…</div>
          ) : (
            <UrlBox url={url} />
          )}
        </div>
      </section>

      {/* Client tabs */}
      <section className="px-4 sm:px-6 max-w-3xl mx-auto pb-20">
        <div className="flex flex-wrap gap-2 mb-6">
          {CLIENTS.map((c) => {
            const Icon = c.Icon;
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                  isActive
                    ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon size={16} /> {c.label}
              </button>
            );
          })}
        </div>

        {/* ChatGPT */}
        {active === 'chatgpt' && (
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <h3 className="text-white font-bold text-lg mb-1">Add to ChatGPT</h3>
            <p className="text-slate-400 text-sm mb-5">
              ChatGPT supports custom MCP servers through its Developer-mode app builder. Once connected, you can ask ChatGPT to query this app's live data directly from a chat.
            </p>
            <ol className="space-y-3">
              <Step n={1}>
                Open <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">chatgpt.com <ExternalLink size={12} /></a> and sign in.
              </Step>
              <Step n={2}>
                Open <strong className="text-slate-200">Settings → Labs → Developer mode</strong> and enable it. ChatGPT will warn this is an experimental feature — confirm to proceed.
              </Step>
              <Step n={3}>
                Go to <strong className="text-slate-200">Apps → Create app</strong>. Give it a name (e.g. <span className="text-cyan-300 font-mono">VoxTelefony</span>) and select <strong className="text-slate-200">MCP Server</strong> as the type.
              </Step>
              <Step n={4}>
                Paste the server URL above into the <strong className="text-slate-200">MCP server URL</strong> field, then click <strong className="text-slate-200">Create</strong>.
              </Step>
              <Step n={5}>
                Back in the chat composer, open the <strong className="text-slate-200">Apps</strong> menu and toggle your new app <strong className="text-slate-200">on</strong> before prompting it.
              </Step>
            </ol>
            <div className="mt-5 p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
              <p className="text-xs text-cyan-200/80 leading-relaxed">
                Tip: after we ship new tools, return to the Apps menu and refresh the connector so ChatGPT picks up the latest tool list.
              </p>
            </div>
          </div>
        )}

        {/* Claude */}
        {active === 'claude' && (
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <h3 className="text-white font-bold text-lg mb-1">Add to Claude</h3>
            <p className="text-slate-400 text-sm mb-5">
              Claude Desktop and Claude Code support custom MCP connectors added from Settings.
            </p>
            <ol className="space-y-3">
              <Step n={1}>
                Open <strong className="text-slate-200">Settings → Connectors</strong> (or <strong className="text-slate-200">Settings → Tools</strong> in Claude Code).
              </Step>
              <Step n={2}>
                Click <strong className="text-slate-200">Add custom connector</strong>.
              </Step>
              <Step n={3}>
                Name it (e.g. <span className="text-cyan-300 font-mono">VoxTelefony</span>), paste the server URL above, and click <strong className="text-slate-200">Add</strong>.
              </Step>
            </ol>
          </div>
        )}

        {/* Cursor */}
        {active === 'cursor' && (
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <h3 className="text-white font-bold text-lg mb-1">Add to Cursor</h3>
            <p className="text-slate-400 text-sm mb-5">
              Cursor manages MCP servers in <span className="text-cyan-300 font-mono">mcp.json</span>.
            </p>
            <ol className="space-y-3 mb-5">
              <Step n={1}>Open <strong className="text-slate-200">Settings → Tools &amp; Integrations → New MCP Server</strong>.</Step>
              <Step n={2}>Add the entry below, save, then toggle it on.</Step>
            </ol>
            <div className="rounded-lg border border-white/5 bg-[#080c18] overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 text-xs text-slate-500 font-mono">~/.cursor/mcp.json</div>
              <pre className="p-4 text-xs text-cyan-300 font-mono overflow-auto whitespace-pre-wrap break-all">{cursorConfig}</pre>
            </div>
          </div>
        )}

        {/* Custom */}
        {active === 'custom' && (
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <h3 className="text-white font-bold text-lg mb-1">Custom MCP client</h3>
            <p className="text-slate-400 text-sm mb-5">
              Any client that speaks the Model Context Protocol over streamable HTTP can connect. Name and URL are all most clients need.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><span className="text-slate-500">Transport:</span> streamable HTTP (JSON-RPC 2.0)</li>
              <li><span className="text-slate-500">Auth:</span> none — public, read-only</li>
              <li><span className="text-slate-500">URL:</span> <span className="text-cyan-300 font-mono break-all">{url}</span></li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">Add it as a new MCP server with the URL above, then reload the client to fetch the tool list.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}