import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Loader2, Send, Lightbulb, Tag, AlertCircle,
  CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = [
  { value: 'activation', label: 'Activation / Setup' },
  { value: 'connection_dropped', label: 'Connection Issues' },
  { value: 'slow_speeds', label: 'Slow Speeds' },
  { value: 'billing', label: 'Billing / Payment' },
  { value: 'device_compatibility', label: 'Device Compatibility' },
  { value: 'data_issues', label: 'Data / eSIM Issues' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

export default function TicketCreateModal({ onClose, onCreated }) {
  const [step, setStep] = useState('describe'); // describe -> ai_suggest -> submit -> done
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [userEmail, setUserEmail] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiError, setAiError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);
  const [showSolution, setShowSolution] = useState(true);
  const debounceRef = useRef(null);

  // Fetch user email on mount
  useEffect(() => {
    base44.auth.me()
      .then(u => setUserEmail(u?.email || ''))
      .catch(() => {});
  }, []);

  const analyzeIssue = async (text) => {
    if (!text || text.trim().length < 15) {
      setAiSuggestion(null);
      return;
    }

    setAiLoading(true);
    setAiError('');

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a VPN support assistant for VoxVPN. A user described their issue:

"${text}"

Analyze this and return:
1. "suggested_category": one of [activation, connection_dropped, slow_speeds, billing, device_compatibility, data_issues, other]
2. "suggested_priority": one of [low, medium, high] — high if they can't connect at all or billing is blocking access
3. "suggested_title": a concise ticket title (max 80 chars)
4. "instant_solution": a helpful step-by-step solution they can try RIGHT NOW (2-4 short steps). Be specific to VPN/eSIM issues. If the issue is account/billing-only and can't be self-solved, say so briefly.
5. "can_self_resolve": boolean — whether the instant_solution likely fixes it without agent help

Respond ONLY as JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggested_category: { type: 'string' },
            suggested_priority: { type: 'string' },
            suggested_title: { type: 'string' },
            instant_solution: { type: 'string' },
            can_self_resolve: { type: 'boolean' },
          },
        },
      });

      const result = res?.output || res;
      setAiSuggestion(result);

      // Auto-fill category and priority from AI
      if (result.suggested_category && CATEGORIES.some(c => c.value === result.suggested_category)) {
        setCategory(result.suggested_category);
      }
      if (result.suggested_priority && ['low', 'medium', 'high'].includes(result.suggested_priority)) {
        setPriority(result.suggested_priority);
      }
      if (result.suggested_title && !title) {
        setTitle(result.suggested_title);
      }
    } catch (err) {
      setAiError('AI analysis unavailable — you can still submit your ticket manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDescriptionChange = (val) => {
    setDescription(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyzeIssue(val), 800);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!title.trim() || !description.trim()) {
      setSubmitError('Please provide a title and description.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const ticket = await base44.entities.SupportTicket.create({
        user_email: userEmail,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: 'open',
      });

      setCreatedTicket(ticket);
      setStep('done');
      onCreated?.();
    } catch (err) {
      setSubmitError(err?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
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
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d1420] border border-cyan-500/20 shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#0d1420]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <Sparkles size={18} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">AI Support Assistant</h2>
                <p className="text-slate-500 text-xs">Describe your issue — we'll suggest a fix instantly</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* DONE STATE */}
            {step === 'done' && createdTicket && (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-green-500" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Ticket Created!</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Your ticket <span className="text-cyan-400 font-mono font-semibold">#{createdTicket.id?.slice(-8).toUpperCase()}</span> has been submitted.
                </p>
                <p className="text-slate-500 text-xs mb-6">
                  Our team will respond within 24 hours. You'll receive updates at {userEmail}.
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors">
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* FORM STATE */}
            {step !== 'done' && (
              <>
                {/* Step 1: Describe issue */}
                <div>
                  <label className="flex items-center gap-2 text-white text-sm font-semibold mb-2">
                    <Sparkles size={15} className="text-cyan-400" /> Describe your issue
                  </label>
                  <textarea
                    value={description}
                    onChange={e => handleDescriptionChange(e.target.value)}
                    rows={5}
                    placeholder="e.g. I can't connect to the Tokyo server. It keeps disconnecting after 10 seconds..."
                    className="w-full px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                    autoFocus
                  />
                  {description.length > 0 && description.length < 15 && (
                    <p className="text-slate-600 text-xs mt-1.5">Keep typing — AI will analyze once you describe a bit more ({description.length}/15)</p>
                  )}
                </div>

                {/* AI Loading */}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-cyan-400 text-sm py-2">
                    <Loader2 size={16} className="animate-spin" /> Analyzing your issue with AI...
                  </div>
                )}

                {/* AI Error */}
                {aiError && !aiLoading && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
                    <AlertCircle size={14} /> {aiError}
                  </div>
                )}

                {/* AI Suggestion */}
                {aiSuggestion && !aiLoading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 overflow-hidden"
                  >
                    {/* Solution header */}
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-cyan-500/10 transition-colors"
                    >
                      <Lightbulb size={16} className="text-cyan-400 flex-shrink-0" />
                      <span className="text-white text-sm font-semibold flex-1">
                        {aiSuggestion.can_self_resolve ? 'Try this instant fix first' : 'AI suggestion'}
                      </span>
                      {showSolution ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </button>

                    {/* Solution body */}
                    {showSolution && (
                      <div className="px-4 pb-4">
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                          {aiSuggestion.instant_solution}
                        </p>
                        {aiSuggestion.can_self_resolve && (
                          <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 rounded-full bg-green-500/15 text-green-400 font-semibold">
                              Likely fixable
                            </span>
                            <span className="text-slate-500">Still need help? Submit the ticket below.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Auto-filled meta */}
                    <div className="px-4 py-3 border-t border-cyan-500/15 flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Tag size={12} className="text-slate-500" />
                        <span className="text-slate-400">Category:</span>
                        <span className="text-white font-medium">
                          {CATEGORIES.find(c => c.value === aiSuggestion.suggested_category)?.label || aiSuggestion.suggested_category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={12} className="text-slate-500" />
                        <span className="text-slate-400">Priority:</span>
                        <span className="text-white font-medium capitalize">{aiSuggestion.suggested_priority}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Ticket Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Short summary of your issue"
                    maxLength={100}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                {/* Category & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Priority</label>
                    <div className="flex gap-2">
                      {PRIORITIES.map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                            priority === p.value
                              ? 'text-white'
                              : 'text-slate-500 border-white/10 hover:border-white/20'
                          }`}
                          style={priority === p.value ? { borderColor: p.color, background: p.color + '15', color: p.color } : {}}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit error */}
                {submitError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {submitError}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #00d4ff, #00b8e6)' }}
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {submitting ? 'Creating ticket...' : 'Submit Ticket'}
                </button>

                <p className="text-center text-slate-600 text-xs">
                  Our team responds within 24 hours. You'll get updates at {userEmail || 'your registered email'}.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}