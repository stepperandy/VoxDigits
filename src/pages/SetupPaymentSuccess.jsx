import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import { ShieldCheck, Loader2, XCircle } from 'lucide-react';

export default function SetupPaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    let done = false;
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        if (!sessionId) {
          setError('Missing payment session.');
          setStatus('error');
          return;
        }

        const fingerprint = await getDeviceFingerprint();
        const res = await base44.functions.invoke('setupPaymentAuth', {
          action: 'confirm',
          session_id: sessionId,
          fingerprint,
        });
        const data = res?.data || res;

        if (data?.success) {
          if (!done) {
            setStatus('done');
            setTimeout(() => { if (!done) navigate('/dashboard'); }, 1600);
          }
        } else {
          if (!done) {
            setError(data?.error || 'We could not confirm your payment method.');
            setStatus('error');
          }
        }
      } catch (e) {
        if (!done) {
          setError(e?.message || 'We could not confirm your payment method.');
          setStatus('error');
        }
      }
    })();
    return () => { done = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080c18] to-[#0d1120] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {status === 'processing' && (
          <>
            <Loader2 size={48} className="text-cyan-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Activating your 25 free credits…</h1>
            <p className="text-slate-400 text-sm">Confirming your payment method and registering your device.</p>
          </>
        )}
        {status === 'done' && (
          <>
            <ShieldCheck size={56} className="text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">You're all set! 🎉</h1>
            <p className="text-slate-400 text-sm mb-4">
              Your card was authorized and 25 free credits are now active. Taking you to your dashboard…
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-bold text-sm"
            >
              Go to dashboard
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Confirmation failed</h1>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => navigate('/auth-signup')}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-bold text-sm"
            >
              Back to signup
            </button>
          </>
        )}
      </div>
    </div>
  );
}