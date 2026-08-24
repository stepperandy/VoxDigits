import { Calendar, AlertTriangle, CheckCircle2, Clock, XCircle, Users } from 'lucide-react';

const STATUS_CONFIG = {
  active: { icon: CheckCircle2, color: 'text-green-400 bg-green-500/10 border-green-500/20', dot: 'bg-green-400', label: 'Active' },
  trial: { icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400', label: 'Trial' },
  pending_payment: { icon: AlertTriangle, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-400', label: 'Pending Payment' },
  expired: { icon: XCircle, color: 'text-red-400 bg-red-500/10 border-red-500/20', dot: 'bg-red-400', label: 'Expired' },
  cancelled: { icon: XCircle, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-500', label: 'Cancelled' },
  paused: { icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400', label: 'Paused' },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  return `$${Number(amount).toFixed(2)}`;
}

/**
 * Summary table showing active subscription statuses and highlighting
 * upcoming renewal dates for all client accounts.
 *
 * Links each client (by contact_email) to their VPNSubscription records,
 * picks the soonest upcoming renewal per client, and highlights rows
 * based on proximity to renewal date.
 */
export default function ClientRenewalTable({ clients = [], subscriptions = [] }) {
  // Link subscriptions to clients via contact_email (primary) or notes (fallback)
  const subsForClient = (client) => {
    const byEmail = client.contact_email
      ? subscriptions.filter((s) => s.user_email === client.contact_email)
      : [];
    if (byEmail.length > 0) return byEmail;
    // Fallback: legacy notes-based linking
    return subscriptions.filter((s) => s.notes && s.notes.includes(client.id));
  };

  // Build per-client summary rows
  const rows = clients.map((client) => {
    const clientSubs = subsForClient(client);
    const activeSubs = clientSubs.filter((s) => s.status === 'active' || s.status === 'trial');

    // Pick the soonest upcoming renewal among active subs
    const upcomingSubs = activeSubs
      .filter((s) => s.renewal_date)
      .sort((a, b) => new Date(a.renewal_date) - new Date(b.renewal_date));
    const nextSub = upcomingSubs[0] || activeSubs[0] || clientSubs[0] || null;

    const primaryStatus = nextSub?.status || client.status || 'pending_payment';
    const renewalDate = nextSub?.renewal_date || null;
    const days = daysUntil(renewalDate);

    return {
      client,
      sub: nextSub,
      activeCount: activeSubs.length,
      totalSubs: clientSubs.length,
      status: primaryStatus,
      plan: nextSub?.plan || client.vpn_plan || '—',
      billingCycle: nextSub?.billing_cycle || null,
      amount: nextSub?.price ?? null,
      renewalDate,
      days,
    };
  });

  // Sort: soonest renewal first, clients without dates last
  rows.sort((a, b) => {
    if (!a.renewalDate) return 1;
    if (!b.renewalDate) return -1;
    return new Date(a.renewalDate) - new Date(b.renewalDate);
  });

  // Summary stats
  const activeClients = rows.filter((r) => r.status === 'active').length;
  const trialClients = rows.filter((r) => r.status === 'trial').length;
  const urgentRenewals = rows.filter((r) => r.days !== null && r.days >= 0 && r.days <= 7).length;
  const upcomingRenewals = rows.filter((r) => r.days !== null && r.days >= 0 && r.days <= 30).length;

  if (clients.length === 0) {
    return (
      <div className="rounded-2xl bg-[#0d1120] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={15} className="text-cyan-400" />
          <h3 className="text-white font-bold text-sm">Client Subscription Summary</h3>
        </div>
        <div className="py-10 text-center">
          <Users size={28} className="text-slate-700 mx-auto mb-2" />
          <p className="text-slate-600 text-xs">No client accounts yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#0d1120] border border-white/5 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-cyan-400" />
          <h3 className="text-white font-bold text-sm">Client Subscription Summary</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-semibold">{activeClients} Active</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">{trialClients} Trial</span>
          {urgentRenewals > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">{urgentRenewals} Urgent</span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">{upcomingRenewals} Renewing ≤30d</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-white/5">
              <th className="text-left font-medium py-2 px-2">Client Account</th>
              <th className="text-left font-medium py-2 px-2">Plan</th>
              <th className="text-center font-medium py-2 px-2">Status</th>
              <th className="text-right font-medium py-2 px-2">Amount</th>
              <th className="text-right font-medium py-2 px-2">Next Renewal</th>
              <th className="text-right font-medium py-2 px-2">Days Left</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ client, sub, activeCount, totalSubs, status, plan, amount, renewalDate, days }) => {
              const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending_payment;
              const Icon = cfg.icon;
              const isUrgent = days !== null && days >= 0 && days <= 7;
              const isUpcoming = days !== null && days >= 0 && days <= 30;
              const isOverdue = days !== null && days < 0;
              const rowBg = isUrgent ? 'bg-red-500/[0.06]' : isUpcoming ? 'bg-amber-500/[0.04]' : isOverdue ? 'bg-slate-500/[0.03]' : '';
              const rowBorder = isUrgent ? 'border-l-2 border-l-red-500/50' : isUpcoming ? 'border-l-2 border-l-amber-500/40' : '';
              return (
                <tr key={client.id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${rowBg} ${rowBorder}`}>
                  {/* Client name + subs count */}
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{client.name}</p>
                        {client.contact_email && (
                          <p className="text-slate-600 text-[10px] truncate">{client.contact_email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Plan */}
                  <td className="py-2.5 px-2">
                    <span className="text-slate-300">{plan}</span>
                    {sub?.billing_cycle && (
                      <span className="text-slate-600 text-[10px] block capitalize">{sub.billing_cycle}</span>
                    )}
                  </td>
                  {/* Status badge */}
                  <td className="py-2.5 px-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                      <Icon size={9} /> {cfg.label}
                    </span>
                  </td>
                  {/* Amount */}
                  <td className="py-2.5 px-2 text-right">
                    <span className="text-slate-300">{formatCurrency(amount)}</span>
                    {totalSubs > 1 && (
                      <span className="text-slate-600 text-[10px] block">{activeCount}/{totalSubs} active subs</span>
                    )}
                  </td>
                  {/* Renewal date */}
                  <td className="py-2.5 px-2 text-right">
                    <span className={isUrgent ? 'text-red-400 font-bold' : isUpcoming ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                      {formatDate(renewalDate)}
                    </span>
                  </td>
                  {/* Days left */}
                  <td className="py-2.5 px-2 text-right">
                    {days === null ? (
                      <span className="text-slate-600">—</span>
                    ) : isOverdue ? (
                      <span className="text-slate-500 text-[10px] font-medium">expired</span>
                    ) : (
                      <span className={`font-bold ${isUrgent ? 'text-red-400' : isUpcoming ? 'text-amber-400' : 'text-slate-400'}`}>
                        {days === 0 ? 'Today' : days === 1 ? '1d' : `${days}d`}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-red-500/30 border-l-2 border-red-500/50" />
          <span>Renewal ≤ 7 days (urgent)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-amber-500/20 border-l-2 border-amber-500/40" />
          <span>Renewal ≤ 30 days</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-slate-500/10" />
          <span>Expired / no renewal</span>
        </div>
      </div>
    </div>
  );
}