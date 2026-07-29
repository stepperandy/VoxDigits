import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, MessageSquare, Headphones, FileText,
  Users, ChevronRight, ExternalLink, Sparkles
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import TicketCreateModal from '@/components/support/TicketCreateModal';
import MyTicketsModal from '@/components/support/MyTicketsModal';

export default function HelpSupport() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [ticketCount, setTicketCount] = useState(null);

  useEffect(() => {
    // Fetch existing ticket count for badge
    base44.entities.SupportTicket.filter({}, '-created_date', 100)
      .then(tickets => setTicketCount(tickets.length))
      .catch(() => setTicketCount(0));
  }, []);

  const mainCards = [
    {
      title: 'Documentation',
      desc: 'Explore comprehensive guides, tutorials, FAQs, and best practices for using VoxVPN.',
      icon: BookOpen,
      accent: '#f26622',
      bg: 'rgba(242,102,34,0.08)',
      border: 'rgba(242,102,34,0.30)',
      action: () => window.open('/help-center', '_self'),
      cta: 'Get Started',
      external: true,
    },
    {
      title: 'Discord Community',
      desc: 'Connect with fellow users and get instant help from our active community.',
      icon: MessageSquare,
      accent: '#1b9e8b',
      bg: 'rgba(27,158,139,0.08)',
      border: 'rgba(27,158,139,0.30)',
      action: () => window.open('https://discord.gg/voxvpn', '_blank'),
      cta: 'Get Started',
      external: true,
    },
    {
      title: 'Open Support Ticket',
      desc: 'Submit a detailed support ticket and get personalized assistance from our team.',
      icon: Headphones,
      accent: '#00d4ff',
      bg: 'rgba(0,212,255,0.06)',
      border: 'rgba(0,212,255,0.25)',
      action: () => setShowTicketModal(true),
      cta: 'Get Started',
      external: false,
      badge: 'AI-Assisted',
    },
  ];

  const quickActions = [
    {
      title: 'My Support Tickets',
      desc: 'View and manage your existing support tickets',
      icon: FileText,
      action: () => setShowTicketsModal(true),
      count: ticketCount,
    },
    {
      title: 'Community Forum',
      desc: 'Join our community for tips, discussions, and peer support',
      icon: Users,
      action: () => window.open('https://www.voxtelefony.com', '_blank'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-white font-black text-4xl sm:text-5xl mb-3">Help &amp; Support</h1>
            {/* Gradient underline */}
            <div className="mx-auto w-32 h-1 rounded-full mb-4"
              style={{ background: 'linear-gradient(90deg, #f26622, #1b9e8b)' }} />
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Get the help you need to stay secure and connected with VoxVPN
            </p>
          </div>

          {/* Main cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {mainCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={card.action}
                  className="group relative rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                  }}
                >
                  {/* External link icon */}
                  {card.external && (
                    <ExternalLink size={16} className="absolute top-5 right-5 text-slate-600 group-hover:text-white transition-colors" />
                  )}

                  {/* Badge */}
                  {card.badge && (
                    <span className="absolute top-5 right-5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: card.accent + '20', color: card.accent }}>
                      <Sparkles size={10} /> {card.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: card.accent + '15' }}>
                    <Icon size={24} style={{ color: card.accent }} />
                  </div>

                  {/* Text */}
                  <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">{card.desc}</p>

                  {/* CTA */}
                  <span className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                    style={{ color: card.accent }}>
                    {card.cta} <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-[#0d1420] border border-white/8 p-6 sm:p-8">
            <h2 className="text-white font-bold text-xl mb-1">Quick Actions</h2>
            <p className="text-slate-500 text-sm mb-6">Manage your support experience</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={action.action}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#060910] border border-white/8 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold text-sm">{action.title}</h4>
                        {action.count !== null && action.count !== undefined && (
                          <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-bold">
                            {action.count}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">{action.desc}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI hint */}
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs">
            <Sparkles size={14} className="text-cyan-400" />
            <span>AI-powered support — describe your issue and get instant suggestions before submitting</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTicketModal && (
        <TicketCreateModal
          onClose={() => setShowTicketModal(false)}
          onCreated={() => {
            setTicketCount(prev => (prev === null ? 1 : prev + 1));
          }}
        />
      )}
      {showTicketsModal && (
        <MyTicketsModal onClose={() => setShowTicketsModal(false)} />
      )}

      <Footer />
    </div>
  );
}