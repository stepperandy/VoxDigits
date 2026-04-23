import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Smartphone, Download, Shield, Wifi, CheckCircle2, ExternalLink } from 'lucide-react';

const PLATFORMS = [
  {
    id: 'ios',
    label: 'iPhone / iPad',
    emoji: '🍎',
    color: 'border-cyan-500/30 bg-cyan-500/5',
    accent: 'text-cyan-400',
    store: { label: 'App Store', url: 'https://apps.apple.com/app/openvpn-connect/id590379981' },
    steps: [
      { title: 'Download the App', desc: 'Install OpenVPN Connect from the App Store on your iPhone or iPad.' },
      { title: 'Get your VPN Config', desc: 'Log in to your VoxVPN dashboard and download your iOS config file (.ovpn).' },
      { title: 'Import the Config', desc: 'Tap the downloaded .ovpn file. iOS will ask you to open it with OpenVPN — tap "Copy to OpenVPN".' },
      { title: 'Add the Profile', desc: 'In OpenVPN, tap the green "+" button to import the profile. Allow VPN configuration when prompted.' },
      { title: 'Connect', desc: 'Toggle the connection switch to ON. You are now protected with VoxVPN!' },
    ],
  },
  {
    id: 'android',
    label: 'Android',
    emoji: '🤖',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    accent: 'text-emerald-400',
    store: { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=net.openvpn.openvpn' },
    steps: [
      { title: 'Download the App', desc: 'Install OpenVPN Connect from the Google Play Store.' },
      { title: 'Get your VPN Config', desc: 'Log in to your VoxVPN dashboard and download your Android config file (.ovpn).' },
      { title: 'Import the Config', desc: 'Open OpenVPN Connect, tap the "+" button, choose "File" and browse to your downloaded .ovpn file.' },
      { title: 'Add the Profile', desc: 'Tap "Add" to import the profile. Grant VPN permission when Android prompts you.' },
      { title: 'Connect', desc: 'Tap the toggle next to VoxVPN to connect. Look for the key icon in your notification bar — you\'re protected!' },
    ],
  },
];

const TIPS = [
  { icon: Wifi, title: 'Use on Public WiFi', desc: 'Always keep VoxVPN on when using café, hotel, or airport Wi-Fi.' },
  { icon: Shield, title: 'Kill Switch', desc: 'Enable Kill Switch in the app settings to prevent data leaks if VPN drops.' },
  { icon: CheckCircle2, title: 'Verify Your IP', desc: 'Visit whatismyip.com after connecting to confirm your IP has changed.' },
];

export default function MobileSetupGuide() {
  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-4">
            <Smartphone size={12} /> Mobile VPN Setup
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Set Up VoxVPN on <span className="text-cyan-400">Mobile</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Get protected on your phone in under 3 minutes. Follow the step-by-step guide for your device below.
          </p>
        </motion.div>

        {/* Platform guides */}
        <div className="space-y-8">
          {PLATFORMS.map((platform, pi) => (
            <motion.div key={platform.id}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.1 }}
              className={`rounded-2xl border ${platform.color} p-6 md:p-8`}>

              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{platform.emoji}</div>
                <div>
                  <h2 className="text-xl font-black text-white">{platform.label}</h2>
                  <a href={platform.store.url} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${platform.accent} hover:opacity-80 transition-opacity mt-0.5`}>
                    <Download size={11} /> Get on {platform.store.label} <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                {platform.steps.map((step, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: pi * 0.1 + i * 0.07 }}
                    className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-black font-black text-sm flex-shrink-0 mt-0.5
                      ${platform.id === 'ios' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-gradient-to-br from-emerald-400 to-green-500'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <p className="text-white font-bold text-sm mb-1">{step.title}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10">
          <h3 className="text-white font-bold text-lg mb-4">Pro Tips</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TIPS.map((tip) => {
              const Icon = tip.icon;
              return (
                <div key={tip.title} className="p-5 rounded-xl border border-white/5 bg-[#0d1120]">
                  <Icon size={20} className="text-cyan-400 mb-3" />
                  <p className="text-white font-semibold text-sm mb-1">{tip.title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{tip.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="mt-10 rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Need your VPN config file?</h3>
          <p className="text-slate-400 text-sm mb-5">Log in to your dashboard to download your personal config.</p>
          <a href="/dashboard"
            className="inline-block px-7 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full text-sm transition-all">
            Go to Dashboard →
          </a>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}