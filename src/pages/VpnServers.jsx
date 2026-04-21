import { useState } from 'react';
import { VPN_SERVERS } from '@/lib/vpnServers';
import {
  Shield, Server, FileText, Wifi, WifiOff, Download,
  AlertCircle, X, Search, CheckCircle2, Info
} from 'lucide-react';

// Flow states (no longer uses vpnConnectionService simulation)
const FLOW = {
  IDLE: 'idle',
  CONFIG_READY: 'config_ready',
  DOWNLOADED: 'downloaded',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
};

function downloadOvpn(server) {
  const blob = new Blob([server.config], { type: 'application/x-openvpn-profile' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${server.id}.ovpn`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function StatusDot({ isConnected, isSelected }) {
  if (isConnected) return <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] flex-shrink-0" />;
  if (isSelected) return <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />;
  return <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />;
}

const STATUS_META = {
  [FLOW.IDLE]:         { label: 'Idle',               color: 'text-slate-400',   bg: 'bg-[#0d1120] border-white/5' },
  [FLOW.CONFIG_READY]: { label: 'Config Ready',        color: 'text-cyan-300',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
  [FLOW.DOWNLOADED]:   { label: 'Downloaded',          color: 'text-yellow-300',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
  [FLOW.CONNECTED]:    { label: 'Connected Externally',color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  [FLOW.DISCONNECTED]: { label: 'Disconnected',        color: 'text-slate-400',   bg: 'bg-[#0d1120] border-white/5' },
};

export default function VpnServers() {
  const [selectedServer, setSelectedServer] = useState(null);
  const [flow, setFlow] = useState(FLOW.IDLE);
  const [showPanel, setShowPanel] = useState(false);
  const [search, setSearch] = useState('');

  const filteredServers = VPN_SERVERS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openPanel = (server) => {
    setSelectedServer(server);
    // Only reset state if switching servers
    if (!selectedServer || selectedServer.id !== server.id) {
      setFlow(server.config?.trim() ? FLOW.CONFIG_READY : FLOW.IDLE);
    }
    setShowPanel(true);
  };

  const handleDownload = () => {
    downloadOvpn(selectedServer);
    setFlow(FLOW.DOWNLOADED);
  };

  const handleMarkConnected = () => setFlow(FLOW.CONNECTED);
  const handleDisconnect = () => { setFlow(FLOW.DISCONNECTED); setShowPanel(false); };
  const handleReconnect = () => { openPanel(selectedServer); };

  const isConnected = flow === FLOW.CONNECTED && selectedServer;
  const status = STATUS_META[flow];
  const configPreview = selectedServer?.config?.split('\n').slice(0, 10).join('\n') ?? '';

  return (
    <div className="min-h-screen bg-[#060d1a] px-5 pt-14 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Shield size={18} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-white font-black text-xl leading-none">VPN Servers</h1>
          <p className="text-slate-500 text-xs mt-0.5">{VPN_SERVERS.length} locations available</p>
        </div>
      </div>

      {/* Status banner */}
      <div className={`mb-5 p-4 rounded-2xl border transition-all ${status.bg}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            {flow === FLOW.CONNECTED && <Wifi size={16} className="text-emerald-400" />}
            {flow === FLOW.DOWNLOADED && <CheckCircle2 size={16} className="text-yellow-400" />}
            {flow === FLOW.CONFIG_READY && <FileText size={16} className="text-cyan-400" />}
            {(flow === FLOW.IDLE || flow === FLOW.DISCONNECTED) && <WifiOff size={16} className="text-slate-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${status.color}`}>{status.label}</p>
            <p className="text-slate-600 text-xs truncate">
              {flow === FLOW.CONNECTED && selectedServer ? `Connected via ${selectedServer.name}` : `${VPN_SERVERS.length} servers available`}
            </p>
          </div>
          {flow === FLOW.CONNECTED && (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:bg-rose-500/30 transition-all active:scale-95 flex-shrink-0"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search servers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0d1120] border border-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 transition-colors"
        />
      </div>

      {/* Server list */}
      <div className="space-y-2.5">
        {filteredServers.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-8">No servers match "{search}"</p>
        )}
        {filteredServers.map((server) => {
          const isSel = selectedServer?.id === server.id;
          const isConn = isConnected && isSel;
          return (
            <div
              key={server.id}
              onClick={() => setSelectedServer(server)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isConn
                  ? 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/10'
                  : isSel
                  ? 'border-cyan-500/40 bg-cyan-500/5 ring-1 ring-cyan-500/10'
                  : 'border-white/5 bg-[#0d1120] hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <StatusDot isSelected={isSel} isConnected={isConn} />
                  <div className="min-w-0">
                    <p className={`font-bold text-sm ${isConn || isSel ? 'text-white' : 'text-slate-200'}`}>
                      {server.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-0.5">
                      <FileText size={10} />
                      <span className="font-mono truncate">{server.id}.ovpn</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    isConn ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'
                  }`}>
                    {isConn ? 'Connected' : 'Ready'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); openPanel(server); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 whitespace-nowrap ${
                      isConn
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/30'
                        : isSel
                        ? 'bg-cyan-400 hover:bg-cyan-300 text-black'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    {isConn ? 'Manage' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom sheet panel */}
      {showPanel && selectedServer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 px-4 pb-6">
          <div className="w-full max-w-md bg-[#0d1120] border border-white/10 rounded-3xl p-6 space-y-4">
            {/* Panel header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Server size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-black text-base">{selectedServer.name}</p>
                  <p className="text-slate-500 text-xs font-mono">{selectedServer.id}.ovpn</p>
                </div>
              </div>
              <button onClick={() => setShowPanel(false)} className="text-slate-500 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            {/* No config */}
            {!selectedServer.config?.trim() ? (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-rose-300 font-bold text-sm">Config not available</p>
                  <p className="text-rose-500 text-xs mt-0.5">This server's .ovpn config hasn't been loaded yet.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Status row */}
                <div className={`flex items-center gap-3 p-3 rounded-2xl border ${STATUS_META[flow].bg}`}>
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    {flow === FLOW.CONNECTED && <Wifi size={14} className="text-emerald-400" />}
                    {flow === FLOW.DOWNLOADED && <CheckCircle2 size={14} className="text-yellow-400" />}
                    {flow === FLOW.CONFIG_READY && <FileText size={14} className="text-cyan-400" />}
                    {(flow === FLOW.IDLE || flow === FLOW.DISCONNECTED) && <WifiOff size={14} className="text-slate-500" />}
                  </div>
                  <p className={`text-sm font-bold ${STATUS_META[flow].color}`}>{STATUS_META[flow].label}</p>
                </div>

                {/* Config preview */}
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Config Preview</p>
                  <pre className="text-xs text-slate-400 bg-black/30 rounded-xl p-3 overflow-hidden leading-relaxed border border-white/5 whitespace-pre-wrap break-all max-h-28">
                    {configPreview}
                  </pre>
                </div>

                {/* Instruction after download */}
                {(flow === FLOW.DOWNLOADED || flow === FLOW.CONFIG_READY) && flow === FLOW.DOWNLOADED && (
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                    <Info size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-200 text-xs leading-relaxed">
                      <span className="font-bold">Open the downloaded file in OpenVPN Connect.</span> Once connected in the OpenVPN app, tap "I'm Connected" below.
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2.5">
                  {/* Download Config */}
                  {(flow === FLOW.CONFIG_READY || flow === FLOW.DISCONNECTED || flow === FLOW.DOWNLOADED) && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-2xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      <Download size={16} />
                      {flow === FLOW.DOWNLOADED ? 'Re-download Config' : 'Download Config'}
                    </button>
                  )}

                  {/* Mark as connected */}
                  {flow === FLOW.DOWNLOADED && (
                    <button
                      onClick={handleMarkConnected}
                      className="w-full py-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-black rounded-2xl text-sm transition-all active:scale-[0.98]"
                    >
                      ✓ I'm Connected
                    </button>
                  )}

                  {/* Connected state */}
                  {flow === FLOW.CONNECTED && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownload}
                        className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold rounded-2xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Download size={14} />
                        Re-download
                      </button>
                      <button
                        onClick={handleDisconnect}
                        className="flex-1 py-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 font-black rounded-2xl text-sm transition-all active:scale-[0.98]"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}

                  {/* Idle fallback */}
                  {flow === FLOW.IDLE && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-2xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download Config
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}