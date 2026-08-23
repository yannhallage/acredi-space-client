import type { PlanResponse } from '../api/billing';

export type PlanCatalogKey = 'free' | 'pro' | 'pro_plus';

export type PlanFeatureKey =
  | 'user'
  | 'gmail'
  | 'organization_storage'
  | 'word'
  | 'excel'
  | 'messaging'
  | 'video_conference'
  | 'note'
  | 'document_conversion';

export interface PlanCatalogItem {
  key: PlanCatalogKey;
  name: string;
  description: string;
  price: {
    monthly: number;
    currency: 'XOF';
  };
  limits: {
    users: number;
    organization_storage_gb: number;
    document_conversions_per_month: number | null;
  };
  features: Record<PlanFeatureKey, boolean>;
}

const FEATURE_ORDER: PlanFeatureKey[] = [
  'gmail',
  'word',
  'excel',
  'messaging',
  'video_conference',
  'note',
  'document_conversion',
];

const FEATURE_LABELS: Record<PlanFeatureKey, string> = {
  user: 'Utilisateurs',
  gmail: 'Gmail',
  organization_storage: 'Stockage organisation',
  word: 'Word',
  excel: 'Excel',
  messaging: 'Messagerie',
  video_conference: 'Visioconference',
  note: 'Notes',
  document_conversion: 'Conversion de documents',
};

const SLUG_ALIASES: Record<string, PlanCatalogKey> = {
  free: 'free',
  starter: 'free',
  'starter-monthly': 'free',
  pro: 'pro',
  'pro-monthly': 'pro',
  pro_plus: 'pro_plus',
  'pro-plus': 'pro_plus',
  proplus: 'pro_plus',
  enterprise: 'pro_plus',
  'enterprise-annual': 'pro_plus',
};

export const PLAN_CATALOG: Record<PlanCatalogKey, PlanCatalogItem> = {
  free: {
    key: 'free',
    name: 'Free',
    description: 'Pour demarrer avec une petite equipe.',
    price: { monthly: 0, currency: 'XOF' },
    limits: {
      users: 5,
      organization_storage_gb: 2,
      document_conversions_per_month: 5,
    },
    features: {
      user: true,
      gmail: false,
      organization_storage: true,
      word: false,
      excel: false,
      messaging: true,
      video_conference: true,
      note: true,
      document_conversion: true,
    },
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    description: 'Pour les equipes en croissance.',
    price: { monthly: 7500, currency: 'XOF' },
    limits: {
      users: 25,
      organization_storage_gb: 50,
      document_conversions_per_month: 50,
    },
    features: {
      user: true,
      gmail: true,
      organization_storage: true,
      word: true,
      excel: true,
      messaging: true,
      video_conference: true,
      note: true,
      document_conversion: true,
    },
  },
  pro_plus: {
    key: 'pro_plus',
    name: 'Pro+',
    description: 'Pour les organisations avancees.',
    price: { monthly: 15000, currency: 'XOF' },
    limits: {
      users: 100,
      organization_storage_gb: 250,
      document_conversions_per_month: null,
    },
    features: {
      user: true,
      gmail: true,
      organization_storage: true,
      word: true,
      excel: true,
      messaging: true,
      video_conference: true,
      note: true,
      document_conversion: true,
    },
  },
};

const CATALOG_ORDER: PlanCatalogKey[] = ['free', 'pro', 'pro_plus'];

function quotaLabel(value: number | null, singular: string, plural: string) {
  if (value == null) {
    return `${plural} illimites`;
  }
  const noun = value === 1 ? singular : plural;
  return `${value} ${noun} / mois`;
}

export function planCatalogLimitLines(item: PlanCatalogItem) {
  return [
    `Jusqu'a ${item.limits.users} utilisateurs`,
    `${item.limits.organization_storage_gb} Go de stockage`,
    quotaLabel(
      item.limits.document_conversions_per_month,
      'conversion',
      'conversions'
    ),
  ];
}

export function planCatalogFeatureLines(item: PlanCatalogItem) {
  return FEATURE_ORDER.map((key) => ({
    key,
    label: FEATURE_LABELS[key],
    included: item.features[key],
  }));
}

export function resolvePlanCatalogKey(plan: Pick<PlanResponse, 'slug' | 'name'>) {
  const slug = plan.slug?.trim().toLowerCase() ?? '';
  if (SLUG_ALIASES[slug]) {
    return SLUG_ALIASES[slug];
  }

  const name = (plan.name ?? '').trim().toLowerCase().replace(/\s+/g, '');
  if (name === 'free' || name === 'starter' || name === 'gratuit') {
    return 'free';
  }
  if (name === 'pro+' || name === 'proplus' || name === 'enterprise') {
    return 'pro_plus';
  }
  if (name === 'pro') {
    return 'pro';
  }
  return null;
}

export function resolvePlanCatalog(plan: PlanResponse, index: number) {
  const key = resolvePlanCatalogKey(plan) ?? CATALOG_ORDER[index] ?? 'free';
  return PLAN_CATALOG[key];
}

export function sortPlansByCatalog(plans: PlanResponse[]) {
  const rank: Record<PlanCatalogKey, number> = {
    free: 0,
    pro: 1,
    pro_plus: 2,
  };

  return [...plans].sort((left, right) => {
    const leftKey = resolvePlanCatalogKey(left);
    const rightKey = resolvePlanCatalogKey(right);
    const leftRank = leftKey ? rank[leftKey] : 99;
    const rightRank = rightKey ? rank[rightKey] : 99;
    return leftRank - rightRank;
  });
}
