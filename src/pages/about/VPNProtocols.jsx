import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Zap, Shield, Lock, Globe } from 'lucide-react';

export default function VPNProtocols() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium"><Shield size={12} /> VPN Protocols</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">VPN <span className="text-cyan-400">Protocols</span> Explained</h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">VPN protocols determine how your data is transmitted between your device and the VPN server. VoxVPN supports the best protocols available — giving you a choice between maximum speed and maximum security.</p>
        <div className="space-y-5 mb-12">
          {[
            { name: 'WireGuard', badge: 'Recommended', desc: 'The newest and fastest VPN protocol. Lean codebase of just 4,000 lines makes it auditable and blazing fast. Best for everyday use.', pros: ['Fastest speeds','Modern cryptography','Easy to audit','Low battery usage'] },
            { name: 'OpenVPN', badge: 'Most Trusted', desc: 'The gold standard in VPN protocols. Open-source, battle-tested and highly configurable. Available over TCP and UDP.', pros: ['Highly secure','Open source','Widely supported','Configurable'] },
            { name: 'IKEv2/IPSec', badge: 'Best for Mobile', desc: 'Excellent protocol for mobile devices. Reconnects quickly when switching between WiFi and cellular networks.', pros: ['Fast reconnection','Mobile optimized','Stable','Secure'] },
          ].map(({ name, badge, desc, pros }) => (
            <div key={name} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-white font-bold text-lg">{name}</h3>
                <span className="text-xs px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-semibold">{badge}</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">{desc}</p>
              <div className="flex flex-wrap gap-2">
                {pros.map(p => <span key={p} className="text-xs px-2.5 py-1 bg-white/5 text-slate-300 rounded-full">{p}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Get the Best VPN Protocols</h2>
          <a href="/#pricing" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Get VoxVPN Now</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}