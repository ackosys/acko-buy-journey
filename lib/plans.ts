import { PlanDetails, PlanTier, FamilyMember, Language } from './types';
import { getT } from './translations';

/* ── Premium Calculation Engine ──
   Based on realistic Indian health insurance pricing.
   Annual premium calculated first, monthly = annual / 12 * 1.08 (8% markup). */

const BASE_ANNUAL_RATES: Record<PlanTier, Record<string, number>> = {
  platinum: {
    '1000000':  8500,   // 10L SI
    '2500000':  14200,  // 25L SI
    '5000000':  21500,  // 50L SI
    '10000000': 32000,  // 1Cr SI
  },
  platinum_lite: {
    '1000000':  5200,
    '2500000':  8800,
    '5000000':  13500,
    '10000000': 20000,
  },
  super_topup: {
    '1000000':  2800,
    '2500000':  4500,
    '5000000':  7200,
    '10000000': 11000,
  },
};

const AGE_MULTIPLIERS: Record<string, number> = {
  '18-25': 0.85,
  '26-35': 1.0,
  '36-45': 1.35,
  '46-55': 1.95,
  '56-65': 2.80,
  '66-75': 3.60,
  '76-99': 4.50,
};

function getAgeMultiplier(age: number): number {
  if (age <= 25) return AGE_MULTIPLIERS['18-25'];
  if (age <= 35) return AGE_MULTIPLIERS['26-35'];
  if (age <= 45) return AGE_MULTIPLIERS['36-45'];
  if (age <= 55) return AGE_MULTIPLIERS['46-55'];
  if (age <= 65) return AGE_MULTIPLIERS['56-65'];
  if (age <= 75) return AGE_MULTIPLIERS['66-75'];
  return AGE_MULTIPLIERS['76-99'];
}

export function calculateFamilyPremium(
  tier: PlanTier,
  si: number,
  members: FamilyMember[],
  frequency: 'monthly' | 'yearly'
): number {
  const siKey = String(si);
  const baseRate = BASE_ANNUAL_RATES[tier][siKey] || BASE_ANNUAL_RATES[tier]['2500000'];

  let totalAnnual = 0;
  for (const member of members) {
    const mult = getAgeMultiplier(member.age);
    totalAnnual += baseRate * mult;
  }

  // Round to nearest 10
  totalAnnual = Math.round(totalAnnual / 10) * 10;

  // GST 18%
  const withGST = Math.round(totalAnnual * 1.18);

  if (frequency === 'monthly') {
    // Monthly = annual / 12 * 1.08 (8% markup for monthly payment)
    return Math.round((withGST / 12) * 1.08);
  }
  return withGST;
}

export function getPlanDetails(
  tier: PlanTier,
  sumInsured: number,
  members: FamilyMember[],
  hasConditions: boolean,
  language: Language = 'en'
): PlanDetails {
  const t = getT(language);
  const monthlyPremium = calculateFamilyPremium(tier, sumInsured, members, 'monthly');
  const yearlyPremium = calculateFamilyPremium(tier, sumInsured, members, 'yearly');

  const plans: Record<PlanTier, PlanDetails> = {
    platinum: {
      tier: 'platinum',
      name: t.plans.platinumName,
      tagline: t.plans.platinumTag,
      sumInsured,
      sumInsuredLabel: formatSI(sumInsured),
      monthlyPremium,
      yearlyPremium,
      features: [
        t.plans.zeroWaitingSpecific,
        t.plans.noRoomRent,
        t.plans.consumablesCovered,
        t.plans.restoreSI,
        t.plans.inflationProtect,
        t.plans.cashless14k,
        t.plans.noCopay,
        t.plans.prePostHosp,
        t.plans.dayCareCovered,
        t.plans.ambulanceCovered,
        t.plans.annualCheckup,
        t.plans.secondOpinion,
      ],
      exclusions: [
        t.plans.maternity,
        t.plans.dentalAccident,
        t.plans.cosmetic,
        t.plans.experimental,
      ],
      waitingPeriod: t.plans.waitPlatinum,
      healthEval: t.plans.evalPlatinum,
      badge: t.plans.badgeMostComprehensive,
      recommended: true,
    },
    platinum_lite: {
      tier: 'platinum_lite',
      name: t.plans.platinumLiteName,
      tagline: t.plans.platinumLiteTag,
      sumInsured,
      sumInsuredLabel: formatSI(sumInsured),
      monthlyPremium,
      yearlyPremium,
      features: [
        t.plans.noRoomRent,
        t.plans.consumablesCovered,
        t.plans.restoreSI,
        t.plans.inflationProtect,
        t.plans.cashless14k,
        t.plans.noCopay,
        t.plans.prePostHosp,
        t.plans.dayCareCovered,
        t.plans.ambulanceCovered,
        t.plans.annualCheckup,
      ],
      exclusions: [
        t.plans.maternity,
        t.plans.dentalAccident,
        t.plans.cosmetic,
        t.plans.specificIllnessWaiting,
      ],
      waitingPeriod: t.plans.waitLite,
      healthEval: t.plans.evalLite,
      badge: t.plans.badgePopular,
    },
    super_topup: {
      tier: 'super_topup',
      name: t.plans.superTopupName,
      tagline: t.plans.superTopupTag,
      sumInsured,
      sumInsuredLabel: formatSI(sumInsured),
      monthlyPremium,
      yearlyPremium,
      features: [
        t.plans.zeroWaiting,
        t.plans.activatesAfterDeductible,
        t.plans.noRoomRent,
        t.plans.consumablesCovered,
        t.plans.worksOnTopGMC,
        t.plans.cashless14k,
        t.plans.restoreSI,
        t.plans.prePostHosp,
      ],
      exclusions: [
        t.plans.deductibleBorne,
        t.plans.maternity,
        t.plans.dentalAccident,
      ],
      waitingPeriod: t.plans.waitTopup,
      healthEval: t.plans.evalTopup,
      badge: t.plans.badgeBestGMC,
    },
  };

  return plans[tier];
}

