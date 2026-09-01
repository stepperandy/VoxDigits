import { useState, useEffect } from 'react';
import { Check, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PaymentMethodModal from '../PaymentMethodModal';
import { useCurrencyDetection } from '@/hooks/useCurrencyDetection';
import { useLanguage } from '@/lib/LanguageContext';

const PLANS = [
  {
    name: '1 Month',
    period: '1 Month',
    days: '30 Days Unlimited',
    price: 2.59,
    pricePerMonth: 2.59,
    badge: null,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    popular: false,
    savingsPercent: 0,
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
    ],
    priceId: 'price_1month',
  },
  {
    name: '3 Months',
    period: '3 Months',
    days: '90 Days Unlimited',
    price: 6.99,
    pricePerMonth: 2.33,
    badge: null,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    popular: false,
    savingsPercent: 10,
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
      'Split Tunneling',
    ],
    priceId: 'price_3months',
  },
  {
    name: '6 Months',
    period: '6 Months',
    days: '180 Days Unlimited',
    price: 13.99,
    pricePerMonth: 2.33,
    badge: 'Most Popular',
    badgeColor: 'bg-cyan-500 text-black',
    color: 'border-2 border-cyan-500 bg-[#0d1a20] shadow-lg shadow-cyan-500/10',
    btnClass: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    popular: true,
    savingsPercent: 10,
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
      'Split Tunneling',
      'DNS Leak Protection',
      'Priority Support',
    ],
    priceId: 'price_6months',
  },
  {
    name: '1 Year',
    period: '1 Year',
    days: '365 Days Unlimited',
    price: 24.99,
    pricePerMonth: 2.08,
    badge: 'Best Value',
    badgeColor: 'bg-emerald-500 text-black',
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    popular: false,
    savingsPercent: 20,
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
      'Split Tunneling',
      'DNS & IPv6 Leak Protection',
      'Dedicated IP Address',
      '24/7 Priority Support',
    ],
    priceId: 'price_1year',
  },
  {
    name: '2 Years',
    period: '2 Years',
    days: '730 Days Unlimited',
    price: 45.99,
    pricePerMonth: 1.92,
    badge: null,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    popular: false,
    savingsPercent: 26,
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
      'Split Tunneling',
      'DNS & IPv6 Leak Protection',
      'Static Dedicated IP',
      'Double VPN (Multi-hop)',
      'Dedicated Account Manager',
    ],
    priceId: 'price_2years',
  },
];

const PLAN_KEYS = {
  '1 Month': { nameKey: 'plan1Month', periodKey: 'plan1Month', daysKey: 'days30', badgeKey: null },
  '3 Months': { nameKey: 'plan3Months', periodKey: 'plan3Months', daysKey: 'days90', badgeKey: null },
  '6 Months': { nameKey: 'plan6Months', periodKey: 'plan6Months', daysKey: 'days180', badgeKey: 'badgeMostPopular' },
  '1 Year': { nameKey: 'plan1Year', periodKey: 'plan1Year', daysKey: 'days365', badgeKey: 'badgeBestValue' },
  '2 Years': { nameKey: 'plan2Years', periodKey: 'plan2Years', daysKey: 'days730', badgeKey: null },
};

const FEATURE_KEYS = {
  'Unlimited Bandwidth': 'featUnlimitedBandwidth',
  'AES-256 Encryption': 'featAes',
  'No-Logs Policy': 'featNoLogs',
  'All Server Locations': 'featAllServers',
  'Kill Switch': 'featKillSwitch',
  'Split Tunneling': 'featSplit',
  'DNS Leak Protection': 'featDnsLeak',
  'Priority Support': 'featPrioritySupport',
  'DNS & IPv6 Leak Protection': 'featDnsIpv6',
  'Dedicated IP Address': 'featDedicatedIp',
  '24/7 Priority Support': 'feat247Priority',
  'Static Dedicated IP': 'featStaticIp',
  'Double VPN (Multi-hop)': 'featDoubleVpn',
  'Dedicated Account Manager': 'featAccountManager',
};

