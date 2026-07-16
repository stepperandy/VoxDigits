const PAYMENT_METHODS = [
  {
    name: 'Visa',
    url: 'https://www.visa.com',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <rect width="48" height="16" rx="2" fill="#1A1F71"/>
        <path d="M20.8 3.2L18.4 12.8H16.5L18.9 3.2H20.8Z" fill="#fff"/>
        <path d="M28.3 3.2L26.1 12.8H24.3L26.5 3.2H28.3Z" fill="#fff"/>
        <path d="M14.5 3.2L12.6 10.1L11.5 4.2C11.4 3.6 11 3.2 10.4 3.2H7.2L7.1 3.5C7.1 3.5 8.7 3.8 9.5 4.8C10.3 5.7 10.5 6.9 10.5 6.9L12.6 12.8H14.8L17.2 3.2H14.5Z" fill="#fff"/>
        <path d="M33.5 3.2L31.6 12.8H29.6L31.5 3.2H33.5Z" fill="#fff"/>
        <path d="M37.6 5.5C37.6 4.7 38.3 4.2 39.5 4.2C40.3 4.2 41.2 4.5 41.2 4.5L41.5 3.4C41.5 3.4 40.7 3.1 39.4 3.1C36.9 3.1 35.5 4.4 35.5 6.1C35.5 7.5 36.8 8.1 37.7 8.5C38.7 8.9 39 9.2 39 9.7C39 10.4 38.2 10.7 37.4 10.7C36.1 10.7 35.2 10.3 35.2 10.3L34.9 11.5C34.9 11.5 35.7 11.9 37.3 11.9C39.9 11.9 41.2 10.6 41.2 8.9C41.2 7.2 39 6.8 37.6 5.5Z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'Mastercard',
    url: 'https://www.mastercard.com',
    svg: (
      <svg viewBox="0 0 48 32" className="h-7 w-auto" fill="none">
        <circle cx="18" cy="16" r="11" fill="#EB001B"/>
        <circle cx="30" cy="16" r="11" fill="#F79E1B"/>
        <path d="M24 7.2C25.6 8.6 26.6 10.7 26.6 13V16V19C26.6 21.3 25.6 23.4 24 24.8C22.4 23.4 21.4 21.3 21.4 19V13C21.4 10.7 22.4 8.6 24 7.2Z" fill="#FF5F00"/>
      </svg>
    ),
  },
  {
    name: 'American Express',
    url: 'https://www.americanexpress.com',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto">
        <rect width="48" height="16" rx="2" fill="#1F72CD"/>
        <text x="24" y="11" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="Arial">AMEX</text>
      </svg>
    ),
  },
  {
    name: 'Discover',
    url: 'https://www.discover.com',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto">
        <rect width="48" height="16" rx="2" fill="#fff"/>
        <circle cx="38" cy="8" r="6" fill="#F76B1C" opacity="0.15"/>
        <text x="20" y="11" textAnchor="middle" fill="#231F20" fontSize="5" fontWeight="bold" fontFamily="Arial">DISCOVER</text>
      </svg>
    ),
  },
  {
    name: 'PayPal',
    url: 'https://www.paypal.com',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <path d="M7 2H12.5C14.8 2 16.5 3.5 16.5 5.8C16.5 8.6 14.2 10.2 11.4 10.2H9.3L8.6 14H6L7 2Z" fill="#003087"/>
        <path d="M9.8 4.5L9.2 7.8H11.4C12.7 7.8 13.8 7 13.8 5.7C13.8 4.8 13 4.5 12 4.5H9.8Z" fill="#009CDE"/>
        <path d="M18 2H23.5C25.8 2 27.5 3.5 27.5 5.8C27.5 8.6 25.2 10.2 22.4 10.2H20.3L19.6 14H17L18 2Z" fill="#003087" opacity="0.6"/>
        <path d="M20.8 4.5L20.2 7.8H22.4C23.7 7.8 24.8 7 24.8 5.7C24.8 4.8 24 4.5 23 4.5H20.8Z" fill="#009CDE" opacity="0.6"/>
      </svg>
    ),
  },
  {
    name: 'Apple Pay',
    url: 'https://www.apple.com/apple-pay',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <rect width="48" height="16" rx="2" fill="#000"/>
        <text x="24" y="11" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="Arial">Pay</text>
      </svg>
    ),
  },
  {
    name: 'Google Pay',
    url: 'https://pay.google.com',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <rect width="48" height="16" rx="2" fill="#fff"/>
        <text x="24" y="11" textAnchor="middle" fill="#5F6368" fontSize="6" fontWeight="bold" fontFamily="Arial">G Pay</text>
      </svg>
    ),
  },
  {
    name: 'Stripe',
    url: 'https://stripe.com',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <rect width="48" height="16" rx="2" fill="#635BFF"/>
        <text x="24" y="11" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="Arial">stripe</text>
      </svg>
    ),
  },
  {
    name: 'Alipay',
    url: 'https://www.alipay.com',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <rect width="48" height="16" rx="2" fill="#1677FF"/>
        <text x="24" y="11" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold" fontFamily="Arial">Alipay</text>
      </svg>
    ),
  },
  {
    name: 'WeChat Pay',
    url: 'https://pay.weixin.qq.com',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <rect width="48" height="16" rx="2" fill="#09B83E"/>
        <text x="24" y="11" textAnchor="middle" fill="#fff" fontSize="4.5" fontWeight="bold" fontFamily="Arial">WeChat Pay</text>
      </svg>
    ),
  },
  {
    name: 'MTN MoMo',
    url: 'https://www.mtn.com/mtn-momo',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <rect width="48" height="16" rx="2" fill="#FFCC00"/>
        <text x="24" y="11" textAnchor="middle" fill="#000" fontSize="6" fontWeight="bold" fontFamily="Arial">MTN</text>
      </svg>
    ),
  },
  {
    name: 'Hubtel',
    url: 'https://hubtel.com',
    svg: (
      <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
        <rect width="48" height="16" rx="2" fill="#E7401E"/>
        <text x="24" y="11" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold" fontFamily="Arial">Hubtel</text>
      </svg>
    ),
  },
];

export default function PaymentIcons() {
  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      {PAYMENT_METHODS.map((method) => (
        <a
          key={method.name}
          href={method.url}
          target="_blank"
          rel="noopener noreferrer"
          title={method.name}
          className="flex items-center justify-center h-8 px-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 transition-all"
        >
          {method.svg}
        </a>
      ))}
    </div>
  );
}