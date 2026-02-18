import { MotorJourneyState, FuelType, NcbPercentage } from './types';

/* ═══════════════════════════════════════════════
   ACKO Motor Insurance — Premium Calculation Engine
   Based on realistic Indian motor insurance pricing
   ═══════════════════════════════════════════════ */

export type MotorPlanType = 'comprehensive' | 'zero_dep' | 'third_party';
export type GarageTier = 'network' | 'all';

export interface MotorPlanDetails {
  type: MotorPlanType;
  garageTier?: GarageTier;
  name: string;
  tagline: string;
  description: string;
  idv: number;
  odPremium: number;
  tpPremium: number;
  ncbDiscount: number;
  basePrice: number;
  gst: number;
  totalPrice: number;
  features: string[];
  notCovered: string[];
  addOnsAvailable: string[];
  badge?: string;
  recommended?: boolean;
}

export interface MotorAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  mandatory?: boolean;
  popular?: boolean;
  recommended?: boolean;
  category?: 'out_of_pocket' | 'protect_everyone';
  hasVariants?: boolean;
  variants?: {
    id: string;
    name: string;
    price: number;
    recommended?: boolean;
    badge?: string;
    features?: string[];
  }[];
}

/* ── IDV Calculation ──
   IDV = Manufacturer's listed selling price - Depreciation
   Depreciation rates based on vehicle age */

const DEPRECIATION_RATES: Record<number, number> = {
  0: 0.05,   // 0-6 months: 5%
  1: 0.15,   // 6-12 months: 15%
  2: 0.20,   // 1-2 years: 20%
  3: 0.30,   // 2-3 years: 30%
  4: 0.40,   // 3-4 years: 40%
  5: 0.50,   // 4-5 years: 50%
};

export function calculateIDV(
  makePrice: number,
  vehicleAge: number,
  cngKitValue: number = 0
): { min: number; recommended: number; max: number } {
  const depRate = DEPRECIATION_RATES[Math.min(vehicleAge, 5)] || 0.50;
  const baseIDV = makePrice * (1 - depRate);
  
  // IDV range: -10% to +5% of calculated value
  const recommended = Math.round((baseIDV + cngKitValue) / 1000) * 1000;
  const min = Math.round(recommended * 0.90 / 1000) * 1000;
  const max = Math.round(recommended * 1.05 / 1000) * 1000;
  
  return { min, recommended, max };
}

/* ── Third Party Premium ──
   Fixed by IRDAI based on engine capacity (CC) or power (kW) */

const TP_RATES_CAR: Record<string, number> = {
  '0-1000': 2072,
  '1000-1500': 3221,
  '1500+': 7890,
};

const TP_RATES_BIKE: Record<string, number> = {
  '0-75': 482,
  '75-150': 714,
  '150-350': 1366,
  '350+': 2804,
};

export function calculateTPPremium(
  vehicleType: 'car' | 'bike',
  engineCC: number
): number {
  if (vehicleType === 'bike') {
    if (engineCC <= 75) return TP_RATES_BIKE['0-75'];
    if (engineCC <= 150) return TP_RATES_BIKE['75-150'];
    if (engineCC <= 350) return TP_RATES_BIKE['150-350'];
    return TP_RATES_BIKE['350+'];
  } else {
    if (engineCC <= 1000) return TP_RATES_CAR['0-1000'];
    if (engineCC <= 1500) return TP_RATES_CAR['1000-1500'];
    return TP_RATES_CAR['1500+'];
  }
}

/* ── Own Damage Premium ──
   OD Premium = IDV × OD rate × (1 - NCB%) */

const OD_RATES_CAR: Record<string, number> = {
  petrol: 0.031,   // 3.1% of IDV
  diesel: 0.033,   // 3.3% of IDV
  cng: 0.029,      // 2.9% of IDV
  electric: 0.025, // 2.5% of IDV
};

const OD_RATES_BIKE: Record<string, number> = {
  petrol: 0.028,
  diesel: 0.030,
  cng: 0.026,
  electric: 0.022,
};

export function calculateODPremium(
  vehicleType: 'car' | 'bike',
  idv: number,
  fuelType: FuelType,
  ncbPercentage: NcbPercentage,
  garageTier: GarageTier = 'all'
): { odPremium: number; ncbDiscount: number } {
  const rates = vehicleType === 'bike' ? OD_RATES_BIKE : OD_RATES_CAR;
  const odRate = rates[fuelType] || rates.petrol;
  
  const baseOD = idv * odRate;
  const ncbDiscount = baseOD * (ncbPercentage / 100);
  let odPremium = baseOD - ncbDiscount;
  
  // Network garage discount: 10-15% off
  if (garageTier === 'network') {
    odPremium = odPremium * 0.85;
  }
  
  return {
    odPremium: Math.round(odPremium),
    ncbDiscount: Math.round(ncbDiscount),
  };
}

