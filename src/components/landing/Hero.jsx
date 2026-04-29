import { motion } from 'framer-motion';
import { Shield, Check, ArrowRight, Play } from 'lucide-react';

const TRUST_BADGES = [
  { label: 'No-Logs Policy', emoji: '🔒' },
  { label: 'AES-256 Bit', emoji: '🛡️' },
  { label: '10+ Locations', emoji: '🌍' },
  { label: 'Kill Switch', emoji: '⚡' },
];

const FLOATING_FLAGS = [
  { flag: '🇺🇸', label: 'New York', top: '15%', left: '8%', delay: 0 },
  { flag: '🇬🇧', label: 'London', top: '28%', left: '82%', delay: 0.3 },
  { flag: '🇩🇪', label: 'Frankfurt', top: '62%', left: '88%', delay: 0.6 },
  { flag: '🇯🇵', label: 'Tokyo', top: '70%', left: '5%', delay: 0.9 },
  { flag: '🇸🇬', label: 'Singapore', top: '45%', left: '90%', delay: 1.2 },
  { flag: '🇳🇱', label: 'Amsterdam', top: '10%', left: '72%', delay: 0.4 },
];

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-[#06080f] flex items-center overflow-hidden pt-20">

      {/* Deep background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06080f] via-[#080d1a] to-[#06080f]" />
        {/* Radial glow — top left */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%)' }} />
        {/* Radial glow — bottom right */}
        <div className="absolute -bottom-40 -right-10 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(rgba(34,211,238,1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
      </div>

      {/* Floating location pills */}
      {FLOATING_FLAGS.map(({ flag, label, top, left, delay }) => (
        <motion.div
          key={label}
          className="absolute hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-slate-300 font-medium"
          style={{ top, left }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 + delay, duration: 0.5 }}
        >
          <span className="text-base">{flag}</span> {label}
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* LEFT — Copy */}
          <div className="flex-1 text-center lg:text-left">

            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-semibold mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              10,000+ users protected right now
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="text-5xl sm:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
            >
              Your Privacy.{' '}
              <br className="hidden sm:block" />
              <span className="relative">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Fully Protected.
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10"
            >
              VoxVPN shields your identity with military-grade encryption, a strict no-logs policy, and blazing-fast WireGuard servers in 10+ countries.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-10"
            >
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-black rounded-2xl text-base transition-all shadow-2xl shadow-cyan-500/30"
              >
                Get VoxVPN Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 hover:border-white/25 text-white font-semibold rounded-2xl text-base transition-all"
              >
                <Play size={15} className="text-cyan-400" />
                See How It Works
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {TRUST_BADGES.map(({ label, emoji }) => (
                <div key={label} className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <span>{emoji}</span>
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — VPN Dashboard Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="flex-1 flex justify-center w-full max-w-md lg:max-w-none"
          >
            <div className="relative w-full max-w-sm">

              {/* Glow behind card */}
              <div className="absolute -inset-8 rounded-3xl blur-3xl opacity-30"
                style={{ background: 'radial-gradient(circle, #22d3ee 0%, #3b82f6 50%, transparent 80%)' }} />

              {/* Main card — mimics the VPN app UI */}
              <div className="relative rounded-3xl border border-white/10 bg-[#0b1221]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
                {/* Card header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-slate-500 text-xs font-mono">VoxVPN</span>
                  <div className="w-16" />
                </div>

                {/* Card body */}
                <div className="p-6 text-center">
                  {/* Shield */}
                  <div className="flex justify-center mb-5">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-2xl bg-cyan-400/30 animate-pulse" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg viewBox="0 0 88 100" className="w-20 h-20 drop-shadow-[0_0_16px_rgba(34,211,238,0.6)]">
                          <defs>
                            <linearGradient id="hShield" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#22d3ee" />
                              <stop offset="100%" stopColor="#1d4ed8" />
                            </linearGradient>
                          </defs>
                          <path d="M44 2L6 16V46C6 68 24 88 44 98C64 88 82 68 82 46V16L44 2Z" fill="url(#hShield)" opacity="0.9" />
                          <path d="M30 50L40 62L60 38" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-sm font-bold">Protected</span>
                  </div>

                  {/* Location row */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/8 bg-white/3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇺🇸</span>
                      <div className="text-left">
                        <p className="text-white text-sm font-semibold">New York, US</p>
                        <p className="text-slate-500 text-xs">12ms · Optimal</p>
                      </div>
                    </div>
                    <div className="text-emerald-400 text-xs font-bold">●●●●○</div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Download', value: '↓ 187 Mbps', color: 'text-cyan-400' },
                      { label: 'Upload', value: '↑ 94 Mbps', color: 'text-violet-400' },
                      { label: 'Ping', value: '12 ms', color: 'text-emerald-400' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl bg-white/3 border border-white/5 py-2.5 px-2">
                        <p className={`${s.color} text-xs font-bold`}>{s.value}</p>
                        <p className="text-slate-600 text-[10px] mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Disconnect button */}
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2">
                    <Shield size={15} /> Disconnect
                  </button>
                </div>
              </div>

              {/* Floating connected devices */}
              <motion.div
                className="absolute -left-14 top-1/4 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-[#0b1221]/90 backdrop-blur-sm"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-lg">💻</span>
                <div>
                  <p className="text-white text-xs font-bold">MacBook Pro</p>
                  <p className="text-emerald-400 text-[10px]">Connected</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-14 bottom-1/4 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-[#0b1221]/90 backdrop-blur-sm"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-lg">📱</span>
                <div>
                  <p className="text-white text-xs font-bold">iPhone 15</p>
                  <p className="text-emerald-400 text-[10px]">Connected</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#06080f] to-transparent pointer-events-none" />
    </div>
  );
}