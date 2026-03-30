import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Globe, Lock, ChevronRight, Star, Check, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const trustPoints = [
  { icon: Shield, label: 'No-Log Policy', desc: 'We never store your activity' },
  { icon: Zap, label: 'Ultra-Fast Speeds', desc: 'WireGuard protocol, zero lag' },
  { icon: Globe, label: '50+ Servers', desc: 'Worldwide coverage' },
  { icon: Lock, label: 'AES-256 Encryption', desc: 'Military-grade security' },
];

const reviews = [
  { name: 'Alex M.', stars: 5, text: 'Fastest VPN I\'ve ever used. Setup took 2 minutes.' },
  { name: 'Sarah K.', stars: 5, text: 'No logs, no nonsense. VoxVPN just works.' },
  { name: 'James T.', stars: 5, text: 'Switched from NordVPN. Way better speeds for the price.' },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#060910] text-white overflow-x-hidden">

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#060910]/95 backdrop-blur border-b border-white/5 shadow-lg' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-cyan-400">Vox</span>VPN
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link to="/contact" className="hover:text-white transition-colors">Support</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
              Sign In
            </Link>
            <a href="#pricing" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded-lg transition-all">
              Get VoxVPN
            </a>
          </div>
          <button className="md:hidden p-2 text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#0d1120] border-t border-white/5 px-4 py-4 space-y-3">
            <a href="#features" className="block text-slate-300 py-2" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#pricing" className="block text-slate-300 py-2" onClick={() => setMenuOpen(false)}>Pricing</a>
            <Link to="/contact" className="block text-slate-300 py-2" onClick={() => setMenuOpen(false)}>Support</Link>
            <Link to="/dashboard" className="block text-slate-300 py-2" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <a href="#pricing" className="block w-full text-center py-3 bg-cyan-500 text-black font-bold rounded-lg" onClick={() => setMenuOpen(false)}>
              Get VoxVPN
            </a>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 flex flex-col items-center text-center overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Trusted by 50,000+ users worldwide
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6 max-w-4xl mx-auto">
            The VPN That
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Never Compromises
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Military-grade encryption. Zero logs. Lightning-fast WireGuard speeds. 
            Your internet — private, secure, and unrestricted.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-base rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2">
              Start Protecting Now
              <ChevronRight size={18} />
            </a>
            <Link to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 border border-white/10 hover:border-cyan-500/40 text-white font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2">
              Sign In to Dashboard
            </Link>
          </div>

          <p className="text-slate-600 text-xs">No credit card required for free trial · Cancel anytime</p>
        </motion.div>

        {/* Shield graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 relative"
        >
          <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield size={80} className="text-cyan-400 drop-shadow-lg" strokeWidth={1.5} />
            </div>
            {/* Orbit dots */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div key={i}
                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400/60"
                style={{
                  top: `${50 - 46 * Math.cos((deg * Math.PI) / 180)}%`,
                  left: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Trust Points */}
      <section id="features" className="py-20 px-4 bg-[#080c18]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Why Choose VoxVPN?</h2>
            <p className="text-slate-500 text-sm">Everything you need. Nothing you don't.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustPoints.map(({ icon: Icon, label, desc }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#0d1120] border border-white/5 rounded-2xl p-6 text-center hover:border-cyan-500/20 transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Icon size={22} className="text-cyan-400" />
                </div>
                <p className="text-white font-bold text-sm mb-1">{label}</p>
                <p className="text-slate-500 text-xs">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mb-4">
            Plans from $2.99/mo
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 text-sm mb-8">All plans include AES-256 encryption, no-log policy, and 5 devices.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
            {[
              { name: 'Monthly', price: '$8.99/mo', label: 'Billed monthly', badge: null },
              { name: 'Basic + Trial', price: '$9.99/mo', label: '3-day free trial', badge: 'Free Trial' },
              { name: 'Annual', price: '$4.99/mo', label: 'Billed $59.88/year', badge: 'Save 44%' },
              { name: '2-Year', price: '$2.99/mo', label: 'Billed $71.76/2yr', badge: 'Best Value' },
            ].map(p => (
              <div key={p.name} className="flex items-center justify-between bg-[#0d1120] border border-white/5 rounded-xl px-5 py-4 hover:border-cyan-500/20 transition-all">
                <div>
                  <p className="text-white font-bold text-sm">{p.name}</p>
                  <p className="text-slate-500 text-xs">{p.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 font-black text-base">{p.price}</p>
                  {p.badge && (
                    <span className="text-xs font-bold text-emerald-400">{p.badge}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link to="/features-mobile"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-base rounded-xl transition-all shadow-lg shadow-cyan-500/25">
            View Full Pricing & Get Started
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-4 bg-[#080c18]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Loved by Users</h2>
            <p className="text-slate-500 text-sm">Real reviews from real customers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#0d1120] border border-white/5 rounded-2xl p-5"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(r.stars)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">"{r.text}"</p>
                <p className="text-slate-500 text-xs font-semibold">{r.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Your Privacy,<br />
            <span className="text-cyan-400">Protected.</span>
          </h2>
          <p className="text-slate-400 text-base mb-8">Join thousands of users who trust VoxVPN every day.</p>
          <a href="#pricing"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-lg rounded-xl transition-all shadow-xl shadow-cyan-500/30">
            Get Protected Now
            <ChevronRight size={20} />
          </a>
          <p className="text-slate-600 text-xs mt-4">Try risk-free · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 text-xs">
          <span><span className="text-cyan-400 font-bold">Vox</span>VPN © 2026</span>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}