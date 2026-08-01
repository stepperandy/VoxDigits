import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Globe, Shield, Mail } from 'lucide-react';

const OPEN_ROLES = [
  { title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'Mobile Developer (Android/iOS)', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'Security Researcher', dept: 'Security', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Success Specialist', dept: 'Support', location: 'Remote', type: 'Full-time' },
  { title: 'Growth Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time' },
  { title: 'DevOps Engineer', dept: 'Infrastructure', location: 'Remote', type: 'Full-time' },
];

const VALUES = [
  { icon: Shield, title: 'Privacy First', desc: 'We build everything with user privacy as the non-negotiable foundation.' },
  { icon: Zap, title: 'Move Fast', desc: 'We ship quickly, iterate based on user feedback, and never stop improving.' },
  { icon: Globe, title: 'Global Impact', desc: 'Our work protects millions of users across 60+ countries every day.' },
  { icon: Heart, title: 'User Obsessed', desc: 'Every decision starts with what is best for the people who trust us.' },
];

export default function Careers() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Briefcase size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Join <span className="text-cyan-400">VoxVPN</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Help us build a more private, secure, and open internet. We're a fully remote team passionate about protecting digital freedom.</p>
        </motion.div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {VALUES.map((val, i) => {
            const Icon = val.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-white/5 bg-[#0d1120]">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-cyan-400" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{val.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 mb-12">
          <h2 className="text-white font-bold text-lg mb-6">Benefits & Perks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Fully remote — work from anywhere',
              'Competitive salary & equity',
              'Flexible working hours',
              'Unlimited PTO policy',
              'Health, dental & vision insurance',
              'Home office stipend',
              'Annual learning & development budget',
              'Conference attendance support',
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                <span className="text-cyan-400">✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Open roles */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-xl mb-6">Open Positions</h2>
          <div className="space-y-3">
            {OPEN_ROLES.map((role, i) => (
              <motion.a key={i} href={`mailto:info@voxdigits.com?subject=Application: ${role.title}`}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-all group">
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1">{role.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>{role.dept}</span>
                    <span className="flex items-center gap-1"><MapPin size={10} /> {role.location}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {role.type}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))', border: '1px solid rgba(0,212,255,0.2)' }}>
          <h3 className="text-white font-bold text-lg mb-2">Don't see the right role?</h3>
          <p className="text-slate-400 text-sm mb-6">Send us your resume and tell us how you'd like to contribute. We're always looking for exceptional talent.</p>
          <a href="mailto:info@voxdigits.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold transition-all text-sm">
            <Mail size={16} /> info@voxdigits.com
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}