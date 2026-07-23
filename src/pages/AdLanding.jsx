import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Phone, Globe, Shield, Zap, ArrowRight, CheckCircle2,
  Building2, User, Store, Star, Clock, Sparkles, TrendingUp,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const AUDIENCES = [
  {
    icon: Building2,
    title: "For Businesses",
    tagline: "Go global without the overhead",
    color: "#0ea5e9",
    points: [
      "Professional local presence in US, UK, Canada, Australia",
      "Keep your personal number private",
      "Free incoming calls & SMS",
      "Voicemail included",
      "No roaming fees — ever",
      "Setup in under 60 seconds",
    ],
    cta: "Get a Business Number",
    ctaPath: "/VirtualNumbers",
  },
  {
    icon: User,
    title: "For Individuals",
    tagline: "Privacy & savings in your pocket",
    color: "#a78bfa",
    points: [
      "Second number for WhatsApp & Telegram",
      "Protect your personal number online",
      "Receive OTPs & verification codes",
      "No roaming charges when traveling",
      "Works on any device — no SIM swap needed",
      "Plans from just $4.99/month",
    ],
    cta: "Get a Private Number",
    ctaPath: "/VirtualNumbers",
  },
  {
    icon: Store,
    title: "For Resellers",
    tagline: "White-label telecom revenue",
    color: "#10b981",
    points: [
      "Wholesale pricing on virtual numbers",
      "Co-branded client portal",
      "Bulk number management dashboard",
      "Full A2P compliance handled for you",
      "High-margin recurring revenue",
      "No minimum commitments",
    ],
    cta: "Become a Reseller",
    ctaPath: "/ClientOnboarding",
  },
];

const PRICING_HIGHLIGHTS = [
  { country: "🇺🇸 US", price: "$4.99", period: "/mo", popular: true },
  { country: "🇬🇧 UK", price: "$6.99", period: "/mo", popular: false },
  { country: "🇨🇦 CA", price: "$5.99", period: "/mo", popular: false },
  { country: "🇦🇺 AU", price: "$7.99", period: "/mo", popular: false },
];

export default function AdLanding() {
  return (
    <div className="font-sans overflow-x-hidden" style={{ background: "linear-gradient(135deg, #0d1b2f 0%, #001f3f 50%, #00264d 100%)" }}>
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Hero */}
      <section className="relative pt-16 md:pt-24 pb-16 px-6 md:px-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]" style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", color: "#67e8f9" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Limited-Time Launch Offer
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight"
          >
            Your Global Number,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Live in 60 Seconds
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8"
          >
            Private virtual phone numbers in the US, UK, Canada, and Australia.
            No roaming fees. No SIM swaps. Just instant global connectivity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10"
          >
            <Link
              to="/VirtualNumbers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", boxShadow: "0 8px 24px rgba(6,182,212,0.3)" }}
            >
              Get Your Number Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/Pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 border border-white/20"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              View All Pricing
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center text-xs text-gray-500"
          >
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-cyan-400" /> Bank-grade encryption</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400" /> Instant activation</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> No contracts</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-cyan-400" /> 4 countries</span>
          </motion.div>
        </div>
      </section>

      {/* Pricing Highlights */}
      <section className="py-12 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-white mb-2">Starting Prices</h2>
          <p className="text-center text-gray-500 text-sm mb-8">No setup fees on annual plans. Cancel anytime.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PRICING_HIGHLIGHTS.map(function (p) {
              return (
                <div
                  key={p.country}
                  className="rounded-2xl p-5 text-center relative transition-all hover:scale-105"
                  style={{
                    background: p.popular ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.03)",
                    border: p.popular ? "1px solid rgba(6,182,212,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {p.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-bold whitespace-nowrap text-white" style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
                      ★ BEST VALUE
                    </span>
                  )}
                  <p className="text-2xl mb-2">{p.country}</p>
                  <p className="text-2xl font-extrabold text-white">${p.price}</p>
                  <p className="text-xs text-gray-500">{p.period}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Audience Sections */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl font-extrabold text-white mb-2">
            Built for{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Everyone</span>
          </h2>
          <p className="text-center text-gray-400 mb-10">Whether you're closing international deals or protecting your privacy — we've got you covered.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AUDIENCES.map(function (a) {
              var Icon = a.icon;
              return (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="rounded-3xl p-7 flex flex-col"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid " + a.color + "25",
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: a.color + "15", border: "1px solid " + a.color + "30" }}>
                    <Icon className="w-6 h-6" style={{ color: a.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{a.title}</h3>
                  <p className="text-sm text-gray-400 mb-5">{a.tagline}</p>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {a.points.map(function (point) {
                      return (
                        <li key={point} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: a.color }} />
                          {point}
                        </li>
                      );
                    })}
                  </ul>

                  <Link
                    to={a.ctaPath}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, " + a.color + "cc, " + a.color + "88)" }}
                  >
                    {a.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Urgency CTA */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-10 md:p-14" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(6,182,212,0.2)" }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
            <Clock className="w-3.5 h-3.5" />
            Launch Special — Act Now
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Go Global?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of professionals, travelers, and businesses already using VoxTelefony to stay connected worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/VirtualNumbers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", boxShadow: "0 8px 24px rgba(6,182,212,0.3)" }}
            >
              <Phone className="w-4 h-4" /> Get Your Number <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/ESimStore"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 border border-white/20"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <Globe className="w-4 h-4" /> Browse eSIM Plans
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}