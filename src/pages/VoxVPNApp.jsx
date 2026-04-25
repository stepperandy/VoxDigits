import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, Download, Loader2, Wifi, WifiOff, ChevronRight,
  Globe, Signal, CheckCircle2, AlertCircle, LogOut, User, RefreshCw
} from 'lucide-react';

// Country flag emoji helper
const FLAG_MAP = {
  US: '🇺🇸', GB: '🇬🇧', UK: '🇬🇧', DE: '🇩🇪', NL: '🇳🇱', SG: '🇸🇬',
  JP: '🇯🇵', AU: '🇦🇺', CA: '🇨🇦', FR: '🇫🇷', ZA: '🇿🇦', BR: '🇧🇷',
  IN: '🇮🇳', SE: '🇸🇪', CH: '🇨🇭', IE: '🇮🇪', IT: '🇮🇹', ES: '🇪🇸',
};

function countryFlag(code) {
  return FLAG_MAP[code?.toUpperCase()] || '🌐';
}

function loadBar(pct) {
  const clamped = Math.min(100, Math.max(0, pct || 0));
  const color = clamped < 50 ? 'bg-emerald-400' : clamped < 80 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-1.5 w-16">
      <div className="flex-1 h-1.5 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-[10px] text-slate-500 w-6 text-right">{Math.round(clamped)}%</span>
    </div>
  );
}

