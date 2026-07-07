import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Server, Users, Eye, Lock, Globe, CheckCircle2, Download, Mail } from 'lucide-react';

export default function TransparencyReport() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <FileText size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Transparency <span className="text-cyan-400">Report</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">We believe in radical transparency. This report details government data requests, our no-logs practices, and infrastructure disclosures.</p>
        </motion.div>

        {/* Reporting period */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#22d3ee' }}>
            Reporting Period: January 1, 2026 — June 30, 2026
          </span>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Eye, value: '0', label: 'Data Requests Complied With' },
            { icon: FileText, value: '3', label: 'Government Requests Received' },
            { icon: Server, value: '60+', label: 'Server Locations' },
            { icon: Users, value: '10M+', label: 'Active Users' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 text-center">
                <Icon size={20} className="text-cyan-400 mx-auto mb-3" />
                <p className="text-2xl sm:text-3xl font-black text-cyan-400 mb-1">{stat.value}</p>
                <p className="text-slate-500 text-xs leading-tight">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Government data requests */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <h2 className="text-white font-bold text-lg mb-2">Government & Law Enforcement Requests</h2>
          <p className="text-slate-500 text-sm mb-6">VoxVPN received the following requests during the reporting period. Because we operate a strict no-logs policy, we have no user activity data to provide.</p>
          <div className="space-y-3">
            {[
              { type: 'Data Preservation Requests', received: 1, complied: 0 },
              { type: 'Court Orders / Subpoenas', received: 1, complied: 0 },
              { type: 'National Security Requests', received: 1, complied: 0 },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 py-3 border-b border-white/5 last:border-0 items-center">
                <span className="text-slate-300 text-sm font-medium">{row.type}</span>
                <span className="text-white text-sm text-center font-semibold">{row.received} received</span>
                <span className="text-emerald-400 text-sm text-center font-bold">{row.complied} complied</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
            <p className="text-slate-400 text-xs leading-relaxed">
              <ShieldCheck size={14} className="text-cyan-400 inline mr-1" />
              <strong className="text-white">Zero data provided.</strong> Because VoxVPN does not store browsing history, DNS queries, IP addresses, or connection logs, we cannot and have not provided any user activity data to any government or law enforcement agency.
            </p>
          </div>
        </div>

        {/* DMCA requests */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <h2 className="text-white font-bold text-lg mb-2">DMCA & Copyright Requests</h2>
          <p className="text-slate-500 text-sm mb-6">We received the following Digital Millennium Copyright Act (DMCA) and copyright takedown requests during the reporting period.</p>
          <div className="space-y-3">
            {[
              { type: 'DMCA Takedown Notices', received: 2, action: 'Forwarded to user (no data shared)' },
              { type: 'Copyright Infringement Claims', received: 1, action: 'No data available to provide' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-3 border-b border-white/5 last:border-0 items-center">
                <span className="text-slate-300 text-sm font-medium">{row.type}</span>
                <span className="text-white text-sm text-center font-semibold">{row.received} received</span>
                <span className="text-amber-400 text-xs text-center font-semibold">{row.action}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-4 leading-relaxed">
            VoxVPN does not monitor or log user activity, so we cannot identify which user accessed specific content. We forward DMCA notices to the user's registered email and take no further action unless required by valid court order.
          </p>
        </div>

        {/* Abuse reports */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <h2 className="text-white font-bold text-lg mb-2">Abuse Reports</h2>
          <p className="text-slate-500 text-sm mb-6">Abuse reports received from third parties regarding VoxVPN IP addresses.</p>
          <div className="space-y-3">
            {[
              { type: 'Spam / Unsolicited Email', received: 4, resolved: 4 },
              { type: 'Port Scanning / Probing', received: 2, resolved: 2 },
              { type: 'Brute Force Attempts', received: 3, resolved: 3 },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 py-3 border-b border-white/5 last:border-0 items-center">
                <span className="text-slate-300 text-sm font-medium">{row.type}</span>
                <span className="text-white text-sm text-center font-semibold">{row.received} reported</span>
                <span className="text-emerald-400 text-sm text-center font-bold">{row.resolved} resolved</span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-4 leading-relaxed">
            All abuse reports are investigated within 24 hours. Due to our no-logs policy, we cannot identify individual users. Accounts found in violation of our Acceptable Use Policy are suspended or terminated.
          </p>
        </div>

        {/* Warrant Canary */}
        <div className="rounded-2xl p-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h2 className="text-white font-bold text-lg">Warrant Canary</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-3">
            <strong className="text-emerald-400">As of July 7, 2026:</strong>
          </p>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> VoxVPN has NOT received any National Security Letters (NSLs).</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> VoxVPN has NOT received any gag orders restricting our ability to disclose requests.</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> VoxVPN has NOT been required to modify our infrastructure to facilitate surveillance.</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> VoxVPN has NOT weakened our encryption or security protocols at any government's request.</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> VoxVPN has NOT provided any user browsing data, DNS queries, or connection logs to any party.</li>
          </ul>
          <p className="text-slate-500 text-xs mt-4 leading-relaxed">
            This warrant canary is updated quarterly. If this section is removed or modified, it may indicate that we have received a request we are legally prohibited from disclosing.
          </p>
        </div>

        {/* No-logs verification */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <h2 className="text-white font-bold text-lg mb-6">No-Logs Verification</h2>
          <ul className="space-y-3">
            {[
              'No browsing history or visited URLs logged',
              'No DNS queries recorded or stored',
              'No connection timestamps or session durations logged',
              'No IP addresses of users logged on VPN servers',
              'No bandwidth usage tracked per user',
              'RAM-only servers — all data wiped on reboot',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <a href="/security-audit" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors">
              <ShieldCheck size={14} /> View Security Audit Report →
            </a>
          </div>
        </div>

        {/* Infrastructure disclosure */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <h2 className="text-white font-bold text-lg mb-6">Infrastructure Disclosure</h2>
          <div className="space-y-4">
            {[
              { icon: Server, label: 'Server Infrastructure', value: 'RAM-only servers across 60+ locations in privacy-friendly jurisdictions' },
              { icon: Lock, label: 'Encryption', value: 'AES-256 encryption on all connections; OpenVPN and WireGuard protocols supported' },
              { icon: Globe, label: 'Jurisdiction', value: 'Operated under privacy-friendly legal jurisdiction with strong data protection laws' },
              { icon: ShieldCheck, label: 'Third-Party Processors', value: 'Stripe (payments), cloud infrastructure providers — no data shared for advertising' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    <Icon size={16} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">{item.label}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download / contact */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="mailto:admin@voxdigits.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold transition-all text-sm">
            <Mail size={16} /> Request Full Report
          </a>
          <a href="/security-audit" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-semibold">
            <Download size={16} /> Security Audit
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}