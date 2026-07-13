import { useState } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import { Loader2, Eye, EyeOff, AlertTriangle, CheckCircle2, Shield, ExternalLink, CreditCard, User, Mail, Lock } from 'lucide-react';

export default function Signup({ onSwitchToLogin }) {
  const { login } = useAuth();
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain uppercase, lowercase, and a number.'); return;
    }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const data = await api.register(fullName.trim(), email, password);
      if (data.success !== false) {
        setSuccess(true);
      } else {
        throw new Error(data.message || data.error || 'Signup failed.');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')) {
        setError('This email is already registered. Try signing in instead.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#060c1a] flex items-center justify-center px-4" style={gridBg}>
        <div className="w-full max-w-sm text-center">
          <div className="flex flex-col items-center mb-6">
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

          <div className="rounded-2xl p-6 shadow-2xl shadow-black/50"
            style={{ background: 'linear-gradient(135deg,#0d1420,#060c1a)', border: '1px solid rgba(0,212,255,0.15)' }}>
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-white font-black text-xl mb-2">Account Created!</h2>
            <p className="text-slate-400 text-sm mb-5">
              Welcome, {fullName.split(' ')[0]}! Your VoxVPN account is ready.
              To activate VPN access, choose a subscription plan.
            </p>

            <a href="https://voxvpn.net/pricing" target="_blank" rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg,#00d4ff,#00b8e6)', color: '#000', boxShadow: '0 8px 24px rgba(0,212,255,0.3)' }}>
              <CreditCard size={16} /> Choose a Plan <ExternalLink size={12} />
            </a>

            <p className="text-slate-500 text-xs mt-4 mb-3">
              After purchasing, return here and sign in with your credentials.
            </p>

            <button onClick={onSwitchToLogin}
              className="text-cyan-400 hover:text-cyan-300 font-bold text-sm transition-colors">
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          <h2 className="text-white font-black text-xl mb-1">Create account</h2>
          <p className="text-slate-500 text-xs mb-5">Same credentials work on all platforms</p>

          {error && (
            <div className="rounded-xl border p-3 mb-4 text-sm"
              style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.05)' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
                  style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
                  style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="8+ chars, Aa1"
                  className="w-full pl-9 pr-11 py-3 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
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
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
                  style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-black font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{ background: loading ? 'rgba(0,212,255,0.7)' : 'linear-gradient(135deg,#00d4ff,#00b8e6)', boxShadow: '0 8px 24px rgba(0,212,255,0.3)' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-5">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-bold transition-colors" style={{ color: '#00d4ff' }}>
              Sign in
            </button>
          </p>
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