import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { motion } from 'framer-motion';
import { Shield, Lock, Server, Eye, Zap, Bug, FileCheck, CheckCircle2, Globe, AlertTriangle } from 'lucide-react';

const SECURITY_FEATURES = [
  { icon: Lock, title: 'AES-256 Encryption', desc: 'Every byte of your traffic is encrypted with AES-256-GCM, the same standard used by the U.S. government and financial institutions. No one — not even us — can read your data in transit.' },
  { icon: Globe, title: 'OpenVPN Protocol', desc: 'We support OpenVPN with AES-256-GCM, the most battle-tested and widely audited VPN protocol. Open-source, peer-reviewed, and trusted by security professionals worldwide.' },
  { icon: Zap, title: 'WireGuard Protocol', desc: 'WireGuard offers state-of-the-art cryptography (ChaCha20, Curve25519) with minimal codebase, faster speeds, and modern security design. Audited and recommended by cybersecurity experts.' },
  { icon: Shield, title: 'Kill Switch', desc: 'If your VPN connection drops unexpectedly, the kill switch instantly blocks all internet traffic, preventing your real IP address or unencrypted data from leaking.' },
  { icon: Eye, title: 'DNS Leak Protection', desc: 'All DNS queries are routed through the encrypted VPN tunnel, preventing your ISP or third parties from seeing which websites you visit.' },
  { icon: AlertTriangle, title: 'IPv6 Leak Protection', desc: 'We block and route all IPv6 traffic through the VPN tunnel, preventing IPv6 address leaks that could expose your identity on modern networks.' },
  { icon: Server, title: 'RAM-Only Servers', desc: 'All VPN servers run entirely in RAM. No data is written to disk. When a server reboots, all data is permanently wiped — there is nothing to seize or access.' },
  { icon: FileCheck, title: 'Strict No-Logs Policy', desc: 'We do not log browsing history, DNS queries, connection timestamps, IP addresses, or bandwidth usage. Independently audited and verified by third-party security firms.' },
];

const PRACTICES = [
  { title: 'Server Hardening', desc: 'All servers are configured with minimal attack surface — no unnecessary services, no SSH password auth, firewall rules restricting access to essential ports only.' },
  { title: 'Regular Updates', desc: 'Server software, VPN protocols, and security patches are updated on a rolling basis with zero-downtime deployment.' },
  { title: 'Access Control', desc: 'Infrastructure access is restricted to authorized engineers using multi-factor authentication. All access is logged and audited.' },
  { title: 'Network Segmentation', desc: 'VPN infrastructure is isolated from management networks. User traffic and administrative operations are fully separated.' },
  { title: 'Monitoring & Alerting', desc: 'Automated monitoring detects anomalies, intrusion attempts, and service disruptions in real-time with 24/7 alerting.' },
  { title: 'Incident Response', desc: 'Documented incident response procedures ensure rapid detection, containment, and transparent disclosure of any security incidents.' },
];

export default function SecurityPage() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Shield size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Security at <span className="text-cyan-400">VoxVPN</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Our security architecture, encryption standards, and privacy practices — built to protect your data at every layer.</p>
        </motion.div>

        {/* Security features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {SECURITY_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="p-6 rounded-2xl border border-white/5 bg-[#0d1120]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security practices */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-cyan-400" />
            <h2 className="text-white font-bold text-lg">Security Practices & Infrastructure</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRACTICES.map((practice, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{practice.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{practice.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsible disclosure */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Bug size={18} className="text-cyan-400" />
            <h2 className="text-white font-bold text-lg">Responsible Disclosure Policy</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            VoxVPN values the security community. If you discover a vulnerability in our systems, we encourage you to report it responsibly. We are committed to working with researchers to verify and address reported issues.
          </p>
          <div className="space-y-3">
            {[
              'Report vulnerabilities to admin@voxdigits.com with full details and reproduction steps.',
              'Provide us reasonable time (minimum 90 days) to investigate and remediate before public disclosure.',
              'Do not access, modify, or destroy data that does not belong to you.',
              'Do not perform denial-of-service attacks or social engineering.',
              'We acknowledge all reports within 48 hours and provide regular updates on remediation progress.',
              'We offer recognition and rewards for verified, high-impact vulnerability reports through our Bug Bounty Program.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="/bug-bounty" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold transition-all text-sm">
              <Bug size={16} /> Bug Bounty Program
            </a>
            <a href="/security-audit" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-semibold">
              <FileCheck size={16} /> Security Audit Report
            </a>
          </div>
        </div>

        {/* Encryption specs table */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-12">
          <h2 className="text-white font-bold text-lg mb-6">Technical Encryption Specifications</h2>
          <div className="space-y-3">
            {[
              { label: 'Data Encryption (OpenVPN)', value: 'AES-256-GCM' },
              { label: 'Data Encryption (WireGuard)', value: 'ChaCha20-Poly1305' },
              { label: 'Key Exchange (OpenVPN)', value: 'RSA-4096 / ECDH' },
              { label: 'Key Exchange (WireGuard)', value: 'Curve25519' },
              { label: 'Handshake (OpenVPN)', value: 'TLS 1.3 with Perfect Forward Secrecy' },
              { label: 'Hash Authentication', value: 'SHA-512' },
              { label: 'VPN Port (Default)', value: 'UDP 1194 / TCP 443' },
              { label: 'DNS Resolution', value: 'Encrypted via VPN tunnel (no leaks)' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-slate-500 text-sm">{item.label}</span>
                <span className="text-white font-semibold text-sm font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="/security-audit" className="p-5 rounded-xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-all text-center">
            <FileCheck size={20} className="text-cyan-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm">Security Audit</h3>
            <p className="text-slate-500 text-xs mt-1">Independent verification</p>
          </a>
          <a href="/transparency-report" className="p-5 rounded-xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-all text-center">
            <Eye size={20} className="text-cyan-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm">Transparency Report</h3>
            <p className="text-slate-500 text-xs mt-1">Government data requests</p>
          </a>
          <a href="/no-logs-policy" className="p-5 rounded-xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-all text-center">
            <Lock size={20} className="text-cyan-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm">No-Logs Policy</h3>
            <p className="text-slate-500 text-xs mt-1">What we don\'t store</p>
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}