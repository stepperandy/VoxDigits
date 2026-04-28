import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, Server, Signal, AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

const FLAG_MAP = {
  US: '🇺🇸', GB: '🇬🇧', UK: '🇬🇧', DE: '🇩🇪', NL: '🇳🇱', SG: '🇸🇬',
  JP: '🇯🇵', AU: '🇦🇺', CA: '🇨🇦', FR: '🇫🇷', ZA: '🇿🇦',
};

function loadColor(pct) {
  if (pct < 50) return 'bg-emerald-400';
  if (pct < 80) return 'bg-amber-400';
  return 'bg-rose-400';
}

function statusBadge(status) {
  if (status === 'online') return <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle2 size={12} /> Online</span>;
  if (status === 'maintenance') return <span className="flex items-center gap-1 text-xs font-bold text-amber-400"><AlertTriangle size={12} /> Maintenance</span>;
  return <span className="flex items-center gap-1 text-xs font-bold text-rose-400"><WifiOff size={12} /> Offline</span>;
}

export default function ServerStatusView() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await base44.entities.VPNServer.list('-active_connections', 200);
    setServers(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
    const iv = setInterval(async () => {
      setRefreshing(true);
      await load();
      setRefreshing(false);
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const online = servers.filter(s => s.status === 'online').length;
  const offline = servers.filter(s => s.status === 'offline').length;
  const maintenance = servers.filter(s => s.status === 'maintenance').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
        <Loader2 size={18} className="animate-spin text-cyan-400" />
        <span className="text-sm">Loading servers…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">VPN Server Status</h2>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-sm font-medium rounded-lg transition-all disabled:opacity-50">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Online', value: online, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Maintenance', value: maintenance, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Offline', value: offline, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
        ].map(item => (
          <div key={item.label} className={`rounded-xl border ${item.bg} p-4 text-center`}>
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
            <p className="text-slate-500 text-xs mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Server table */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1120] overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-white/5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
          <span>Server</span>
          <span>Region / City</span>
          <span>Load</span>
          <span>Connections</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-white/5">
          {servers.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-2">
              <Server size={28} className="text-slate-700" />
              <p className="text-slate-500 text-sm">No servers found.</p>
            </div>
          ) : (
            servers.map((s, i) => {
              const load = s.current_load || 0;
              return (
                <motion.div key={s.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{FLAG_MAP[s.country?.toUpperCase()] || '🌐'}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{s.ip_address}</p>
                      <p className="text-slate-600 text-xs font-mono">Port {s.port || 51820}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-white text-sm">{s.region || '—'}</p>
                    <p className="text-slate-500 text-xs">{s.city || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 max-w-[80px]">
                      <div className={`h-full rounded-full ${loadColor(load)}`} style={{ width: `${Math.min(100, load)}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8">{Math.round(load)}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Signal size={13} className="text-cyan-400" />
                    <span className="text-white text-sm">{s.active_connections || 0}</span>
                    <span className="text-slate-600 text-xs">/ {s.max_connections || '—'}</span>
                  </div>
                  {statusBadge(s.status)}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}