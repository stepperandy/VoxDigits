import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, Send, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function BroadcastEmailView() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fromName, setFromName] = useState('VoxVPN Team');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and message are required.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await base44.functions.invoke('broadcastEmail', {
        subject,
        body,
        from_name: fromName || undefined,
      });
      setResult(res?.data || res);
    } catch (e) {
      setError(e?.message || 'Failed to send broadcast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Mail className="text-cyan-400" /> Broadcast Email
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Send an announcement (maintenance, updates, etc.) to every registered user at once.
        </p>
      </div>

      <div className="bg-[#0d1120] border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">From name</label>
          <Input
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            className="bg-[#060910] border-white/10 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Subject *</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Scheduled maintenance — VoxVPN"
            className="bg-[#060910] border-white/10 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Message *</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="Dear VoxVPN user, ..."
            className="bg-[#060910] border-white/10 text-white resize-y"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSend}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Sending…
              </>
            ) : (
              <>
                <Send size={16} /> Send to all users
              </>
            )}
          </Button>
          <span className="text-slate-500 text-xs">Each registered user receives an individual email.</span>
        </div>
      </div>

      {result && (
        <div className="bg-[#0d1120] border border-cyan-500/20 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <CheckCircle2 size={18} /> Broadcast complete
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-white">{result.total ?? 0}</p>
              <p className="text-slate-500 text-xs">Total users</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-400">{result.sent ?? 0}</p>
              <p className="text-slate-500 text-xs">Delivered</p>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-400">{result.failed ?? 0}</p>
              <p className="text-slate-500 text-xs">Failed</p>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="mt-2 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">First failures:</p>
              {result.errors.map((e, i) => (
                <p key={i}>
                  {e.email}: {e.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}