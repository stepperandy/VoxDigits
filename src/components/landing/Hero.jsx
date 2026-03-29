import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Shield, Lock, Globe, Zap, Wifi, Key, Eye, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const featureCards = [
  {
    icon: Shield,
    color: '#22d3ee',
    title: 'AES-256 Encryption',
    description: 'Military-grade encryption protects every byte of your data.',
  },
  {
    icon: Eye,
    color: '#a78bfa',
    title: 'No-Logs Policy',
    description: 'We never record your browsing activity or IP address.',
  },
  {
    icon: Zap,
    color: '#34d399',
    title: 'Lightning Fast',
    description: 'Optimized routing ensures minimal speed loss globally.',
  },
  {
    icon: Globe,
    color: '#f472b6',
    title: 'Global Servers',
    description: 'Connect through 10+ locations across 4 continents.',
  },
  {
    icon: Key,
    color: '#fbbf24',
    title: 'Kill Switch',
    description: 'Instantly cuts internet if your VPN drops — always safe.',
  },
];

// Mini floating icon cards positioned around the shield
const floatingItems = [
  { icon: Wifi,        color: '#22d3ee', x: -130, y: -80,  delay: 0 },
  { icon: Shield,      color: '#a78bfa', x:  110, y: -100, delay: 0.3 },
  { icon: Lock,        color: '#34d399', x:  130, y:   40, delay: 0.6 },
  { icon: Globe,       color: '#f472b6', x:  -60, y:  120, delay: 0.9 },
  { icon: Zap,         color: '#fbbf24', x: -140, y:   50, delay: 1.2 },
  { icon: AlertCircle, color: '#c084fc', x:   30, y: -130, delay: 1.5 },
  { icon: Key,         color: '#6ee7b7', x:   90, y:  110, delay: 1.8 },
];

function ShieldCard({ activeIdx }) {
  const card = featureCards[activeIdx];
  const Icon = card.icon;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 420, height: 420 }}>
      {/* Outer dark circle bg */}
      <div className="absolute inset-0 rounded-full border border-white/5" style={{ background: 'radial-gradient(circle, #0d1a24 0%, #080c18 70%)' }} />

      {/* Concentric rings */}
      {[180, 140, 100].map((r, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-500/10"
          style={{ width: r * 2, height: r * 2 }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 25 + i * 8, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Floating mini icon badges */}
      {floatingItems.map(({ icon: FIcon, color, x, y, delay }, idx) => (
        <motion.div
          key={idx}
          className="absolute flex items-center justify-center w-10 h-10 rounded-xl bg-[#0d1624] border border-white/10"
          style={{
            left: `calc(50% + ${x}px - 20px)`,
            top: `calc(50% + ${y}px - 20px)`,
            boxShadow: `0 0 14px ${color}44`,
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          <FIcon size={18} color={color} />
        </motion.div>
      ))}

      {/* Central card */}
      <div className="relative z-10 w-56 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f2535 0%, #0a1a28 100%)', border: '1px solid rgba(34,211,238,0.2)', boxShadow: '0 0 60px rgba(34,211,238,0.1), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        {/* Card header glow */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }} />

        <div className="p-6 flex flex-col items-center text-center gap-4">
          {/* Shield icon with glow */}
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: `${card.color}15`, border: `1px solid ${card.color}40`, boxShadow: `0 0 30px ${card.color}30` }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon size={32} color={card.color} />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-white font-bold text-sm mb-1" style={{ color: card.color }}>{card.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{card.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveCard((i) => (i + 1) % featureCards.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-[#080c18] pt-28 pb-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Glow blobs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              10,000+ users protected worldwide
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Your Privacy,{' '}
              <span className="text-cyan-400">Our Priority.</span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              VoxVPN encrypts your connection, hides your identity, and unlocks the internet — on every device, everywhere in the world.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button className="px-7 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full text-sm transition-all shadow-lg shadow-cyan-500/25">
                Get Protected Now
              </button>
              <button className="px-7 py-3 border border-white/15 hover:border-cyan-500/50 text-white font-semibold rounded-full text-sm transition-all">
                See How It Works
              </button>
            </div>

            <div className="flex flex-wrap gap-5 pt-1">
              {['No-Logs Policy', 'Blazing Fast', '10+ Locations', 'AES-256 Bit'].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-400 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Shield Card Viz */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <ShieldCard activeIdx={activeCard} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}