/* ── Zero Dep Premium ──
   Zero Dep = OD Premium × 1.20 (20% markup) */

export function calculateZeroDepPremium(
  odPremium: number,
  vehicleAge: number
): number {
  // Zero dep not available for vehicles > 5 years
  if (vehicleAge > 5) return 0;
  
  // Premium markup: 15-25% based on age
  const markup = vehicleAge <= 2 ? 1.15 : 1.20;
  return Math.round(odPremium * markup);
}

/* ── Plan Details Generator ── */

export function getMotorPlanDetails(
  state: MotorJourneyState,
  planType: MotorPlanType,
  garageTier?: GarageTier
): MotorPlanDetails {
  const { vehicleType, vehicleData, previousPolicy } = state;
  
  // Mock values for demo
  const makePrice = 800000; // ₹8L for Swift
  const engineCC = vehicleType === 'bike' ? 150 : 1200;
  const vehicleAge = vehicleData.registrationYear ? new Date().getFullYear() - vehicleData.registrationYear : 3;
  
  const idvData = calculateIDV(makePrice, vehicleAge);
  const idv = idvData.recommended;
  const ncb = previousPolicy.ncbPercentage || 0;
  
  const tpPremium = calculateTPPremium(vehicleType || 'car', engineCC);
  
  if (planType === 'third_party') {
    return {
      type: 'third_party',
      name: 'Third-party Plan',
      tagline: 'Minimum coverage required by law',
      description: 'It covers damage caused by your car to others and their property, but does not cover any damage caused to your car.',
      idv: 0,
      odPremium: 0,
      tpPremium,
      ncbDiscount: 0,
      basePrice: tpPremium,
      gst: Math.round(tpPremium * 0.18),
      totalPrice: Math.round(tpPremium * 1.18),
      features: [
        'Third-party liabilities — Covers damage caused to others and their property in case of an accident',
      ],
      notCovered: [
        'Own car damage — Doesn\'t cover damage to your car',
        'Illegal driving — Doesn\'t cover expenses arising from traffic law violations like driving without a valid licence or under the influence of alcohol, drugs etc.',
      ],
      addOnsAvailable: [
        'personal_accident',
        'passenger_protection',
        'paid_driver',
      ],
      badge: 'Best suited for old vehicles that have low resale value',
    };
  }
  
  const { odPremium, ncbDiscount } = calculateODPremium(
    vehicleType || 'car',
    idv,
    vehicleData.fuelType || 'petrol',
    ncb,
    garageTier || 'all'
  );
  
  if (planType === 'comprehensive') {
    const basePrice = odPremium + tpPremium;
    const gst = Math.round(basePrice * 0.18);
    const totalPrice = basePrice + gst;
    
    return {
      type: 'comprehensive',
      garageTier: garageTier || 'all',
      name: garageTier === 'network' ? 'Comprehensive Plan — Network Garages' : 'Comprehensive Plan — All Garages',
      tagline: 'Complete protection for your vehicle',
      description: 'This plan includes fire, theft, accident, and third party liability cover.',
      idv,
      odPremium,
      tpPremium,
      ncbDiscount,
      basePrice,
      gst,
      totalPrice,
      features: [
        'Accidents — Covers car repairs if your car is damaged in an accident',
        'Fire, theft and calamities — Covers car theft, and car damage caused by fire, and natural calamities',
        'Rat-bite protection — Covers car damage caused by rat bites',
        'Third-party liabilities — Covers damage caused to others and their property in case of an accident',
        'Free car pick up & drop',
        garageTier === 'network' ? 'Cashless claims at 5,400+ network garages' : 'Cashless claims at any garage',
        'Real-time repair updates',
      ],
      notCovered: [
        'Damage due to regular wear and tear — Doesn\'t cover natural wear and tear of parts like tyres, tubes, and engine',
        'Commercial use of the car — Doesn\'t cover damage caused to the car if it\'s used for business-related activities',
        'Pre-existing damage — Doesn\'t cover any damage suffered by your car before the purchase of this policy',
        'Illegal driving — Doesn\'t cover expenses arising from traffic law violations',
      ],
      addOnsAvailable: [
        'engine_protection',
        'extra_car_protection',
        'consumables_cover',
        'personal_accident',
        'passenger_protection',
        'paid_driver',
      ],
      recommended: garageTier === 'all',
      badge: garageTier === 'network' ? 'Popular in your area' : 'Recommended for your car',
    };
  }
  
  // Zero Dep
  const zeroDepOD = calculateZeroDepPremium(odPremium, vehicleAge);
  const basePrice = zeroDepOD + tpPremium;
  const gst = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + gst;
  
  return {
    type: 'zero_dep',
    name: 'Zero Depreciation',
    tagline: 'Zero out-of-pocket on repairs',
    description: 'It covers damage to your car, and damage caused by your car to others and their property. It also covers full cost of car parts if they\'re replaced during a claim.',
    idv,
    odPremium: zeroDepOD,
    tpPremium,
    ncbDiscount,
    basePrice,
    gst,
    totalPrice,
    features: [
      'Zero depreciation — Covers full cost of car parts during a claim and saves you from depreciation charges',
      'Accidents — Covers car repairs if your car is damaged in an accident',
      'Fire, theft and calamities — Covers car theft, and car damage caused by fire, and natural calamities',
      'Rat-bite protection — Covers car damage caused by rat bites',
      'Third-party liabilities — Covers damage caused to others and their property',
      'Free car pick up & drop',
      'Cashless claims at any garage',
      'Real-time repair updates',
    ],
    notCovered: [
      'Damage due to regular wear and tear — Doesn\'t cover natural wear and tear of parts like tyres, tubes, and engine',
      'Commercial use of the car — Doesn\'t cover damage caused to the car if it\'s used for business-related activities',
      'Pre-existing damage — Doesn\'t cover any damage suffered by your car before the purchase of this policy',
      'Illegal driving — Doesn\'t cover expenses arising from traffic law violations',
    ],
    addOnsAvailable: [
      'engine_protection',
      'extra_car_protection',
      'consumables_cover',
      'personal_accident',
      'passenger_protection',
      'paid_driver',
    ],
    recommended: true,
    badge: 'Best value',
  };
}

