import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, Plus, X, TrendingUp, Search, MousePointerClick, DollarSign, Target, Eye, Trophy, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

const PLANS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
  { value: 'biennial', label: 'Biennial' },
];

const CHANNELS = [
  { value: 'seo', label: 'SEO', icon: Search, color: '#22d3ee' },
  { value: 'ppc', label: 'PPC', icon: MousePointerClick, color: '#a78bfa' },
  { value: 'social', label: 'Social', icon: TrendingUp, color: '#f59e0b' },
  { value: 'email', label: 'Email', icon: Target, color: '#34d399' },
  { value: 'referral', label: 'Referral', icon: Trophy, color: '#fb7185' },
];

function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-[#0d1120]">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={16} />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-slate-600 text-[10px] mt-1">{sub}</p>}
    </div>
  );
}

export default function MarketingPerformance() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.MarketingMetric.list('-date', 500).catch(() => []);
      setMetrics(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = selectedPlan === 'all' ? metrics : metrics.filter((m) => m.plan === selectedPlan);

  // Aggregate totals
  const totals = filtered.reduce((acc, m) => {
    acc.impressions += m.impressions || 0;
    acc.clicks += m.clicks || 0;
    acc.conversions += m.conversions || 0;
    acc.spend += m.spend || 0;
    acc.revenue += m.revenue || 0;
    acc.backlinks += m.backlinks || 0;
    return acc;
  }, { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, backlinks: 0 });

  const ctr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : '0.00';
  const cpc = totals.clicks > 0 ? (totals.spend / totals.clicks).toFixed(2) : '0.00';
  const cpa = totals.conversions > 0 ? (totals.spend / totals.conversions).toFixed(2) : '0.00';
  const roas = totals.spend > 0 ? (totals.revenue / totals.spend).toFixed(2) : '0.00';

  // Build time-series (last 30 days)
  const seriesMap = {};
  filtered.forEach((m) => {
    const key = m.date;
    if (!seriesMap[key]) seriesMap[key] = { date: key, impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 };
    seriesMap[key].impressions += m.impressions || 0;
    seriesMap[key].clicks += m.clicks || 0;
    seriesMap[key].conversions += m.conversions || 0;
    seriesMap[key].spend += m.spend || 0;
    seriesMap[key].revenue += m.revenue || 0;
  });
  const series = Object.values(seriesMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  const chartData = series.map((s) => ({ ...s, date: format(parseISO(s.date), 'MMM d') }));

  // Per-plan breakdown
  const planBreakdown = PLANS.map((p) => {
    const planMetrics = metrics.filter((m) => m.plan === p.value);
    const imp = planMetrics.reduce((a, m) => a + (m.impressions || 0), 0);
    const clk = planMetrics.reduce((a, m) => a + (m.clicks || 0), 0);
    const cnv = planMetrics.reduce((a, m) => a + (m.conversions || 0), 0);
    const spd = planMetrics.reduce((a, m) => a + (m.spend || 0), 0);
    const rev = planMetrics.reduce((a, m) => a + (m.revenue || 0), 0);
    return { ...p, impressions: imp, clicks: clk, conversions: cnv, spend: spd, revenue: rev, roas: spd > 0 ? rev / spd : 0 };
  });

  // Per-channel breakdown
  const channelBreakdown = CHANNELS.map((ch) => {
    const chMetrics = filtered.filter((m) => m.channel === ch.value);
    const imp = chMetrics.reduce((a, m) => a + (m.impressions || 0), 0);
    const clk = chMetrics.reduce((a, m) => a + (m.clicks || 0), 0);
    const cnv = chMetrics.reduce((a, m) => a + (m.conversions || 0), 0);
    const spd = chMetrics.reduce((a, m) => a + (m.spend || 0), 0);
    const rev = chMetrics.reduce((a, m) => a + (m.revenue || 0), 0);
    return { ...ch, impressions: imp, clicks: clk, conversions: cnv, spend: spd, revenue: rev };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Marketing Performance</h2>
          <p className="text-slate-500 text-sm mt-1">Track SEO and PPC campaign results across all plans</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:border-white/20 text-sm transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm transition-all">
            <Plus size={14} /> Add Metrics
          </button>
        </div>
      </div>

      {/* Plan filter + View toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedPlan('all')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedPlan === 'all' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-[#0d1120] text-slate-400 border border-white/5 hover:text-white'}`}>
            All Plans
          </button>
          {PLANS.map((p) => (
            <button key={p.value} onClick={() => setSelectedPlan(p.value)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedPlan === p.value ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-[#0d1120] text-slate-400 border border-white/5 hover:text-white'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-[#0d1120] rounded-lg p-1 border border-white/5">
          <button onClick={() => setView('overview')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'overview' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>Overview</button>
          <button onClick={() => setView('seo')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'seo' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>SEO</button>
          <button onClick={() => setView('ppc')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'ppc' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>PPC</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard icon={Eye} label="Impressions" value={totals.impressions.toLocaleString()} color="bg-cyan-500/10 text-cyan-400" />
            <MetricCard icon={MousePointerClick} label="Clicks" value={totals.clicks.toLocaleString()} color="bg-violet-500/10 text-violet-400" />
            <MetricCard icon={Target} label="Conversions" value={totals.conversions.toLocaleString()} color="bg-emerald-500/10 text-emerald-400" />
            <MetricCard icon={TrendingUp} label="CTR" value={`${ctr}%`} sub={cpc > 0 ? `$${cpc} CPC` : ''} color="bg-amber-500/10 text-amber-400" />
            <MetricCard icon={DollarSign} label="Ad Spend" value={`$${totals.spend.toFixed(2)}`} sub={`$${cpa} CPA`} color="bg-rose-500/10 text-rose-400" />
            <MetricCard icon={TrendingUp} label="Revenue" value={`$${totals.revenue.toFixed(2)}`} sub={`${roas}x ROAS`} color="bg-green-500/10 text-green-400" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Clicks & Conversions Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="clicks" stroke="#22d3ee" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="conversions" stroke="#34d399" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Spend vs Revenue</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="spend" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plan breakdown table */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Performance by Plan</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs border-b border-white/5">
                    <th className="text-left py-2 px-3 font-medium">Plan</th>
                    <th className="text-right py-2 px-3 font-medium">Impressions</th>
                    <th className="text-right py-2 px-3 font-medium">Clicks</th>
                    <th className="text-right py-2 px-3 font-medium">CTR</th>
                    <th className="text-right py-2 px-3 font-medium">Conversions</th>
                    <th className="text-right py-2 px-3 font-medium">Spend</th>
                    <th className="text-right py-2 px-3 font-medium">Revenue</th>
                    <th className="text-right py-2 px-3 font-medium">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {planBreakdown.map((p) => {
                    const ctrP = p.impressions > 0 ? ((p.clicks / p.impressions) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={p.value} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-3 px-3 text-white font-medium">{p.label}</td>
                        <td className="text-right py-3 px-3 text-slate-300">{p.impressions.toLocaleString()}</td>
                        <td className="text-right py-3 px-3 text-slate-300">{p.clicks.toLocaleString()}</td>
                        <td className="text-right py-3 px-3 text-cyan-400">{ctrP}%</td>
                        <td className="text-right py-3 px-3 text-slate-300">{p.conversions}</td>
                        <td className="text-right py-3 px-3 text-rose-400">${p.spend.toFixed(2)}</td>
                        <td className="text-right py-3 px-3 text-emerald-400">${p.revenue.toFixed(2)}</td>
                        <td className="text-right py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.roas >= 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {p.roas.toFixed(2)}x
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Channel breakdown */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Performance by Channel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {channelBreakdown.map((ch) => {
                const Icon = ch.icon;
                return (
                  <div key={ch.value} className="p-4 rounded-xl bg-[#060910] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ch.color}15` }}>
                        <Icon size={13} style={{ color: ch.color }} />
                      </div>
                      <span className="text-white text-xs font-bold">{ch.label}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Impressions</span><span className="text-slate-200">{ch.impressions.toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Clicks</span><span className="text-slate-200">{ch.clicks.toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Conversions</span><span className="text-emerald-400">{ch.conversions}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Spend</span><span className="text-rose-400">${ch.spend.toFixed(0)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Revenue</span><span className="text-cyan-400">${ch.revenue.toFixed(0)}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent metrics log */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Recent Metrics Entries</h3>
              <span className="text-slate-500 text-xs">{filtered.length} records</span>
            </div>
            {filtered.length === 0 ? (
              <div className="py-8 text-center">
                <BarChart3 size={28} className="text-slate-700 mx-auto mb-2" />
                <p className="text-slate-600 text-xs">No marketing metrics recorded yet. Click "Add Metrics" to log your first entry.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filtered.slice(0, 20).map((m) => {
                  const ch = CHANNELS.find((c) => c.value === m.channel);
                  const plan = PLANS.find((p) => p.value === m.plan);
                  return (
                    <div key={m.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/2 hover:bg-white/4 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ch?.color || '#64748b'}15` }}>
                          {ch && <ch.icon size={12} style={{ color: ch.color }} />}
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">{m.campaign_name || `${ch?.label} - ${plan?.label}`}</p>
                          <p className="text-slate-600 text-[10px]">{format(parseISO(m.date), 'MMM d, yyyy')} · {plan?.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-400">{m.impressions?.toLocaleString()} imp</span>
                        <span className="text-cyan-400">{m.clicks?.toLocaleString()} clicks</span>
                        <span className="text-emerald-400">{m.conversions} conv</span>
                        <span className="text-rose-400">${(m.spend || 0).toFixed(0)}</span>
                        <span className="text-slate-500">${(m.revenue || 0).toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {showAdd && <AddMetricModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}

function AddMetricModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    plan: 'monthly',
    date: format(new Date(), 'yyyy-MM-dd'),
    channel: 'seo',
    campaign_name: '',
    impressions: '',
    clicks: '',
    conversions: '',
    spend: '',
    revenue: '',
    avg_position: '',
    backlinks: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await base44.entities.MarketingMetric.create({
        plan: form.plan,
        date: form.date,
        channel: form.channel,
        campaign_name: form.campaign_name,
        impressions: Number(form.impressions) || 0,
        clicks: Number(form.clicks) || 0,
        conversions: Number(form.conversions) || 0,
        spend: Number(form.spend) || 0,
        revenue: Number(form.revenue) || 0,
        avg_position: form.avg_position ? Number(form.avg_position) : undefined,
        backlinks: Number(form.backlinks) || 0,
      });
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save metrics');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full bg-[#080c18] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 focus:outline-none';
  const labelCls = 'text-slate-400 text-xs font-medium mb-1 block';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d1120] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Log Marketing Metrics</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Plan</label>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className={inputCls}>
                {PLANS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Channel</label>
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className={inputCls}>
                {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Campaign Name</label>
            <input value={form.campaign_name} onChange={(e) => setForm({ ...form, campaign_name: e.target.value })} className={inputCls} placeholder="Google Ads - Monthly Plan" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelCls}>Impressions</label><input type="number" min="0" value={form.impressions} onChange={(e) => setForm({ ...form, impressions: e.target.value })} className={inputCls} placeholder="0" /></div>
            <div><label className={labelCls}>Clicks</label><input type="number" min="0" value={form.clicks} onChange={(e) => setForm({ ...form, clicks: e.target.value })} className={inputCls} placeholder="0" /></div>
            <div><label className={labelCls}>Conversions</label><input type="number" min="0" value={form.conversions} onChange={(e) => setForm({ ...form, conversions: e.target.value })} className={inputCls} placeholder="0" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Spend (USD)</label><input type="number" step="0.01" min="0" value={form.spend} onChange={(e) => setForm({ ...form, spend: e.target.value })} className={inputCls} placeholder="0.00" /></div>
            <div><label className={labelCls}>Revenue (USD)</label><input type="number" step="0.01" min="0" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} className={inputCls} placeholder="0.00" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Avg Position (SEO)</label><input type="number" step="0.1" value={form.avg_position} onChange={(e) => setForm({ ...form, avg_position: e.target.value })} className={inputCls} placeholder="e.g. 3.5" /></div>
            <div><label className={labelCls}>Backlinks</label><input type="number" min="0" value={form.backlinks} onChange={(e) => setForm({ ...form, backlinks: e.target.value })} className={inputCls} placeholder="0" /></div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Save Metrics
          </button>
        </form>
      </div>
    </div>
  );
}