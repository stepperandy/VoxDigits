import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Server, TrendingUp, Wifi, Users } from 'lucide-react';

export default function ServerStatusDashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const res = await base44.functions.invoke('getServerStatus', {});
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to load server status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status) return <div className="text-slate-500">Loading server status...</div>;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-white/3 border border-white/10">
          <p className="text-slate-400 text-xs">Online Servers</p>
          <p className="text-white text-2xl font-bold">{status.summary.online_servers}/{status.summary.total_servers}</p>
        </div>
        <div className="p-4 rounded-lg bg-white/3 border border-white/10">
          <p className="text-slate-400 text-xs">Avg Uptime</p>
          <p className="text-white text-2xl font-bold">{status.summary.avg_uptime}%</p>
        </div>
        <div className="p-4 rounded-lg bg-white/3 border border-white/10">
          <p className="text-slate-400 text-xs">Avg Latency</p>
          <p className="text-white text-2xl font-bold">{status.summary.avg_latency_ms}ms</p>
        </div>
        <div className="p-4 rounded-lg bg-white/3 border border-white/10">
          <p className="text-slate-400 text-xs">Active Users</p>
          <p className="text-white text-2xl font-bold">{(status.summary.total_active_connections / 1000).toFixed(1)}k</p>
        </div>
      </div>

      {/* Server List */}
      <div className="space-y-2">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Server size={18} /> Top Servers by Speed
        </h3>
        {status.servers.slice(0, 5).map((server, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
            <div>
              <p className="text-white font-semibold text-sm">{server.city}, {server.country}</p>
              <p className="text-slate-500 text-xs flex items-center gap-1">
                <Wifi size={12} /> {server.latency_ms}ms • {server.load.toFixed(0)}% load
              </p>
            </div>
            <div className="text-right">
              <p className="text-cyan-400 text-sm font-bold">{server.latency_ms}ms</p>
              <p className="text-slate-500 text-xs flex items-center justify-end gap-1">
                <Users size={12} /> {server.active_users}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}