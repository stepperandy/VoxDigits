import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Globe, Zap } from "lucide-react";
import { safeReturnTo } from "@/lib/authReturnTo";
import NetworkCanvas from "@/components/auth/NetworkCanvas";

const LOGO = "https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/13431de73_VoxICON.png";
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80";

const providers = [
  { id: "google", label: "Google", logo: "https://img.icons8.com/color/48/000000/google-logo.png" },
  { id: "microsoft", label: "Microsoft", logo: "https://img.icons8.com/color/48/000000/microsoft.png" },
  { id: "facebook", label: "Facebook", logo: "https://img.icons8.com/color/48/000000/facebook-new.png" },
  { id: "apple", label: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Post-login destination (e.g. the MCP OAuth consent page sends users here
  // with returnTo so the grant flow can resume). Same-origin paths only.
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleProvider = (id) => {
    base44.auth.loginWithProvider(id, returnTo);
  };

  return (
    <div className="auth-light min-h-screen grid lg:grid-cols-2" style={{ background: "#f2f8fc" }}>
      {/* Brand panel with real photography */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Global secure network"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(3,12,28,0.72) 0%, rgba(3,12,28,0.88) 100%)" }}
        />
        <NetworkCanvas />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={LOGO} alt="VoxVPN" className="w-11 h-11 rounded-xl" />
            <span className="text-white text-xl font-bold tracking-tight">VoxVPN</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Your privacy,<br />protected everywhere.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Join thousands of people and teams who trust VoxVPN to encrypt their
            connection on every device, in every country.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm text-white">
              <img src={LOGO} alt="" className="w-6 h-6 rounded-md" />
              Military-grade AES-256 encryption
            </li>
            <li className="flex items-center gap-3 text-sm text-white">
              <ShieldCheck size={18} className="text-cyan-400 shrink-0" />
              Strict no-logs policy, independently audited
            </li>
            <li className="flex items-center gap-3 text-sm text-white">
              <Globe size={18} className="text-cyan-400 shrink-0" />
              65+ countries with ultra-fast servers
            </li>
            <li className="flex items-center gap-3 text-sm text-white">
              <Zap size={18} className="text-cyan-400 shrink-0" />
              One account, all your devices
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-slate-400 text-xs">© 2026 VoxVPN. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo (real logo image) */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <img src={LOGO} alt="VoxVPN" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold tracking-tight text-gray-900">VoxVPN</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <img src={LOGO} alt="VoxVPN" className="w-12 h-12 rounded-2xl mx-auto mb-5" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1 mb-7 text-center">Log in to your account</p>

            {/* Social sign-in with real brand logos */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {providers.map((p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  className="h-11 rounded-xl text-sm font-medium gap-2 text-gray-800 hover:border-gray-400 hover:bg-gray-50"
                  onClick={() => handleProvider(p.id)}
                >
                  <img src={p.logo} alt={p.label} className="w-5 h-5" />
                  {p.label}
                </Button>
              ))}
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-semibold">or</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl text-gray-900"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-900 font-semibold">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-cyan-700 font-medium hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl text-gray-900"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-medium text-base text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-lg shadow-cyan-600/30 border-0"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link
              to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
              className="text-cyan-700 font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}