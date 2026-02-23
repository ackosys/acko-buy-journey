/**
 * Journey Persistence — saves in-progress journey state to localStorage so
 * the DropOffBanner can show real "continue where you left off" cards.
 *
 * Only serialisable, meaningful fields are stored (no functions, no history).
 */

export type ProductKey = 'health' | 'car' | 'bike' | 'life';

// ── Snapshot shape ────────────────────────────────────────────────────────────

export interface JourneySnapshot {
  product: ProductKey;
  currentStepId: string;
  savedAt: string; // ISO

  /* Health */
  userName?: string;
  members?: { relation: string; age: number; name?: string }[];
  pincode?: string;
  selectedPlan?: { name?: string; monthlyPremium?: number; yearlyPremium?: number; sumInsured?: number; tier?: string } | null;
  paymentComplete?: boolean;
  paymentFrequency?: 'monthly' | 'yearly';
  currentPremium?: number;
  callScheduledDate?: string;
  testScheduledDate?: string;
  testScheduledLab?: string;
  postPaymentPhase?: string | null;

  /* Life */
  name?: string;           // life store uses `name` not `userName`
  gender?: string;
  dob?: string;
  coverAmount?: number;
  annualPremium?: number;
  monthlyPremium?: number;
  ekycComplete?: boolean;
  financialComplete?: boolean;
  medicalComplete?: boolean;
  userPath?: string;       // 'guided' | 'direct_quote'

