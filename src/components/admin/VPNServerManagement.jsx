import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Loader2, Check, AlertCircle, Zap, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const emptyForm = {
  region: '',
  country: '',
  city: '',
  ip_address: '',
  public_key: '',
  max_connections: 1000,
  status: 'online',
};

function ServerForm({ initial, onSave, onCancel, saving, vultrRegions }) {
  const [form, setForm] = useState(initial || emptyForm);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-cyan-500/20 bg-[#0a1020] p-6 space-y-4">
      <h3 className="text-white font-semibold">{initial?.id ? 'Edit Server' : 'Add VPN Server'}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Region *</label>
          <input value={form.region} onChange={e => set('region', e.target.value)} placeholder="New York"
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Country Code *</label>
          <input value={form.country} onChange={e => set('country', e.target.value)} placeholder="US"
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">City</label>
          <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="New York"
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">IP Address *</label>
          <input value={form.ip_address} onChange={e => set('ip_address', e.target.value)} placeholder="1.2.3.4"
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Public Key (WireGuard) *</label>
          <textarea value={form.public_key} onChange={e => set('public_key', e.target.value)} placeholder="Base64 encoded public key"
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none" rows={3} />
        </div>
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Max Connections</label>
          <input type="number" value={form.max_connections} onChange={e => set('max_connections', parseInt(e.target.value) || 1000)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-wider mb-1.5 block">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} disabled={saving || !form.region || !form.ip_address}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 text-black font-bold text-sm rounded-xl transition-all">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {initial?.id ? 'Update' : 'Add'}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 border border-white/10 text-slate-400 hover:text-white text-sm rounded-xl transition-all">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

export default function VPNServerManagement() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [vultrRegions, setVultrRegions] = useState([]);

  const load = () => {
    setLoading(true);
    base44.entities.VPNServer.list('-updated_date').then(setServers).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await base44.entities.VPNServer.update(editing.id, form);
      } else {
        await base44.entities.VPNServer.create(form);
      }
      setShowForm(false);
      setEditing(null);
      setTimeout(() => load(), 300);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this server?')) return;
    try {
      await base44.entities.VPNServer.delete(id);
      setServers(servers.filter(s => s.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const handleSyncVultr = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke('vultrServerManagement', {
        action: 'sync_vultr_metrics',
      });
      load();
    } catch (error) {
      alert('Failed to sync: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'online') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'offline') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Servers', value: servers.length, color: 'text-white' },
          { label: 'Online', value: servers.filter(s => s.status === 'online').length, color: 'text-emerald-400' },
          { label: 'Total Connections', value: servers.reduce((s, srv) => s + (srv.active_connections || 0), 0), color: 'text-cyan-400' },
          { label: 'Total Bandwidth (GB)', value: servers.reduce((s, srv) => s + (srv.bandwidth_used_gb || 0), 0).toFixed(1), color: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-[#0d1120] border border-white/5 px-4 py-4">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-white font-semibold">VPN Servers</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSyncVultr}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black text-sm font-bold rounded-xl transition-all flex-shrink-0"
          >
            {syncing ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            Sync Vultr
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded-xl transition-all flex-shrink-0"
          >
            <Plus size={15} /> Add Server
          </button>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <ServerForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            saving={saving}
            vultrRegions={vultrRegions}
          />
        )}
      </AnimatePresence>

      {/* Servers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin text-cyan-400" />
          <span className="text-sm">Loading servers...</span>
        </div>
      ) : servers.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] py-20 text-center">
          <Radio size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No servers yet. Click "Add Server" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {servers.map((server) => (
            <motion.div key={server.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 bg-[#0d1120] p-5 flex flex-col gap-4 hover:border-white/10 transition-all">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Radio size={18} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight">{server.region}</p>
                    <p className="text-slate-500 text-[11px]">{server.city}, {server.country} • {server.ip_address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => { setEditing(server); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-cyan-400 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(server.id)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-rose-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold w-fit border ${getStatusColor(server.status)}`}>
                {server.status.toUpperCase()}
              </span>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Load', value: `${(server.current_load || 0).toFixed(0)}%`, color: 'text-blue-400' },
                  { label: 'Connections', value: `${server.active_connections || 0}/${server.max_connections || 1000}`, color: 'text-cyan-400' },
                  { label: 'Uptime', value: `${(server.uptime_percentage || 99.9).toFixed(1)}%`, color: 'text-emerald-400' },
                ].map(m => (
                  <div key={m.label} className="rounded-lg bg-[#0a1020] p-2">
                    <p className="text-slate-600 text-[10px]">{m.label}</p>
                    <p className={`${m.color} text-sm font-bold`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Bandwidth */}
              <div className="bg-[#0a1020] rounded-lg p-3">
                <p className="text-slate-600 text-xs mb-1">Bandwidth Used</p>
                <div className="w-full bg-[#060910] rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full"
                    style={{ width: `${Math.min((server.bandwidth_used_gb || 0) / 1000 * 100, 100)}%` }} />
                </div>
                <p className="text-cyan-400 text-sm font-bold mt-1">{(server.bandwidth_used_gb || 0).toFixed(1)} GB</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}