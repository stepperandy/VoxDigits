import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  ArrowLeft, Smartphone, Download, Shield, Lock, UserCheck,
  Settings, Wifi, CheckCircle2, Loader2, ExternalLink, Apple,
  ChevronRight, KeyRound, Fingerprint, AppWindow
} from 'lucide-react';

const STEPS = [
  {
    icon: Download,
    title: 'Download VoxVPN',
    subtitle: 'From the App Store',
    description: 'Open the App Store on your iPhone or iPad and search for "VoxVPN", or tap the button below to go straight to the listing.',
    accent: '#a78bfa',
  },
  {
    icon: AppWindow,
    title: 'Install & Open',
    subtitle: 'Launch the app',
    description: 'Tap Get to install, then open VoxVPN from your home screen. The app icon features the VoxVPN shield logo.',
    accent: '#8b5cf6',
  },
  {
    icon: UserCheck,
    title: 'Sign In',
    subtitle: 'Use your VoxVPN credentials',
    description: 'Enter the email and password you used to subscribe. Your same account works across all platforms — Windows, Android, and iOS.',
    accent: '#7c3aed',
  },
  {
    icon: Shield,
    title: 'Allow VPN Configuration',
    subtitle: 'iOS permission prompt',
    description: 'When you connect for the first time, iOS will show "VoxVPN Would Like to Add VPN Configurations". Tap Allow to let VoxVPN create the secure VPN profile.',
    accent: '#6d28d9',
  },
  {
    icon: Fingerprint,
    title: 'Authenticate',
    subtitle: 'Face ID, Touch ID, or Passcode',
    description: 'Confirm with Face ID, Touch ID, or your device passcode. This authorizes the VPN profile to be added to your device securely.',
    accent: '#5b21b6',
  },
  {
    icon: Settings,
    title: 'Trust the Profile',
    subtitle: 'Settings → General → VPN & Device Management',
    description: 'If iOS blocks the connection, go to Settings → General → VPN & Device Management, tap the VoxVPN profile, and select Trust. This is standard for all VPN apps on iOS.',
    accent: '#4c1d95',
  },
  {
    icon: Wifi,
    title: 'Connect & Browse Securely',
    subtitle: 'You\'re protected!',
    description: 'Open VoxVPN, select a server location, and tap Connect. Your connection is now encrypted with AES-256 — browse, stream, and work privately.',
    accent: '#00d4ff',
  },
];

export default function IOSSetup() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(me => { if (me) setUser(me); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Back link */}
        <Link to="/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm font-medium transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', boxShadow: '0 0 30px rgba(167,139,250,0.15)' }}>
              <Apple size={32} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">VoxVPN for iOS</h1>
              <p className="text-slate-400 text-sm mt-0.5">Install & configure the VPN profile on your iPhone or iPad</p>
            </div>
          </div>

          {/* App Store button */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <a
              href="https://apps.apple.com/app/voxvpn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', boxShadow: '0 8px 30px rgba(124,58,237,0.3)' }}
            >
              <Apple size={20} />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-medium opacity-80">Download on the</div>
                <div className="text-base font-black">App Store</div>
              </div>
              <ExternalLink size={14} className="ml-1 opacity-70" />
            </a>
            <span className="text-slate-500 text-xs">Requires iOS 14.0 or later · iPhone, iPad & iPod touch</span>
          </div>
        </motion.div>

        {/* Credentials reminder */}
        {!loading && user && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl border border-violet-500/20 bg-[#0d1420] p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <KeyRound size={14} className="text-violet-400" />
              </div>
              <h3 className="text-white font-bold text-sm">Your Sign-In Credentials</h3>
            </div>
            <p className="text-slate-400 text-xs mb-3">Use this email to sign in to the VoxVPN iOS app:</p>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-slate-500 text-xs w-12 flex-shrink-0">Email</span>
              <span className="text-white text-xs font-mono font-semibold">{user.email}</span>
            </div>
            <p className="text-slate-600 text-[10px] mt-2">Use the same password you set when you signed up. <Link to="/reset-password" className="text-violet-400 hover:text-violet-300">Forgot password?</Link></p>
          </motion.div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + idx * 0.05 }}
                className="relative rounded-2xl border bg-[#0d1420] p-5 flex gap-4"
                style={{ borderColor: `${step.accent}22` }}
              >
                {/* Step number badge */}
                <div className="flex-shrink-0">
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.accent}15`, border: `1px solid ${step.accent}40` }}>
                    <Icon size={22} style={{ color: step.accent }} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                      style={{ background: step.accent }}>
                      {idx + 1}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-bold text-sm">{step.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${step.accent}15`, color: step.accent }}>
                      {step.subtitle}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.description}</p>
                </div>

                {/* Connecting line */}
                {idx < STEPS.length - 1 && (
                  <div className="absolute left-[2.6rem] top-[4.5rem] bottom-[-0.75rem] w-px" style={{ background: `${step.accent}20` }} />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Trust banner */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-8 rounded-2xl border border-cyan-500/20 p-5 flex items-start gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,80,160,0.04))' }}>
          <Lock size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-bold text-sm mb-1">Why does iOS ask to trust the profile?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Apple requires all VPN apps to install a configuration profile that manages your network connection.
              This is a standard security measure — VoxVPN never sees or stores your device passcode, and the profile
              only routes traffic through our encrypted servers. You can remove it anytime in Settings → General →
              VPN & Device Management.
            </p>
          </div>
        </motion.div>

        {/* Troubleshooting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="mt-4 rounded-2xl border border-white/5 bg-[#0d1420] p-5">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <ChevronRight size={14} className="text-violet-400" /> Troubleshooting
          </h3>
          <div className="space-y-2.5">
            {[
              { q: '"Untrusted Enterprise Developer" error', a: 'Go to Settings → General → VPN & Device Management → tap VoxVPN → Trust.' },
              { q: 'VPN won\'t connect after allowing', a: 'Toggle the VPN off and on in Settings, or restart your iPhone, then reconnect from the app.' },
              { q: 'App says "subscription required"', a: 'Make sure you signed in with the same email you used to subscribe. Check your dashboard for your active plan.' },
              { q: 'Profile disappeared after iOS update', a: 'iOS updates can reset VPN profiles. Open VoxVPN and tap Connect again — you may need to re-allow the configuration.' },
            ].map((item, idx) => (
              <details key={idx} className="group rounded-lg" style={{ background: '#060c1a', border: '1px solid rgba(255,255,255,0.05)' }}>
                <summary className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer list-none">
                  <span className="text-slate-300 text-xs font-semibold">{item.q}</span>
                  <ChevronRight size={14} className="text-slate-600 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="px-3 pb-3 text-slate-500 text-xs leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </motion.div>

        {/* Help link */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs mb-2">Still need help installing VoxVPN on iOS?</p>
          <Link to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all"
            style={{ borderColor: 'rgba(0,212,255,0.3)', color: '#00d4ff', background: 'rgba(0,212,255,0.05)' }}>
            <CheckCircle2 size={14} /> Contact Support
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}