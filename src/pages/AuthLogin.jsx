import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock } from 'lucide-react';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { Link, useNavigate } from 'react-router-dom';

export default function AuthLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('authLogin', { email, password });
      const data = response?.data || response;

      if (!data?.success || !data?.subscription) {
        setError(data?.message || 'Access denied. No active subscription found.');
        return;
      }
      const subStatus = data.subscription.status;
      if (subStatus !== 'active' && subStatus !== 'trial') {
        setError('Your subscription is not active. Please choose a plan to access VoxVPN.');
        return;
      }
      await base44.auth.loginViaEmailPassword(email, password);
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get('next') || params.get('from_url') || '/dashboard';
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
            <span className="px-2 bg-[#0d1120] text-slate-400">or sign in with email</span>
          </div>
        </div>

        {/* Email Login Form */}
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
        </form>

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