import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Shield, WifiOff, Loader2, LogOut, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { SERVER_CONFIG_MAP } from '@/lib/vpnNativePlugin';

export default function ServerList() {
  const navigate = useNavigate();
  const email = localStorage.getItem('vpn_email') || '';

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState(SERVER_CONFIG_MAP[5]); // London default
  const [showServerList, setShowServerList] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Timer while connected
  useEffect(() => {
    if (connected) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [connected]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const handleToggleConnect = async () => {
    if (connecting) return;
    if (connected) {
      setConnected(false);
      return;
    }
    setConnecting(true);
    // Simulate connection delay (OpenVPN not integrated yet)
    await new Promise(r => setTimeout(r, 2000));
    setConnecting(false);
    setConnected(true);
  };

  const handleSelectServer = (server) => {
    if (connected) {
      setConnected(false);
      setElapsed(0);
    }
    setSelectedServer(server);
    setShowServerList(false);
  };

  const handleLogout = () => {
    setConnected(false);
    localStorage.removeItem('vpn_token');
    localStorage.removeItem('vpn_email');
    navigate('/app/login');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={bg}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${connected ? 'rgba(0,255,150,0.12)' : 'rgba(0,180,255,0.1)'} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }} />
      </div>

      {/* Header */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
            alt="VoxVPN"
            className="h-10 w-auto"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.5))' }}
          />
          <div>
            <p className="text-white font-black text-base leading-none">VoxVPN</p>
            <p className="text-slate-600 text-[10px] mt-0.5 truncate max-w-[160px]">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-white transition-colors text-xs font-semibold"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <LogOut size={13} /> Log Out
        </button>
      </div>

      {/* Connection Orb */}
      <div className="flex flex-col items-center pt-6 pb-4 z-10 relative">
        <div className="relative flex items-center justify-center" style={{ width: 170, height: 170 }}>
          {/* Ping rings when connected */}
          {connected && (
            <>
              <div className="absolute w-full h-full rounded-full animate-ping opacity-10" style={{ background: 'rgba(0,255,150,0.4)', animationDuration: '2.2s' }} />
              <div className="absolute w-[80%] h-[80%] rounded-full animate-ping opacity-15" style={{ background: 'rgba(0,212,255,0.4)', animationDuration: '2.2s', animationDelay: '0.6s' }} />
            </>
          )}
          {/* Spinner when connecting */}
          {connecting && (
            <div className="absolute w-full h-full rounded-full animate-spin" style={{ border: '2px solid transparent', borderTopColor: '#00d4ff', borderRightColor: '#00d4ff' }} />
          )}
          {/* Orb */}
          <button
            onClick={handleToggleConnect}
            disabled={connecting}
            className="w-[88%] h-[88%] rounded-full flex flex-col items-center justify-center gap-2 relative z-10 active:scale-95 transition-all duration-200"
            style={{
              background: connected
                ? 'linear-gradient(135deg, rgba(0,255,150,0.15), rgba(0,180,255,0.12))'
                : 'rgba(255,255,255,0.04)',
              border: `2px solid ${connected ? 'rgba(0,255,150,0.5)' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: connected
                ? '0 0 60px rgba(0,255,150,0.25), 0 0 30px rgba(0,212,255,0.15), inset 0 0 30px rgba(0,255,150,0.05)'
                : '0 0 20px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {connecting
              ? <Loader2 size={30} className="text-cyan-400 animate-spin" />
              : connected
                ? <Shield size={34} style={{ color: '#00ff96', filter: 'drop-shadow(0 0 10px rgba(0,255,150,0.8))' }} />
                : <WifiOff size={30} className="text-slate-500" />
            }
            <span
              className="font-black text-[11px] uppercase tracking-widest"
              style={{ color: connected ? '#00ff96' : '#64748b', textShadow: connected ? '0 0 12px rgba(0,255,150,0.8)' : 'none' }}
            >
              {connecting ? 'Connecting…' : connected ? 'Protected' : 'Tap to Connect'}
            </span>
          </button>
        </div>

        {/* Status line */}
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: connected ? '#00ff96' : '#334155',
              boxShadow: connected ? '0 0 8px #00ff96' : 'none',
            }}
          />
          <span className="font-bold text-sm" style={{ color: connected ? '#00ff96' : '#64748b' }}>
            {connecting ? 'Establishing secure tunnel…' : connected ? `Connected · ${formatTime(elapsed)}` : 'Not protected'}
          </span>
        </div>
      </div>

      {/* Selected Server Card + server picker */}
      <div className="px-5 z-10 relative mb-4">
        <button
          onClick={() => setShowServerList(v => !v)}
          className="w-full p-4 rounded-2xl flex items-center gap-3 transition-all active:scale-[0.98]"
          style={{
            background: 'rgba(13,17,32,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <span className="text-2xl leading-none">{selectedServer.flag}</span>
          <div className="flex-1 text-left">
            <p className="text-white font-bold text-sm leading-none">{selectedServer.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{selectedServer.country}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 4px #10b981' }} />
            <span className="text-slate-500 text-xs">Online</span>
            {showServerList ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </div>
        </button>

        {/* Server dropdown */}
        {showServerList && (
          <div
            className="mt-2 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(10,14,26,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              maxHeight: '280px',
              overflowY: 'auto',
            }}
          >
            {SERVER_CONFIG_MAP.map((server) => {
              const isSelected = selectedServer.config === server.config && selectedServer.name === server.name;
              return (
                <button
                  key={server.name}
                  onClick={() => handleSelectServer(server)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                  style={{
                    background: isSelected ? 'rgba(0,212,255,0.07)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span className="text-lg leading-none w-7">{server.flag}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: isSelected ? '#00d4ff' : '#e2e8f0' }}>{server.name}</p>
                    <p className="text-[11px] text-slate-600">{server.country}</p>
                  </div>
                  {isSelected && <Check size={14} className="text-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Connect / Disconnect Button */}
      <div className="px-5 z-10 relative mb-6">
        <button
          onClick={handleToggleConnect}
          disabled={connecting}
          className="w-full py-4 font-black text-base rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
          style={
            connected
              ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', boxShadow: '0 4px 20px rgba(239,68,68,0.1)' }
              : { background: 'linear-gradient(135deg, #00d4ff, #00c47a)', boxShadow: '0 8px 28px rgba(0,212,255,0.3)', color: '#000' }
          }
        >
          {connecting
            ? <><Loader2 size={18} className="animate-spin" /> Connecting…</>
            : connected
              ? <><WifiOff size={18} /> Disconnect</>
              : <><Shield size={18} /> Connect Now</>
          }
        </button>
      </div>

      {/* Stats row when connected */}
      {connected && (
        <div className="px-5 z-10 relative mb-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Status', value: 'Secure', color: '#00ff96' },
              { label: 'Protocol', value: 'OpenVPN', color: '#00d4ff' },
              { label: 'Time', value: formatTime(elapsed), color: '#a78bfa' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="font-black text-sm" style={{ color }}>{value}</span>
                <span className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom spacer */}
      <div className="flex-1" />
      <p className="text-center text-slate-700 text-[10px] pb-8 z-10 relative">VoxVPN · Military-grade privacy</p>
    </div>
  );
}

const bg = {
  background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #060a14 55%, #030609 100%)',
};