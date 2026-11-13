import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const statusColor = {
  sent: 'text-emerald-400',
  sending: 'text-amber-400',
  failed: 'text-rose-400',
  draft: 'text-slate-400',
};
const statusIcon = { sent: CheckCircle2, sending: Loader2, failed: XCircle, draft: Mail };

export default function EmailBlastHistory({ blasts, loading }) {
  if (loading) {
    return <div className="flex items-center gap-2 text-slate-400 text-sm py-6"><Loader2 size={14} className="animate-spin" /> Loading history...</div>;
  }
  if (!blasts.length) {
    return <p className="text-slate-500 text-sm py-6 text-center">No email blasts sent yet.</p>;
  }
  return (
    <div className="space-y-2">
      {blasts.map((b) => {
        const Icon = statusIcon[b.status] || Mail;
        return (
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-[#0d1120]">
            <Icon size={16} className={statusColor[b.status]} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{b.subject}</p>
              <p className="text-slate-500 text-xs">
                {b.sent_count || 0}/{b.total_recipients || 0} sent
                {b.failed_count > 0 ? ` · ${b.failed_count} failed` : ''}
              </p>
            </div>
            <span className={`text-xs font-bold uppercase ${statusColor[b.status]}`}>{b.status}</span>
          </div>
        );
      })}
    </div>
  );
}