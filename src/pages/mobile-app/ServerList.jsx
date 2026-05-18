import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import {
  Shield, Settings, CreditCard, LogOut, ChevronRight,
  Wifi, WifiOff, Loader2, Zap, Upload, Download, Clock, Globe
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Simulated live stats — in a real app these'd come from the VPN client
function useVpnStats(connected) {
  const [stats, setStats] = useState({ ping: 0, upload: 0, download: 0, duration: 0 });
  const timerRef = useRef(null);

  useEffect(() => {
    if (connected) {
      timerRef.current = setInterval(() => {
        setStats(s => ({
          ping: Math.floor(Math.random() * 15) + 8,
          upload: +(Math.random() * 0.8 + 0.1).toFixed(1),
          download: +(Math.random() * 3 + 0.5).toFixed(1),
          duration: s.duration + 1,
        }));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setStats({ ping: 0, upload: 0, download: 0, duration: 0 });
    }
    return () => clearInterval(timerRef.current);
  }, [connected]);

  return stats;
}

function formatDuration(secs) {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function LoadBar({ value }) {
  const color = value < 50 ? '#10b981' : value < 80 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function ServerList() {
  const navigate = useNavigate();
  const email = localStorage.getItem('vpn_email') || '';
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const stats = useVpnStats(connected);

  useEffect(() => {
    base44.functions.invoke('getServers', {})
      .then(res => setServers(res.data?.servers || []))
      .catch(() => setServers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = (server) => {
    if (connected && selectedServer?.id === server.id) {
      setConnected(false);
      setSelectedServer(null);
      return;
    }
    setConnecting(true);
    setSelectedServer(server);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2000);
  };

  const handleQuickConnect = () => {
    const best = servers.find(s => s.status === 'online') || servers[0];
    if (best) handleConnect(best);
  };

  const handleLogout = () => {
    localStorage.removeItem('vpn_token');
    localStorage.removeItem('vpn_email');
    navigate('/app/login');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={bg}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-10 transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${connected ? '#00d4ff' : '#7c3aed'} 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Header */}
      <div className="px-5 pt-14 pb-3 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-9 w-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.5))' }} />
          <div>
            <p className="text-white font-black text-base leading-none">VoxVPN</p>
            {email && <p className="text-slate-600 text-[10px] mt-0.5">{email}</p>}
          </div>
        </div>
        <button onClick={handleLogout} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <LogOut size={16} />
        </button>
      </div>

      {/* Main connect button */}
      <div className="flex flex-col items-center py-6 z-10 relative">
        <button
          onClick={connected ? () => { setConnected(false); setSelectedServer(null); } : handleQuickConnect}
          disabled={connecting}
          className="relative flex items-center justify-center transition-all active:scale-95"
          style={{ width: 140, height: 140 }}
        >
          {/* Pulse rings when connected */}
          {connected && (
            <>
              <div className="absolute w-full h-full rounded-full animate-ping opacity-20" style={{ background: 'rgba(0,212,255,0.4)', animationDuration: '2s' }} />
              <div className="absolute w-[85%] h-[85%] rounded-full animate-ping opacity-25" style={{ background: 'rgba(0,212,255,0.3)', animationDuration: '2s', animationDelay: '0.5s' }} />
            </>
          )}
          {connecting && (
            <div className="absolute w-full h-full rounded-full animate-spin" style={{ border: '2px solid transparent', borderTopColor: '#00d4ff', borderRightColor: '#00d4ff' }} />
          )}
          {/* Button face */}
          <div className="w-[90%] h-[90%] rounded-full flex flex-col items-center justify-center gap-1 relative z-10"
            style={{
              background: connected
                ? 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,100,200,0.2))'
                : 'rgba(255,255,255,0.05)',
              border: `2px solid ${connected ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: connected ? '0 0 50px rgba(0,212,255,0.35), inset 0 0 30px rgba(0,212,255,0.08)' : '0 0 20px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {connecting ? (
              <Loader2 size={28} className="text-cyan-400 animate-spin" />
            ) : connected ? (
              <Shield size={32} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.8))' }} />
            ) : (
              <WifiOff size={28} className="text-slate-500" />
            )}
            <span className="text-xs font-black mt-0.5" style={{ color: connected ? '#00d4ff' : '#64748b', textShadow: connected ? '0 0 10px rgba(0,212,255,0.8)' : 'none' }}>
              {connecting ? 'CONNECTING' : connected ? 'PROTECTED' : 'TAP TO CONNECT'}
            </span>
          </div>
        </button>

        {/* Status text */}
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{
            background: connected ? '#00d4ff' : '#334155',
            boxShadow: connected ? '0 0 8px #00d4ff' : 'none',
            animation: connected ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }} />
          <span className="text-sm font-bold" style={{ color: connected ? '#00d4ff' : '#64748b' }}>
            {connecting ? 'Establishing secure tunnel…' : connected ? `Connected · ${selectedServer?.name || ''}` : 'Not protected'}
          </span>
        </div>
      </div>

      {/* Live Stats — only when connected */}
      {connected && (
        <div className="mx-5 mb-4 z-10 relative">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: <Zap size={12} className="text-yellow-400" />, label: 'PING', value: `${stats.ping}ms`, color: '#facc15' },
              { icon: <Clock size={12} className="text-cyan-400" />, label: 'TIME', value: formatDuration(stats.duration), color: '#00d4ff' },
              { icon: <Upload size={12} className="text-emerald-400" />, label: 'UP', value: `${stats.upload}MB/s`, color: '#10b981' },
              { icon: <Download size={12} className="text-violet-400" />, label: 'DOWN', value: `${stats.download}MB/s`, color: '#8b5cf6' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl" style={statCard}>
                {icon}
                <span className="text-xs font-black font-mono leading-none" style={{ color, fontSize: '10px' }}>{value}</span>
                <span className="text-[9px] text-slate-600 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Connect */}
      {!connected && !connecting && (
        <div className="mx-5 mb-4 z-10 relative">
          <button onClick={handleQuickConnect}
            className="w-full py-3 font-black text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all text-black"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #0066cc)', boxShadow: '0 6px 24px rgba(0,212,255,0.3)' }}>
            <Zap size={16} /> Quick Connect — Best Server
          </button>
        </div>
      )}

      {/* Server list */}
      <div className="px-5 flex-1 z-10 relative overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Globe size={11} /> Server Locations
          </p>
          {!loading && <p className="text-slate-600 text-[10px] font-mono">{servers.length} available</p>}
        </div>

        <div className="space-y-2 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="text-cyan-400 animate-spin" />
            </div>
          ) : (
            servers.map((server) => {
              const isActive = connected && selectedServer?.id === server.id;
              const load = server.load || Math.floor(Math.random() * 60 + 10);
              return (
                <button
                  key={server.id || server.name}
                  onClick={() => handleConnect(server)}
                  className="w-full p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                  style={{
                    background: isActive ? 'rgba(0,212,255,0.08)' : 'rgba(13,17,32,0.8)',
                    border: isActive ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
                    boxShadow: isActive ? '0 0 20px rgba(0,212,255,0.15)' : 'none',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isActive ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
                        border: isActive ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                      }}>
                      <Wifi size={16} style={{ color: isActive ? '#00d4ff' : server.status === 'online' ? '#10b981' : '#64748b' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm leading-none" style={{ color: isActive ? '#00d4ff' : '#f1f5f9', textShadow: isActive ? '0 0 10px rgba(0,212,255,0.5)' : 'none' }}>{server.name || server.city}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5 font-mono">{server.city}, {server.country}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: server.status === 'online' ? '#10b981' : '#64748b', boxShadow: server.status === 'online' ? '0 0 6px #10b981' : 'none' }} />
                        <span className="text-[10px] text-slate-600">{server.status || 'online'}</span>
                      </div>
                      {isActive && <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider">Active</span>}
                    </div>
                  </div>
                  <LoadBar value={load} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mx-5 mb-8 mt-2 z-10 relative" style={{ ...glassNav }}>
        <div className="flex items-center justify-around p-3">
          <NavBtn icon={<Shield size={20} />} label="Servers" active />
          <NavBtn icon={<CreditCard size={20} />} label="Plans" onClick={() => navigate('/app/subscription')} />
          <NavBtn icon={<Settings size={20} />} label="Settings" onClick={() => navigate('/app/settings')} />
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all"
      style={{ color: active ? '#00d4ff' : '#475569' }}>
      <span style={{ filter: active ? 'drop-shadow(0 0 6px rgba(0,212,255,0.8))' : 'none' }}>{icon}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

const bg = {
  background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #060a14 50%, #030609 100%)',
};

const statCard = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(10px)',
};

const glassNav = {
  background: 'rgba(13,17,32,0.85)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.05)',
};