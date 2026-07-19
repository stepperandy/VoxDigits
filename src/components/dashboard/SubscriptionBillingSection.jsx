import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  CreditCard, Loader2, RefreshCw, Zap, FileText, Download,
  CheckCircle2, AlertCircle, Calendar, DollarSign, ExternalLink, Ban,
} from 'lucide-react';

export default function SubscriptionBillingSection({ subscription, userEmail }) {
  const [portalLoading, setPortalLoading] = useState(false);
  const [billing, setBilling] = useState(null);
  const [billingLoading, setBillingLoading] = useState(true);

  const hasAccess = subscription && ['active', 'trial'].includes(subscription.status);

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    try {
      const res = await base44.functions.invoke('getBillingHistory', {});
      setBilling(res?.data || res);
    } catch {
      // non-fatal — billing may not exist yet
    } finally {
      setBillingLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await base44.functions.invoke('createStripePortal', {});
      if (res?.data?.url || res?.url) {
        window.open(res?.data?.url || res?.url, '_blank');
      } else {
        window.location.href = '/pricing';
      }
    } catch {
      window.location.href = '/pricing';
    } finally {
      setPortalLoading(false);
    }
  };

  const renewalDate = subscription?.renewal_date
    ? new Date(subscription.renewal_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-2xl border bg-[#0d1420] p-6 mb-5"
      style={{ borderColor: 'rgba(139,92,246,0.15)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <CreditCard size={16} className="text-violet-400" />
        </div>
        <h3 className="text-white font-bold text-sm">Subscription &amp; Billing</h3>
        <span className="ml-auto text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
          Manage your plan
        </span>
      </div>

      {/* Billing summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <BillingTile
          icon={DollarSign}
          label="Current Plan"
          value={subscription?.plan || '—'}
          color="#00d4ff"
        />
        <BillingTile
          icon={CheckCircle2}
          label="Status"
          value={subscription?.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : '—'}
          color={hasAccess ? '#10b981' : '#f43f5e'}
        />
        <BillingTile
          icon={Calendar}
          label={subscription?.status === 'expired' || subscription?.status === 'cancelled' ? 'Expired' : 'Renewal'}
          value={renewalDate || '—'}
          color="#a78bfa"
        />
        <BillingTile
          icon={RefreshCw}
          label="Billing Cycle"
          value={subscription?.billing_cycle ? subscription.billing_cycle.charAt(0).toUpperCase() + subscription.billing_cycle.slice(1) : '—'}
          color="#fbbf24"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-5">
        {subscription ? (
          <button
            onClick={openBillingPortal}
            disabled={portalLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
          >
            {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
            Manage Billing Portal
          </button>
        ) : (
          <Link
            to="/pricing"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
          >
            <Zap size={14} /> Choose a Plan
          </Link>
        )}

        <Link
          to="/pricing"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 text-sm font-bold hover:bg-amber-500/10 transition-all"
          style={{ background: 'rgba(251,191,36,0.05)' }}
        >
          <Zap size={14} /> Upgrade Plan
        </Link>

        {hasAccess && (
          <button
            onClick={openBillingPortal}
            disabled={portalLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-400 text-sm font-semibold hover:bg-rose-500/10 transition-all"
          >
            <Ban size={14} /> Cancel
          </button>
        )}
      </div>

      {/* Help note */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg mb-5"
        style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)' }}>
        <AlertCircle size={12} className="text-violet-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-400 text-[11px] leading-relaxed">
          The billing portal lets you update your payment method, change billing cycle,
          view invoices, and cancel your subscription — all managed securely through Stripe.
        </p>
      </div>

      {/* Billing history / invoices */}
      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-slate-500" />
            <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Billing History</p>
          </div>
          <span className="text-slate-600 text-[10px]">
            {billing?.invoices?.length || 0} invoice{(billing?.invoices?.length || 0) === 1 ? '' : 's'}
          </span>
        </div>

        {billingLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={18} className="animate-spin text-slate-600" />
          </div>
        ) : billing?.invoices?.length > 0 ? (
          <div className="space-y-2">
            {billing.invoices.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                style={{ background: '#0a1020', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    <FileText size={13} className="text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">
                      {inv.plan ? `${inv.plan} Plan` : 'Subscription'}
                    </p>
                    <p className="text-slate-600 text-[10px]">
                      {inv.date ? new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-white text-xs font-bold">
                      ${typeof inv.amount === 'number' ? inv.amount.toFixed(2) : inv.amount || '—'}
                    </p>
                    <p className={`text-[10px] font-semibold ${
                      inv.status === 'paid' || inv.status === 'succeeded' ? 'text-emerald-400'
                      : inv.status === 'open' || inv.status === 'pending' ? 'text-amber-400'
                      : 'text-slate-500'
                    }`}>
                      {inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : '—'}
                    </p>
                  </div>
                  {inv.download_url && (
                    <a
                      href={inv.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    >
                      <Download size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText size={24} className="mx-auto mb-2 text-slate-700" />
            <p className="text-slate-500 text-xs">No invoices yet</p>
            <p className="text-slate-600 text-[10px] mt-1">
              Your billing history will appear here after your first payment.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BillingTile({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl p-3" style={{ background: '#0a1020', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={11} style={{ color }} />
        <p className="text-slate-600 text-[10px] uppercase tracking-wider font-semibold">{label}</p>
      </div>
      <p className="text-white font-bold text-sm leading-tight truncate">{value}</p>
    </div>
  );
}