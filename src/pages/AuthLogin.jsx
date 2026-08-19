import { useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, Mail, Zap, ArrowLeft } from 'lucide-react';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import ChinaAccessNotice from '@/components/auth/ChinaAccessNotice';
import { LanguageContext } from '@/lib/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';

export default function AuthLogin() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const isZh = language === 'zh';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Magic-link (passwordless) login state — shown by default for Chinese users.
  const [magicMode, setMagicMode] = useState(isZh);
  const [magicEmail, setMagicEmail] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  // If an admin is already logged in, skip the login screen and go to the panel.
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let done = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!done && (me?.role === 'admin' || me?.role === 'super_admin')) {
          const params = new URLSearchParams(window.location.search);
          const next = params.get('next') || params.get('from_url');
          window.location.href = next || '/admin';
          return;
        }
      } catch {
        // not logged in — show the login form
      } finally {
        if (!done) setChecking(false);
      }
    })();
    return () => { done = true; };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#080c18] to-[#0d1120] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    if (!magicEmail || !magicEmail.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setMagicLoading(true);
    // Remember the email so the instant-login page can pre-fill it.
    localStorage.setItem('voxvpn_magic_email', magicEmail.trim());
    try {
      await base44.functions.invoke('sendMagicLink', { email: magicEmail.trim() });
      setMagicSent(true);
    } catch (err) {
      // The function always returns success; surface a generic error only on hard failure.
      setError(err?.message || 'Could not send login link. Please try again.');
    } finally {
      setMagicLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('authLogin', { email, password });
      const data = response?.data || response;

      if (!data?.success) {
        setError(data?.message || 'Access denied. No active subscription found.');
        return;
      }

      // Admins always get in — no active subscription required.
      const isAdmin = data.subscription?.plan === 'Admin' || data.user?.role === 'admin';

      if (!isAdmin) {
        if (!data?.subscription) {
          setError(data?.message || 'Access denied. No active subscription found.');
          return;
        }
        const subStatus = data.subscription.status;
        if (subStatus !== 'active' && subStatus !== 'trial') {
          setError('Your subscription is not active. Please choose a plan to access VoxVPN.');
          return;
        }
      }

      await base44.auth.loginViaEmailPassword(email, password);
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') || params.get('from_url');
      window.location.href = next || (isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message || 'Invalid email or password.';
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080c18] to-[#0d1120] text-white flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/13431de73_VoxICON.png"
            alt="VoxVPN"
            className="w-16 h-16 mx-auto mb-3"
          />
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your VoxVPN account</p>
        </div>

        {/* China access notice */}
        <div className="mb-5">
          <ChinaAccessNotice />
        </div>

        {/* Social Login */}
        <div className="mb-6">
          <SocialLoginButtons />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0d1120] text-slate-400">
              {magicMode ? 'sign in with a login link' : 'or sign in with email'}
            </span>
          </div>
        </div>

        {/* Magic Link Login (passwordless) */}
        {magicMode && !magicSent && (
          <form onSubmit={handleMagicLink} className="space-y-4 mb-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={magicLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {magicLoading ? 'Sending link…' : (<><Zap size={16} /> Send Login Link</>)}
            </Button>
            {isZh && (
              <p className="text-amber-400/70 text-[11px] text-center leading-relaxed">
                ⚡ 无需密码 — 我们会向您的邮箱发送一个登录链接，点击即可直接登录。
              </p>
            )}
            <button
              type="button"
              onClick={() => { setMagicMode(false); setError(''); }}
              className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} /> Use password instead
            </button>
          </form>
        )}

        {/* Magic Link — sent confirmation */}
        {magicMode && magicSent && (
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
              <Mail size={28} className="text-cyan-400 mx-auto mb-3" />
              <p className="text-white font-semibold text-sm mb-2">Check your inbox</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                We sent a secure login link to <span className="text-white font-semibold">{magicEmail}</span>.
                Open the email, click the link, then press{' '}
                <span className="text-cyan-400 font-semibold">⚡ Instant Login</span> — no password needed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setMagicSent(false); setError(''); }}
              className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} /> Use password instead
            </button>
          </div>
        )}

        {/* Email + Password Login Form */}
        {!magicMode && (
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/reset-password" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <button
            type="button"
            onClick={() => { setMagicMode(true); setError(''); }}
            className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Zap size={14} /> Send me a login link instead
          </button>
        </form>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Sign up
          </Link>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-slate-500 text-xs">
          <Lock size={12} className="text-cyan-400" />
          <span>AES-256 Encrypted · No-Logs Policy</span>
        </div>
      </div>
    </div>
  );
}