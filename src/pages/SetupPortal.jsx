import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Monitor, Terminal, Smartphone, Loader2, Shield, Wifi, Globe } from 'lucide-react';

const PLATFORMS = [
  { id: 'windows', label: 'Windows',       icon: Monitor,    color: 'text-blue-400',    desc: 'Windows 10 / 11' },
  { id: 'macos',   label: 'macOS',          icon: Monitor,    color: 'text-slate-300',   desc: 'macOS 12+' },
  { id: 'linux',   label: 'Linux',          icon: Terminal,   color: 'text-orange-400',  desc: 'Ubuntu / Debian / Arch' },
  { id: 'android', label: 'Android',        icon: Smartphone, color: 'text-emerald-400', desc: 'Android 7+' },
  { id: 'ios',     label: 'iPhone / iPad',  icon: Smartphone, color: 'text-cyan-400',    desc: 'iOS 14+' },
  { id: 'router',  label: 'Router',         icon: Wifi,       color: 'text-violet-400',  desc: 'OpenWrt / DD-WRT' },
];

export default function SetupPortal() {
  const [status, setStatus] = useState('loading');
  const [welcomeText, setWelcomeText] = useState('Loading your secure setup details.');
  const [tokenInput, setTokenInput] = useState('');
  const [token, setToken] = useState('');
  const [liveMode, setLiveMode] = useState(false);
  const [serverCount, setServerCount] = useState(0);
  const [servers, setServers] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');

  const loadPortal = async (tok) => {
    setStatus('loading');
    if (!tok) {
      setWelcomeText('No token detected. Showing demo portal.');
      setServerCount(6);
      setServers([
        { name: 'New York', country: 'US' }, { name: 'London', country: 'UK' },
        { name: 'Frankfurt', country: 'DE' }, { name: 'Singapore', country: 'SG' },
        { name: 'Tokyo', country: 'JP' }, { name: 'Amsterdam', country: 'NL' },
      ]);
      setLiveMode(false);
      setStatus('demo');
      return;
    }
    setToken(tok);
    setTokenInput(tok);
    try {
      const res = await base44.functions.invoke('setupPortal', { token: tok });
      const data = res.data;
      setWelcomeText(`Setup ready · ${data.email} · Plan: ${data.plan}`);
      setServerCount(data.serverCount || 0);
      setServers(data.servers || []);
      setLiveMode(true);
      setStatus('ok');
    } catch {
      setWelcomeText('Unable to load live data. Showing demo portal.');
      setServerCount(6);
      setServers([
        { name: 'New York', country: 'US' }, { name: 'London', country: 'UK' },
        { name: 'Frankfurt', country: 'DE' }, { name: 'Singapore', country: 'SG' },
      ]);
      setLiveMode(false);
      setStatus('demo');
    }
  };

  useEffect(() => { loadPortal(urlToken); }, []);

  const handleDownload = async (proto) => {
    if (!liveMode) { alert('Please load your setup with a valid token first.'); return; }
    if (!selectedPlatform) { alert('Please select your device platform.'); return; }

    setDownloading(proto);
    try {
      const res = await base44.functions.invoke('setupPortal', {
        token,
        platform: selectedPlatform,
        proto,
      });
      const { url, fileName } = res.data;
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

  const reloadWithToken = () => {
    if (!tokenInput.trim()) return;
    const next = new URL(window.location.href);
    next.searchParams.set('token', tokenInput.trim());
    window.location.href = next.toString();
  };

  return (
    <div className="min-h-screen text-[#f4f8fc]" style={{ background: 'linear-gradient(180deg,#081120,#0d1b2f)', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Hero */}
      <header className="px-4 sm:px-6 lg:px-8 pt-14 pb-8 border-b border-white/5"
        style={{ background: 'radial-gradient(circle at top right, rgba(79,209,255,.15), transparent 30%), radial-gradient(circle at top left, rgba(14,165,255,.18), transparent 24%)' }}>
        <div className="max-w-4xl mx-auto">
          <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-16 w-auto mb-5" />
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">VoxVPN Setup Portal</h1>
          <p className="text-[#a9b7c9] text-base max-w-2xl leading-relaxed">
            One download. All {serverCount > 0 ? serverCount : ''} servers included. Switch locations freely inside your VPN app — just like ExpressVPN.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8 pb-20 max-w-4xl mx-auto space-y-6">

        {/* Token / Status */}
        <div className="rounded-[20px] border border-[#223654] p-6 space-y-4"
          style={{ background: 'linear-gradient(180deg,#101d31,#13243d)', boxShadow: '0 20px 50px rgba(0,0,0,.35)' }}>
          <div>
            <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-3 ${
              status === 'ok' ? 'bg-[#123824] border border-[#38c172] text-[#bbf7d0]'
              : status === 'loading' ? 'bg-[#17263d] border border-[#324e74] text-[#c7d7ea]'
              : 'bg-[#4f3b12] border border-[#f6c453] text-[#fde68a]'
            }`}>
              {status === 'loading' && <Loader2 size={11} className="inline animate-spin mr-1" />}
              {status === 'ok' ? '✓ Setup loaded' : status === 'loading' ? 'Loading…' : 'Demo mode'}
            </span>
            <p className="text-[#a9b7c9] text-sm">{welcomeText}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Paste your secure VoxVPN access token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && reloadWithToken()}
              className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-[#223654] bg-[#091423] text-white placeholder-[#4a5e75] text-sm focus:outline-none focus:border-[#0ea5ff]"
            />
            <button onClick={reloadWithToken}
              className="px-5 py-3 bg-[#0b1627] text-[#4fd1ff] border border-[#28425f] text-sm font-bold rounded-xl hover:bg-[#0d1e38] transition-all">
              Load Setup
            </button>
          </div>
        </div>

        {status === 'loading' ? (
          <div className="flex items-center justify-center py-24 gap-2 text-[#a9b7c9]">
            <Loader2 size={20} className="animate-spin text-[#0ea5ff]" />
            <span className="text-sm">Loading VoxVPN setup…</span>
          </div>
        ) : (
          <>
            {/* Included servers badge */}
            {servers.length > 0 && (
              <div className="rounded-[16px] border border-[#223654] p-4 bg-[#0b1627]">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={15} className="text-[#4fd1ff]" />
                  <p className="text-white text-sm font-bold">{servers.length} Server Locations Included in Every Download</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {servers.map((s, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-[#0d1e38] border border-[#223654] text-[#4fd1ff] font-semibold">
                      {s.name}, {s.country}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1 — Pick Platform */}
            <div className="rounded-[18px] border border-[#223654] p-6"
              style={{ background: 'linear-gradient(180deg,#101d31,#13243d)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#0ea5ff] text-[#02111d] text-xs font-black flex items-center justify-center">1</span>
                <h2 className="text-white font-bold text-base m-0">Select Your Device</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PLATFORMS.map(p => {
                  const Icon = p.icon;
                  return (
                    <button key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`flex flex-col items-start gap-1.5 px-4 py-4 rounded-xl border text-left transition-all ${
                        selectedPlatform === p.id
                          ? 'border-[#0ea5ff] bg-[#0ea5ff]/10'
                          : 'border-[#223654] bg-[#0b1627] hover:border-[#324e74]'
                      }`}>
                      <Icon size={20} className={p.color} />
                      <p className="text-white text-sm font-bold">{p.label}</p>
                      <p className="text-[#a9b7c9] text-xs">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 — Download */}
            <div className="rounded-[18px] border border-[#223654] p-6"
              style={{ background: 'linear-gradient(180deg,#101d31,#13243d)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#0ea5ff] text-[#02111d] text-xs font-black flex items-center justify-center">2</span>
                <h2 className="text-white font-bold text-base m-0">Download VPN Config</h2>
              </div>

              {!selectedPlatform ? (
                <p className="text-[#4a5e75] text-sm">Select your device above first.</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-[#a9b7c9] text-sm">
                    Both files below include <strong className="text-white">all {serverCount || servers.length} server locations</strong>. Pick your preferred protocol:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* OpenVPN */}
                    <div className="rounded-[14px] border border-[#223654] p-5 bg-[#0b1627] space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-[#4fd1ff]" />
                        <p className="text-white font-bold text-sm">OpenVPN</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/20">Recommended</span>
                      </div>
                      <p className="text-[#a9b7c9] text-xs leading-relaxed">
                        One <code className="text-[#4fd1ff]">.ovpn</code> file with all servers. Import into <strong className="text-white">OpenVPN Connect</strong> (free) — switch servers from the app's server list.
                      </p>
                      <button onClick={() => handleDownload('openvpn')} disabled={!!downloading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-[#02111d] disabled:opacity-50 transition-all"
                        style={{ background: 'linear-gradient(135deg,#0ea5ff,#4fd1ff)' }}>
                        {downloading === 'openvpn' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        Download .ovpn (All Servers)
                      </button>
                    </div>

                    {/* WireGuard */}
                    <div className="rounded-[14px] border border-[#223654] p-5 bg-[#0b1627] space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-violet-400" />
                        <p className="text-white font-bold text-sm">WireGuard</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-bold border border-violet-500/20">Fastest</span>
                      </div>
                      <p className="text-[#a9b7c9] text-xs leading-relaxed">
                        A setup script that installs one tunnel per server into <strong className="text-white">WireGuard</strong> (free). Each server appears as a separate tunnel — activate any one instantly.
                      </p>
                      <button onClick={() => handleDownload('wireguard')} disabled={!!downloading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-violet-300 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 disabled:opacity-50 transition-all">
                        {downloading === 'wireguard' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        Download Setup Script
                      </button>
                    </div>
                  </div>

                  {/* Install instructions */}
                  <div className="rounded-[14px] border border-[#223654] p-4 bg-[#091423] space-y-2">
                    <p className="text-white text-xs font-bold">After Downloading:</p>
                    <ol className="text-[#a9b7c9] text-xs space-y-1 list-decimal list-inside">
                      <li><strong className="text-white">OpenVPN:</strong> Install <a href="https://openvpn.net/client/" target="_blank" rel="noreferrer" className="text-[#4fd1ff] underline">OpenVPN Connect</a> → Import the .ovpn file → Choose a server → Connect.</li>
                      <li><strong className="text-white">WireGuard:</strong> Install <a href="https://www.wireguard.com/install/" target="_blank" rel="noreferrer" className="text-[#4fd1ff] underline">WireGuard</a> → Run the setup script → Each server tunnel appears in the app → Click any to activate.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Support */}
        <div className="rounded-[14px] border border-[#234a69] p-4 bg-[#0d2638] text-center">
          <p className="text-[#4fd1ff] text-sm font-bold mb-1">Need help setting up?</p>
          <a href="mailto:support@voxdigits.com" className="text-[#a9b7c9] text-xs hover:text-[#4fd1ff] transition-colors">support@voxdigits.com</a>
        </div>
      </main>

      <footer className="text-center py-8 text-[#a9b7c9] text-sm border-t border-[#223654]">
        © 2026 VoxDigits Communications LLC · www.voxvpn.net
      </footer>
    </div>
  );
}