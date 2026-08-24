import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { motion } from 'framer-motion';
import { Newspaper, Download, Image, FileText, Globe, Mail, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function MediaKit() {
  const [copied, setCopied] = useState(false);

  const copyBoilerplate = () => {
    navigator.clipboard.writeText(BOILERPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Newspaper size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Media <span className="text-cyan-400">Kit</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Official VoxVPN brand assets, logos, press releases, and company information for journalists, partners, and affiliates.</p>
        </motion.div>

        {/* Quick facts */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <h2 className="text-white font-bold text-lg mb-6">Company Facts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Company Name', value: 'VoxVPN' },
              { label: 'Legal Entity', value: 'VoxTelefony Communications LLC' },
              { label: 'Founded', value: '2020' },
              { label: 'Industry', value: 'Cybersecurity / VPN' },
              { label: 'Users', value: '10M+ worldwide' },
              { label: 'Server Locations', value: '60+ countries' },
              { label: 'Encryption', value: 'AES-256' },
              { label: 'Protocols', value: 'OpenVPN, WireGuard' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-slate-500 text-sm">{item.label}</span>
                <span className="text-white font-semibold text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logo assets */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Image size={18} className="text-cyan-400" />
            <h2 className="text-white font-bold text-lg">Logo & Brand Assets</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Primary Logo (Dark BG)', url: 'https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png' },
              { label: 'App Icon', url: 'https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/13431de73_VoxICON.png' },
            ].map((asset, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-center py-6 mb-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <img src={asset.url} alt={asset.label} className="h-12 w-auto" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">{asset.label}</span>
                  <a href={asset.url} download className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    <Download size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-4">For additional formats (SVG, EPS, PDF) or custom assets, contact info@voxdigits.com</p>
        </div>

        {/* Boilerplate */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-cyan-400" />
              <h2 className="text-white font-bold text-lg">Company Boilerplate</h2>
            </div>
            <button onClick={copyBoilerplate} className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition-colors">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            VoxVPN is a privacy-first VPN service providing military-grade AES-256 encryption, a strict no-logs policy, and high-speed servers across 60+ countries. Founded in 2020 by cybersecurity engineers and digital rights advocates, VoxVPN is operated by VoxTelefony Communications LLC and serves over 10 million users worldwide. VoxVPN is available on Windows, macOS, Linux, iOS, Android, and routers, supporting both OpenVPN and WireGuard protocols. Learn more at voxvpn.net.
          </p>
        </div>

        {/* Press contact */}
        <div className="rounded-2xl p-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))', border: '1px solid rgba(0,212,255,0.2)' }}>
          <h2 className="text-white font-bold text-lg mb-2">Press Contact</h2>
          <p className="text-slate-400 text-sm mb-4">For press inquiries, interviews, and partnership opportunities:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:info@voxdigits.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold transition-all text-sm">
              <Mail size={16} /> info@voxdigits.com
            </a>
            <a href="/press" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-semibold">
              <ExternalLink size={16} /> Press & News Page
            </a>
          </div>
        </div>

        {/* Usage guidelines */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8">
          <h2 className="text-white font-bold text-lg mb-4">Brand Usage Guidelines</h2>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li className="flex items-start gap-2"><Globe size={14} className="text-cyan-400 mt-1 flex-shrink-0" /> Always use the official VoxVPN logo without modification.</li>
            <li className="flex items-start gap-2"><Globe size={14} className="text-cyan-400 mt-1 flex-shrink-0" /> Do not stretch, distort, or recolor the logo.</li>
            <li className="flex items-start gap-2"><Globe size={14} className="text-cyan-400 mt-1 flex-shrink-0" /> Maintain clear space around the logo equal to the height of the icon.</li>
            <li className="flex items-start gap-2"><Globe size={14} className="text-cyan-400 mt-1 flex-shrink-0" /> Refer to the company as "VoxVPN" or "VoxTelefony Communications LLC" for legal contexts.</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const BOILERPLATE = `VoxVPN is a privacy-first VPN service providing military-grade AES-256 encryption, a strict no-logs policy, and high-speed servers across 60+ countries. Founded in 2020 by cybersecurity engineers and digital rights advocates, VoxVPN is operated by VoxTelefony Communications LLC and serves over 10 million users worldwide. VoxVPN is available on Windows, macOS, Linux, iOS, Android, and routers, supporting both OpenVPN and WireGuard protocols. Learn more at voxvpn.net.`;