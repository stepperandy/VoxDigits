import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight,
  Building2, Zap, Users, Bug, KeyRound, CheckCircle2, User, Phone,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ChinaAccessNotice from '@/components/auth/ChinaAccessNotice';
import { LanguageContext } from '@/lib/LanguageContext';

const LOGO_URL = 'https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/9d3567c74_image.png';

const TEAM_SIZES = [
  { value: '5', label: '1–5 employees' },
  { value: '10', label: '6–10 employees' },
  { value: '25', label: '11–25 employees' },
  { value: '50', label: '26–50 employees' },
  { value: '100', label: '51–100 employees' },
  { value: '250', label: '100+ employees' },
];

const FEATURES = [
  { icon: Shield, title: 'VPN for Every Device', desc: 'Military-grade encryption across Windows, macOS, Android & iOS' },
  { icon: Bug, title: 'Vox Antivirus Built-in', desc: 'Real-time malware scanning embedded in the desktop installer' },
  { icon: Eye, title: 'DNS Threat Filtering', desc: 'Block malware, phishing & custom domains at the network level' },
  { icon: Users, title: 'Team Management', desc: 'Invite members, manage devices & enforce security policies' },
];

export default function BusinessLogin() {
  const { language } = useContext(LanguageContext);
  const isZh = language === 'zh';
  const skipOtp = language === 'zh';

  // One form serves both actions — toggle flips the behaviour
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [teamSize, setTeamSize] = useState('10');
  const [contactPhone, setContactPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP verification (signup, non-Chinese users only)
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Magic-link (passwordless) login
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const goToDashboard = (next) => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get('next') || next || '/business/dashboard';
  };

  // ---- LOGIN ----
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('authLogin', { email, password });
      const data = response?.data || response;
      if (!data?.success) {
        setError(data?.message || 'Invalid email or password.');
        return;
      }
      const role = data.user?.role;
      if (!['client_admin', 'agency_admin', 'super_admin', 'admin'].includes(role)) {
        setError('This login is for business accounts. Please use the standard login page.');
        return;
      }
      await base44.auth.loginViaEmailPassword(email, password);
      goToDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setError('');
    if (!email || !email.includes('@')) {
      setError('Enter your work email first.');
      return;
    }
    setMagicLoading(true);
    localStorage.setItem('voxvpn_magic_email', email.trim());
    try {
      await base44.functions.invoke('sendMagicLink', { email: email.trim() });
      setMagicSent(true);
    } catch (err) {
      setError(err?.message || 'Could not send login link. Please try again.');
    } finally {
      setMagicLoading(false);
    }
  };

  // ---- SIGNUP ----
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await base44.functions.invoke('businessSignup', {
        company_name: companyName, full_name: fullName, email, password,
        team_size: teamSize, contact_phone: contactPhone, plan: 'standard',
      });
      if (res.data?.error) throw new Error(res.data.error);

      if (skipOtp) {
        await base44.auth.loginViaEmailPassword(email, password);
        goToDashboard();
        return;
      }
      setNeedsVerification(true);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      await base44.auth.verifyOtp({ email, otpCode: otpCode.trim() });
      await base44.auth.loginViaEmailPassword(email, password);
      goToDashboard();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Verification failed. Check your code and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    try { await base44.auth.resendOtp(email); } catch { /* ignore */ }
  };

  const switchMode = (signup) => {
    setIsSignup(signup);
    setError('');
    setNeedsVerification(false);
    setMagicSent(false);
  };

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <img src={LOGO_URL} alt="VoxVPN Business Shield" className="w-40 h-auto mx-auto mb-4" />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold mb-4">
              <Building2 size={12} /> VoxShield Business
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              {isSignup ? 'Secure Your Entire Team' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {isSignup
                ? 'VPN + Antivirus + DNS filtering for businesses. One dashboard, one login, total control.'
                : 'Sign in to your business dashboard — or create a new account below.'}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">

            {/* Left: Features */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-white font-bold text-xl mb-6">Everything your team needs</h2>
              {FEATURES.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-[#0d1420]">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <f.icon size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}

              <div className="p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 mt-6">
                <div className="flex items-center gap-2 text-violet-400 font-bold text-sm mb-2">
                  <Lock size={14} /> One Login Everywhere
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The same credentials work on the web dashboard, desktop app, and mobile.
                  Team members use their email &amp; password — no separate accounts.
                </p>
              </div>
            </motion.div>

            {/* Right: Unified form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#0d1420] to-[#060c1a] p-8"
              style={{ boxShadow: '0 0 60px rgba(0,212,255,0.06)' }}>

              {/* Mode toggle */}
              <div className="flex p-1 mb-6 rounded-xl bg-[#060910] border border-white/10">
                <button onClick={() => switchMode(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isSignup ? 'bg-cyan-400 text-black' : 'text-slate-400 hover:text-white'}`}>
                  Sign In
                </button>
                <button onClick={() => switchMode(true)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isSignup ? 'bg-cyan-400 text-black' : 'text-slate-400 hover:text-white'}`}>
                  Create Account
                </button>
              </div>

              <h2 className="text-white font-black text-2xl mb-1">
                {isSignup ? 'Create Business Account' : 'Sign In to Dashboard'}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                {isSignup ? 'Start your 14-day trial — no credit card required.' : 'Use your work email and password.'}
              </p>

              <div className="mb-4">
                <ChinaAccessNotice />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* OTP verification (signup only) */}
              {isSignup && needsVerification ? (
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="mb-2 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-3">
                    <KeyRound size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-bold text-sm mb-1">Verify your email</p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        We sent a 6-digit code to <span className="text-white font-semibold">{email}</span>.
                        Enter it below to activate your account.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Verification Code *</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required inputMode="numeric" maxLength={6} placeholder="Enter 6-digit code"
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm tracking-[0.3em] font-mono focus:outline-none focus:border-cyan-500/50 transition-colors text-center" />
                    </div>
                  </div>

                  <button type="submit" disabled={verifying || otpCode.length !== 6}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-base text-black transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #00b8e6)', boxShadow: '0 8px 30px rgba(0,212,255,0.3)' }}>
                    {verifying ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                    {verifying ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Didn't receive it?</span>
                    <button type="button" onClick={handleResendCode} className="text-cyan-400 hover:text-cyan-300 font-semibold">
                      Resend code
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
                  {isSignup && (
                    <>
                      <div>
                        <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Company Name *</label>
                        <div className="relative">
                          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                          <input value={companyName} onChange={e => setCompanyName(e.target.value)} required
                            placeholder="Acme Corporation"
                            className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Your Full Name *</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                          <input value={fullName} onChange={e => setFullName(e.target.value)} required
                            placeholder="John Doe"
                            className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Work Email *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="john@acme.com"
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Password *</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                        placeholder={isSignup ? 'Min 8 chars, upper + lower + number' : '••••••••'}
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {isSignup && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Team Size</label>
                        <select value={teamSize} onChange={e => setTeamSize(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                          {TEAM_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Phone (optional)</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                          <input value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                            placeholder="+1 555 0100"
                            className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isSignup && (
                    <div className="flex justify-end">
                      <Link to="/reset-password" className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-base text-black transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #00b8e6)', boxShadow: '0 8px 30px rgba(0,212,255,0.3)' }}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : (isSignup ? <Shield size={20} /> : <Shield size={20} />)}
                    {loading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? 'Create Business Account' : 'Sign In to Dashboard')}
                    {!loading && <ArrowRight size={18} />}
                  </button>

                  {/* Magic link — login only */}
                  {!isSignup && (
                    magicSent ? (
                      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                        <Mail size={24} className="text-cyan-400 mx-auto mb-2" />
                        <p className="text-white font-semibold text-sm mb-1">Check your inbox</p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          We sent a login link to <span className="text-white font-semibold">{email}</span>.
                          Open the email, click the link, then press <span className="text-cyan-400 font-semibold">⚡ Instant Login</span>.
                        </p>
                      </div>
                    ) : (
                      <button type="button" onClick={handleMagicLink} disabled={magicLoading || !email}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-all disabled:opacity-50">
                        {magicLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                        {magicLoading ? 'Sending…' : (isZh ? '发送登录链接（无需密码）' : 'Send me a login link instead')}
                      </button>
                    )
                  )}
                </form>
              )}

              <div className="flex items-center justify-center gap-2 mt-6 text-slate-600 text-xs">
                <Lock size={12} className="text-cyan-400" />
                <span>AES-256 Encrypted · No-Logs Policy</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}