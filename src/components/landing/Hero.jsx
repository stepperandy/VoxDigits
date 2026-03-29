import { motion } from 'framer-motion';
import { CheckCircle, Shield } from 'lucide-react';

export default function Hero() {
  return (
    <div className="min-h-screen bg-[#080c18] pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(0,212,200,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,200,0.05) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Glow blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Home</span>
              <span>/</span>
              <span className="text-cyan-400">VPN Service</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight">
              Your Privacy,{' '}
              <span className="relative inline-block text-cyan-400">
                Our Priority.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 10" fill="none" preserveAspectRatio="none">
                  <path d="M2 7 Q75 2 150 7 Q225 12 298 5" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              VoxVPN encrypts your connection and hides your identity — on every device, everywhere in the world. AES-256 Encryption, no logs, blazing fast.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded text-sm transition-all">
                Get Protected Now
              </button>
              <button className="px-6 py-3 border border-slate-600 hover:border-cyan-500 text-white hover:text-cyan-400 font-semibold rounded text-sm transition-all">
                Learn More
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-4 pt-2">
              {['No-Logs Policy', 'Blazing Fast', '10+ Locations', 'AES-256 Bit'].map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-400 text-xs">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Shield box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-2xl scale-110" />

              {/* Box */}
              <div className="relative w-72 h-72 lg:w-80 lg:h-80 bg-gradient-to-br from-[#0f1628] to-[#0a1020] border border-cyan-500/30 rounded-2xl flex flex-col items-center justify-center gap-4 shadow-2xl shadow-cyan-500/10">
                {/* Dot grid overlay */}
                <div className="absolute inset-0 rounded-2xl opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(0,212,200,0.3) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />

                {/* Shield */}
                <div className="relative z-10">
                  <div className="w-24 h-24 flex items-center justify-center">
                    <Shield size={80} className="text-cyan-400" strokeWidth={1} />
                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl" />
                  </div>
                </div>

                {/* Label */}
                <div className="relative z-10 text-center">
                  <p className="text-cyan-400 font-bold text-sm tracking-wider">AES-256 Encryption</p>
                  <p className="text-slate-500 text-xs mt-1">Military-grade protection</p>
                </div>

                {/* Corner dots */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-4 right-4 w-3 h-3 bg-cyan-500 rounded-full opacity-60" />
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity }}
                  className="absolute bottom-4 left-4 w-2 h-2 bg-cyan-400 rounded-full opacity-40" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}