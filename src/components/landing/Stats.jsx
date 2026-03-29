import { motion } from 'framer-motion';

const stats = [
  { number: '2,500+', label: 'Active Users' },
  { number: '10+', label: 'Server Locations' },
  { number: '99.8%', label: 'Uptime' },
  { number: '0 Logs', label: 'Privacy Logs' },
];

export default function Stats() {
  return (
    <div className="bg-[#080c18] border-y border-white/5 py-10 px-4 sm:px-6 lg:px-8">
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
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{stat.number}</div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}