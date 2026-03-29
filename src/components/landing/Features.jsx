import { Lock, Zap, Shield, Globe, AlertCircle, Smartphone, Wifi, GitBranch } from 'lucide-react';

const features = [
  { icon: Lock, title: 'No-Logs Policy', description: 'We never record your browsing activity, IP address, or DNS queries.' },
  { icon: Zap, title: 'Lightning Fast', description: 'Optimized routing across global infrastructure ensures minimal speed loss.' },
  { icon: Shield, title: 'AES-256 Encryption', description: 'Military-grade encryption protects every byte of your data.' },
  { icon: Globe, title: 'Bypass Geo-Blocks', description: 'Access Netflix, BBC iPlayer, Hulu and any restricted content.' },
  { icon: AlertCircle, title: 'Kill Switch', description: 'If your VPN drops, our kill switch instantly cuts your internet.' },
  { icon: Smartphone, title: 'All Your Devices', description: 'Windows, macOS, iOS, Android, Linux and more.' },
  { icon: Wifi, title: 'Public WiFi Protection', description: 'Stay safe on coffee shop and airport WiFi automatically.' },
  { icon: GitBranch, title: 'Split Tunneling', description: 'Choose which apps use the VPN and which use your normal connection.' },
];

export default function Features() {
  return (
    <section id="features" className="bg-[#080c18] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Why VoxVPN</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for Real Privacy</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Every feature is designed with one goal: keeping you private, safe, and unrestricted online.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group p-5 rounded-xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/30 hover:bg-[#0f1628] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Icon size={20} className="text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}