import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, UserPlus, Loader2, Trash2, Mail, X, CheckCircle2, AlertCircle, Clock, CreditCard, Calendar, MoreVertical, Crown } from 'lucide-react';

const STATUS_STYLES = {
  active: { label: 'Active', dot: '#34A853', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  trial: { label: 'Trial', dot: '#00d4ff', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  pending_payment: { label: 'Pending', dot: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  expired: { label: 'Expired', dot: '#ef4444', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  cancelled: { label: 'Cancelled', dot: '#94a3b8', text: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10' },
  paused: { label: 'Paused', dot: '#a78bfa', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
};

const ROLE_STYLES = {
  client_admin: { label: 'Admin', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  agency_admin: { label: 'Agency', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  team_member: { label: 'Member', cls: 'text-slate-400 bg-white/5 border-white/10' },
  admin: { label: 'Super', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function TeamTableTab({ data, onRefresh }) {
  const { teamMembers, subscriptions, devices, client } = data;
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', job_title: '', member_role: 'team_member' });
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  // Build subscription lookup by email
  const subMap = {};
  (subscriptions || []).forEach(s => { subMap[s.user_email] = s; });

  // Build device count by owner email
  const deviceCounts = {};
  (devices || []).forEach(d => {
    const email = d.owner_email;
    if (email) deviceCounts[email] = (deviceCounts[email] || 0) + 1;
  });

  const rows = (teamMembers || []).map(m => ({
    ...m,
    subscription: subMap[m.email] || null,
    deviceCount: deviceCounts[m.email] || 0,
  }));

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await base44.functions.invoke('inviteTeamMember', inviteForm);
      if (res.data?.error) throw new Error(res.data.error);
      setInviteMsg({ type: 'success', text: res.data?.message || 'Team member invited' });
      setInviteForm({ email: '', full_name: '', job_title: '', member_role: 'team_member' });
      setTimeout(() => { setShowInvite(false); setInviteMsg(null); onRefresh(); }, 1500);
    } catch (err) {
      setInviteMsg({ type: 'error', text: err.message });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this team member? They will lose access to the business VPN.')) return;
    setRemovingId(memberId);
    setMenuOpen(null);
    try {
      const res = await base44.functions.invoke('removeTeamMember', { member_id: memberId });
      if (res.data?.error) throw new Error(res.data.error);
      onRefresh();
    } catch (err) {
      alert('Failed to remove: ' + err.message);
    } finally {
      setRemovingId(null);
    }
  };

  const seatUsed = teamMembers?.length || 0;
  const seatMax = client?.max_users || 10;
  const activeCount = rows.filter(r => r.subscription && ['active', 'trial'].includes(r.subscription.status)).length;
  const atRiskCount = rows.filter(r => r.subscription && ['expired', 'pending_payment', 'cancelled'].includes(r.subscription.status)).length;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header + stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white font-black text-xl">Team & Subscriptions</h2>
          <p className="text-slate-500 text-xs mt-1">{seatUsed} of {seatMax} seats used · {activeCount} active · {atRiskCount} at risk</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded-xl transition-all">
          <UserPlus size={15} /> Invite Member
        </button>
      </div>

      {/* Seat usage bar */}
      <div className="rounded-xl bg-[#0d1420] border border-white/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-xs">Seat Usage</span>
          <span className="text-white text-xs font-bold">{seatUsed} / {seatMax}</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all"
            style={{ width: `${Math.min(100, (seatUsed / seatMax) * 100)}%` }} />
        </div>
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl border border-cyan-500/20 bg-[#0d1420] p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Invite Team Member</h3>
                <button onClick={() => setShowInvite(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
              </div>
              {inviteMsg && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                  inviteMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}>
                  {inviteMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {inviteMsg.text}
                </div>
              )}
              <form onSubmit={handleInvite} className="space-y-3">
                <input type="email" required value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email address *"
                  className="w-full px-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                <input value={inviteForm.full_name} onChange={e => setInviteForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Full name (optional)"
                  className="w-full px-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                <input value={inviteForm.job_title} onChange={e => setInviteForm(f => ({ ...f, job_title: e.target.value }))}
                  placeholder="Job title (optional)"
                  className="w-full px-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                <select value={inviteForm.member_role} onChange={e => setInviteForm(f => ({ ...f, member_role: e.target.value }))}
                  className="w-full px-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                  <option value="team_member">Team Member</option>
                  <option value="client_admin">Admin (full access)</option>
                </select>
                <button type="submit" disabled={inviting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold disabled:opacity-50">
                  {inviting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  {inviting ? 'Sending Invite...' : 'Send Invite'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Table — Desktop */}
      <div className="hidden md:block rounded-2xl border border-white/5 bg-[#0d1420] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Member</th>
              <th className="text-left px-4 py-3 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Plan</th>
              <th className="text-left px-4 py-3 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Renewal</th>
              <th className="text-center px-4 py-3 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Devices</th>
              <th className="text-right px-4 py-3 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((m, i) => {
              const sub = m.subscription;
              const status = sub ? STATUS_STYLES[sub.status] || STATUS_STYLES.pending_payment : null;
              const role = ROLE_STYLES[m.role] || ROLE_STYLES.team_member;
              const days = sub ? getDaysUntil(sub.renewal_date) : null;
              const isUrgent = days !== null && days <= 7 && days >= 0;
              const isExpired = days !== null && days < 0;
              return (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  {/* Member */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        {m.role === 'client_admin' ? <Crown size={14} className="text-cyan-400" /> : <Users size={14} className="text-cyan-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{m.full_name || m.email}</p>
                        <p className="text-slate-500 text-xs truncate">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${role.cls}`}>{role.label}</span>
                  </td>
                  {/* Plan */}
                  <td className="px-4 py-3">
                    {sub ? (
                      <span className="text-white text-sm font-medium">{sub.plan}</span>
                    ) : (
                      <span className="text-slate-600 text-xs italic">No subscription</span>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    {status ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                        <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  {/* Renewal */}
                  <td className="px-4 py-3">
                    {sub?.renewal_date ? (
                      <div>
                        <p className="text-white text-xs font-medium">{new Date(sub.renewal_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        {isExpired ? (
                          <p className="text-rose-400 text-[10px] font-semibold">{Math.abs(days)}d ago</p>
                        ) : isUrgent ? (
                          <p className="text-amber-400 text-[10px] font-semibold">{days}d left</p>
                        ) : days !== null ? (
                          <p className="text-slate-600 text-[10px]">{days}d left</p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  {/* Devices */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-white text-sm font-medium">{m.deviceCount}</span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    {m.role !== 'client_admin' ? (
                      <button onClick={() => handleRemove(m.id)} disabled={removingId === m.id}
                        className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-colors disabled:opacity-50">
                        {removingId === m.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    ) : (
                      <span className="text-slate-700 text-[10px]">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            }) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Users size={28} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No team members yet.</p>
                  <p className="text-slate-600 text-xs mt-1">Click "Invite Member" to add your first team member.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {rows.length > 0 ? rows.map((m, i) => {
          const sub = m.subscription;
          const status = sub ? STATUS_STYLES[sub.status] || STATUS_STYLES.pending_payment : null;
          const role = ROLE_STYLES[m.role] || ROLE_STYLES.team_member;
          const days = sub ? getDaysUntil(sub.renewal_date) : null;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-white/5 bg-[#0d1420] p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    {m.role === 'client_admin' ? <Crown size={14} className="text-cyan-400" /> : <Users size={14} className="text-cyan-400" />}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{m.full_name || m.email}</p>
                    <p className="text-slate-500 text-xs">{m.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${role.cls}`}>{role.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                <div>
                  <p className="text-slate-600 text-[9px] uppercase">Plan</p>
                  <p className="text-white text-xs font-medium">{sub?.plan || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-[9px] uppercase">Status</p>
                  {status ? (
                    <p className={`text-xs font-semibold ${status.text}`}>{status.label}</p>
                  ) : <p className="text-slate-600 text-xs">—</p>}
                </div>
                <div>
                  <p className="text-slate-600 text-[9px] uppercase">Devices</p>
                  <p className="text-white text-xs font-medium">{m.deviceCount}</p>
                </div>
              </div>
              {sub?.renewal_date && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                  <Calendar size={11} className="text-slate-600" />
                  <p className="text-slate-400 text-[10px]">
                    Renews {new Date(sub.renewal_date).toLocaleDateString()}
                    {days !== null && days < 0 ? ` · Expired ${Math.abs(days)}d ago` : days !== null && days <= 7 ? ` · ${days}d left` : ''}
                  </p>
                </div>
              )}
              {m.role !== 'client_admin' && (
                <button onClick={() => handleRemove(m.id)} disabled={removingId === m.id}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs font-medium disabled:opacity-50">
                  {removingId === m.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Remove Member
                </button>
              )}
            </motion.div>
          );
        }) : (
          <div className="rounded-2xl border border-white/5 bg-[#0d1420] py-12 text-center">
            <Users size={28} className="text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No team members yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}