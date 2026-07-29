export type BillingPlanId = 'starter' | 'pro' | 'enterprise';

export type InvoiceStatus = 'paid' | 'pending' | 'failed';

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  priceLabel: string;
  periodLabel: string;
  description: string;
  featured?: boolean;
  features: string[];
}

export interface CurrentSubscription {
  planId: BillingPlanId;
  planName: string;
  priceLabel: string;
  billingCycle: string;
  status: 'active' | 'trial' | 'past_due';
  seats: number;
  seatsUsed: number;
  renewsAt: string;
  startedAt: string;
}

export interface BillingInvoice {
  id: string;
  number: string;
  issuedAt: string;
  amountLabel: string;
  status: InvoiceStatus;
  planName: string;
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceLabel: '12 EUR',
    periodLabel: '/ mois',
    description: 'Pour demarrer avec une petite equipe.',
    features: [
      'Jusqu a 5 membres',
      'Fichiers et discussions',
      'Calendrier partage',
      'Support email',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '29 EUR',
    periodLabel: '/ mois',
    description: 'Le plan recommande pour les equipes actives.',
    featured: true,
    features: [
      'Jusqu a 25 membres',
      'Visio et reunions',
      'Roles et permissions',
      'Historique et exports',
      'Support prioritaire',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceLabel: '79 EUR',
    periodLabel: '/ mois',
    description: 'Pour les organisations avec des besoins avances.',
    features: [
      'Membres illimites',
      'SSO et securite avancee',
      'SLA dedie',
      'Onboarding accompagne',
      'Support 24/7',
    ],
  },
];

export const CURRENT_SUBSCRIPTION: CurrentSubscription = {
  planId: 'pro',
  planName: 'Pro',
  priceLabel: '29 EUR / mois',
  billingCycle: 'Mensuel',
  status: 'active',
  seats: 25,
  seatsUsed: 12,
  renewsAt: '2026-08-29',
  startedAt: '2026-01-29',
};

export const BILLING_INVOICES: BillingInvoice[] = [
  {
    id: 'inv-2026-07',
    number: 'INV-2026-007',
    issuedAt: '2026-07-29',
    amountLabel: '29,00 EUR',
    status: 'paid',
    planName: 'Pro',
  },
  {
    id: 'inv-2026-06',
    number: 'INV-2026-006',
    issuedAt: '2026-06-29',
    amountLabel: '29,00 EUR',
    status: 'paid',
    planName: 'Pro',
  },
  {
    id: 'inv-2026-05',
    number: 'INV-2026-005',
    issuedAt: '2026-05-29',
    amountLabel: '29,00 EUR',
    status: 'paid',
    planName: 'Pro',
  },
  {
    id: 'inv-2026-04',
    number: 'INV-2026-004',
    issuedAt: '2026-04-29',
    amountLabel: '12,00 EUR',
    status: 'paid',
    planName: 'Starter',
  },
];
