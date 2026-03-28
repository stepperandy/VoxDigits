import { motion } from 'framer-motion';
import { Signal } from 'lucide-react';

const servers = [
  { flag: '🇬🇧', name: 'London', code: 'GB', latency: '134ms', status: 'Online' },
  { flag: '🇺🇸', name: 'Los Angeles', code: 'US', latency: '7ms', status: 'Online' },
  { flag: '🇺🇸', name: 'New York', code: 'US', latency: '12ms', status: 'Online' },
  { flag: '🇸🇬', name: 'Singapore', code: 'SG', latency: '85ms', status: 'Online' },
  { flag: '🇳🇱', name: 'Amsterdam', code: 'NL', latency: '45ms', status: 'Online' },
];

export default function Servers() {
  return (
    <section id="servers" className="bg-slate-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Global Server Network
          </h2>
          <p className="text-lg text-slate-400">
            Ultra-fast servers across 5+ locations — updated in real-time
          </p>
        </motion.div>

        {/* Servers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {servers.map((server, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-cyan-500/50 transition-all duration-300"
            >
              {/* Status Indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{server.flag}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-400 font-medium">{server.status}</span>
                </div>
              </div>

              {/* Server Info */}
              <h3 className="text-white font-semibold mb-1">{server.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{server.code}</p>

              {/* Latency */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <Signal size={14} className="text-cyan-400" />
                <span className="text-slate-300 text-sm">{server.latency}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}