import { motion } from 'framer-motion';

const stats = [
  { number: '2,500+', label: 'Active Users' },
  { number: '10+', label: 'Server Locations' },
  { number: '99.8%', label: 'Uptime' },
  { number: '0', label: 'Privacy Logs' }
];

export default function Stats() {
  return (
    <div className="bg-slate-900/50 border-y border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-slate-400 text-sm sm:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}