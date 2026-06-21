const methods = [
  { href: 'https://visa.com', label: 'Visa', cls: 'bg-[#0057B8] text-white' },
  { href: 'https://mastercard.com', label: 'Mastercard', cls: 'bg-black text-white' },
  { href: 'https://americanexpress.com', label: 'AMEX', cls: 'bg-[#007CC3] text-white' },
  { href: 'https://discover.com', label: 'Discover', cls: 'bg-black text-white' },
  { href: 'https://apple.com/apple-pay', label: 'Apple Pay', cls: 'bg-black text-white' },
  { href: 'https://pay.google.com', label: 'Google Pay', cls: 'bg-white text-slate-700' },
  { href: 'https://hubtel.com', label: 'Hubtel', cls: 'bg-white text-[#0a3d62]' },
  { href: 'https://alipay.com', label: 'Alipay', cls: 'bg-[#0060C7] text-white' },
  { href: 'https://wechat.com', label: 'WeChat Pay', cls: 'bg-[#00C250] text-white' },
  { href: 'https://mtn.com/momo', label: 'MTN MoMo', cls: 'bg-[#FFCC00] text-black' },
];

export default function PaymentIcons() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {methods.map(({ href, label, cls }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={`h-9 px-2.5 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wide transition-transform duration-200 hover:scale-110 hover:-translate-y-0.5 ${cls}`}
          style={{ boxShadow: '0 4px 10px -3px rgba(0,80,200,0.3), inset 0 1px 1px rgba(255,255,255,0.3)' }}
        >
          {label}
        </a>
      ))}
    </div>
  );
}