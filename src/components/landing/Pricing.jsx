import { useState } from 'react';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const plans = [
  {
    name: 'Basic',
    price: 9.99,
    yearly: 5.00,
    popular: false,
    features: ['2 Devices', '50+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption'],
    priceIdMonthly: 'price_1QsgL0EiNNFb5ydcXxxxx',
    priceIdYearly: 'price_1QsgL0EiNNFb5ydcYyyyy',
  },
  {
    name: 'Standard',
    price: 14.99,
    yearly: 10.00,
    popular: false,
    features: ['3 Devices', 'All Locations', 'Unlimited Bandwidth', 'AES-256 Encryption', 'Priority Support'],
    priceIdMonthly: 'price_1QsgL0EiNNFb5ydcZzzzz',
    priceIdYearly: 'price_1QsgL0EiNNFb5ydcAaaaa',
  },
  {
    name: 'Premium',
    price: 19.99,
    yearly: 14.99,
    popular: true,
    features: ['5 Devices', 'All 12 Locations', 'Unlimited Bandwidth', 'AES-256 Encryption', 'Priority Support', 'Split Tunneling'],
    priceIdMonthly: 'price_1QsgL0EiNNFb5ydcBbbbb',
    priceIdYearly: 'price_1QsgL0EiNNFb5ydcCcccc',
  },
  {
    name: 'Advanced',
    price: 29.99,
    yearly: 24.99,
    popular: false,
    features: ['7 Devices', 'All Premium Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', '24/7 Support', 'Dedicated IP'],
    priceIdMonthly: 'price_1QsgL0EiNNFb5ydcDdddd',
    priceIdYearly: 'price_1QsgL0EiNNFb5ydcEeeee',
  },
  {
    name: 'Enterprise',
    price: 39.99,
    yearly: 18.00,
    popular: false,
    features: ['10 Devices', 'All Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', '24/7 Priority Support', 'Dedicated IP', 'Kill Switch'],
    priceIdMonthly: 'price_1QsgL0EiNNFb5ydcFffff',
    priceIdYearly: 'price_1QsgL0EiNNFb5ydcGgggg',
  },
];

function PlanCard({ plan, yearly }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const priceId = yearly ? plan.priceIdYearly : plan.priceIdMonthly;
      const res = await base44.functions.invoke('createStripeCheckout', {
        plan: plan.name,
        priceId: priceId,
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
      <h3 className="text-white font-bold text-base mb-1">{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-extrabold text-white">${yearly ? plan.yearly : plan.price}</span>
        <span className="text-slate-500 text-xs">/month</span>
      </div>
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
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="bg-[#080c18] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-sm mb-8">All plans include AES-256 encryption and no-log policy</p>

          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!yearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${yearly ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${yearly ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${yearly ? 'text-white' : 'text-slate-500'}`}>
              Yearly <span className="text-cyan-400">Save 30%</span>
            </span>
          </div>
        </div>

        {/* Row 1: Basic + Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 max-w-2xl mx-auto">
          {[plans[0], plans[2]].map((plan) => <PlanCard key={plan.name} plan={plan} yearly={yearly} />)}
        </div>

        {/* Row 2: Standard + Advanced + Enterprise */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[plans[1], plans[3], plans[4]].map((plan) => <PlanCard key={plan.name} plan={plan} yearly={yearly} />)}
        </div>
      </div>
    </section>
  );
}