import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LogIn, Wifi, Settings, Lock, CreditCard, Smartphone, Clock } from 'lucide-react';

const activityIcons = {
  login: LogIn,
  vpn_connect: Wifi,
  vpn_disconnect: Wifi,
  settings_updated: Settings,
  payment: CreditCard,
  '2fa_enabled': Lock,
  device_added: Smartphone,
};

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await base44.functions.invoke('getActivityLog', {});
      setActivities(res.data?.activities || []);
    } catch (err) {
      console.error('Failed to load activity log:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading activity log...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Account Activity</h2>
      <div className="space-y-2">
        {activities.map((activity, i) => {
          const Icon = activityIcons[activity.type] || Clock;
          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
              <div className="flex-shrink-0 mt-1">
                <Icon size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{activity.description}</p>
                <p className="text-slate-500 text-xs">
                  {activity.device} • IP: {activity.ip}
                </p>
              </div>
              <p className="text-slate-500 text-xs flex-shrink-0">
                {new Date(activity.timestamp).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}