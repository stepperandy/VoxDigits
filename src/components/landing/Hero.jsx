import { motion } from 'framer-motion';
import { Shield, CheckCircle } from 'lucide-react';

export default function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(34, 197, 94, 0.05) 25%, rgba(34, 197, 94, 0.05) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.05) 75%, rgba(34, 197, 94, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 197, 94, 0.05) 25%, rgba(34, 197, 94, 0.05) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.05) 75%, rgba(34, 197, 94, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10">
              <CheckCircle size={16} className="text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">10,000+ users protected worldwide</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
              Your Privacy, <br />
              <span className="text-cyan-400">Our Priority</span>.
            </h1>

            {/* Description */}
            <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
              VoxVPN encrypts your connection, hides your identity, and unlocks the internet — on every device, everywhere in the world.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-3 bg-cyan-500 text-slate-950 font-semibold rounded-full hover:bg-cyan-400 transition-all transform hover:scale-105">
                Get Protected Now
              </button>
              <button className="px-8 py-3 border border-slate-500 text-white font-semibold rounded-full hover:border-cyan-500 hover:text-cyan-400 transition-colors">
                See How It Works
              </button>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-cyan-400" />
                <span className="text-slate-300">No-Logs Policy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-cyan-400" />
                <span className="text-slate-300">Blazing Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-cyan-400" />
                <span className="text-slate-300">10+ Locations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-cyan-400" />
                <span className="text-slate-300">AES-256 Bit</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-96 lg:h-full flex items-center justify-center"
          >
            <div className="relative w-64 h-64 lg:w-80 lg:h-80">
              {/* Animated background circles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border border-cyan-500/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8 border border-cyan-500/10 rounded-full"
              />

              {/* Shield Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-3xl blur-2xl" />
                  <Shield size={200} className="text-cyan-400 relative z-10" strokeWidth={0.5} />
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-12 right-8 w-16 h-16 bg-cyan-500/10 rounded-lg border border-cyan-500/30 flex items-center justify-center"
              >
                <span className="text-cyan-400 text-xs font-bold">AES-256</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-12 left-8 w-12 h-12 bg-cyan-500/10 rounded-lg border border-cyan-500/30"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}