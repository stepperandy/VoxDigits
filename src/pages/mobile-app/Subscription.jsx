import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Shield, Globe, FileDown } from 'lucide-react';

/**
 * Subscription (iOS companion) — informational page clarifying that the
 * iOS companion is free, has no in-app purchases, and requires the external
 * OpenVPN Connect app to establish VPN connections.
 */
export default function Subscription() {
  const navigate = useNavigate();

  const points = [
    'Free companion app — no in-app purchases or subscriptions',
    'Manage your VoxVPN account and server configurations',
    'Download OpenVPN (.ovpn) configuration files for your servers',
    'VPN connection is established by the separate OpenVPN Connect app',
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={bg}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-10" style={{ background: 'radial-gradient(ellipse, #00d4ff 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="px-5 pt-14 pb-4 flex items-center gap-3 z-10 relative">
        <button onClick={() => navigate('/app/servers')} aria-label="Back to servers"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-black text-xl leading-none">VoxVPN for iOS</h1>
          <p className="text-slate-500 text-xs mt-0.5">Free companion app</p>
        </div>
      </div>

      <main className="flex-1 px-5 pb-8 flex flex-col gap-4 z-10 relative">
        <section className="rounded-3xl p-5" style={{ background: 'rgba(13,17,32,0.85)', border: '1px solid rgba(0,212,255,0.35)', boxShadow: '0 0 40px rgba(0,212,255,0.14)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-cyan-400/10 border border-cyan-400/30">
              <Shield size={21} className="text-cyan-300" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Included with iOS</h2>
              <p className="text-cyan-300 text-xs font-semibold">No purchase required</p>
            </div>
          </div>

          <ul className="space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-slate-300">
                <Check size={16} className="text-cyan-300 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-3xl p-4" style={{ background: 'rgba(13,17,32,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start gap-3">
            <FileDown size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-400 text-[12px] leading-relaxed">
              VoxVPN does not establish a VPN connection, encrypt traffic, or use a
              native device tunnel. To connect, import an .ovpn configuration into the
              OpenVPN Connect app installed on your device.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield, label: 'No Logs', color: 'text-cyan-400' },
            { icon: Globe, label: 'Global', color: 'text-violet-400' },
            { icon: FileDown, label: '.ovpn Files', color: 'text-amber-400' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <Icon size={18} className={color} />
              <span className="text-white text-xs font-bold">{label}</span>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/app/servers')}
          className="w-full py-4 font-black rounded-2xl text-sm text-slate-950 bg-cyan-400"
          style={{ boxShadow: '0 8px 32px rgba(0,212,255,0.35)' }}>
          Continue to OpenVPN Configurations
        </button>
      </main>
    </div>
  );
}

const bg = {
  background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #060a14 60%, #030609 100%)',
};