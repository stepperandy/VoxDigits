import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('authLogin', {
        email,
        password,
        device_id: getDeviceId(),
        device_name: 'Android App',
        device_type: 'android',
      });
      const data = res.data;
      if (!data?.success || !data?.token) {
        setError(data?.message || 'Invalid credentials.');
        return;
      }
      localStorage.setItem('vpn_token', data.token);
      localStorage.setItem('vpn_email', email);
      navigate('/app/servers');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={bg}>
      {/* BG effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] opacity-15" style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center pt-16 pb-6 px-6 z-10 relative">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: 'rgba(0,212,255,0.3)', animationDuration: '2.5s' }} />
          <div className="w-20 h-20 rounded-full flex items-center justify-center relative" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 30px rgba(0,212,255,0.2)' }}>
            <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="w-14 h-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.6))' }} />
          </div>
        </div>
        <h1 className="text-white font-black text-2xl tracking-tight" style={{ textShadow: '0 0 20px rgba(0,212,255,0.4)' }}>Welcome Back</h1>
        <p className="text-slate-500 text-sm mt-1">Sign in to your VoxVPN account</p>
      </div>

      {/* Card */}
      <div className="flex-1 px-5 z-10 relative">
        <div className="rounded-3xl p-6" style={glassCard}>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3.5 rounded-2xl text-white text-sm placeholder-slate-600 focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block font-semibold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl text-white text-sm placeholder-slate-600 focus:outline-none transition-all pr-12"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-black rounded-2xl text-base transition-all flex items-center justify-center gap-2 active:scale-[0.97] mt-2 text-black disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #0066cc)', boxShadow: '0 8px 32px rgba(0,212,255,0.3)' }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Authenticating…</> : <><Shield size={16} /> Sign In Securely</>}
            </button>
          </form>

          <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-center text-slate-500 text-xs mb-3">New to VoxVPN?</p>
            <button
              onClick={() => navigate('/vpn-signup')}
              className="w-full py-3 font-bold rounded-2xl text-sm transition-all active:scale-[0.97]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
            >
              Create Account
            </button>
          </div>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6 pb-8">VoxVPN · Military-grade privacy</p>
      </div>
    </div>
  );
}

function getDeviceId() {
  let id = localStorage.getItem('voxvpn_device_id');
  if (!id) {
    id = 'android-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('voxvpn_device_id', id);
  }
  return id;
}

const bg = {
  background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #060a14 60%, #030609 100%)',
};

const glassCard = {
  background: 'rgba(13, 17, 32, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
};

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
};