function PlanCard({ plan, isAdmin, onPaymentMethodSelect, currency, convertPrice }) {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const planKeys = PLAN_KEYS[plan.name];

  const handleCheckout = () => {
    onPaymentMethodSelect(plan, plan.priceId, false);
  };

  return (
    <div className={`relative rounded-xl p-6 flex flex-col ${plan.color}`}>
      {planKeys.badgeKey && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${plan.badgeColor}`}>{t(planKeys.badgeKey)}</span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-white font-bold text-base mb-0.5">{t(planKeys.nameKey)}</h3>
        <p className="text-slate-600 text-xs">{t(planKeys.daysKey)}</p>
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-extrabold text-white">{currency.symbol}{convertPrice(plan.price)}</span>
      </div>
      <p className="text-slate-600 text-xs mb-5">
        {currency.symbol}{convertPrice(plan.pricePerMonth)}{t('perMonth')}
        {plan.savingsPercent > 0 && <span className="ml-2 text-cyan-400 font-semibold">{t('saveVsMonthly').replace('{percent}', plan.savingsPercent)}</span>}
      </p>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg text-sm font-bold mb-5 transition-all disabled:opacity-50 ${plan.btnClass}`}
      >
        {loading ? t('btnProcessing') : t('btnGet').replace('{period}', t(planKeys.periodKey))}
      </button>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f, fi) => (
          <li key={fi} className="flex items-center gap-2">
            <Check size={13} className="text-cyan-400 flex-shrink-0" />
            <span className="text-slate-400 text-xs">{t(FEATURE_KEYS[f] || f)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const { currency, countryCode } = useCurrencyDetection();
  const { t } = useLanguage();
  const convertPrice = (usdPrice) => (usdPrice * currency.rate).toFixed(currency.rate >= 100 ? 0 : 2);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setIsAdmin(u?.role === 'admin');
      })
      .catch(() => {});
  }, []);

  const handlePaymentMethodSelect = (plan, priceId) => {
    setSelectedPlan(plan);
    setSelectedPriceId(priceId);
    setModalOpen(true);
  };

  // Only admin-bypass is handled here — all Stripe/Hubtel/Alipay/WeChat checkout
  // is handled inside PaymentMethodModal, which passes the detected currency,
  // country, live exchange rate, and billing cycle to createStripeCheckout.
  const handlePaymentProceed = async (method) => {
    if (isAdmin && method === 'admin-bypass') {
      try {
        await base44.functions.invoke('grantSubscription', {
          plan: selectedPlan.name,
          target_email: user.email,
        });
        alert(`${selectedPlan.name} plan granted to ${user.email}`);
      } catch (error) {
        alert('Error: ' + error.message);
      } finally {
        setModalOpen(false);
      }
    }
  };

  return (
    <section id="pricing" className="relative bg-[#080c18] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background world map image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/2f2ad398a_image.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          opacity: 0.18,
        }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">{t('pricingLabel')}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('pricingTitle')}</h2>
          <p className="text-slate-400 text-sm">{t('pricingSubtitle')}</p>
        </div>

        {/* Pricing info */}
        <div className="text-center mb-10">
          <p className="text-slate-400 text-sm">{t('pricesIn')} <span className="font-semibold text-white">{currency.code}</span> · {t('detectedLabel')} <span className="text-cyan-400 font-semibold">{countryCode}</span></p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PLANS.map((plan) => (
            <PlanCard 
              key={plan.name} 
              plan={plan} 
              isAdmin={isAdmin}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              currency={currency}
              convertPrice={convertPrice}
            />
          ))}
        </div>

        {/* Payment Method Modal */}
        <PaymentMethodModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          plan={selectedPlan}
          isAdmin={isAdmin}
          onProceed={handlePaymentProceed}
          currency={currency}
          countryCode={countryCode}
          isBilledYearly={selectedPlan?.name === '1 Year' || selectedPlan?.name === '2 Years'}
          isSixMonths={selectedPlan?.name === '6 Months'}
          userEmail={user?.email}
        />

        {/* Trust bar */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Live Support */}
          <div className="flex items-start gap-4 p-6 rounded-2xl border border-white/5 bg-[#0d1120]">
            <div className="text-3xl flex-shrink-0">💬</div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base mb-1">{t('liveSupport')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{t('liveSupportDesc')}</p>
              <a href="/contact" className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold rounded-lg transition-all">
                {t('contactSupport')}
              </a>
            </div>
          </div>

          {/* Money-back */}
          <div className="flex items-start gap-4 p-6 rounded-2xl border border-white/5 bg-[#0d1120]">
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-4 border-cyan-400 flex items-center justify-center">
              <span className="text-cyan-400 font-black text-sm">30</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base mb-1">{t('moneyBackTitle')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{t('moneyBackDesc')}</p>
              <a href="#pricing" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-lg transition-all">
                {t('getVoxvpnCta')}
              </a>
            </div>
          </div>
        </div>

        {/* Payment trust section */}
        <div className="mt-12 rounded-2xl border border-white/5 bg-[#0d1120] p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path d="M13.5 6H5.5C4.4 6 3.5 6.9 3.5 8v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2h2v2c0 1.1.9 2 2 2s2-.9 2-2v-3c0-.55-.22-1.05-.59-1.41L18.5 10h-3c-1.1 0-2-.9-2-2V6z" fill="#635BFF"/>
            </svg>
            <h3 className="text-white font-bold text-sm">{t('securePayment')}</h3>
            <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(99,91,255,0.15)', color: '#8b80ff', border: '1px solid rgba(99,91,255,0.3)' }}>
              {t('pciCompliant')}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: t('payProcessor'), value: t('payProcessorVal') },
              { label: t('payCards'), value: t('payCardsVal') },
              { label: t('payAltMethods'), value: t('payAltVal') },
              { label: t('payBillingCycle'), value: t('payBillingVal') },
              { label: t('payAutoRenewal'), value: t('payAutoVal') },
              { label: t('payCancellation'), value: t('payCancelVal') },
              { label: t('payMoneyBack'), value: t('payMoneyBackVal') },
              { label: t('payCurrency'), value: t('payCurrencyVal').replace('{code}', currency.code) },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                <span className="text-slate-500 text-xs">{item.label}</span>
                <span className="text-white font-semibold text-xs text-right">{item.value}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-[10px] mt-4 leading-relaxed">
            {t('payDisclaimerPre')}<a href="/refund-policy" className="text-cyan-400 hover:underline">{t('refundPolicyLink')}</a>{t('payDisclaimerPost')}
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          {t('pricingFooter').replace('{code}', currency.code)}
        </p>
      </div>
    </section>
  );
}