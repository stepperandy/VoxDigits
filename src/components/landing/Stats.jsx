import { motion } from 'framer-motion';
import { Users, Server, Activity, ShieldCheck } from 'lucide-react';

const stats = [
  { icon: Users, number: '2,500+', label: 'Active Users', sub: 'and growing daily', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { icon: Server, number: '10+', label: 'Server Locations', sub: 'across 4 continents', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },

  { icon: Activity, number: '99.8%', label: 'Uptime SLA', sub: 'guaranteed reliability', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: ShieldCheck, number: '0 Logs', label: 'Data Stored', sub: 'strict no-logs policy', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
];

export default function Stats() {
  return (
    <div className="bg-[#06080f] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, number, label, sub, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-5 rounded-2xl border ${bg} flex flex-col gap-3`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} border`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className={`text-3xl font-black ${color} leading-none mb-1`}>{number}</p>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}