import React, { useState } from 'react';
import { Mail, Send, Loader2, AlertCircle, CheckCircle2, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdminBroadcast() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fromName, setFromName] = useState('VoxTelefony');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const canSend = subject.trim() && message.trim() && !sending;

  const runBroadcast = async (opts = {}) => {
    setError('');
    setResult(null);
    try {
      const res = await base44.functions.invoke('broadcastEmail', {
        subject: subject.trim(),
        body: message.trim(),
        from_name: fromName.trim() || 'VoxTelefony',
        ...opts,
      });
      const data = res?.data ?? res;
      setResult(data);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to send broadcast');
    }
  };

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      await runBroadcast();
    } finally {
      setSending(false);
    }
  };

  const handleTest = async () => {
    if (!canSend || !testEmail.trim()) return;
    setTesting(true);
    try {
      await runBroadcast({ test_email: testEmail.trim() });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Broadcast Email</h2>
          <p className="text-sm text-slate-400">Send one email to every registered user at once — maintenance notices, announcements, and more.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
        {/* From name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">From name</label>
          <input
            type="text"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="VoxTelefony"
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Scheduled maintenance this Sunday"
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            placeholder="Write the announcement. Plain text is fine."
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 resize-y"
          />
        </div>

        {/* Test send */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Send a test first</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-slate-900/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={handleTest}
              disabled={!canSend || !testEmail.trim() || testing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Test
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-300">
                {result.test ? 'Test email sent' : 'Broadcast complete'}
              </p>
            </div>
            {!result.test && (
              <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                <span>Total recipients: <span className="font-semibold text-white">{result.total}</span></span>
                <span>Sent: <span className="font-semibold text-emerald-400">{result.sent}</span></span>
                <span>Failed: <span className="font-semibold text-red-400">{result.failed}</span></span>
              </div>
            )}
            {result.errors?.length > 0 && (
              <div className="mt-2 text-xs text-red-300/80 space-y-1">
                {result.errors.map((e, i) => (
                  <p key={i}>{e.email}: {e.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Send to all */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending…' : 'Send to all users'}
          </button>
          <p className="text-xs text-slate-500">This emails every registered user.</p>
        </div>
      </div>
    </div>
  );
}