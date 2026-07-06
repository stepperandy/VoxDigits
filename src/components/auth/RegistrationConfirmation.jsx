import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, CheckCircle2, Download, Zap, LogOut, Loader2,
  Mail, ArrowRight, Sparkles
} from 'lucide-react';

export default function RegistrationConfirmation() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(me => { if (me) setUser(me); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center">
        <Loader2 size={24} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b10] flex flex-col">
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
            alt="VoxVPN"
            className="h-12 w-auto"
          />
        </a>
        {user && (
          <button
            onClick={() => base44.auth.logout('/')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        )}
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Success shield */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center mb-6"
          >
            <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(6,182,212,0.15), rgba(6,182,212,0.02))',
                border: '2px solid rgba(6,182,212,0.3)',
                boxShadow: '0 0 40px rgba(6,182,212,0.15)',
              }}
            >
              <ShieldCheck size={44} className="text-cyan-400" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 12 }}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan-400 flex items-center justify-center"
              >
                <CheckCircle2 size={16} className="text-[#0a0b10]" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-black text-white mb-2">Account Created!</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Welcome to VoxVPN{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}. Your account is ready.
            </p>
          </motion.div>

          {/* Email confirmation card */}
          {user?.email && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
              style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <Mail size={14} className="text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Registered Email</p>
                <p className="text-white text-sm font-mono truncate">{user.email}</p>
              </div>
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 ml-auto" />
            </motion.div>
          )}

          {/* Next steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-white/5 bg-[#0d1120] p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-cyan-400" />
              <p className="text-white text-sm font-bold">Next Steps</p>
            </div>
            <ol className="space-y-3">
              {[
                { text: 'Choose a subscription plan', highlight: 'subscription plan', link: '/pricing' },
                { text: 'Download the VoxVPN app for your device', highlight: 'VoxVPN app', link: '/setup' },
                { text: 'Connect and browse securely', highlight: 'Connect', link: null },
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)' }}>
                    {idx + 1}
                  </span>
                  <span className="text-slate-400 text-xs leading-relaxed">
                    {step.link ? (
                      <Link to={step.link} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                        {step.highlight}
                      </Link>
                    ) : (
                      <span className="text-cyan-400 font-semibold">{step.highlight}</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* CTA — choose a plan */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Link
              to="/pricing?new=1"
              className="w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2
                bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20"
            >
              <Zap size={18} /> Choose Your Plan
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/setup"
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                border border-white/10 text-slate-300 hover:text-white hover:border-white/20 bg-transparent"
            >
              <Download size={16} /> Go to Setup Portal
            </Link>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-3 text-center">
        <p className="text-slate-700 text-xs">VoxVPN — Military-grade privacy</p>
      </footer>
    </div>
  );
}