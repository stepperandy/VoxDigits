import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Loader2 } from 'lucide-react';

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const res = await base44.functions.invoke('getNotificationPreferences', {});
      setPrefs(res.data);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    setSaving(true);
    try {
      const updated = { ...prefs, [key]: !prefs[key] };
      await base44.functions.invoke('updateNotificationPreferences', updated);
      setPrefs(updated);
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading preferences...</div>;

  const toggleOptions = [
    { key: 'email_on_login', label: 'Login notifications', desc: 'Get notified on new logins' },
    { key: 'email_on_payment', label: 'Payment confirmations', desc: 'Receipts for payments' },
    { key: 'email_on_renewal', label: 'Renewal reminders', desc: 'Before subscription renews' },
    { key: 'email_on_updates', label: 'Feature updates', desc: 'New VoxVPN features' },
    { key: 'push_notifications', label: 'Push notifications', desc: 'In-app notifications' },
    { key: 'sms_on_critical', label: 'SMS alerts', desc: 'Critical issues only' },
    { key: 'marketing_emails', label: 'Marketing emails', desc: 'Offers and promotions' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Bell size={24} /> Notification Settings
      </h2>

      <div className="space-y-3">
        {toggleOptions.map(opt => (
          <div key={opt.key} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/3 hover:bg-white/5">
            <div>
              <p className="text-white font-semibold text-sm">{opt.label}</p>
              <p className="text-slate-500 text-xs">{opt.desc}</p>
            </div>
            <button
              onClick={() => handleToggle(opt.key)}
              disabled={saving}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                prefs[opt.key] ? 'bg-cyan-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  prefs[opt.key] ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {saving && (
        <div className="flex items-center gap-2 text-cyan-400 text-sm">
          <Loader2 size={14} className="animate-spin" /> Saving...
        </div>
      )}
    </div>
  );
}