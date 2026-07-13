import { useState } from 'react';
import { Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ALL_URLS = [
  '/',
  '/pricing',
  '/download',
  '/get',
  '/setup',
  '/setup-guide',
  '/mobile-setup',
  '/ios-setup',
  '/vpn-for-usa', '/vpn-for-uk', '/vpn-for-canada', '/vpn-for-australia',
  '/vpn-for-germany', '/vpn-for-france', '/vpn-for-japan',
  '/windows-vpn', '/mac-vpn', '/linux-vpn', '/ios-vpn', '/android-vpn',
  '/router-vpn', '/chrome-extension',
  '/no-logs-policy', '/kill-switch', '/split-tunneling', '/aes-256-encryption',
  '/dns-leak-protection', '/ipv6-leak-protection',
  '/vpn-for-streaming', '/vpn-for-gaming', '/vpn-for-torrenting',
  '/vpn-for-business', '/vpn-for-travel',
  '/what-is-a-vpn', '/how-vpn-works', '/vpn-protocols', '/wireguard-vpn', '/openvpn',
  '/about', '/servers', '/vpn-servers',
  '/security', '/security-audit', '/transparency-report',
  '/blog', '/press', '/media-kit',
  '/help-center', '/contact', '/status', '/bug-bounty', '/careers',
  '/privacy-policy', '/terms-of-service', '/cookie-policy', '/refund-policy',
  '/acceptable-use-policy',
  '/affiliate', '/affiliate-register', '/referral',
  '/login', '/signup', '/reset-password',
  '/shield', '/shield/agencies', '/shield/clients', '/shield/agency', '/shield/onboarding',
  '/delete-account', '/delete',
];

export default function IndexNowPanel() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('submitToIndexNow', { urls: ALL_URLS });
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const successCount = result?.results?.filter((r) => r.ok).length || 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Zap size={16} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">IndexNow — Instant Indexing</h3>
            <p className="text-slate-500 text-xs mt-0.5">Ping search engines when you update content or policies</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
          {submitting ? 'Submitting...' : 'Submit All URLs'}
        </button>
      </div>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-slate-300">
              Submitted <span className="text-white font-bold">{result.submitted}</span> URLs —{' '}
              <span className="text-emerald-400 font-bold">{successCount}</span> search engines accepted
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
            {result.results?.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/3 text-[11px]">
                <span className="text-slate-500 truncate">{r.endpoint.replace('https://', '').replace('/indexnow', '')}</span>
                <span className={`font-semibold ${r.ok ? 'text-emerald-400' : 'text-slate-600'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 mt-3">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <p className="text-slate-600 text-[10px] mt-3">
        Auto-submits on Download changes. Use this button to manually ping after updating blog posts, legal pages, or policies.
      </p>
    </div>
  );
}