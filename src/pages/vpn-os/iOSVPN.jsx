import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Zap, Lock, Globe } from 'lucide-react';

// Static, iOS-specific landing content. Kept inline (no LLM dependency) so the
// page always renders a complete landing page on direct navigation and refresh.
const CONTENT = {
  headline: 'VPN for iPhone & iPad',
  subheadline:
    'Protect your iOS devices with military-grade AES-256 encryption, a strict no-logs policy, and secure Wi-Fi protection across 20 server locations on 4 continents.',
  cards: [
    { title: 'AES-256 Encryption', desc: 'Military-grade encryption secures every byte of your iPhone and iPad traffic.' },
    { title: 'Secure Wi-Fi Protection', desc: 'Stay safe on public Wi-Fi with automatic kill switch protection on iOS.' },
    { title: 'No-Logs Policy', desc: 'We never store your browsing history, DNS queries, or IP address on iOS.' },
    { title: '20 Global Locations', desc: 'Connect to optimized servers across 4 continents for fast, reliable access.' },
  ],
  cta_headline: 'Get VoxVPN for your iPhone or iPad',
};

const ICONS = [Shield, Zap, Lock, Globe];

export default function iOSVPN() {
  const words = CONTENT.headline.split(' ');
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">
          📱 iOS VPN
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
          {words.map((word, i, arr) =>
            i === arr.length - 1
              ? <span key={i} className="text-cyan-400"> {word}</span>
              : <span key={i}>{i > 0 ? ' ' : ''}{word}</span>
          )}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">{CONTENT.subheadline}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {CONTENT.cards.map((card, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div key={i} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
                <Icon size={22} className="text-cyan-400 mb-3" />
                <h3 className="text-white font-semibold mb-2">{card.title}</h3>
                <p className="text-slate-400 text-sm">{card.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{CONTENT.cta_headline}</h2>
          <a
            href="/#pricing"
            className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all"
          >
            Download for iOS
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}