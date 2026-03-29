import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Lock, Zap, Eye } from 'lucide-react';

export default function VpnTorrenting() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">⬇️ VPN for Torrenting</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">Best VPN for <span className="text-cyan-400">Torrenting</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">Torrent safely and privately with VoxVPN. Hide your IP from peers, bypass ISP throttling and protect yourself from copyright notices — with P2P-optimized servers.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Eye, title: 'Hide from Peers', desc: 'Your real IP is hidden from all other torrent peers in the swarm.' },
            { icon: Zap, title: 'No Throttling', desc: 'Bypass ISP speed throttling on P2P and torrent traffic.' },
            { icon: Shield, title: 'P2P Optimized Servers', desc: 'Dedicated P2P servers in torrent-friendly jurisdictions.' },
            { icon: Lock, title: 'No DMCA Notices', desc: 'Your ISP can\'t see your torrent activity, so no notices are sent.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Icon size={22} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Torrent Safely and Privately</h2>
          <a href="/#pricing" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Get VoxVPN Now</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}