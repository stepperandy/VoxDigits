import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer';
import { Shield, Bug, Award, Mail } from 'lucide-react';

export default function BugBounty() {
  return (
    <div className="bg-[#080c18]">
      <Navbar />
      <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Security</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">VoxVPN Bug Bounty Program</h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Help us keep VoxVPN secure. Report vulnerabilities responsibly and earn rewards.
            </p>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Shield size={24} className="text-cyan-400 mb-3" />
              <p className="text-white font-semibold text-sm mb-1">In Scope</p>
              <p className="text-slate-400 text-xs">All VoxVPN applications, infrastructure, and web properties.</p>
            </div>
            <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Bug size={24} className="text-amber-400 mb-3" />
              <p className="text-white font-semibold text-sm mb-1">Vulnerability Types</p>
              <p className="text-slate-400 text-xs">Security flaws, encryption weaknesses, and protocol issues.</p>
            </div>
            <div className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Award size={24} className="text-emerald-400 mb-3" />
              <p className="text-white font-semibold text-sm mb-1">Rewards</p>
              <p className="text-slate-400 text-xs">$100–$5,000 based on severity and impact.</p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="mb-12">
            <h2 className="text-white font-bold text-lg mb-6">Responsible Disclosure Guidelines</h2>
            <div className="space-y-4">
              {[
                { title: 'Report Privately', desc: 'Send vulnerability reports to security@voxvpn.net with detailed reproduction steps.' },
                { title: 'Allow Time for Review', desc: 'Give us 90 days to patch before public disclosure or coordinated release.' },
                { title: 'No Illegal Activity', desc: 'Unauthorized access to systems or data is prohibited, even for testing.' },
                { title: 'Good Faith Testing', desc: 'Test only on systems you own or have explicit permission to test.' },
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-white/5 bg-[#0d1120]">
                  <p className="text-white font-semibold text-sm mb-2">{item.title}</p>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Levels */}
          <div className="mb-12">
            <h2 className="text-white font-bold text-lg mb-6">Severity & Reward Tiers</h2>
            <div className="space-y-3">
              {[
                { severity: 'Critical', range: '$1,000–$5,000', desc: 'Remote code execution, complete compromise' },
                { severity: 'High', range: '$500–$1,000', desc: 'Encryption bypass, authentication failure' },
                { severity: 'Medium', range: '$200–$500', desc: 'Information disclosure, denial of service' },
                { severity: 'Low', range: '$100–$200', desc: 'Minor bugs, user experience issues' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-4 rounded-xl border border-white/5 bg-[#0d1120]">
                  <div>
                    <p className="text-white font-semibold text-sm">{item.severity}</p>
                    <p className="text-slate-400 text-xs mt-1">{item.desc}</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold whitespace-nowrap ml-4">{item.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Out of Scope */}
          <div className="mb-12 p-6 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <p className="text-white font-semibold text-sm mb-3">Out of Scope</p>
            <ul className="space-y-2 text-slate-400 text-sm">
              {[
                'Social engineering or phishing attacks',
                'DDoS attacks or network disruptions',
                'Third-party service vulnerabilities',
                'Physical security issues',
                'UI/UX bugs without security impact',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 mt-1">×</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="p-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-start gap-4">
              <Mail size={24} className="text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold text-base mb-2">Report a Vulnerability</p>
                <p className="text-slate-400 text-sm mb-4">Send detailed reports with reproduction steps and proof of concept to:</p>
                <a href="mailto:security@voxvpn.net" className="inline-block px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded-lg transition-colors">
                  security@voxvpn.net
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}