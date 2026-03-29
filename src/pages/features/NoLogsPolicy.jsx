import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Eye, Lock, FileX } from 'lucide-react';

export default function NoLogsPolicy() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium"><Shield size={12} /> No-Logs Policy</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">VoxVPN <span className="text-cyan-400">No-Logs Policy</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">We believe privacy is a fundamental right. VoxVPN maintains a strict no-logs policy — we never record, store or share your browsing activity, connection timestamps, IP addresses or DNS queries.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Eye, title: 'No Browsing Logs', desc: 'We never record what websites you visit or what content you access.' },
            { icon: FileX, title: 'No IP Address Logs', desc: 'Your real IP address is never stored on our servers.' },
            { icon: Lock, title: 'No DNS Query Logs', desc: 'All DNS queries are encrypted and never logged.' },
            { icon: Shield, title: 'Independently Audited', desc: 'Our no-logs policy is verified by independent third-party security audits.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Icon size={22} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8">
          <h2 className="text-2xl font-bold text-white mb-4">What We Never Collect</h2>
          <ul className="space-y-3 text-slate-400 text-sm">
            {['Browsing history or visited websites','Connection timestamps or session duration','Originating IP addresses','DNS queries','Bandwidth usage per user','VPN server IP addresses used'].map(item => (
              <li key={item} className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0" />{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}