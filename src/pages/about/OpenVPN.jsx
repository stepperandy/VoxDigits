import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Lock, Globe, Zap } from 'lucide-react';

export default function OpenVPN() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium"><Lock size={12} /> OpenVPN</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">VoxVPN with <span className="text-cyan-400">OpenVPN</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">OpenVPN is the most trusted, battle-tested VPN protocol in the world. Open-source, independently audited and used by security professionals and enterprises globally.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Shield, title: 'Open Source', desc: 'Completely open-source and publicly audited by the security community since 2001.' },
            { icon: Lock, title: 'AES-256 Encryption', desc: 'Uses industry-standard AES-256-GCM encryption for all connections.' },
            { icon: Globe, title: 'TCP & UDP Support', desc: 'Available over both TCP (reliable) and UDP (fast) depending on your needs.' },
            { icon: Zap, title: 'Universal Compatibility', desc: 'Supported on every major platform: Windows, macOS, Linux, iOS, Android.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Icon size={22} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Get OpenVPN with VoxVPN</h2>
          <a href="/#pricing" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Get VoxVPN Now</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}