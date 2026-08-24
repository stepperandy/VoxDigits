import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

export default function SupportWidget() {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getSupportTickets', {});
      setTickets(res.data?.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subject || !message) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await base44.functions.invoke('createSupportTicket', {
        subject,
        category,
        message,
        priority: 'normal',
      });
      setSubject('');
      setMessage('');
      setShowForm(false);
      loadTickets();
    } catch (err) {
      console.error('Failed to create ticket:', err);
      alert('Failed to create support ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/3">
      <h3 className="text-white font-bold flex items-center gap-2">
        <MessageCircle size={16} /> Support
      </h3>

      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
        >
          <Send size={14} /> Contact Support
        </Button>
      ) : (
        <div className="space-y-3 p-3 rounded-lg bg-white/5">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm"
          >
            <option value="general">General</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
          </select>

          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-white placeholder:text-slate-500"
          />

          <textarea
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm focus:outline-none"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit'}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {tickets.length > 0 && (
        <div className="pt-3 border-t border-white/10">
          <p className="text-slate-400 text-sm mb-2">Your Tickets:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tickets.slice(0, 5).map(ticket => (
              <div key={ticket.id} className="p-2 rounded-lg bg-white/5 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">{ticket.subject}</p>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    ticket.status === 'open' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}