  /* Motor */
  vehicleType?: 'car' | 'bike' | null;
  vehicleData?: {
    make?: string;
    model?: string;
    variant?: string;
    fuelType?: string;
    registrationYear?: number | null;
  };
  registrationNumber?: string;
  totalPremium?: number;
  selectedPlanType?: string | null;
  ownerName?: string;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'acko_journey_snapshots';

function loadAll(): Partial<Record<ProductKey, JourneySnapshot>> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAll(data: Partial<Record<ProductKey, JourneySnapshot>>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveSnapshot(snapshot: JourneySnapshot): void {
  const all = loadAll();
  all[snapshot.product] = snapshot;
  saveAll(all);
}

export function loadSnapshot(product: ProductKey): JourneySnapshot | null {
  return loadAll()[product] ?? null;
}

export function clearSnapshot(product: ProductKey): void {
  const all = loadAll();
  delete all[product];
  saveAll(all);
}

export function clearAllSnapshots(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ── Which steps are "significant" (worth saving) ──────────────────────────────

export const HEALTH_SAVE_STEPS = new Set([
  'recommendation.result',
  'review.summary',
  'review.consent',
  'review.dob_collection',
  'review.dob_ack',
  'payment.success',
  'health_eval.intro',
  'health_eval.lab_schedule',
  'health_eval.schedule',
  'completion.celebration',
]);

export const LIFE_SAVE_STEPS = new Set([
  'life_quote_display',
  'life_addons_intro',
  'life_review',
  'life_payment',
  'life_ekyc',
  'life_financial',
  'life_medical_eval',
  'life_underwriting',
  'life_complete',
]);

export const MOTOR_SAVE_STEPS = new Set([
  'quote.plans_ready',
  'quote.plan_selection',
  'quote.plan_selected',
  'addons.out_of_pocket',
  'addons.protect_everyone',
  'addons.complete',
  'review.premium_breakdown',
  'payment.success',
  'completion.dashboard',
]);

// ── Step → DropOff display info ───────────────────────────────────────────────

export interface DropOffDisplay {
  title: string;
  subtitle: string;
  ctaLabel: string;
  /** resume URL (relative, no origin) */
  route: string;
  urgency: 'high' | 'medium' | 'low';
  badge: string;
}

function fmt(n: number | undefined, freq: string = 'monthly'): string {
  if (!n) return '';
  return `₹${n.toLocaleString('en-IN')}${freq === 'monthly' ? '/mo' : '/yr'}`;
}

function vehicleLabel(snap: JourneySnapshot): string {
  const v = snap.vehicleData;
  if (!v?.make) return snap.vehicleType === 'bike' ? 'Bike' : 'Car';
  return [v.make, v.model].filter(Boolean).join(' ');
}

export function getDropOffDisplay(snap: JourneySnapshot): DropOffDisplay | null {
  const { product, currentStepId } = snap;

  /* ── HEALTH ─────────────────────────────────────────────── */
  if (product === 'health') {
    const memberCount = snap.members?.length ?? 0;
    const memberStr = memberCount > 0 ? `${memberCount} member${memberCount > 1 ? 's' : ''}` : '';
    const premStr = fmt(snap.currentPremium, snap.paymentFrequency);

    if (['recommendation.result', 'review.summary', 'review.consent', 'review.dob_collection', 'review.dob_ack'].includes(currentStepId)) {
      return {
        title: 'Your health quote is ready',
        subtitle: [premStr, memberStr].filter(Boolean).join(' · '),
        ctaLabel: 'Complete purchase',
        route: '/health?resume=1',
        urgency: 'high',
        badge: 'Quote ready',
      };
    }
    if (currentStepId === 'payment.success' || currentStepId === 'health_eval.intro') {
      return {
        title: 'Schedule your health check-up',
        subtitle: `Policy active · Tests pending${memberStr ? ' · ' + memberStr : ''}`,
        ctaLabel: 'Schedule now',
        route: '/health?resume=1',
        urgency: 'high',
        badge: 'Action needed',
      };
    }
    if (currentStepId === 'health_eval.lab_schedule' || currentStepId === 'health_eval.schedule') {
      const labStr = snap.testScheduledLab ? ` · ${snap.testScheduledLab}` : '';
      const dateStr = snap.testScheduledDate ? ` on ${snap.testScheduledDate}` : '';
      return {
        title: 'Your health tests are scheduled',
        subtitle: `Tests booked${dateStr}${labStr}`,
        ctaLabel: 'View details',
        route: '/health?resume=1',
        urgency: 'medium',
        badge: 'In progress',
      };
    }
    if (currentStepId === 'completion.celebration') {
      return {
        title: 'Your health policy is active!',
        subtitle: `${premStr ? premStr + ' · ' : ''}${memberStr}`,
        ctaLabel: 'View dashboard',
        route: '/health?resume=1',
        urgency: 'low',
        badge: 'Policy active',
      };
    }
  }

  /* ── LIFE ────────────────────────────────────────────────── */
  if (product === 'life') {
    const displayName = snap.name ? snap.name : '';
    const coverStr = snap.coverAmount ? `₹${(snap.coverAmount / 10000000).toFixed(0)} Cr cover` : '';
    const premStr = snap.annualPremium ? `₹${snap.annualPremium.toLocaleString('en-IN')}/yr` : (snap.monthlyPremium ? `₹${snap.monthlyPremium.toLocaleString('en-IN')}/mo` : '');

    if (currentStepId === 'life_quote_display' || currentStepId === 'life_addons_intro') {
      return {
        title: `${displayName ? displayName + ', your' : 'Your'} life quote is ready`,
        subtitle: [premStr, coverStr].filter(Boolean).join(' · '),
        ctaLabel: 'Review & buy',
        route: '/life?resume=1',
        urgency: 'high',
        badge: 'Quote ready',
      };
    }
    if (currentStepId === 'life_review' || currentStepId === 'life_payment') {
      return {
        title: 'Complete your life insurance purchase',
        subtitle: [premStr, coverStr].filter(Boolean).join(' · '),
        ctaLabel: 'Complete now',
        route: '/life?resume=1',
        urgency: 'high',
        badge: 'Action needed',
      };
    }
    if (currentStepId === 'life_ekyc') {
      return {
        title: 'Complete eKYC to activate your policy',
        subtitle: `Payment done · eKYC pending${coverStr ? ' · ' + coverStr : ''}`,
        ctaLabel: 'Complete eKYC',
        route: '/life?resume=1',
        urgency: 'high',
        badge: 'Action needed',
      };
    }
    if (currentStepId === 'life_financial') {
      return {
        title: 'Submit your income documents',
        subtitle: `eKYC done · Financial docs pending`,
        ctaLabel: 'Upload now',
        route: '/life?resume=1',
        urgency: 'medium',
        badge: 'Step pending',
      };
    }
    if (currentStepId === 'life_medical_eval') {
      return {
        title: 'Medical evaluation in progress',
        subtitle: `Results expected in 2–3 days${coverStr ? ' · ' + coverStr : ''}`,
        ctaLabel: 'Track status',
        route: '/life?resume=1',
        urgency: 'medium',
        badge: 'In progress',
      };
    }
    if (currentStepId === 'life_underwriting' || currentStepId === 'life_complete') {
      return {
        title: 'Your policy is being processed',
        subtitle: `Underwriting in progress${coverStr ? ' · ' + coverStr : ''}`,
        ctaLabel: 'Track status',
        route: '/life?resume=1',
        urgency: 'low',
        badge: 'Processing',
      };
    }
  }

  /* ── CAR / BIKE ──────────────────────────────────────────── */
  if (product === 'car' || product === 'bike') {
    const vLabel = vehicleLabel(snap);
    const regStr = snap.registrationNumber ? ` · ${snap.registrationNumber.toUpperCase()}` : '';
    const premStr = snap.totalPremium ? `₹${snap.totalPremium.toLocaleString('en-IN')}/yr` : '';
    const planStr = snap.selectedPlanType === 'zero_dep' ? 'Zero Dep' : snap.selectedPlanType === 'third_party' ? 'Third Party' : snap.selectedPlanType === 'comprehensive' ? 'Comprehensive' : '';
    const route = `/motor?vehicle=${product}&resume=1`;

    if (['quote.plans_ready', 'quote.plan_selection'].includes(currentStepId)) {
      return {
        title: `Your ${product} insurance quote is ready`,
        subtitle: `${vLabel}${regStr}`,
        ctaLabel: 'View plans',
        route,
        urgency: 'high',
        badge: 'Quote ready',
      };
    }
    if (['quote.plan_selected', 'addons.out_of_pocket', 'addons.protect_everyone', 'addons.complete', 'review.premium_breakdown'].includes(currentStepId)) {
      return {
        title: `Complete your ${product} insurance purchase`,
        subtitle: [planStr, premStr, `${vLabel}${regStr}`].filter(Boolean).join(' · '),
        ctaLabel: 'Complete purchase',
        route,
        urgency: 'high',
        badge: 'Action needed',
      };
    }
    if (currentStepId === 'payment.success' || currentStepId === 'completion.dashboard') {
      return {
        title: `Your ${product} policy is active`,
        subtitle: [planStr, `${vLabel}${regStr}`].filter(Boolean).join(' · '),
        ctaLabel: 'View policy',
        route,
        urgency: 'low',
        badge: 'Policy active',
      };
    }
  }

  return null;
}
