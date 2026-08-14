import React from "react";
import { Star, BadgeCheck, Building2, Quote } from "lucide-react";
import { motion } from "framer-motion";

const businessTestimonials = [
  {
    name: "Jonathan Pierce",
    role: "Chief Operating Officer",
    company: "Meridian Trade Group",
    industry: "Import / Export",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=face",
    quote: "We operate across 14 countries and needed local presence without the overhead. VoxTelefony's US and UK virtual numbers let us appear local to clients everywhere — our inbound inquiry rate jumped 35% in the first quarter.",
    rating: 5,
    metric: "35% more inquiries"
  },
  {
    name: "Amara Okafor",
    role: "Head of Customer Experience",
    company: "Atlas Logistics",
    industry: "Logistics & Freight",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&crop=face",
    quote: "The call forwarding rules are a lifesaver. Our dispatch team in Accra receives calls from London and Toronto clients on local numbers — no roaming fees, no missed shipments. It paid for itself in week one.",
    rating: 5,
    metric: "Zero missed calls"
  },
  {
    name: "Daniel Whitfield",
    role: "Founder & CEO",
    company: "Northwind Consulting",
    industry: "Professional Services",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    quote: "As a consultancy serving international clients, privacy is everything. The dedicated virtual numbers keep our personal lines separate and our communications encrypted. Setup took ten minutes, not ten days.",
    rating: 5,
    metric: "10-min setup"
  },
  {
    name: "Priya Raghunathan",
    role: "VP of Operations",
    company: "Lumen Support Solutions",
    industry: "BPO & Call Centers",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face",
    quote: "We provisioned local numbers for 40 agents across five countries in a single afternoon. The SMS inbox and auto-reply templates cut our response time from hours to minutes. Our CSAT scores have never been higher.",
    rating: 5,
    metric: "5-min avg response"
  },
  {
    name: "Thomas Eriksen",
    role: "Managing Director",
    company: "Nordic Ventures Ltd",
    industry: "Real Estate Investment",
    avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=120&h=120&fit=crop&crop=face",
    quote: "Closing deals across borders means clients need to reach us on a local number they trust. VoxTelefony gave us instant credibility in new markets — we landed two Australian contracts in the first month.",
    rating: 5,
    metric: "2 new market deals"
  },
  {
    name: "Fatima Al-Zahra",
    role: "Director of Communications",
    company: "Sahara Hospitality Group",
    industry: "Hotels & Tourism",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop&crop=face",
    quote: "Our hotels now offer guests a local number for concierge and bookings in every market we serve. The eSIM data plans for our traveling staff eliminated roaming bills entirely. A genuine game-changer.",
    rating: 5,
    metric: "$0 roaming fees"
  }
];

export default function BusinessTestimonials() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a1628 0%, #0d1f38 50%, #0a1628 100%)" }}>
      {/* Subtle background accent */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(0,212,255,0.06) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(249,115,22,0.05) 0%, transparent 40%)" }} />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)" }}>
            <Building2 size={14} className="text-cyan-400" />
            <span className="text-cyan-300 text-xs font-bold tracking-widest">BUSINESS CUSTOMERS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Trusted by Companies Worldwide
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            From startups to enterprises, businesses rely on VoxTelefony to connect with clients globally.
            Here's what our business users have to say.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessTestimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="relative rounded-2xl p-7 flex flex-col gap-4 group"
              style={{ background: "linear-gradient(145deg, #0f1d33 0%, #0a1628 100%)", border: "1px solid rgba(0,212,255,0.12)" }}
            >
              <Quote size={32} className="text-cyan-400/10 absolute top-5 right-5" />

              {/* Top row: rating + verified */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <BadgeCheck size={13} className="fill-emerald-400/20" />
                  VERIFIED
                </span>
              </div>

              {/* Quote */}
              <p className="text-slate-300 text-sm leading-relaxed flex-1">
                "{t.quote}"
              </p>

              {/* Metric badge */}
              <div className="inline-flex items-center self-start px-3 py-1 rounded-lg text-xs font-bold text-cyan-300" style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
                {t.metric}
              </div>

              {/* Person */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{t.name}</p>
                  <p className="text-slate-400 text-xs truncate">{t.role}</p>
                  <p className="text-slate-500 text-[10px] truncate">{t.company} · {t.industry}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
            <div>
              <div className="text-3xl font-black text-white">12,000+</div>
              <p className="text-slate-500 text-xs mt-1">Business Users</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div>
              <div className="text-3xl font-black text-white">4.9<span className="text-amber-400">★</span></div>
              <p className="text-slate-500 text-xs mt-1">Average Rating</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div>
              <div className="text-3xl font-black text-white">180+</div>
              <p className="text-slate-500 text-xs mt-1">Countries Served</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div>
              <div className="text-3xl font-black text-white">99.9%</div>
              <p className="text-slate-500 text-xs mt-1">Uptime SLA</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}