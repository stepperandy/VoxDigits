import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Zap, Gift, X } from 'lucide-react';

const typeIcons = {
  alert: AlertCircle,
  news: Zap,
  promo: Gift,
};

export default function AnnouncementsWidget() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await base44.functions.invoke('getAnnouncements', {});
      setAnnouncements(res.data?.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = (id) => {
    setDismissed([...dismissed, id]);
  };

  const filtered = announcements.filter(a => !dismissed.includes(a.id));

  if (loading || filtered.length === 0) return null;

  return (
    <div className="space-y-2">
      {filtered.map(ann => {
        const Icon = typeIcons[ann.type] || AlertCircle;
        const colors = {
          alert: 'border-red-500/20 bg-red-500/10 text-red-400',
          news: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
          promo: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
        };

        return (
          <div key={ann.id} className={`flex items-start gap-3 p-3 rounded-lg border ${colors[ann.type]}`}>
            <Icon size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{ann.title}</p>
              <p className="text-xs opacity-80">{ann.message}</p>
            </div>
            <button
              onClick={() => dismiss(ann.id)}
              className="flex-shrink-0 hover:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}