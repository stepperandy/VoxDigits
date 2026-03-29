import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Globe, Lock, Eye } from 'lucide-react';

export default function WhatIsVPN() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium"><Globe size={12} /> About VPN</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">What is a <span className="text-cyan-400">VPN?</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-8">A Virtual Private Network (VPN) is a secure, encrypted tunnel between your device and the internet. It hides your IP address, encrypts your traffic, and lets you browse privately and freely.</p>
        <div className="space-y-6 mb-12">
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2"><Lock size={18} className="text-cyan-400" /> How Does a VPN Work?</h2>
            <p className="text-slate-400 text-sm leading-relaxed">When you connect to a VPN, your device creates an encrypted tunnel to a VPN server. All your internet traffic flows through this tunnel, so websites see the VPN server's IP instead of yours. Your ISP can only see encrypted data — not what you're browsing.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2"><Eye size={18} className="text-cyan-400" /> Why Do You Need a VPN?</h2>
            <ul className="space-y-2 text-slate-400 text-sm">
              {['Protect your privacy from ISPs, advertisers and hackers','Secure your data on public WiFi','Access geo-restricted content and streaming services','Bypass internet censorship while traveling','Prevent bandwidth throttling by your ISP','Shop online safely without price discrimination'].map(item => (
                <li key={item} className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
            <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2"><Shield size={18} className="text-cyan-400" /> Is a VPN Legal?</h2>
            <p className="text-slate-400 text-sm leading-relaxed">VPNs are legal in most countries and widely used by individuals, businesses, and governments. Some countries with restrictive internet policies may regulate or ban VPN use. Always check your local laws when traveling.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Try VoxVPN Risk-Free</h2>
          <a href="/#pricing" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Get VoxVPN Now</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}