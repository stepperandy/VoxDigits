import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

const testimonials = [
  {
    name: 'Marcus Reed',
    roleKey: 'roleSoftwareEngineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    textKey: 'testimonial1',
  },
  {
    name: 'Elena Petrova',
    roleKey: 'roleDigitalNomad',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    textKey: 'testimonial2',
  },
  {
    name: 'James Okoye',
    roleKey: 'roleBusinessOwner',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    textKey: 'testimonial3',
  },
  {
    name: 'Priya Sharma',
    roleKey: 'roleContentCreator',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    textKey: 'testimonial4',
  },
  {
    name: 'David Chen',
    roleKey: 'roleItConsultant',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    textKey: 'testimonial5',
  },
  {
    name: 'Sofia Almeida',
    roleKey: 'roleFreelanceDesigner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    textKey: 'testimonial6',
  },
];

export default function Testimonials() {
  const { t } = useLanguage();
  return (
    <section className="bg-[#080c18] border-t border-white/5 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Star size={12} className="text-cyan-400 fill-cyan-400" />
            <span className="text-cyan-400 text-xs font-bold tracking-wide">{t('reviewsBadge')}</span>
          </div>
          <h2 className="text-white text-3xl sm:text-4xl font-black tracking-tight">{t('testimonialsTitle')}</h2>
          <p className="text-slate-500 text-sm mt-3 max-w-2xl mx-auto">
            {t('testimonialsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="relative rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <Quote size={28} className="text-cyan-400/15 absolute top-4 right-4" />

              <div className="flex items-center gap-1">
                {Array.from({ length: item.rating }).map((_, idx) => (
                  <Star key={idx} size={13} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t(item.textKey)}"</p>

              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-white text-xs font-bold">{item.name}</p>
                  <p className="text-slate-500 text-[10px]">{t(item.roleKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}