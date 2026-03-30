import { useState } from 'react';
// Pricing plans match Stripe products exactly
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const plans = [
  {
    name: 'Monthly',
    price: 8.99,
    billingLabel: 'billed monthly',
    popular: false,
    features: ['5 Devices', '50+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Log Policy'],
    priceId: 'price_1TDvPiAj5jZA8C2y4aS6FXt1',
  },
  {
    name: 'Basic',
    price: 9.99,
    billingLabel: 'billed monthly',
    popular: false,
    features: ['5 Devices', '50+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Log Policy', '3-Day Free Trial'],
    priceId: 'price_1TFwCxAj5jZA8C2ywLEfaNXR',
    trial: true,
  },
  {
    name: 'Annual',
    price: 4.99,
    billingLabel: 'billed $59.88/year',
    popular: true,
    features: ['5 Devices', 'All Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Log Policy', 'Priority Support', 'Kill Switch'],
    priceId: 'price_1TDvPjAj5jZA8C2yKmoBiYce',
    savings: 'Save 44%',
  },
  {
    name: '2-Year',
    price: 2.99,
    billingLabel: 'billed $71.76 every 2 years',
    popular: false,
    features: ['5 Devices', 'All Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Log Policy', '24/7 Support', 'Kill Switch', 'Dedicated IP'],
    priceId: 'price_1TDvPjAj5jZA8C2yrapCxQbT',
    savings: 'Best Value',
  },
];

function PlanCard({ plan }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createStripeCheckout', {
        plan: plan.name,
        priceId: plan.priceId,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error starting checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative rounded-xl p-6 flex flex-col ${
      plan.popular
        ? 'border-2 border-cyan-500 bg-[#0d1a20] shadow-lg shadow-cyan-500/10'
        : 'border border-white/5 bg-[#0d1120]'
    }`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded-full">Most Popular</span>
        </div>
      )}
      {plan.savings && !plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full">{plan.savings}</span>
        </div>
      )}
      <h3 className="text-white font-bold text-base mb-1">{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-extrabold text-white">${plan.price}</span>
        <span className="text-slate-500 text-xs">/month</span>
      </div>
      <p className="text-slate-600 text-xs mb-4">{plan.billingLabel}</p>
      {plan.trial && <p className="text-cyan-400 text-xs font-semibold mb-3">✓ 3-day free trial</p>}
      <button onClick={handleCheckout} disabled={loading} className={`w-full py-2.5 rounded text-sm font-bold mb-5 transition-all disabled:opacity-50 ${
        plan.popular
          ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
          : 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400'
      }`}>
        {loading ? 'Processing...' : `Get ${plan.name}`}
      </button>
      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f, fi) => (
          <li key={fi} className="flex items-center gap-2">
            <Check size={14} className="text-cyan-400 flex-shrink-0" />
            <span className="text-slate-400 text-xs">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="bg-[#080c18] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-sm">All plans include AES-256 encryption and no-log policy</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
        </div>
      </div>
    </section>
  );
}