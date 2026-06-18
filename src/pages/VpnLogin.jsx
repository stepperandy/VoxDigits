import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Wifi, Lock, Zap, Globe, Server, Key, Cpu } from 'lucide-react';

const PARTICLES = [
  { icon: Shield,  top: '8%',  left: '5%',  size: 22, anim: 'float-1', blink: 'blink-1' },
  { icon: Wifi,    top: '15%', left: '88%', size: 18, anim: 'float-2', blink: 'blink-2' },
  { icon: Lock,    top: '72%', left: '7%',  size: 20, anim: 'float-3', blink: 'blink-1' },
  { icon: Zap,     top: '80%', left: '90%', size: 16, anim: 'float-1', blink: 'blink-3' },
  { icon: Globe,   top: '45%', left: '3%',  size: 24, anim: 'float-2', blink: 'blink-2' },
  { icon: Server,  top: '35%', left: '92%', size: 20, anim: 'float-3', blink: 'blink-1' },
  { icon: Key,     top: '60%', left: '85%', size: 17, anim: 'float-1', blink: 'blink-3' },
  { icon: Cpu,     top: '90%', left: '40%', size: 19, anim: 'float-2', blink: 'blink-2' },
  { icon: Shield,  top: '5%',  left: '55%', size: 16, anim: 'float-3', blink: 'blink-1' },
  { icon: Wifi,    top: '55%', left: '95%', size: 22, anim: 'float-1', blink: 'blink-3' },
  { icon: Lock,    top: '25%', left: '12%', size: 15, anim: 'float-2', blink: 'blink-2' },
  { icon: Globe,   top: '88%', left: '15%', size: 21, anim: 'float-3', blink: 'blink-1' },
];

export default function VpnLogin() {
  useEffect(() => {
    window.location.replace('/auth-login');
  }, []);

  return (
    <div className="min-h-screen bg-[#060c1a] text-white flex items-center justify-center relative overflow-hidden">

      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(8deg); }
          66% { transform: translateY(10px) rotate(-5deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          40% { transform: translateY(-22px) translateX(12px) rotate(-10deg); }
          70% { transform: translateY(8px) translateX(-8px) rotate(6deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-14px) rotate(12deg) scale(1.1); }
        }
        @keyframes blink-1 {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.7; }
        }
        @keyframes blink-2 {
          0%, 30%, 100% { opacity: 0.15; }
          60% { opacity: 0.6; }
        }
        @keyframes blink-3 {
          0%, 80%, 100% { opacity: 0.1; }
          20% { opacity: 0.8; }
          40% { opacity: 0.2; }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .float-1 { animation: float-1 7s ease-in-out infinite; }
        .float-2 { animation: float-2 9s ease-in-out infinite; }
        .float-3 { animation: float-3 6s ease-in-out infinite; }
        .blink-1 { animation: blink-1 3s ease-in-out infinite; }
        .blink-2 { animation: blink-2 4.5s ease-in-out infinite; }
        .blink-3 { animation: blink-3 2.5s ease-in-out infinite; }
        .scan-line {
          animation: scan-line 6s linear infinite;
          background: linear-gradient(180deg, transparent, rgba(0,212,255,0.04), transparent);
          height: 80px;
          width: 100%;
          position: absolute;
          left: 0;
          pointer-events: none;
          z-index: 1;
        }
        .pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
        .fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>

      {/* Cyber grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #060c1a 80%)' }}
      />

      {/* Scan line */}
      <div className="scan-line" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />

      {/* Flying tech particles */}
      {PARTICLES.map((p, i) => {
        const Icon = p.icon;
        return (
          <div key={i} className={`absolute pointer-events-none ${p.anim} ${p.blink}`}
            style={{ top: p.top, left: p.left }}>
            <Icon size={p.size} className="text-cyan-400" />
          </div>
        );
      })}

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6 fade-in-up">
        {/* Logo with pulse ring */}
        <div className="relative flex items-center justify-center">
          <div className="pulse-ring w-20 h-20 rounded-full border-2 border-cyan-400/40 absolute" />
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
            <Shield size={36} className="text-cyan-400" />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight">
            Vox<span className="text-cyan-400">VPN</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Securing your connection…</p>
        </div>

        {/* Spinner */}
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />

        {/* Trust line */}
        <p className="text-slate-600 text-xs flex items-center gap-1.5">
          <Lock size={10} /> AES-256 Encrypted · No-Logs Policy
        </p>
      </div>
    </div>
  );
}