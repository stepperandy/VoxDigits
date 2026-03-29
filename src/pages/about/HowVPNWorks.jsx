import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Lock, Globe, Shield, Zap } from 'lucide-react';

export default function HowVPNWorks() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium"><Globe size={12} /> How VPN Works</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">How Does a <span className="text-cyan-400">VPN Work?</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">Understanding how a VPN works helps you make the most of your privacy tools. Here's a step-by-step breakdown of what happens when you connect to VoxVPN.</p>
        <div className="space-y-4 mb-12">
          {[
            { step: '01', title: 'You Connect to VoxVPN', desc: 'The VoxVPN app on your device establishes an encrypted tunnel to one of our secure servers worldwide.', icon: Lock },
            { step: '02', title: 'Your Traffic is Encrypted', desc: 'All data leaving your device is wrapped in AES-256 encryption before it even reaches your router or ISP.', icon: Shield },
            { step: '03', title: 'Traffic Routes via Our Server', desc: 'Your internet requests are forwarded from our VPN server, which has its own IP address — not yours.', icon: Globe },
            { step: '04', title: 'Websites See Our IP', desc: 'Websites and services see our VPN server\'s IP address, not your real location or identity.', icon: Zap },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="flex gap-5 p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 font-black text-sm">{step}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1 flex items-center gap-2"><Icon size={16} className="text-cyan-400" />{title}</h3>
                <p className="text-slate-400 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Experience VPN Protection</h2>
          <a href="/#pricing" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Get VoxVPN Now</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}