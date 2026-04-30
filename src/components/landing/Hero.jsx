import { motion } from 'framer-motion';

const TRUST_BADGES = [
  'No-Logs Policy',
  'AES-256 Bit',
  '20 Locations',
  'Kill Switch',
];

export default function Hero() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-24"
      style={{ background: 'linear-gradient(180deg, #1a0533 0%, #0d0118 40%, #080010 100%)' }}
    >
      {/* Tech circuit background image — full hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/373e867b8_image.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          opacity: 0.85,
        }}
      />
      {/* Overlay to keep text readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(10,5,30,0.45) 0%, rgba(8,0,16,0.6) 60%, rgba(8,0,16,0.92) 100%)',
        }}
      />

      {/* Premium Shield — centered */}
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex items-center justify-center"
        style={{ marginTop: '20px', marginBottom: '-10px' }}
      >
        {/* Outer glow aura */}
        <div className="absolute" style={{
          width: 260, height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(0,100,255,0.08) 50%, transparent 75%)',
          filter: 'blur(16px)',
        }} />
        <svg
          width="200"
          height="230"
          viewBox="0 0 100 115"
          fill="none"
          style={{
            filter:
              'drop-shadow(0 0 12px rgba(0,212,255,1)) drop-shadow(0 0 30px rgba(0,150,255,0.8)) drop-shadow(0 0 60px rgba(0,100,255,0.5))',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <defs>
            <linearGradient id="shieldBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0a1628" stopOpacity="0" />
              <stop offset="40%" stopColor="#0d2244" stopOpacity="0" />
              <stop offset="100%" stopColor="#061020" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="shieldEdge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="40%" stopColor="#0080ff" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
            <linearGradient id="shieldInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#003a6e" stopOpacity="0" />
              <stop offset="100%" stopColor="#001a3a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="shieldHighlight" x1="0%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,212,255,0.4)" />
              <stop offset="100%" stopColor="rgba(0,128,255,0)" />
            </linearGradient>
            <linearGradient id="glowCenter" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,212,255,0.6)" />
              <stop offset="60%" stopColor="rgba(0,100,255,0.2)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <filter id="innerGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Shield outer body */}
          <path
            d="M50 3L10 18V52C10 76 28 96 50 108C72 96 90 76 90 52V18L50 3Z"
            fill="url(#shieldBody)"
          />

          {/* Shield outer border — cyan glow */}
          <path
            d="M50 3L10 18V52C10 76 28 96 50 108C72 96 90 76 90 52V18L50 3Z"
            fill="none"
            stroke="url(#shieldEdge)"
            strokeWidth="2"
          />

          {/* Inner panel bevel */}
          <path
            d="M50 12L18 24V52C18 70 32 86 50 97C68 86 82 70 82 52V24L50 12Z"
            fill="url(#shieldInner)"
          />
          <path
            d="M50 12L18 24V52C18 70 32 86 50 97C68 86 82 70 82 52V24L50 12Z"
            fill="none"
            stroke="rgba(0,180,255,0.3)"
            strokeWidth="1"
          />

          {/* Inner glow highlight (top-left) */}
          <path
            d="M50 12L18 24V44C28 40 38 34 50 30V12Z"
            fill="url(#shieldHighlight)"
          />

          {/* Center vertical crease */}
          <line x1="50" y1="12" x2="50" y2="97" stroke="rgba(0,212,255,0.25)" strokeWidth="0.8" />

          {/* Center glow orb */}
          <ellipse cx="50" cy="52" rx="12" ry="14" fill="url(#glowCenter)" opacity="0.6" filter="url(#innerGlow)" />

          {/* Top cap rivet dots */}
          <circle cx="35" cy="16" r="1.2" fill="rgba(0,212,255,0.5)" />
          <circle cx="50" cy="11" r="1.4" fill="rgba(0,212,255,0.7)" />
          <circle cx="65" cy="16" r="1.2" fill="rgba(0,212,255,0.5)" />

          {/* Edge accent lines */}
          <path d="M18 36 Q14 44 14 52" stroke="rgba(0,212,255,0.4)" strokeWidth="0.8" fill="none" />
          <path d="M82 36 Q86 44 86 52" stroke="rgba(0,212,255,0.4)" strokeWidth="0.8" fill="none" />
        </svg>
      </motion.div>

      {/* Main content block */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto w-full">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="font-black text-white leading-tight mb-0"
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            letterSpacing: '-0.02em',
          }}
        >
          Your Privacy. Fully Protected.
        </motion.h1>

        {/* Gradient underline */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-3 mb-6 rounded-full"
          style={{
            height: '3px',
            width: '340px',
            maxWidth: '80%',
            background: 'linear-gradient(90deg, #ec4899, #a855f7, #06b6d4)',
          }}
        />

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
        >
          VoxVPN shields your identity with military-grade encryption, a strict
          no-logs policy, and blazing-fast VoxVPN servers in 20 locations.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex items-center gap-4 mb-8 flex-wrap justify-center"
        >
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 font-bold text-white text-sm rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 0 20px rgba(124,58,237,0.5)',
            }}
          >
            Get VoxVPN Now
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 font-bold text-white text-sm rounded-lg transition-all hover:bg-white/10 active:scale-95"
            style={{
              border: '1.5px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            See How It Works
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-8 flex-wrap"
        >
          {TRUST_BADGES.map((label, i) => (
            <span key={label} className="flex items-center gap-2">
              <span>{label}</span>
              {i < TRUST_BADGES.length - 1 && <span className="text-slate-600">|</span>}
            </span>
          ))}
        </motion.div>

        {/* VPN Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="w-full max-w-xl rounded-xl overflow-hidden"
          style={{
            background: 'rgba(20, 10, 40, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="px-6 py-2 text-center text-white font-semibold text-sm border-b"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            VPN Status Card
          </div>
          <div className="px-6 py-3 flex items-center justify-center gap-2 text-sm flex-wrap">
            <span className="font-bold" style={{ color: '#4ade80' }}>Protected</span>
            <span className="text-slate-400">·</span>
            <span className="text-white">New York US</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">85 Mbps / 30 Mbps / 12 ms</span>
            <span className="text-slate-400">·</span>
            <button className="font-bold text-white hover:text-slate-300 transition-colors">Disconnect</button>
          </div>
        </motion.div>
      </div>

      {/* Bottom padding */}
      <div className="pb-16" />
    </div>
  );
}