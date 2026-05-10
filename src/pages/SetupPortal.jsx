import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Monitor, Terminal, Smartphone, Loader2, Shield, Wifi, Globe, Lock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const PLATFORMS = [
  { id: 'windows', label: 'Windows',       icon: Monitor,    color: 'text-blue-400',    desc: 'Windows 10 / 11' },
  { id: 'macos',   label: 'macOS',          icon: Monitor,    color: 'text-slate-300',   desc: 'macOS 12+' },
  { id: 'linux',   label: 'Linux',          icon: Terminal,   color: 'text-orange-400',  desc: 'Ubuntu / Debian / Arch' },
  { id: 'android', label: 'Android',        icon: Smartphone, color: 'text-emerald-400', desc: 'Android 7+' },
  { id: 'ios',     label: 'iPhone / iPad',  icon: Smartphone, color: 'text-cyan-400',    desc: 'iOS 14+' },
  { id: 'router',  label: 'Router',         icon: Wifi,       color: 'text-violet-400',  desc: 'OpenWrt / DD-WRT' },
];

export default function SetupPortal() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ok | error | noSub
  const [serverCount, setServerCount] = useState(0);
  const [servers, setServers] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        if (!me) {
          setAuthChecked(true);
          setStatus('unauthenticated');
          return;
        }
        setUser(me);
        setAuthChecked(true);

        // Load server list from backend (validates subscription too)
        const res = await base44.functions.invoke('setupPortal', {});
        const data = res.data;

        if (data?.error) {
          if (data.error.includes('subscription')) {
            setStatus('noSub');
          } else {
            setErrorMsg(data.error);
            setStatus('error');
          }
          return;
        }

        setServerCount(data.serverCount || 0);
        setServers(data.servers || []);
        setStatus('ok');
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load setup portal.');
        setStatus('error');
      }
    };
    init();
  }, []);

  const handleDownload = async (proto) => {
    if (!selectedPlatform) { alert('Please select your device platform first.'); return; }

    setDownloading(proto);
    try {
      const res = await base44.functions.invoke('setupPortal', {
        platform: selectedPlatform,
        proto,
      });
      const data = res.data;

      if (data?.error) {
        alert('Download failed: ' + data.error);
        return;
      }

      const { url, fileName } = data;
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDownloading(null);
    }
  };

  // ── States ──────────────────────────────────────────────────────────────────

  if (!authChecked || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#060c1a] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#060c1a]">
        <Navbar />
        <div className="pt-40 pb-24 px-4 max-w-md mx-auto text-center space-y-6">
          <Lock size={48} className="text-slate-600 mx-auto" />
          <h1 className="text-3xl font-black text-white">Sign In Required</h1>
          <p className="text-slate-400">Please log in to access your VoxVPN setup files.</p>
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all">
            Log In to Continue
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === 'noSub') {
    return (
      <div className="min-h-screen bg-[#060c1a]">
        <Navbar />
        <div className="pt-40 pb-24 px-4 max-w-md mx-auto text-center space-y-6">
          <AlertCircle size={48} className="text-amber-400 mx-auto" />
          <h1 className="text-3xl font-black text-white">No Active Subscription</h1>
          <p className="text-slate-400">You need an active VoxVPN plan to download your config files.</p>
          <Link to="/pricing"
            className="block w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all">
            View Plans →
          </Link>
          <Link to="/dashboard" className="block text-slate-500 text-sm hover:text-white transition-colors">
            Go to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#060c1a]">
        <Navbar />
        <div className="pt-40 pb-24 px-4 max-w-md mx-auto text-center space-y-6">
          <AlertCircle size={48} className="text-rose-400 mx-auto" />
          <h1 className="text-3xl font-black text-white">Something went wrong</h1>
          <p className="text-slate-400">{errorMsg || 'Please try again or contact support.'}</p>
          <a href="mailto:support@voxdigits.com" className="block text-cyan-400 hover:underline">support@voxdigits.com</a>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Authenticated + Active subscription ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold mb-4">
            <Shield size={12} /> Setup Portal
          </div>
          <h1 className="text-4xl font-black text-white mb-2">VoxVPN Setup</h1>
          <p className="text-slate-400 text-sm">
            Welcome, <span className="text-white font-medium">{user?.full_name || user?.email}</span>. Download your personal VPN config below.
          </p>
        </div>

        {/* Server list badge */}
        {servers.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={14} className="text-cyan-400" />
              <p className="text-white text-sm font-bold">{serverCount} Server Locations Included</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {servers.map((s, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#0a1020] border border-white/5 text-cyan-400 font-semibold">
                  {s.name}, {s.country}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Select Platform */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-cyan-400 text-black text-xs font-black flex items-center justify-center">1</span>
            <h2 className="text-white font-bold text-base">Select Your Device</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PLATFORMS.map(p => {
              const Icon = p.icon;
              return (
                <button key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`flex flex-col items-start gap-1.5 px-4 py-4 rounded-xl border text-left transition-all ${
                    selectedPlatform === p.id
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-white/5 bg-[#0a1020] hover:border-white/10'
                  }`}>
                  <Icon size={20} className={p.color} />
                  <p className="text-white text-sm font-bold">{p.label}</p>
                  <p className="text-slate-500 text-xs">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Download */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-cyan-400 text-black text-xs font-black flex items-center justify-center">2</span>
            <h2 className="text-white font-bold text-base">Download Your Config</h2>
          </div>

          {!selectedPlatform ? (
            <p className="text-slate-500 text-sm">Select your device above first.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                Your VoxVPN config includes all <strong className="text-white">{serverCount || servers.length} server locations</strong>.
              </p>

              <div className="rounded-xl border border-cyan-500/20 bg-[#0a1020] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-cyan-400" />
                  <p className="text-white font-bold text-sm">VoxVPN Config File</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">All Servers Included</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Download your personal <code className="text-cyan-400">.ovpn</code> config file. Import it into the <strong className="text-white">VoxVPN app</strong> and log in with your VoxVPN email &amp; password to connect.
                </p>
                <button onClick={() => handleDownload('openvpn')} disabled={!!downloading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-black disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)' }}>
                  {downloading === 'openvpn' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Download VoxVPN Config
                </button>
              </div>

              {/* Instructions */}
              <div className="rounded-xl border border-white/5 bg-[#0a1020] p-4 space-y-2">
                <p className="text-white text-xs font-bold">How to Connect:</p>
                <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
                  <li>Download your VoxVPN config file above.</li>
                  <li>Install <a href="https://openvpn.net/client/" target="_blank" rel="noreferrer" className="text-cyan-400 underline">VoxVPN app</a> on your device (free).</li>
                  <li>Open the app → Import the config file.</li>
                  <li>Log in with your VoxVPN email &amp; password → Connect.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Support */}
        <div className="rounded-xl border border-white/5 bg-[#0d1420] p-4 text-center">
          <p className="text-slate-400 text-sm font-bold mb-1">Need help?</p>
          <a href="mailto:support@voxdigits.com" className="text-cyan-400 text-xs hover:underline">support@voxdigits.com</a>
          <span className="text-slate-600 text-xs mx-2">·</span>
          <Link to="/contact" className="text-cyan-400 text-xs hover:underline">Contact Support</Link>
        </div>

      </div>

      <Footer />
    </div>
  );
}