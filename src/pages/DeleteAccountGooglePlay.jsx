import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, Trash2, ArrowLeft, CheckCircle2, XCircle,
  Mail, Smartphone, FileText, Clock, AlertTriangle, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DeleteAccountGooglePlay() {
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = unknown

  // Check if user is logged in
  useEffect(() => {
    base44.auth.me()
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') return;
    setLoading(true);
    setError('');
    try {
      await base44.functions.invoke('deleteUserAccount', {});
      setDone(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c18] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#060910]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/13431de73_VoxICON.png"
              alt="VoxVPN"
              className="h-9 w-auto"
            />
            <span className="font-bold text-lg">VoxVPN</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 text-sm transition-colors">
            <ArrowLeft size={15} />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={30} className="text-rose-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Delete Your VoxVPN Account</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            You can request deletion of your VoxVPN account and associated data at any time.
            This page explains exactly what happens, what gets deleted, what is retained, and how long it takes.
          </p>
        </div>

        {done ? (
          /* Success */
          <div className="bg-[#0d1120] border border-emerald-500/20 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black mb-3">Account Deletion Complete</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your VoxVPN account and all associated data have been permanently deleted. Any active
              subscription has been cancelled. You can create a new account at any time if you wish to return.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all"
            >
              Back to Home
            </Link>
          </div>
        ) : showDeleteForm ? (
          /* Delete confirmation */
          <div className="bg-[#0d1120] border border-rose-500/20 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
              <Trash2 size={28} className="text-rose-400" />
            </div>
            <h2 className="text-2xl font-black text-center mb-2">Confirm Permanent Deletion</h2>
            <p className="text-slate-400 text-sm text-center mb-8">
              Type <span className="text-rose-400 font-bold">DELETE</span> to permanently delete your account and all data.
            </p>

            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full bg-[#091523] border border-white/10 focus:border-rose-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none mb-4 placeholder:text-slate-600"
            />

            {error && <p className="text-rose-400 text-xs mb-4 text-center">{error}</p>}

            <div className="space-y-3">
              <button
                onClick={handleDelete}
                disabled={confirmation !== 'DELETE' || loading}
                className="w-full py-3 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all"
              >
                {loading ? 'Deleting...' : 'Permanently Delete My Account'}
              </button>
              <button
                onClick={() => { setShowDeleteForm(false); setConfirmation(''); setError(''); }}
                className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-semibold rounded-xl text-sm transition-all"
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* How to request deletion */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <FileText size={18} className="text-cyan-400" />
                <h2 className="text-xl font-bold">How to Request Account Deletion</h2>
              </div>
              <div className="bg-[#0d1120] border border-white/5 rounded-2xl p-6 sm:p-8">
                <ol className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                    <div>
                      <h3 className="font-semibold mb-1">Sign in to your account</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Log in to the VoxVPN app or website at <span className="text-cyan-400">voxvpn.net</span> using the email address associated with your account.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                    <div>
                      <h3 className="font-semibold mb-1">Open the Delete Account page</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Navigate to <span className="text-cyan-400">voxvpn.net/delete</span> in your browser, or go to <span className="text-cyan-400">Settings → Delete Account</span> in the VoxVPN Android app.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                    <div>
                      <h3 className="font-semibold mb-1">Confirm deletion</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Review what will be deleted, then type <span className="text-rose-400 font-bold">DELETE</span> to confirm. Your account and data are permanently removed within <span className="text-white font-semibold">24 hours</span>.
                      </p>
                    </div>
                  </li>
                </ol>

                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-slate-500 text-xs mb-3">Don't have app access? You can also request deletion by email:</p>
                  <a
                    href="mailto:support@voxdigits.com?subject=Delete%20My%20VoxVPN%20Account&body=Please%20delete%20my%20VoxVPN%20account%20and%20all%20associated%20data.%0A%0AEmail%20on%20file%3A%20"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all"
                  >
                    <Mail size={15} className="text-cyan-400" />
                    support@voxdigits.com
                  </a>
                </div>
              </div>
            </section>

            {/* What gets deleted */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <Trash2 size={18} className="text-rose-400" />
                <h2 className="text-xl font-bold">Data That Will Be Deleted</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Lock, title: 'Account credentials', desc: 'Your email, password, and login session' },
                  { icon: Smartphone, title: 'Linked devices', desc: 'All registered device fingerprints and VPN profiles' },
                  { icon: FileText, title: 'Subscription records', desc: 'Your plan, billing history, and renewal dates' },
                  { icon: ShieldCheck, title: 'VPN configurations', desc: 'OpenVPN/WireGuard keys and server configs' },
                  { icon: Mail, title: 'Support tickets', desc: 'All open and resolved support conversations' },
                  { icon: Clock, title: 'Connection logs', desc: 'Session history and usage statistics' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[#0d1120] border border-white/5 rounded-xl p-4">
                    <CheckCircle2 size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm mb-0.5">{item.title}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* What is retained */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <Lock size={18} className="text-amber-400" />
                <h2 className="text-xl font-bold">Data That May Be Retained</h2>
              </div>
              <div className="bg-[#0d1120] border border-amber-500/10 rounded-2xl p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <XCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Billing & payment records</p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Transaction records from Stripe, Hubtel, or other payment processors are retained for up to <span className="text-white font-semibold">7 years</span> as required by financial regulations and tax law. VoxVPN does not store full card numbers — these remain with the payment processor.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Fraud & abuse prevention logs</p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Anonymized security logs (IP addresses, device identifiers) may be retained for up to <span className="text-white font-semibold">90 days</span> after deletion to protect against fraud, chargebacks, and abuse, in accordance with our legitimate business interest.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Legal compliance records</p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        If we are legally obligated to retain specific data (e.g., due to an active legal hold or regulatory request), that data will be kept only for the duration required by law and then permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Retention summary */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <Clock size={18} className="text-cyan-400" />
                <h2 className="text-xl font-bold">Deletion Timeline</h2>
              </div>
              <div className="bg-[#0d1120] border border-white/5 rounded-2xl p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Account & profile data</span>
                    <span className="text-rose-400 font-bold text-sm">Deleted within 24 hours</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">VPN configs & linked devices</span>
                    <span className="text-rose-400 font-bold text-sm">Deleted within 24 hours</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Subscription & billing history</span>
                    <span className="text-amber-400 font-bold text-sm">Retained up to 7 years (legal)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Anonymized fraud-prevention logs</span>
                    <span className="text-amber-400 font-bold text-sm">Retained up to 90 days</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Active subscription warning */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 mb-10 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-400 text-sm leading-relaxed">
                If you have an <span className="text-white font-semibold">active paid subscription</span>, it will be
                cancelled immediately upon deletion. Refunds for partial billing periods are handled per our
                <Link to="/refund-policy" className="text-cyan-400 hover:underline mx-1">Refund Policy</Link>.
              </p>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-[#0d1120] to-[#0a1525] border border-white/10 rounded-2xl p-8 text-center">
              <h2 className="text-xl font-bold mb-2">Ready to delete your account?</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                This action is permanent and cannot be undone. Make sure you've saved anything you need before proceeding.
              </p>
              {isLoggedIn === false ? (
                <div className="space-y-3">
                  <p className="text-amber-400 text-xs">
                    You must be signed in to delete your account.
                  </p>
                  <Link
                    to="/auth-login?redirect=/delete"
                    className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all"
                  >
                    Sign In to Continue
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteForm(true)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-sm transition-all"
                >
                  <Trash2 size={16} />
                  Delete My Account
                </button>
              )}
            </div>
          </>
        )}

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-10 leading-relaxed max-w-lg mx-auto">
          VoxVPN is a product of VoxTelefony Communications LLC. For questions about data deletion,
          contact <a href="mailto:support@voxdigits.com" className="text-cyan-400 hover:underline">support@voxdigits.com</a>.
          See our <Link to="/privacy-policy" className="text-cyan-400 hover:underline">Privacy Policy</Link> for full details.
        </p>
      </div>
    </div>
  );
}