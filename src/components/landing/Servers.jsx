import { motion } from 'framer-motion';
import { Signal } from 'lucide-react';

const servers = [
  { flag: '🇬🇧', name: 'London', code: 'United Kingdom', latency: '134ms', load: '45%' },
  { flag: '🇺🇸', name: 'Los Angeles', code: 'United States', latency: '7ms', load: '62%' },
  { flag: '🇺🇸', name: 'New York', code: 'United States', latency: '12ms', load: '38%' },
  { flag: '🇸🇬', name: 'Singapore', code: 'Singapore', latency: '85ms', load: '51%' },
  { flag: '🇳🇱', name: 'Amsterdam', code: 'Netherlands', latency: '45ms', load: '29%' },
];

export default function Servers() {
  return (
    <section id="servers" className="bg-[#080c18] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Our Network</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Global Server Network</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Ultra-fast servers across 5+ locations — updated in real-time. Low latency, high reliability.
          </p>
        </motion.div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-5 gap-4 px-4 mb-3 text-xs text-slate-600 uppercase tracking-wider">
          <span>Location</span>
          <span>Country</span>
          <span>Status</span>
          <span>Latency</span>
          <span>Server Load</span>
        </div>

        <div className="space-y-2">
          {servers.map((server, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center px-4 py-4 rounded-xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{server.flag}</span>
                <span className="text-white font-medium text-sm">{server.name}</span>
              </div>
              <span className="text-slate-400 text-sm hidden md:block">{server.code}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-cyan-400 text-xs font-medium">Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Signal size={13} className="text-slate-500" />
                <span className="text-slate-300 text-sm">{server.latency}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full max-w-20">
                  <div
                    className="h-1.5 bg-cyan-500 rounded-full"
                    style={{ width: server.load }}
                  />
                </div>
                <span className="text-slate-500 text-xs">{server.load}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}