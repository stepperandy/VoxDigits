import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SignupConfirmation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [userName, setUserName] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (active && me?.full_name) setUserName(me.full_name);
      } catch {
        /* not logged in yet — fine */
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080c18] to-[#0d1120] text-white flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-cyan-400" />
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {userName ? `Welcome, ${userName.split(' ')[0]}!` : 'Account Created!'}
        </h1>
        <p className="text-slate-400 mb-6">
          Your VoxVPN account is ready. You've been granted a 3-day free trial to explore everything.
        </p>

        {email && (
          <div className="mb-6 p-3 bg-slate-800/60 border border-slate-700 rounded-xl flex items-center gap-2 justify-center text-sm text-slate-300">
            <Mail size={16} className="text-cyan-400" />
            <span className="truncate">{email}</span>
          </div>
        )}

        <div className="mb-6 p-4 bg-cyan-500/5 border border-cyan-400/20 rounded-xl text-left">
          <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold text-sm">
            <ShieldCheck size={16} /> What's next
          </div>
          <ul className="space-y-1.5 text-slate-400 text-xs">
            <li>• Choose a plan to activate your subscription</li>
            <li>• Download the app for your devices</li>
            <li>• Connect to any of our global servers</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/pricing?new=1')}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            Choose Your Plan <ArrowRight size={18} />
          </button>
          <Link
            to="/dashboard"
            className="w-full py-3 border border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-white font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        <p className="text-slate-500 text-xs mt-6">
          Need help?{' '}
          <Link to="/help-center" className="text-cyan-400 hover:text-cyan-300">Visit our help center</Link>
        </p>
      </div>
    </div>
  );
}