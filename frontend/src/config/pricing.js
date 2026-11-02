/**
 * Pricing — SINGLE SOURCE OF TRUTH for plan data.
 *
 * The Landing page and the Pricing page both render from this file.
 * To wire up checkout later (Whop), set `checkoutUrl` on the paid tiers —
 * no page changes needed. While `checkoutUrl` is null, paid-tier buttons
 * route visitors to sign-up with a "checkout coming online" notice.
 *
 * No payment processor is integrated anywhere in the app yet.
 */

export const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '$0',
    period: 'forever',
    description: 'Get your first professional quotes out the door.',
    features: [
      'A few quotes per month',
      'Basic quote templates',
      'PDF quote export',
      'Vendor list',
      'Email support'
    ],
    cta: 'Get Started Free',
    popular: false,
    checkoutUrl: null
  },
  {
    id: 'solo',
    name: 'Solo',
    price: 19,
    priceLabel: '$19',
    period: 'per month',
    description: 'For the owner-operator who quotes every week.',
    features: [
      'Unlimited quotes',
      'Receipt capture & tracking',
      'Automatic follow-up reminders',
      'Material price lookups',
      'Job scheduling',
      '1 user'
    ],
    cta: 'Start Solo',
    popular: true,
    checkoutUrl: null // TODO(whop): set when Whop checkout is wired
  },
  {
    id: 'crew',
    name: 'Crew',
    price: 39,
    priceLabel: '$39',
    period: 'per month',
    description: 'For shops running more than one truck.',
    features: [
      'Everything in Solo',
      'Multi-user / team accounts',
      'Shared vendors & templates',
      'Team scheduling',
      'Priority support'
    ],
    cta: 'Start Crew',
    popular: false,
    checkoutUrl: null // TODO(whop): set when Whop checkout is wired
  }
];

export const CHECKOUT_COMING_SOON_MESSAGE =
  'Checkout is coming online shortly — create your free account now and we will switch your plan on the moment it opens.';
