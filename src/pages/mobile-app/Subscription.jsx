import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CreditCard, Check, Zap, Lock, Globe } from 'lucide-react';

const PLANS = [
  {
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    features: ['4 Server Locations', '5 Devices', 'Unlimited Bandwidth', 'Kill Switch'],
    popular: false,
    color: 'border-white/10',
  },
  {
    name: 'Yearly',
    price: '$4.99',
    period: '/month',
    badge: 'Save 50%',
    features: ['4 Server Locations', '10 Devices', 'Unlimited Bandwidth', 'Kill Switch', 'Priority Support', 'Ad Blocker'],
    popular: true,
    color: 'border-cyan-500/40',
  },
];

export default function Subscription() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060d1a] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-6 flex items-center gap-3">
        <button onClick={() => navigate('/app/servers')}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-black text-lg leading-none">Choose a Plan</h1>
          <p className="text-slate-500 text-xs mt-0.5">Premium protection at any budget</p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-8 flex flex-col gap-5">
        {/* Value props */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield, label: 'No Logs' },
            { icon: Zap, label: 'Fast VPN' },
            { icon: Lock, label: 'AES-256' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#0d1120] border border-white/5">
              <Icon size={20} className="text-cyan-400" />
              <span className="text-white text-xs font-bold">{label}</span>
            </div>
          ))}
        </div>

        {/* Plans */}
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-5 rounded-2xl border bg-[#0d1120] ${plan.color} ${plan.popular ? 'ring-1 ring-cyan-500/30' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-5">
                <span className="px-3 py-1 bg-cyan-400 text-black text-xs font-black rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            {plan.badge && (
              <div className="absolute -top-3 right-5">
                <span className="px-3 py-1 bg-emerald-400 text-black text-xs font-black rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="flex items-end gap-1 mb-4 mt-1">
              <span className="text-white font-black text-3xl">{plan.price}</span>
              <span className="text-slate-500 text-sm mb-1">{plan.period}</span>
            </div>

            <ul className="space-y-2 mb-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check size={14} className="text-cyan-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button className={`w-full py-3.5 font-black rounded-2xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              plan.popular
                ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
            }`}>
              <CreditCard size={16} />
              Get {plan.name} Plan
            </button>
          </div>
        ))}

        <p className="text-center text-slate-600 text-xs">
          Payments are handled securely. Cancel anytime.
        </p>
      </div>
    </div>
  );
}