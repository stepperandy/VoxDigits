import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Loader2, Eye, EyeOff, AlertTriangle, Shield, ExternalLink, CreditCard } from 'lucide-react';

const API_URL = 'https://api.base44.com/api/apps/69c84f61d5543b54fe26e1e5/functions/authLogin';

function getDeviceId() {
  let id = localStorage.getItem('voxvpn_device_id');
  if (!id) {
    const raw = [
      navigator.userAgent,
      navigator.hardwareConcurrency,
      screen.width, screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      Math.random().toString(36).slice(2),
    ].join('|');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    id = 'win-' + Math.abs(hash).toString(16) + '-' + Date.now().toString(36);
    localStorage.setItem('voxvpn_device_id', id);
  }
  return id;
}

function getDeviceName() {
  return localStorage.getItem('voxvpn_device_name') || `Windows PC (${navigator.platform || 'Desktop'})`;
}

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [errorType, setErrorType] = useState(''); // 'expired' | 'device_limit' | 'no_sub' | 'invalid'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    setErrorType('');

    try {
      const device_id   = getDeviceId();
      const device_name = getDeviceName();

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, device_id, device_name, device_type: 'windows' }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        if (data.expired) setErrorType('expired');
        else if (data.deviceLimitExceeded) setErrorType('device_limit');
        else if (data.subscriptionActive === false && res.status === 403) setErrorType('no_sub');
        else setErrorType('invalid');
        throw new Error(data.message || data.error || 'Invalid email or password.');
      }

      localStorage.setItem('voxvpn_device_name', device_name);

      if (window.electronVPN?.saveToken) {
        await window.electronVPN.saveToken(data.token);
      } else {
        localStorage.setItem('voxvpn_token', data.token);
      }

      login({
        email: data.email || email,
        token: data.token,
        device_id,
        device_name,
        name: data.user?.name || email.split('@')[0],
        plan: data.subscription?.plan || null,
        hasAccess: true,
      });

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1a] flex items-center justify-center px-4" style={gridBg}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
            alt="VoxVPN"
            className="h-16 w-auto mb-3"
          />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
            <Shield size={11} /> VoxVPN Shield Agent
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 shadow-2xl shadow-black/50"
          style={{ background: 'linear-gradient(135deg,#0d1420,#060c1a)', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 40px rgba(0,212,255,0.06)' }}>

          <h2 className="text-white font-black text-xl mb-1">Welcome back</h2>
          <p className="text-slate-500 text-xs mb-6">Sign in with your VoxVPN / VoxShield account</p>

          {/* Error messages */}
          {error && (
            <div className="rounded-xl border p-3 mb-4 text-sm"
              style={{
                borderColor: errorType === 'expired' ? 'rgba(251,191,36,0.3)' : errorType === 'device_limit' ? 'rgba(139,92,246,0.3)' : 'rgba(239,68,68,0.25)',
                background: errorType === 'expired' ? 'rgba(251,191,36,0.05)' : errorType === 'device_limit' ? 'rgba(139,92,246,0.05)' : 'rgba(239,68,68,0.05)',
              }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5"
                  style={{ color: errorType === 'expired' ? '#fbbf24' : errorType === 'device_limit' ? '#a78bfa' : '#f87171' }} />
                <div>
                  <p style={{ color: errorType === 'expired' ? '#fbbf24' : errorType === 'device_limit' ? '#a78bfa' : '#f87171' }}>
                    {error}
                  </p>
                  {(errorType === 'expired' || errorType === 'no_sub') && (
                    <a href="https://voxvpn.net/pricing" target="_blank" rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold underline"
                      style={{ color: '#00d4ff' }}>
                      <CreditCard size={10} /> Renew at voxvpn.net <ExternalLink size={9} />
                    </a>
                  )}
                  {errorType === 'device_limit' && (
                    <a href="https://voxvpn.net/account-settings" target="_blank" rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold underline"
                      style={{ color: '#a78bfa' }}>
                      Manage devices at voxvpn.net <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
                style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
                  style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-black font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{ background: loading ? 'rgba(0,212,255,0.7)' : 'linear-gradient(135deg,#00d4ff,#00b8e6)', boxShadow: '0 8px 24px rgba(0,212,255,0.3)' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Sign In to Shield'}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-5 pt-4 border-t border-white/5 space-y-2 text-center">
            <p className="text-slate-500 text-sm">
              No account?{' '}
              <a href="https://voxvpn.net/pricing" target="_blank" rel="noopener noreferrer"
                className="font-bold transition-colors" style={{ color: '#00d4ff' }}>
                Get a plan at voxvpn.net
              </a>
            </p>
            <a href="https://voxvpn.net/auth-login" target="_blank" rel="noopener noreferrer"
              className="block text-slate-600 text-xs hover:text-slate-400 transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        <p className="text-center text-slate-700 text-xs mt-5">VoxVPN Shield Agent · Military-grade privacy</p>
      </div>
    </div>
  );
}

const gridBg = {
  backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.03) 1px,transparent 1px)',
  backgroundSize: '40px 40px',
};