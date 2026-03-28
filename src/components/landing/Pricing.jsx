import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    devices: '2 devices',
    price: 9.99,
    yearly: 99.90,
    popular: false,
    features: [
      '2 Devices',
      '50+ Servers',
      'Unlimited Bandwidth',
      'AES-256 Encryption'
    ]
  },
  {
    name: 'Premium',
    devices: '5 devices',
    price: 14.99,
    yearly: 149.90,
    popular: true,
    features: [
      '5 Devices',
      'All 12 Locations',
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'Priority Support',
      'Split Tunneling'
    ]
  },
  {
    name: 'Enterprise',
    devices: '10 devices',
    price: 24.99,
    yearly: 249.90,
    popular: false,
    features: [
      '10 Devices',
      'All Premium Servers',
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      '24/7 Priority Support',
      'Dedicated IP',
      'Advanced Kill Switch'
    ]
  }
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            All plans include AES-256 encryption and no-log policy
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!yearly ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                yearly ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  yearly ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${yearly ? 'text-white' : 'text-slate-400'}`}>
              Yearly <span className="text-cyan-400">Save 17%</span>
            </span>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl transition-all duration-300 ${
                plan.popular
                  ? 'border-2 border-cyan-500 bg-slate-900 shadow-xl shadow-cyan-500/20 md:scale-105'
                  : 'border border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.devices}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${yearly ? (plan.yearly / 12).toFixed(2) : plan.price}
                    </span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  {yearly && (
                    <p className="text-sm text-cyan-400 mt-2">
                      ${plan.yearly} billed yearly
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all mb-8 ${
                    plan.popular
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      : 'border border-slate-700 text-white hover:border-cyan-500 hover:text-cyan-400'
                  }`}
                >
                  Get {plan.name}
                </button>

                {/* Features List */}
                <div className="space-y-4">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-center gap-3">
                      <Check size={18} className="text-cyan-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}