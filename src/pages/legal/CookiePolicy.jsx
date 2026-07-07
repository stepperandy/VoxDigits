import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Cookie, ShieldCheck, BarChart3, Megaphone, Settings } from 'lucide-react';

const CATEGORIES = [
  {
    icon: ShieldCheck,
    name: 'Essential Cookies',
    status: 'Always Active',
    desc: 'These cookies are strictly necessary for the website to function. They enable core features like authentication, session management, and security. They cannot be disabled.',
    cookies: ['session_id', 'auth_token', 'csrf_token'],
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: BarChart3,
    name: 'Analytics Cookies',
    status: 'Optional',
    desc: 'These cookies help us understand how visitors interact with our website, allowing us to improve performance and user experience. All data is anonymized and aggregated.',
    cookies: ['_ga', '_gid', 'usage_stats'],
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: Megaphone,
    name: 'Marketing Cookies',
    status: 'Disabled by Default',
    desc: 'These cookies may be used to deliver relevant advertisements. VoxVPN does not use marketing cookies by default. If enabled in the future, they would help measure ad campaign effectiveness.',
    cookies: ['_fbp', 'ads_tracker'],
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
];

export default function CookiePolicy() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Cookie size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Cookie Policy</h1>
          <p className="text-slate-500 text-sm mb-4">Last updated: July 7, 2026</p>
        </div>

        {/* Intro */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-slate-300 text-sm leading-relaxed">
            This Cookie Policy explains how VoxVPN ("we", "us") uses cookies and similar technologies on our website. Cookies are small text files stored on your device when you visit a website. We use cookies to provide, secure, and improve our services.
          </p>
        </div>

        {/* Cookie categories */}
        <div className="space-y-6 mb-8">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div key={i} className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg} border`}>
                      <Icon size={18} className={cat.color} />
                    </div>
                    <h2 className="text-white font-bold text-base">{cat.name}</h2>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cat.bg} border ${cat.color}`}>{cat.status}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{cat.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.cookies.map(c => (
                    <code key={c} className="px-2 py-1 rounded text-xs font-mono" style={{ background: '#060c1a', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>{c}</code>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Management instructions */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Settings size={18} className="text-cyan-400" />
            <h2 className="text-white font-bold text-base">How to Manage Cookies</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            You can control and manage cookies in the following ways:
          </p>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span> Use your browser settings to accept, block, or delete cookies. Most browsers offer detailed cookie management in their privacy settings.</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span> Use "Do Not Track" (DNT) signals in your browser — we respect DNT preferences.</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span> Clear your browser data periodically to remove stored cookies.</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span> Use private/incognito browsing mode to prevent cookies from being saved.</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span> Essential cookies cannot be disabled as they are required for core website functionality (login, security, session management).</li>
          </ul>
        </div>

        {/* Third-party services */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-white font-bold text-base mb-4">Third-Party Services</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-3">
            We use the following third-party services that may set cookies:
          </p>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span> <strong className="text-white">Stripe</strong> — Payment processing. Sets cookies for fraud prevention. See stripe.com/cookies.</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span> <strong className="text-white">Cloud Infrastructure</strong> — Website hosting and CDN. May set essential session cookies.</li>
          </ul>
          <p className="text-slate-500 text-xs mt-4">We do not share cookie data with advertising networks or third-party trackers.</p>
        </div>

        {/* Contact */}
        <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))', border: '1px solid rgba(0,212,255,0.2)' }}>
          <h2 className="text-white font-bold text-base mb-2">Questions About Cookies?</h2>
          <p className="text-slate-400 text-sm mb-3">Contact us for any cookie-related questions.</p>
          <a href="mailto:admin@voxdigits.com" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors">admin@voxdigits.com</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}