export function formatSI(amount: number): string {
  if (amount >= 10000000) return `${amount / 10000000} Cr`;
  if (amount >= 100000) return `${amount / 100000}L`;
  return `${amount / 1000}K`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ── Feature Explanations — shown in accordion on plan details ── */
export const FEATURE_EXPLANATIONS: Record<string, string> = {
  'Zero waiting period for specific illnesses': 'Most insurers make you wait 2-4 years before covering illnesses like hernia, kidney stones, or appendicitis. With this plan, these are covered from day 1 — no waiting.',
  'No room rent limit': 'Many policies cap room rent at ₹5,000-10,000/day. If your room costs more, you pay the difference — and all other charges get proportionally reduced too. This plan has no such cap.',
  'Consumables covered': 'Consumables like gloves, syringes, PPE kits, and surgical items are typically excluded and can add ₹15,000-50,000 to your bill. This plan covers them fully.',
  'Restore Sum Insured (100%)': 'If your sum insured gets used up during the year, it\'s automatically restored to 100% for any future claims. You\'re never left without coverage mid-year.',
  'Inflation Protect SI (10% annual increase)': 'Medical inflation in India runs at 14% per year. Your sum insured increases 10% automatically every year at no extra premium, so your cover keeps pace with rising costs.',
  'Cashless at 14,000+ hospitals': 'Walk into any of 14,000+ partner hospitals across India, show your ACKO health card, and get treated. We settle the bill directly with the hospital — you pay nothing upfront.',
  'No co-payment': 'Some policies force you to pay 10-20% of every claim from your pocket. This plan has zero co-pay — ACKO covers 100% of eligible expenses.',
  'Pre & post hospitalisation covered': 'Medical costs don\'t stop at the hospital door. Doctor visits, tests, and medicines 60 days before and 180 days after hospitalisation are fully covered.',
  'Day care treatment covered': 'Modern procedures like dialysis, chemotherapy, cataract surgery, and angioplasty that don\'t need 24-hour admission are fully covered.',
  'Ambulance charges covered': 'Emergency ambulance charges up to ₹5,000 per hospitalisation are covered, so you never have to worry about transport in an emergency.',
  'Annual health check-up': 'A comprehensive health check-up once a year for all covered members, helping you catch potential issues early.',
  'Second opinion benefit': 'Unsure about a diagnosis? ACKO arranges a second medical opinion from top specialists at zero extra cost.',
  'Zero waiting period': 'Coverage starts from day 1 — no waiting period for any illness or condition. This is especially valuable for top-up plans.',
  'Activates after deductible is crossed': 'This top-up plan kicks in after your base policy (GMC or personal) is exhausted. For example, if your deductible is ₹5L, claims above ₹5L are covered by this plan.',
  'Works on top of GMC or any base policy': 'Designed to sit on top of your existing employer or personal health insurance, filling the gap when your base cover falls short during a large claim.',
};

export const SI_OPTIONS = [
  { value: 1000000, label: '10 Lakhs', description: 'Basic protection for young, healthy individuals' },
  { value: 2500000, label: '25 Lakhs', description: 'Good coverage for most families' },
  { value: 5000000, label: '50 Lakhs', description: 'Comprehensive — covers major surgeries and critical care' },
  { value: 10000000, label: '1 Crore', description: 'Premium protection — peace of mind for serious illness' },
];

const CONDITIONS_IDS = [
  { id: 'diabetes', severity: 'mild' as const },
  { id: 'hypertension', severity: 'mild' as const },
  { id: 'thyroid', severity: 'mild' as const },
  { id: 'asthma', severity: 'mild' as const },
  { id: 'pcos', severity: 'mild' as const },
  { id: 'cataract', severity: 'mild' as const },
  { id: 'arthritis', severity: 'mild' as const },
  { id: 'cancer', severity: 'severe' as const },
  { id: 'heart_disease', severity: 'severe' as const },
  { id: 'stroke', severity: 'severe' as const },
  { id: 'organ_transplant', severity: 'severe' as const },
  { id: 'none', severity: 'none' as const },
];

export function getConditionsList(language: Language = 'en'): { id: string; label: string; severity: string }[] {
  const t = getT(language);
  const labels: Record<string, string> = {
    diabetes: t.plans.diabetes,
    hypertension: t.plans.hypertension,
    thyroid: t.plans.thyroid,
    asthma: t.plans.asthma,
    pcos: t.plans.pcos,
    cataract: t.plans.cataract,
    arthritis: t.plans.arthritis,
    cancer: t.plans.cancer,
    heart_disease: t.plans.heartDisease,
    stroke: t.plans.stroke,
    organ_transplant: t.plans.organTransplant,
    none: t.plans.noneAbove,
  };
  return CONDITIONS_IDS.map(c => ({ ...c, label: labels[c.id] || c.id }));
}

/** @deprecated Use getConditionsList(language) for language-aware labels */
export const CONDITIONS_LIST = getConditionsList('en');

export function getSiOptions(language: Language = 'en'): { value: number; label: string; description: string }[] {
  const t = getT(language);
  return [
    { value: 1000000, label: t.plans.si10L, description: t.plans.si10LDesc },
    { value: 2500000, label: t.plans.si25L, description: t.plans.si25LDesc },
    { value: 5000000, label: t.plans.si50L, description: t.plans.si50LDesc },
    { value: 10000000, label: t.plans.si1Cr, description: t.plans.si1CrDesc },
  ];
}

/* ── Pincode to hospital count (mock data) ── */
const PINCODE_HOSPITALS: Record<string, number> = {
  '560': 847,   // Bangalore
  '400': 1234,  // Mumbai
  '110': 956,   // Delhi
  '500': 612,   // Hyderabad
  '600': 723,   // Chennai
  '411': 534,   // Pune
  '380': 412,   // Ahmedabad
  '700': 489,   // Kolkata
  '302': 267,   // Jaipur
  '226': 198,   // Lucknow
};

export function getHospitalCount(pincode: string): number {
  const prefix = pincode.substring(0, 3);
  return PINCODE_HOSPITALS[prefix] || Math.floor(150 + Math.random() * 300);
}

/* ── Nearby labs (mock) ── */
export const NEARBY_LABS = [
  { id: 'thyrocare', name: 'Thyrocare Diagnostics', distance: '1.2 km', rating: 4.3 },
  { id: 'metropolis', name: 'Metropolis Healthcare', distance: '2.4 km', rating: 4.5 },
  { id: 'srl', name: 'SRL Diagnostics', distance: '3.1 km', rating: 4.2 },
  { id: 'lalpath', name: 'Dr Lal PathLabs', distance: '3.8 km', rating: 4.6 },
  { id: 'home', name: 'Home sample collection', distance: 'At your doorstep', rating: 4.7 },
];

export function getHealthEvalType(
  members: FamilyMember[],
  conditions: string[],
  tier: PlanTier
): { type: 'questions_only' | 'doctor_call' | 'lab_visit'; description: string } {
  const hasHeartCondition = conditions.includes('heart_disease') || conditions.includes('stroke');
  const hasSevereCondition = conditions.includes('cancer') || conditions.includes('organ_transplant');
  const hasSenior = members.some(m => m.age >= 55);

  if (hasHeartCondition || hasSevereCondition) {
    return {
      type: 'lab_visit',
      description: 'Based on the health conditions shared, a visit to a nearby lab will be required for blood tests, ECG, and other diagnostics. We\'ll help you pick a convenient lab and time.',
    };
  }

  if (tier === 'platinum' || tier === 'super_topup' || hasSenior) {
    return {
      type: 'doctor_call',
      description: 'A phone call with our doctor and basic medical tests at your home. Takes about 30 minutes.',
    };
  }

  return {
    type: 'questions_only',
    description: 'Just a few simple medical questions online. No physical tests needed.',
  };
}