export default function VoxVPNApp() {
  const [user, setUser] = useState(null);
  const [servers, setServers] = useState([]);
  const [device, setDevice] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedServer, setSelectedServer] = useState(null);
  const [connected, setConnected] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [platform, setPlatform] = useState('windows');

  const PLATFORMS = ['windows', 'macos', 'linux', 'ios', 'android'];

  const platformFileLabel = {
    windows: 'VoxVPN-Setup.ps1',
    macos: 'VoxVPN-Setup.sh',
    linux: 'VoxVPN-Setup.sh',
    ios: 'VoxVPN.conf',
    android: 'VoxVPN.conf',
  };

  const platformInstructions = {
    windows: [
      'Click "Download Setup" — saves VoxVPN-Setup.ps1',
      'Right-click the file → "Run with PowerShell"',
      'Allow Administrator access when prompted',
      'Script auto-installs WireGuard + your VoxVPN config',
      'VoxVPN connects automatically — you\'re protected!',
    ],
    macos: [
      'Click "Download Setup" — saves VoxVPN-Setup.sh',
      'Open Terminal and run: sudo bash ~/Downloads/VoxVPN-Setup.sh',
      'Script installs WireGuard + your VoxVPN config',
      'VoxVPN connects automatically',
    ],
    linux: [
      'Click "Download Setup" — saves VoxVPN-Setup.sh',
      'Open Terminal: sudo bash ~/Downloads/VoxVPN-Setup.sh',
      'Script installs WireGuard + activates tunnel',
    ],
    ios: [
      'Install "WireGuard" from the App Store',
      'Click "Download Config" — saves VoxVPN.conf',
      'Open WireGuard → "+" → Import from file',
      'Select VoxVPN.conf and tap Activate',
    ],
    android: [
      'Install "WireGuard" from Google Play',
      'Click "Download Config" — saves VoxVPN.conf',
      'Open WireGuard → "+" → Import from file',
      'Select VoxVPN.conf and tap Activate',
    ],
  };

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const res = await base44.functions.invoke('getVpnServersForUser', {});
        const data = res.data;
        setServers(data.servers || []);
        setDevice(data.device || null);
        setSubscription(data.subscription || null);
        // Auto-select least loaded server
        if (data.servers && data.servers.length > 0) {
          const best = [...data.servers].sort((a, b) => (a.current_load || 0) - (b.current_load || 0))[0];
          setSelectedServer(best);
        }
      } catch (err) {
        setError(err.message || 'Failed to load servers. Please make sure you have an active subscription.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return servers;
    const q = search.toLowerCase();
    return servers.filter(s =>
      (s.region || '').toLowerCase().includes(q) ||
      (s.city || '').toLowerCase().includes(q) ||
      (s.country || '').toLowerCase().includes(q)
    );
  }, [servers, search]);

  const handleDownload = async () => {
    if (!selectedServer) return;
    setDownloading(true);
    try {
      const res = await base44.functions.invoke('downloadVpnConfigForServer', {
        serverId: selectedServer.id,
        platform,
      });
      const blob = new Blob([res.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const label = (selectedServer.city || selectedServer.region || 'Server').replace(/\s+/g, '-');
      a.download = `VoxVPN-${label}.conf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setConnected(true);
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-14 w-auto mx-auto mb-6" />
          <Loader2 size={20} className="text-cyan-400 animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Loading your VoxVPN servers…</p>
        </motion.div>
      </div>
    );
  }

  // ─── Error / no subscription ───────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <WifiOff size={28} className="text-rose-400" />
          </div>
          <h2 className="text-white font-bold text-xl">Cannot Connect</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <a href="/#pricing" className="inline-block px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all">
            Get a Subscription
          </a>
        </div>
      </div>
    );
  }

  // ─── Main App ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080c18] flex flex-col">

      {/* Top bar */}
      <header className="border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between bg-[#080c18]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-9 w-auto" />
          {subscription && (
            <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              {subscription.plan} Plan
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user && <span className="hidden sm:block text-slate-400 text-sm">{user.full_name}</span>}
          <a href="/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors">
            <User size={14} /> Dashboard
          </a>
          <button onClick={() => base44.auth.logout('/')} className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Left panel — server list */}
        <aside className="w-full sm:w-80 lg:w-96 border-r border-white/5 flex flex-col bg-[#0a0e1a]">

          {/* Search */}
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search servers…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
              />
            </div>
          </div>

          {/* Server count */}
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-slate-500 text-xs">{filtered.length} server{filtered.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Globe size={11} /> {servers.length} locations
            </div>
          </div>

          {/* Server list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Globe size={28} className="text-slate-700 mb-2" />
                <p className="text-slate-500 text-sm">No servers match "{search}"</p>
              </div>
            ) : (
              <div className="space-y-0.5 p-2">
                {filtered.map((server) => {
                  const isSelected = selectedServer?.id === server.id;
                  const load = (server.current_load || ((server.active_connections || 0) / (server.max_connections || 100)) * 100);
                  return (
                    <motion.button
                      key={server.id}
                      onClick={() => { setSelectedServer(server); setConnected(false); }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border border-cyan-500/20'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{countryFlag(server.country)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{server.city || server.region}</p>
                        <p className="text-slate-500 text-xs truncate">{server.region}</p>
                      </div>
                      {loadBar(load)}
                      {isSelected && <ChevronRight size={14} className="text-cyan-400 flex-shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Right panel — connect */}
        <main className="hidden sm:flex flex-1 flex-col items-center justify-center px-6 py-12 relative overflow-auto">

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl transition-all duration-1000 ${
              connected ? 'bg-emerald-500/10' : 'bg-cyan-500/8'
            }`} />
          </div>

          <div className="relative z-10 w-full max-w-sm space-y-6">

            {/* Big connect button */}
            <div className="flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleDownload}
                disabled={!selectedServer || downloading}
                className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center gap-2 transition-all shadow-2xl disabled:opacity-60 ${
                  connected
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20'
                    : 'border-cyan-500 bg-cyan-500/10 shadow-cyan-500/20 hover:shadow-cyan-500/30'
                }`}
              >
                {downloading ? (
                  <Loader2 size={32} className="text-cyan-400 animate-spin" />
                ) : connected ? (
                  <CheckCircle2 size={36} className="text-emerald-400" />
                ) : (
                  <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-10 w-auto" />
                )}
                <span className={`text-xs font-bold text-center px-2 ${connected ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {downloading ? 'Preparing…' : connected ? 'Download Again' : platform === 'windows' ? 'Download Setup' : platform === 'ios' || platform === 'android' ? 'Download Config' : 'Download Setup'}
                </span>
              </motion.button>

              <div className="text-center mt-3">
                <p className="text-slate-400 text-xs">
                  {connected ? '✅ File ready! Follow the steps below.' : selectedServer ? `↑ Click to download ${platformFileLabel[platform]}` : 'Select a server from the list'}
                </p>
                {!connected && selectedServer && platform === 'windows' && (
                  <p className="text-slate-600 text-[11px] mt-1">Auto-installs WireGuard + VoxVPN</p>
                )}
              </div>
            </div>

            {/* Selected server info */}
            <AnimatePresence mode="wait">
              {selectedServer && (
                <motion.div key={selectedServer.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{countryFlag(selectedServer.country)}</span>
                    <div>
                      <p className="text-white font-bold">{selectedServer.city || selectedServer.region}</p>
                      <p className="text-slate-400 text-sm">{selectedServer.region}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-xs font-semibold">Online</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'IP Address', value: selectedServer.ip_address },
                      { label: 'Port', value: selectedServer.port || 51820 },
                      { label: 'Load', value: `${Math.round(selectedServer.current_load || 0)}%` },
                      { label: 'Uptime', value: `${selectedServer.uptime_percentage || 99.9}%` },
                    ].map(item => (
                      <div key={item.label} className="bg-black/20 rounded-xl p-2.5">
                        <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-white font-semibold text-xs">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Platform selector */}
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Download config for</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      platform === p
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                        : 'border-white/10 text-slate-500 hover:text-white hover:border-white/20'
                    }`}>
                    {p === 'ios' ? 'iOS' : p === 'macos' ? 'macOS' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* How to use — dynamic per platform */}
            <div className="rounded-xl border border-white/5 bg-[#0d1120] p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-xs font-bold">
                  {platform === 'windows' ? 'Windows Setup Instructions' :
                   platform === 'macos' ? 'macOS Setup Instructions' :
                   platform === 'linux' ? 'Linux Setup Instructions' :
                   platform === 'ios' ? 'iPhone / iPad Instructions' : 'Android Instructions'}
                </p>
                <span className="text-[10px] text-slate-600 font-mono bg-white/5 px-2 py-0.5 rounded">{platformFileLabel[platform]}</span>
              </div>
              {(platformInstructions[platform] || []).map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-slate-400 text-xs">{step}</p>
                </div>
              ))}
              {(platform === 'ios' || platform === 'android') && (
                <a href={platform === 'ios' ? 'https://apps.apple.com/app/wireguard/id1441195209' : 'https://play.google.com/store/apps/details?id=com.wireguard.android'}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  Get WireGuard →
                </a>
              )}
            </div>
          </div>
        </main>

        {/* Mobile-only: connect panel below server list (shown when server selected) */}
        <AnimatePresence>
          {selectedServer && (
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#0d1120] border-t border-white/10 p-4 space-y-3 z-40"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{countryFlag(selectedServer.country)}</span>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{selectedServer.city || selectedServer.region}</p>
                  <p className="text-slate-400 text-xs">{selectedServer.region}</p>
                </div>
              </div>
              <button onClick={handleDownload} disabled={downloading}
                className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all">
                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {downloading ? 'Preparing…' : platform === 'windows' ? 'Download VoxVPN-Setup.ps1' : 'Download Config'}
              </button>
              <p className="text-slate-500 text-[11px] text-center">
                {platform === 'windows' ? 'Right-click → Run with PowerShell (as Admin)' : 'Import into WireGuard app to connect'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}