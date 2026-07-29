import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Inbox, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS_STYLES = {
  open: { bg: 'rgba(0,212,255,0.15)', color: '#00d4ff', label: 'Open' },
  in_progress: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'In Progress' },
  waiting_customer: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7', label: 'Awaiting You' },
  resolved: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Resolved' },
  closed: { bg: 'rgba(100,116,139,0.15)', color: '#64748b', label: 'Closed' },
};

const PRIORITY_STYLES = {
  low: { color: '#22c55e', label: 'Low' },
  medium: { color: '#f59e0b', label: 'Medium' },
  high: { color: '#ef4444', label: 'High' },
};

const CATEGORY_LABELS = {
  activation: 'Activation',
  connection_dropped: 'Connection',
  slow_speeds: 'Speeds',
  billing: 'Billing',
  device_compatibility: 'Device',
  data_issues: 'Data/eSIM',
  other: 'Other',
};

export default function MyTicketsModal({ onClose }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await base44.entities.SupportTicket.filter({}, '-created_date', 100);
      setTickets(result);
    } catch (err) {
      setError(err?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#0d1420] border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#0d1420]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <Inbox size={18} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">My Support Tickets</h2>
                <p className="text-slate-500 text-xs">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 size={24} className="animate-spin text-cyan-400" />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && tickets.length === 0 && (
              <div className="text-center py-12">
                <Inbox size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No support tickets yet.</p>
                <p className="text-slate-600 text-xs mt-1">Click "Open Support Ticket" to create one.</p>
              </div>
            )}

            {!loading && !error && tickets.length > 0 && (
              <div className="space-y-3">
                {tickets.map((ticket) => {
                  const status = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;
                  const priority = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium;
                  const isOpen = expanded === ticket.id;

                  return (
                    <div
                      key={ticket.id}
                      className="rounded-xl bg-[#060910] border border-white/8 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpanded(isOpen ? null : ticket.id)}
                        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-600 text-xs font-mono">
                              #{ticket.id?.slice(-8).toUpperCase()}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: status.bg, color: status.color }}
                            >
                              {status.label}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                              style={{ borderColor: priority.color + '40', color: priority.color }}
                            >
                              {priority.label}
                            </span>
                          </div>
                          <h4 className="text-white font-semibold text-sm truncate">{ticket.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span>{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                            <span>·</span>
                            <span>{new Date(ticket.created_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ChevronRight
                          size={18}
                          className={`text-slate-600 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                        />
                      </button>

                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="px-4 pb-4 border-t border-white/5"
                        >
                          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line mt-3">
                            {ticket.description}
                          </p>
                          {ticket.resolution_notes && (
                            <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <p className="text-green-400 text-xs font-semibold mb-1">Resolution:</p>
                              <p className="text-slate-300 text-sm">{ticket.resolution_notes}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}