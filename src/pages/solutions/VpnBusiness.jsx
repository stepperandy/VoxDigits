import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Users, Lock, Globe } from 'lucide-react';

export default function VpnBusiness() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">💼 VPN for Business</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">VoxVPN for <span className="text-cyan-400">Business</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">Protect your entire team with VoxVPN Business. Secure remote access, protect sensitive data on public WiFi and keep your company's communications private.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Users, title: 'Team Management', desc: 'Manage VPN accounts for your entire team from a central dashboard.' },
            { icon: Globe, title: 'Remote Access', desc: 'Secure remote access to internal company resources from anywhere.' },
            { icon: Shield, title: 'Data Protection', desc: 'Protect sensitive business data with military-grade encryption.' },
            { icon: Lock, title: 'Dedicated IP', desc: 'Business plans include dedicated IP addresses for whitelisting.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Icon size={22} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Protect Your Business</h2>
          <a href="/#pricing" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Contact Sales</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}