/* ── Add-ons ── */

export function getMotorAddOns(vehicleType: 'car' | 'bike' = 'car'): MotorAddOn[] {
  return [
    {
      id: 'engine_protection',
      name: 'Engine Protect',
      description: 'Save yourself from costly engine repairs. Covers engine and gearbox damage caused by non-accidental events like floods, heavy rains, and oil leaks.',
      price: 399,
      category: 'out_of_pocket',
      recommended: true,
    },
    {
      id: 'extra_car_protection',
      name: 'Extra Car Protect',
      description: 'Be prepared for roadside emergencies.',
      price: 399,
      category: 'out_of_pocket',
      hasVariants: true,
      variants: [
        {
          id: 'lite',
          name: 'LITE',
          price: 399,
          features: [
            'Free 24x7 roadside assistance up to 40km',
            'Key repair/replacement up to ₹7,000',
            'Accommodation expenses up to ₹6,500 for outstation repairs',
          ],
        },
        {
          id: 'plus',
          name: 'PLUS',
          price: 799,
          recommended: true,
          features: [
            '24x7 car breakdown assistance - unlimited',
            'Key repair/replacement up to ₹25,000',
            'Accommodation expenses up to ₹15,000 during outstation repairs',
          ],
        },
      ],
    },
    {
      id: 'consumables_cover',
      name: 'Consumables Cover',
      description: 'Save on repair extras. Covers the cost of consumables like nuts, bolts, brake oil, engine oil etc. that get replaced during repair.',
      price: 399,
      category: 'out_of_pocket',
    },
    {
      id: 'ncb_protect',
      name: 'NCB Protect',
      description: 'Protect your No Claim Bonus. Make a claim without losing your NCB. Valid only for 1 claim.',
      price: 399,
      category: 'out_of_pocket',
    },
    {
      id: 'return_to_invoice',
      name: 'Return to Invoice Cover',
      description: 'Ensure full coverage for total loss. Pays the complete invoice value of your car or the current on-road price, whichever is lower, if your car is stolen or damaged beyond repair.',
      price: 399,
      category: 'out_of_pocket',
    },
    {
      id: 'personal_accident',
      name: 'Personal Accident Cover',
      description: 'Coverage for accidental injury or death of the car owner.',
      price: 399,
      category: 'protect_everyone',
      mandatory: true,
      hasVariants: true,
      variants: [
        {
          id: '15_lakh',
          name: '₹15 lakh coverage',
          price: 399,
          recommended: true,
          badge: 'Premium offer',
          features: [
            'Full coverage in case of death or permanent disability',
            '50% coverage for partial disability (loss of one eye or limb)',
          ],
        },
        {
          id: '50_lakh',
          name: '₹50 lakh coverage',
          price: 999,
          features: [
            'Full coverage in case of death or permanent disability',
            '50% coverage for partial disability',
            '4 out of 5 ACKO users prefer higher coverage',
          ],
        },
      ],
    },
    {
      id: 'passenger_protection',
      name: 'Passenger Protection',
      description: 'For your loved ones. Coverage of up to ₹1 lakh per passenger for accidental death or injury.',
      price: 399,
      category: 'protect_everyone',
    },
    {
      id: 'paid_driver',
      name: 'Paid Driver Protection',
      description: 'For your driver. Pays up to your legal obligation amount in the event of serious injury or death of your paid driver in an accident.',
      price: 399,
      category: 'protect_everyone',
    },
  ];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIDV(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)} Lakh`;
  return `${(amount / 1000).toFixed(0)}K`;
}
