import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MailCheck, CheckCircle2, AlertTriangle, Loader2, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AcceptInvite() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const [loading, setLoading] = useState(false);
  const [acceptedEmail, setAcceptedEmail] = useState(null);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('acceptInvite', { token });
      setAcceptedEmail(res.data?.email || '');
    } catch (err) {
      setError(err?.response?.data?.error || err?.data?.error || err?.message || 'Failed to accept invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      {/* Glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-md">
        <div className="bg-[#0d1120]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {!token && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Invalid invitation link</h1>
              <p className="text-slate-400 mb-6">
                This invitation link is missing its token. Please open the <strong>Accept Invitation</strong> button
                directly from your invitation email.
              </p>
              <Link to="/login" className="text-slate-400 hover:text-white text-sm inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </div>
          )}

          {token && !acceptedEmail && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center mb-6">
                <MailCheck className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Accept your invitation</h1>
              <p className="text-slate-400 mb-2">
                You've been invited to VoxVPN. Accept below to create your password — you won't need to log in first.
              </p>
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-left">
                  <span className="inline-flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </span>
                </div>
              )}
              <button
                onClick={handleAccept}
                disabled={loading}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-slate-950 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Accepting…
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" /> Accept &amp; Create Password
                  </>
                )}
              </button>
            </div>
          )}

          {token && acceptedEmail !== null && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Invitation accepted</h1>
              <p className="text-slate-400 mb-4">
                We've sent a <strong className="text-white">password creation link</strong> to{' '}
                <span className="text-cyan-400">{acceptedEmail}</span>.
              </p>
              <div className="p-4 bg-slate-800/50 rounded-lg text-left mb-6">
                <p className="text-slate-400 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 inline mr-1.5 -mt-0.5" />
                  Open that email and click the link to set your new password — you'll be signed in
                  automatically. Check your spam folder if it doesn't arrive within a few minutes.
                </p>
              </div>
              <Link
                to="/login"
                className="text-slate-400 hover:text-white text-sm inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Invitations expire after 7 days. Ask your administrator to resend if yours has expired.
        </p>
      </div>
    </div>
  );
}