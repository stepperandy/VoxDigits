import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Zap, DollarSign, Download } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const [downloadStats, setDownloadStats] = useState(null);

  const loadAnalytics = async () => {
    try {
      const [statsRes, events] = await Promise.all([
        base44.functions.invoke('getAdminStats', {}),
        base44.entities.DownloadEvent.list('-created_date', 500),
      ]);
      setData(statsRes.data);

      // Compute download stats from events
      const attempted = events.filter(e => e.status === 'attempted').length;
      const success = events.filter(e => e.status === 'success').length;
      const failed = events.filter(e => e.status === 'failed').length;
      const rate = attempted > 0 ? Math.round((success / attempted) * 100) : 0;

      // Per-platform breakdown
      const platforms = ['Windows', 'Android'];
      const byPlatform = platforms.map(p => ({
        platform: p,
        attempted: events.filter(e => e.platform === p && e.status === 'attempted').length,
        success: events.filter(e => e.platform === p && e.status === 'success').length,
      }));

      // By source
      const dashboard = events.filter(e => e.source === 'dashboard').length;
      const publicPage = events.filter(e => e.source === 'public_page').length;

      setDownloadStats({ attempted, success, failed, rate, byPlatform, dashboard, publicPage });
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="text-slate-500">Loading analytics...</div>;
  }

  // Mock data for charts
  const dailyData = [
    { day: 'Mon', users: 120, revenue: 1200 },
    { day: 'Tue', users: 150, revenue: 1500 },
    { day: 'Wed', users: 180, revenue: 1800 },
    { day: 'Thu', users: 220, revenue: 2200 },
    { day: 'Fri', users: 250, revenue: 2500 },
    { day: 'Sat', users: 200, revenue: 2000 },
    { day: 'Sun', users: 170, revenue: 1700 },
  ];

  const metrics = [
    { label: 'Total Users', value: data.overview?.total_users, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Subs', value: data.overview?.active_subscriptions, icon: Zap, color: 'bg-green-500' },
    { label: 'Revenue', value: `$${data.overview?.monthly_revenue}`, icon: DollarSign, color: 'bg-yellow-500' },
    { label: 'Connections', value: data.overview?.total_connections, icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="p-4 rounded-lg border border-white/10 bg-white/3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{m.label}</p>
                  <p className="text-white font-bold text-2xl mt-1">{m.value}</p>
                </div>
                <Icon size={24} className="text-slate-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Download Analytics */}
      {downloadStats && (
        <div className="p-5 rounded-lg border border-white/10 bg-white/3">
          <div className="flex items-center gap-2 mb-4">
            <Download size={16} className="text-cyan-400" />
            <h3 className="text-white font-bold">Download Analytics</h3>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: downloadStats.rate >= 70 ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)', color: downloadStats.rate >= 70 ? '#34d399' : '#fbbf24' }}>
              {downloadStats.rate}% success rate
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Attempted', value: downloadStats.attempted, color: '#00d4ff' },
              { label: 'Successful', value: downloadStats.success, color: '#34d399' },
              { label: 'Failed', value: downloadStats.failed, color: '#f87171' },
              { label: 'From Public Page', value: downloadStats.publicPage, color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <p className="text-slate-500 text-xs mb-2">By Platform</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={downloadStats.byPlatform} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="platform" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1420', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }} />
                <Bar dataKey="attempted" name="Attempted" fill="rgba(0,212,255,0.4)" radius={[4,4,0,0]} />
                <Bar dataKey="success" name="Success" fill="#34d399" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/3">
          <h3 className="text-white font-bold mb-4">Daily Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="users" stroke="#06b6d4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 rounded-lg border border-white/10 bg-white/3">
          <h3 className="text-white font-bold mb-4">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="revenue" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}