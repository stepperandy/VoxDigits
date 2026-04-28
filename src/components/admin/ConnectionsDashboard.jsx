import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Loader2, Wifi, TrendingUp, RefreshCw, FileSpreadsheet, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConnectionsDashboard() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  const load = async () => {
    const data = await base44.entities.Analytics.list('-date', 30);
    setAnalytics([...data].reverse());
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
    const iv = setInterval(() => {
      setRefreshing(true);
      load().finally(() => setRefreshing(false));
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    setExportResult(null);
    try {
      const res = await base44.functions.invoke('exportToSheets', {});
      setExportResult(res.data);
    } catch (err) {
      setExportResult({ error: err.message });
    } finally {
      setExporting(false);
    }
  };

  const chartData = analytics.map(a => ({
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    connections: a.total_active_connections || 0,
    bandwidth: parseFloat((a.total_bandwidth_gb || 0).toFixed(1)),
    newSubs: a.new_subscriptions || 0,
    cancelled: a.cancelled_subscriptions || 0,
  }));

  const latest = analytics[analytics.length - 1];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
        <Loader2 size={18} className="animate-spin text-cyan-400" />
        <span className="text-sm">Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-white font-semibold text-lg">Connections & Bandwidth Dashboard</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { setRefreshing(true); load().finally(() => setRefreshing(false)); }}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm rounded-lg transition-all disabled:opacity-50">
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg transition-all disabled:opacity-50">
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
            Export to Google Sheets
          </button>
        </div>
      </div>

      {/* Export result */}
      {exportResult && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
            exportResult.error
              ? 'border-rose-500/30 bg-rose-500/5 text-rose-300'
              : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
          }`}>
          <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            {exportResult.error ? (
              <p>Export failed: {exportResult.error}</p>
            ) : (
              <>
                <p className="font-semibold">Exported {exportResult.rowCount} rows to Google Sheets!</p>
                <a href={exportResult.spreadsheetUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 mt-1 text-xs underline hover:opacity-80">
                  Open Spreadsheet <ExternalLink size={11} />
                </a>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Connections', value: latest?.total_active_connections ?? '—', icon: Wifi, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          { label: 'Bandwidth Used (GB)', value: latest?.total_bandwidth_gb?.toFixed(1) ?? '—', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'New Subscriptions', value: latest?.new_subscriptions ?? '—', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Cancelled Today', value: latest?.cancelled_subscriptions ?? '—', icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border ${item.bg} p-4`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-slate-500 text-xs uppercase tracking-wider leading-snug">{item.label}</p>
                <Icon size={16} className={item.color} />
              </div>
              <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
              <p className="text-slate-600 text-[10px] mt-1">Today</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Connections */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
          <h3 className="text-white font-bold mb-4 text-sm">Total Active Connections (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="connGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#475569" style={{ fontSize: '11px' }} />
              <YAxis stroke="#475569" style={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0a1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }} labelStyle={{ color: '#fff' }} />
              <Area type="monotone" dataKey="connections" stroke="#06b6d4" strokeWidth={2} fill="url(#connGrad)" name="Connections" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bandwidth */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
          <h3 className="text-white font-bold mb-4 text-sm">Bandwidth Usage GB (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#475569" style={{ fontSize: '11px' }} />
              <YAxis stroke="#475569" style={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0a1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }} labelStyle={{ color: '#fff' }} />
              <Area type="monotone" dataKey="bandwidth" stroke="#3b82f6" strokeWidth={2} fill="url(#bwGrad)" name="Bandwidth (GB)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subscription trends */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 lg:col-span-2">
          <h3 className="text-white font-bold mb-4 text-sm">New vs Cancelled Subscriptions (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#475569" style={{ fontSize: '11px' }} />
              <YAxis stroke="#475569" style={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0a1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }} labelStyle={{ color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="newSubs" stroke="#10b981" strokeWidth={2} dot={false} name="New Subscriptions" />
              <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} dot={false} name="Cancelled" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}