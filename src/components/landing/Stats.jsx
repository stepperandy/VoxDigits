import { motion } from 'framer-motion';
import { Users, Server, Activity, ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

const stats = [
  { icon: Server, number: '20', label: 'statServers', sub: 'statServersSub', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { icon: Globe, number: '4', label: 'statCountries', sub: 'statCountriesSub', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { icon: Users, number: 'Trusted', label: 'statCustomers', sub: 'statCustomersSub', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: Activity, number: '99.9%', label: 'statUptime', sub: 'statUptimeSub', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
];

export default function Stats() {
  const { t } = useLanguage();
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
                <p className="text-white font-semibold text-sm">{t(label)}</p>
                <p className="text-slate-500 text-xs mt-0.5">{t(sub)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}