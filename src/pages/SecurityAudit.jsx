import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { motion } from 'framer-motion';
import { ShieldCheck, FileCheck, Lock, Eye, Server, Download, CheckCircle2, Calendar, ExternalLink } from 'lucide-react';

export default function SecurityAudit() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <ShieldCheck size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Security <span className="text-cyan-400">Audit</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">VoxVPN is committed to independent security verification of our no-logs policy, encryption standards, and infrastructure. We will publish audit reports here when they are completed.</p>
        </motion.div>

        {/* Audit status card */}
        <div className="rounded-2xl p-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))', border: '1px solid rgba(0,212,255,0.2)' }}>
          <div className="flex items-center gap-3 mb-4">
            <FileCheck size={20} className="text-cyan-400" />
            <h2 className="text-white font-bold text-lg">Audit Status</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Audit Firm', value: 'To be announced' },
              { label: 'Status', value: 'Pending — audit planned' },
              { label: 'Scope', value: 'No-Logs Policy & Infrastructure' },
              { label: 'Result', value: 'Forthcoming' },
              { label: 'Standard', value: 'AES-256 / OpenVPN / WireGuard' },
              { label: 'Report', value: 'Will be published here' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-slate-500 text-sm">{item.label}</span>
                <span className="text-white font-semibold text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What was audited */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <h2 className="text-white font-bold text-lg mb-6">Planned Audit Scope</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Eye, title: 'No-Logs Verification', desc: 'Will verify that VoxVPN does not store browsing history, DNS queries, connection timestamps, or traffic destinations.' },
              { icon: Lock, title: 'Encryption Standards', desc: 'Will verify AES-256 encryption implementation across all VPN protocols (OpenVPN and WireGuard).' },
              { icon: Server, title: 'Infrastructure Security', desc: 'Will review server configurations, access controls, and network architecture across all server locations.' },
              { icon: ShieldCheck, title: 'Data Handling', desc: 'Will confirm that no user activity data is written to disk, and that RAM-only server configurations are in place.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    <Icon size={16} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commitments */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <h2 className="text-white font-bold text-lg mb-6">Our Security Commitments</h2>
          <ul className="space-y-3">
            {[
              'Independent security audit planned — report will be published upon completion',
              'RAM-only server infrastructure — no data written to persistent storage',
              'AES-256 encryption on all VPN connections by default',
              'Strict no-logs policy designed for independent verification',
              'Regular penetration testing of all infrastructure components',
              'Transparent disclosure of any security incidents',
              'Bug bounty program for responsible vulnerability disclosure',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Audit timeline */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <h2 className="text-white font-bold text-lg mb-6">Audit Timeline</h2>
          <div className="space-y-3">
            {[
              { date: 'Planned', scope: 'No-Logs & Infrastructure', result: 'Pending' },
            ].map((audit, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-cyan-400" />
                  <span className="text-white text-sm font-semibold">{audit.date}</span>
                  <span className="text-slate-500 text-xs">{audit.scope}</span>
                </div>
                <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> {audit.result}
                </span>
              </div>
            ))}
            <p className="text-slate-500 text-xs leading-relaxed pt-2">
              No completed independent audits yet. VoxVPN's first independent security audit is planned, and the full report will be published on this page once it is completed.
            </p>
          </div>
        </div>

        {/* Resources */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/bug-bounty" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-semibold">
            <ShieldCheck size={16} /> Bug Bounty Program
          </a>
          <a href="/privacy-policy" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm font-semibold">
            <ExternalLink size={16} /> Privacy Policy
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}