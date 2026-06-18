import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, Shield, Wifi, Zap, Globe, Key } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PARTICLES = [
  { icon: Shield,  top: '8%',  left: '5%',  size: 22, anim: 'float-1', blink: 'blink-1' },
  { icon: Wifi,    top: '15%', left: '88%', size: 18, anim: 'float-2', blink: 'blink-2' },
  { icon: Lock,    top: '72%', left: '7%',  size: 20, anim: 'float-3', blink: 'blink-1' },
  { icon: Zap,     top: '80%', left: '90%', size: 16, anim: 'float-1', blink: 'blink-3' },
  { icon: Globe,   top: '45%', left: '3%',  size: 24, anim: 'float-2', blink: 'blink-2' },
  { icon: Key,     top: '60%', left: '85%', size: 17, anim: 'float-1', blink: 'blink-3' },
];

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const isValid = Object.values(strength).every(Boolean) && password === confirmPassword;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isValid) { setError('Password requirements not met.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('emailSignup', { full_name: fullName, email, password });
      if (res.data?.success) {
        navigate('/app/login');
      } else {
        setError(res.data?.error || 'Signup failed.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1a] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <style>{`
        @keyframes float-1{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-18px) rotate(8deg)}66%{transform:translateY(10px) rotate(-5deg)}}
        @keyframes float-2{0%,100%{transform:translateY(0) translateX(0) rotate(0deg)}40%{transform:translateY(-22px) translateX(12px) rotate(-10deg)}70%{transform:translateY(8px) translateX(-8px) rotate(6deg)}}
        @keyframes float-3{0%,100%{transform:translateY(0) rotate(0deg) scale(1)}50%{transform:translateY(-14px) rotate(12deg) scale(1.1)}}
        @keyframes blink-1{0%,100%{opacity:.25}50%{opacity:.7}}
        @keyframes blink-2{0%,30%,100%{opacity:.15}60%{opacity:.6}}
        @keyframes blink-3{0%,80%,100%{opacity:.1}20%{opacity:.8}40%{opacity:.2}}
        @keyframes scan-line{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.4}100%{transform:scale(1.8);opacity:0}}
        .float-1{animation:float-1 7s ease-in-out infinite}.float-2{animation:float-2 9s ease-in-out infinite}.float-3{animation:float-3 6s ease-in-out infinite}
        .blink-1{animation:blink-1 3s ease-in-out infinite}.blink-2{animation:blink-2 4.5s ease-in-out infinite}.blink-3{animation:blink-3 2.5s ease-in-out infinite}
        .scan-line{animation:scan-line 6s linear infinite;background:linear-gradient(180deg,transparent,rgba(0,212,255,0.04),transparent);height:80px;width:100%;position:absolute;left:0;pointer-events:none}
        .pulse-ring{animation:pulse-ring 2s ease-out infinite}
      `}</style>

      {/* Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.3) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center,transparent 40%,#060c1a 80%)' }} />
      </div>
      <div className="scan-line" />

      {PARTICLES.map((p, i) => {
        const Icon = p.icon;
        return (
          <div key={i} className={`absolute pointer-events-none ${p.anim} ${p.blink}`} style={{ top: p.top, left: p.left }}>
            <Icon size={p.size} className="text-cyan-400" />
          </div>
        );
      })}

      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(0,212,255,0.06) 0%,transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="pulse-ring w-20 h-20 rounded-full border-2 border-cyan-400/30 absolute" />
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/13431de73_VoxICON.png"
              alt="VoxVPN"
              className="w-16 h-16 rounded-2xl"
              style={{ filter: 'drop-shadow(0 0 14px rgba(0,212,255,0.5))' }}
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Vox<span className="text-cyan-400">VPN</span></h1>
          <p className="text-slate-400 text-sm">Create your account</p>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(0,212,255,0.07),0 20px 60px rgba(0,0,0,0.5)' }}>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/60 transition-all" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/60 transition-all" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/60 transition-all pr-10" required />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                {[['length','8+ chars'],['upper','Uppercase'],['lower','Lowercase'],['number','Number']].map(([k,label]) => (
                  <div key={k} className={`flex items-center gap-1 ${strength[k] ? 'text-green-400' : 'text-slate-600'}`}>
                    <CheckCircle2 size={11} /> {label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/60 transition-all pr-10" required />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="mt-1" required />
              <label htmlFor="terms" className="text-xs text-slate-400">
                I agree to the{' '}
                <a href="/terms-of-service" className="text-cyan-400">Terms of Service</a>{' '}and{' '}
                <a href="/privacy-policy" className="text-cyan-400">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeTerms || !isValid}
              className="w-full py-3 rounded-xl font-black text-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#00d4ff,#00b8e0)', boxShadow: '0 4px 24px rgba(0,212,255,0.35)' }}
            >
              {loading ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center text-slate-500 text-xs">
            Already have an account?{' '}
            <button onClick={() => navigate('/app/login')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Sign in →
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5 text-slate-600 text-xs">
          <Lock size={10} />
          <span>AES-256 Encrypted · No-Logs Policy</span>
        </div>
      </div>
    </div>
  );
}