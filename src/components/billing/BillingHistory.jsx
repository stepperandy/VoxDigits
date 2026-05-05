import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BillingHistory() {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingHistory();
  }, []);

  const loadBillingHistory = async () => {
    try {
      const res = await base44.functions.invoke('getBillingHistory', {});
      setBilling(res.data);
    } catch (err) {
      console.error('Failed to load billing history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/3">
      <h3 className="text-white font-bold">Billing History</h3>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2 rounded-lg bg-white/5">
          <p className="text-slate-500 text-xs">Next Billing Date</p>
          <p className="text-white font-bold text-sm">
            {new Date(billing?.next_billing_date).toLocaleDateString()}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <p className="text-slate-500 text-xs">Plan</p>
          <p className="text-white font-bold text-sm">{billing?.subscription?.plan}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <p className="text-slate-500 text-xs">Total Spent</p>
          <p className="text-white font-bold text-sm">${billing?.total_spent.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-slate-400 text-sm font-semibold">Recent Invoices</p>
        {billing?.invoices?.map(invoice => (
          <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-slate-500" />
              <div>
                <p className="text-white text-sm">{new Date(invoice.date).toLocaleDateString()}</p>
                <p className="text-slate-500 text-xs">{invoice.plan} Plan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white font-bold">${invoice.amount.toFixed(2)}</p>
                <p className="text-green-400 text-xs">{invoice.status}</p>
              </div>
              <a href={invoice.download_url} className="text-cyan-400 hover:text-cyan-300">
                <Download size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}