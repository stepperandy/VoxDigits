import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Globe, TrendingUp } from 'lucide-react';

export default function VPNStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await base44.functions.invoke('getUserStats', {});
      setStats(res.data?.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return <div className="text-slate-500">Loading stats...</div>;

  const dailyData = [
    { day: 'Mon', gb: 5.2 },
    { day: 'Tue', gb: 4.8 },
    { day: 'Wed', gb: 6.1 },
    { day: 'Thu', gb: 5.5 },
    { day: 'Fri', gb: 7.2 },
    { day: 'Sat', gb: 9.1 },
    { day: 'Sun', gb: 7.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Current Session */}
      {stats.current_session?.connected && (
        <div className="p-6 rounded-lg border border-green-500/20 bg-green-500/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap size={20} className="text-green-400" /> Currently Connected
            </h3>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">LIVE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-slate-400 text-xs">Server</p>
              <p className="text-white font-bold">{stats.current_session.server}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Connected</p>
              <p className="text-white font-bold">{stats.current_session.connected_since}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Download</p>
              <p className="text-white font-bold">{stats.current_session.download_mbps} Mbps</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Data Used</p>
              <p className="text-white font-bold">{stats.current_session.data_used_this_session_mb} MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/3">
          <p className="text-slate-400 text-sm mb-2 flex items-center gap-2">
            <Activity size={16} /> Total Data Used
          </p>
          <p className="text-white text-3xl font-bold">{stats.total_data_used_gb} GB</p>
          <p className="text-slate-500 text-xs mt-1">This month: {stats.this_month.data_used_gb} GB</p>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/3">
          <p className="text-slate-400 text-sm mb-2 flex items-center gap-2">
            <Globe size={16} /> Connection Time
          </p>
          <p className="text-white text-3xl font-bold">{stats.total_connection_time_hours}h</p>
          <p className="text-slate-500 text-xs mt-1">This month: {stats.this_month.connection_hours}h</p>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/3">
          <p className="text-slate-400 text-sm mb-2 flex items-center gap-2">
            <TrendingUp size={16} /> Connections
          </p>
          <p className="text-white text-3xl font-bold">{stats.lifetime.connections}</p>
          <p className="text-slate-500 text-xs mt-1">Avg: {stats.lifetime.average_session_minutes} min</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 rounded-lg border border-white/10 bg-white/3">
        <h3 className="text-white font-bold mb-4">Data Usage This Week</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <Bar dataKey="gb" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/3">
          <h3 className="text-white font-bold mb-3">This Month</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Countries: {stats.this_month.countries_visited.join(', ')}</li>
            <li>Peak Day: {stats.this_month.peak_usage_day}</li>
            <li>Peak Hours: 8-11 PM</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/3">
          <h3 className="text-white font-bold mb-3">Lifetime</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Most Used: {stats.lifetime.most_used_server}</li>
            <li>Devices: {stats.devices_active} active</li>
            <li>Member Since: 8 months</li>
          </ul>
        </div>
      </div>
    </div>
  );
}