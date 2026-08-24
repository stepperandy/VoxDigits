import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, Send, Loader2, AlertTriangle, CheckCircle2, X, Users, UserCheck } from 'lucide-react';

const SEGMENTS = [
  { value: 'all', label: 'All registered users', icon: Users },
  { value: 'active_subscribers', label: 'Active subscribers only', icon: UserCheck },
];

const TEMPLATES = [
  { label: 'Maintenance notice', subject: 'Scheduled Maintenance Notice', body: 'Hi,\n\nWe will be performing scheduled maintenance on our servers on [date] from [start time] to [end time]. During this window, some services may be temporarily unavailable.\n\nWe apologize for any inconvenience and appreciate your patience.\n\n— VoxTelephony Team' },
  { label: 'New feature', subject: 'New Feature Announcement', body: 'Hi,\n\nWe\'re excited to share a new update! [Describe the feature and benefit.]\n\nLog in to your dashboard to try it out.\n\n— VoxTelephony Team' },
  { label: 'Blank', subject: '', body: '' },
];

export default function BroadcastEmailView() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState('all');
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const applyTemplate = (t) => {
    setSubject(t.subject);
    setBody(t.body);
    setResult(null);
    setError('');
  };

  const handleSend = async () => {
    setConfirmOpen(false);
    setSending(true);
    setError('');
    setResult(null);
    try {
      const res = await base44.functions.invoke('broadcastEmail', { subject, body, segment });
      if (!res.data?.success) {
        setError(res.data?.error || 'Failed to send broadcast.');
      } else {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send broadcast.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-cyan-400" /> Broadcast Email
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Send an announcement email to all registered users at once — maintenance notices, new features, and more.
        </p>
      </div>

      {/* Templates */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.label}
            onClick={() => applyTemplate(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#0d1120] border border-white/5 rounded-2xl p-6 space-y-5">
        {/* Segment */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recipients</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SEGMENTS.map((s) => {
              const Icon = s.icon;
              const active = segment === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => setSegment(s.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    active
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                      : 'bg-white/3 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-cyan-400' : 'text-slate-500'} />
                  <span className="text-sm font-medium">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Scheduled Maintenance — Aug 30"
            className="w-full bg-[#060910] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="Write your announcement…"
            className="w-full bg-[#060910] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 resize-y"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm">
            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Broadcast complete</p>
              <p className="text-emerald-200/80 mt-0.5">
                Sent to {result.sent} of {result.total} recipients
                {result.failed > 0 && ` · ${result.failed} failed`}.
              </p>
              {result.errors?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-emerald-200/70 text-xs">View sample errors</summary>
                  <ul className="mt-1 space-y-1 text-xs text-rose-200/80">
                    {result.errors.map((e, i) => (
                      <li key={i} className="font-mono">{e.email}: {e.error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Send */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={sending || !subject.trim() || !body.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#060910] font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {sending ? 'Sending…' : 'Send Broadcast'}
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0d1120] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-bold">Confirm broadcast</h3>
              </div>
              <button onClick={() => setConfirmOpen(false)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              This will email <strong className="text-cyan-400">{SEGMENTS.find((s) => s.value === segment)?.label}</strong> with the subject
              <strong className="text-white"> "{subject}"</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-[#060910]"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}