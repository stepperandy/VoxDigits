import React from "react";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Founder, Mitchell Consulting",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    quote:
      "VoxTelefony's US virtual number let me run my consulting firm from abroad without clients ever knowing. Call forwarding keeps me reachable on every device — it feels like I never left home.",
  },
  {
    name: "James Okafor",
    role: "Operations Lead, Swiftlogix",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    quote:
      "We issue local numbers for every market we enter. Setup took minutes, and our support team now answers customers on numbers they actually trust. Conversions on incoming calls jumped noticeably.",
  },
  {
    name: "Priya Nair",
    role: "CEO, BloomRetail",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    quote:
      "Separate numbers for sales, support, and billing — all routed to the same team. VoxTelefony gave us a professional presence in three countries for a fraction of what we used to spend.",
  },
];

export default function ClientTestimonials() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(180deg, #0a1f33 0%, #0d2b4a 100%)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-4">
            Client Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Trusted by businesses worldwide
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Hear how teams use VoxTelephony virtual numbers to stay connected with customers across borders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-500/40 transition-colors flex flex-col"
            >
              <Quote className="w-8 h-8 text-cyan-500/40 mb-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-200 text-sm leading-relaxed mb-6 flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30 bg-gray-700"
                />
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}