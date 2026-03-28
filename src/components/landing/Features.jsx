import { motion } from 'framer-motion';
import { Lock, Zap, Shield, Globe, AlertCircle, Smartphone, Wifi, GitBranch } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'No-Logs Policy',
    description: 'We never record your browsing activity, IP address, or DNS queries.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized routing across global infrastructure ensures minimal speed loss.'
  },
  {
    icon: Shield,
    title: 'AES-256 Encryption',
    description: 'Military-grade encryption protects every byte of your data from hackers and ISPs.'
  },
  {
    icon: Globe,
    title: 'Bypass Geo-Blocks',
    description: 'Access Netflix, BBC iPlayer, Hulu and any restricted content from anywhere.'
  },
  {
    icon: AlertCircle,
    title: 'Kill Switch',
    description: 'If your VPN drops, our kill switch instantly cuts your internet to protect you.'
  },
  {
    icon: Smartphone,
    title: 'All Your Devices',
    description: 'Windows, macOS, iOS, Android, Linux and more. One subscription covers all.'
  },
  {
    icon: Wifi,
    title: 'Public WiFi Protection',
    description: 'Stay safe on coffee shop and airport WiFi with automatic protection.'
  },
  {
    icon: GitBranch,
    title: 'Split Tunneling',
    description: 'Choose which apps use the VPN and which use your normal connection.'
  }
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Built for Real Privacy
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Every feature is designed with one goal: keeping you private, safe, and unrestricted online.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="group p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                    <Icon size={24} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}