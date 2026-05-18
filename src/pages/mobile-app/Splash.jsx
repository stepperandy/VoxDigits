import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('vpn_token');
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 40);
    const timer = setTimeout(() => {
      navigate(token ? '/app/servers' : '/app/login');
    }, 2400);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={bg}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)', filter: 'blur(60px)', animation: 'pulse 3s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(40px)' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Logo + rings */}
      <div className="relative flex flex-col items-center z-10">
        {/* Outer pulse rings */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-48 h-48 rounded-full border border-cyan-400/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-36 h-36 rounded-full border border-cyan-400/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
          <div className="absolute w-24 h-24 rounded-full border border-cyan-400/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
          {/* Glowing shield center */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)', boxShadow: '0 0 40px rgba(0,212,255,0.3), inset 0 0 40px rgba(0,212,255,0.05)' }}>
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
              alt="VoxVPN"
              className="w-14 h-auto"
              style={{ filter: 'drop-shadow(0 0 12px rgba(0,212,255,0.7))' }}
            />
          </div>
        </div>

        <h1 className="text-white font-black text-3xl tracking-tight mb-1" style={{ textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>VoxVPN</h1>
        <p className="text-cyan-400 text-xs font-semibold tracking-[0.3em] uppercase">Military-Grade Privacy</p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-20 w-48 z-10">
        <div className="h-0.5 bg-white/5 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all duration-75" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00d4ff, #7c3aed)', boxShadow: '0 0 10px rgba(0,212,255,0.8)' }} />
        </div>
        <p className="text-center text-slate-600 text-xs">Initializing secure tunnel…</p>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:0.35} }
      `}</style>
    </div>
  );
}

const bg = {
  background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #060a14 50%, #030609 100%)',
};