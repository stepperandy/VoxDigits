import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Eye, Lock, Globe } from 'lucide-react';

export default function IPv6LeakProtection() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium"><Shield size={12} /> IPv6 Leak Protection</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">VoxVPN <span className="text-cyan-400">IPv6 Leak Protection</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">Many VPNs only protect your IPv4 address, leaving your IPv6 address exposed. VoxVPN blocks all IPv6 traffic when connected, ensuring your real address is never revealed.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Eye, title: 'Full IPv6 Blocking', desc: 'All IPv6 traffic is blocked when VPN is active, eliminating leaks.' },
            { icon: Globe, title: 'Automatic Detection', desc: 'Automatically detects and handles IPv6 connections.' },
            { icon: Lock, title: 'Always On', desc: 'IPv6 leak protection is enabled by default, no manual setup required.' },
            { icon: Shield, title: 'Dual-Stack Support', desc: 'Handles both IPv4 and IPv6 networks seamlessly.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Icon size={22} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Get Complete Leak Protection</h2>
          <a href="/#pricing" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Get VoxVPN Now</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}