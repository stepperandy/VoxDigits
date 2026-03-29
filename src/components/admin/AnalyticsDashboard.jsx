import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, TrendingUp, Wifi, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // Get live metrics
      const metricsRes = await base44.functions.invoke('analyticsTracking', {
        action: 'get_live_metrics',
      });

      // Get subscription trends
      const trendsRes = await base44.functions.invoke('analyticsTracking', {
        action: 'get_subscription_trends',
      });

      // Get analytics data
      const analyticsRes = await base44.functions.invoke('analyticsTracking', {
        action: 'get_analytics',
      });

      setMetrics(metricsRes.data.metrics);
      setTrends(trendsRes.data.trends.reverse());
      setAnalytics(analyticsRes.data.analytics.reverse());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setRefreshing(true);
      loadData().then(() => setRefreshing(false));
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
        <Loader2 size={18} className="animate-spin text-cyan-400" />
        <span className="text-sm">Loading analytics...</span>
      </div>
    );
  }

  const trafficChartData = analytics.map(a => ({
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    connections: a.total_active_connections || 0,
    bandwidth: (a.total_bandwidth_gb || 0) / 10, // Scale for display
  }));

  const subscriptionChartData = trends.slice(-30).map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    new: t.new_subscriptions || 0,
    cancelled: t.cancelled_subscriptions || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">VPN Analytics</h2>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
        >
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics && [
          {
            label: 'Active Connections',
            value: metrics.total_connections,
            icon: Wifi,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10 border-cyan-500/20',
          },
          {
            label: 'Total Bandwidth (GB)',
            value: metrics.total_bandwidth_gb.toFixed(1),
            icon: TrendingUp,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
          },
          {
            label: 'Active Servers',
            value: `${metrics.active_servers}/${metrics.total_servers}`,
            icon: Zap,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
          },
          {
            label: 'Active Subscriptions',
            value: metrics.active_subscriptions,
            icon: Users,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10 border-violet-500/20',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border ${item.bg} p-4`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-slate-500 text-xs uppercase tracking-wider">{item.label}</p>
                <Icon size={18} className={item.color} />
              </div>
              <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Connections & Bandwidth Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6"
        >
          <h3 className="text-white font-bold mb-4">Traffic & Connections (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a1020', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="connections" stroke="#06b6d4" strokeWidth={2} dot={false} name="Connections" />
              <Line type="monotone" dataKey="bandwidth" stroke="#3b82f6" strokeWidth={2} dot={false} name="Bandwidth (GB/10)" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subscription Sign-ups & Cancellations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6"
        >
          <h3 className="text-white font-bold mb-4">Subscription Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subscriptionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a1020', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="new" fill="#10b981" name="New Subscriptions" />
              <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Server Load Distribution */}
      {metrics?.server_breakdown && metrics.server_breakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Server Load Pie */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <h3 className="text-white font-bold mb-4">Connection Distribution by Server</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.server_breakdown}
                  dataKey="connections"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {metrics.server_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1020', border: '1px solid rgba(255,255,255,0.1)' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Server Details Table */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <h3 className="text-white font-bold mb-4">Server Status Overview</h3>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {metrics.server_breakdown.map((server) => (
                <div key={server.region} className="flex items-center justify-between p-3 rounded-lg bg-[#0a1020] border border-white/5">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{server.region}</p>
                    <p className="text-slate-500 text-xs">
                      {server.connections} connections • {server.load.toFixed(0)}% load
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    server.status === 'online'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {server.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}