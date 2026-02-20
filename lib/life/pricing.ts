/**
 * ACKO Life Insurance Pricing Module
 * Based on actual ACKO pricing structure (2026)
 * 
 * Sources:
 * - https://www.acko.com/life-insurance/cheap-term-life-insurance/
 * - https://www.acko.com/life-insurance/1-crore-term-insurance/
 * 
 * Key Points:
 * - Starting from ₹18/day (~₹6,570/year) for ₹1 Cr coverage (30-year-old non-smoker)
 * - Premiums based on: age, gender, smoking status, health, occupation, policy term
 * - Riders: Accidental Death, Critical Illness, Permanent Disability
 * - Accidental riders: Combined max 30% of base premium
 * - Critical Illness: Max 100% of base premium
 */

export interface PricingFactors {
  age: number;
  gender: 'male' | 'female';
  smokingStatus: 'never' | 'past' | 'current';
  sumAssured: number; // Coverage amount
  policyTerm: number; // Years
  occupationRisk: 'low' | 'medium' | 'high';
  bmi?: number; // Body Mass Index
}

export interface RiderPricing {
  riderId: 'accidental_death' | 'critical_illness' | 'disability';
  name: string;
  basePremiumPerLakh: number; // Premium per ₹1 lakh coverage
  minCoverage: number;
  maxCoverageMultiplier: number; // Multiple of base sum assured
  isAccidental: boolean; // Counts toward 30% accidental cap
}

// Base premium calculation constants
const BASE_RATE_PER_LAKH = {
  // Annual premium per ₹1 lakh coverage for 30-year-old non-smoker
  male: 6.57, // ₹657/yr for ₹10L = ~₹6,570/yr for ₹1Cr
  female: 5.50, // Women get ~15-20% lower rates
};

// Age multipliers (younger = cheaper)
const AGE_MULTIPLIERS: Record<string, number> = {
  '18-25': 0.75, // 25% discount for very young buyers
  '26-30': 1.0,  // Base rate
  '31-35': 1.25,
  '36-40': 1.6,
  '41-45': 2.1,
  '46-50': 3.0,
  '51-55': 4.2,
  '56-60': 6.0,
};

// Smoking status multipliers
const SMOKING_MULTIPLIERS = {
  never: 1.0,    // Base rate
  past: 1.15,    // 15% higher
  current: 1.8,  // 80% higher
};

// Occupation risk multipliers
const OCCUPATION_MULTIPLIERS = {
  low: 1.0,      // Desk jobs, professionals
  medium: 1.25,  // Field work, moderate risk
  high: 1.65,    // Mining, construction, hazardous work
};

// Policy term adjustments (longer term = slightly lower per-year rate)
const TERM_MULTIPLIERS: Record<number, number> = {
  10: 1.1,
  15: 1.05,
  20: 1.0,  // Base
  25: 0.98,
  30: 0.95,
  35: 0.93,
  40: 0.92,
};

// ACTUAL ACKO RIDER PRICING - Extracted from screenshots (Feb 2026)
// Pricing map: coverage amount → annual premium
export const ACKO_RIDER_PRICING_MAP = {
  disability: {
    1000000: 264,   // ₹10L → ₹264/yr
    1500000: 384,   // ₹15L → ₹384/yr
    2000000: 516,   // ₹20L → ₹516/yr
    2500000: 636,   // ₹25L → ₹636/yr
    3000000: 756,   // ₹30L → ₹756/yr
    4000000: 1008,  // ₹40L → ₹1,008/yr
    4500000: 1128,  // ₹45L → ₹1,128/yr
    5000000: 1248,  // ₹50L → ₹1,248/yr
    5500000: 1368,  // ₹55L → ₹1,368/yr
    6000000: 1500,  // ₹60L → ₹1,500/yr
  },
  accidental_death: {
    1000000: 456,   // ₹10L → ₹456/yr
    1500000: 684,   // ₹15L → ₹684/yr
    2000000: 912,   // ₹20L → ₹912/yr
    2500000: 1140,  // ₹25L → ₹1,140/yr
    3000000: 1356,  // ₹30L → ₹1,356/yr
  },
  critical_illness: {
    500000: 1020,   // ₹5L → ₹1,020/yr
    600000: 1188,   // ₹6L → ₹1,188/yr
    700000: 1368,   // ₹7L → ₹1,368/yr
    800000: 1536,   // ₹8L → ₹1,536/yr
    900000: 1704,   // ₹9L → ₹1,704/yr
    1000000: 1884,  // ₹10L → ₹1,884/yr
  },
};

// Rider pricing metadata
export const RIDER_PRICING: Record<string, RiderPricing> = {
  accidental_death: {
    riderId: 'accidental_death',
    name: 'Accidental Death Benefit',
    basePremiumPerLakh: 0.456, // Average: ₹45.6/yr per ₹1L
    minCoverage: 1000000, // ₹10 lakh minimum
    maxCoverageMultiplier: 2, // Up to 2x base sum assured
    isAccidental: true,
  },
  critical_illness: {
    riderId: 'critical_illness',
    name: 'Critical Illness Benefit',
    basePremiumPerLakh: 1.884, // Average: ₹188.4/yr per ₹1L
    minCoverage: 500000, // ₹5 lakh minimum
    maxCoverageMultiplier: 1, // Up to 1x base sum assured
    isAccidental: false,
  },
  disability: {
    riderId: 'disability',
    name: 'Accidental Total Permanent Disability',
    basePremiumPerLakh: 0.264, // Average: ₹26.4/yr per ₹1L
    minCoverage: 1000000, // ₹10 lakh minimum
    maxCoverageMultiplier: 1, // Up to 1x base sum assured
    isAccidental: true,
  },
};

/**
 * Calculate age multiplier based on age bracket
 */
function getAgeMultiplier(age: number): number {
  if (age <= 25) return AGE_MULTIPLIERS['18-25'];
  if (age <= 30) return AGE_MULTIPLIERS['26-30'];
  if (age <= 35) return AGE_MULTIPLIERS['31-35'];
  if (age <= 40) return AGE_MULTIPLIERS['36-40'];
  if (age <= 45) return AGE_MULTIPLIERS['41-45'];
  if (age <= 50) return AGE_MULTIPLIERS['46-50'];
  if (age <= 55) return AGE_MULTIPLIERS['51-55'];
  return AGE_MULTIPLIERS['56-60'];
}

/**
 * Calculate term multiplier
 */
function getTermMultiplier(term: number): number {
  return TERM_MULTIPLIERS[term] || 1.0;
}

/**
 * Calculate base premium for term life insurance
 * Returns annual premium
 */
export function calculateBasePremium(factors: PricingFactors): number {
  const {
    age,
    gender,
    smokingStatus,
    sumAssured,
    policyTerm,
    occupationRisk,
  } = factors;

  // Base rate per lakh based on gender
  const baseRatePerLakh = BASE_RATE_PER_LAKH[gender];

  // Calculate coverage in lakhs
  const coverageInLakhs = sumAssured / 100000;

  // Base premium before multipliers
  let basePremium = baseRatePerLakh * coverageInLakhs;

  // Apply multipliers
  const ageMultiplier = getAgeMultiplier(age);
  const smokingMultiplier = SMOKING_MULTIPLIERS[smokingStatus];
  const occupationMultiplier = OCCUPATION_MULTIPLIERS[occupationRisk];
  const termMultiplier = getTermMultiplier(policyTerm);

  // Final premium calculation
  const annualPremium =
    basePremium *
    ageMultiplier *
    smokingMultiplier *
    occupationMultiplier *
    termMultiplier;

  // Round to nearest 10
  return Math.round(annualPremium / 10) * 10;
}

/**
 * Calculate rider premium using ACTUAL ACKO pricing
 * Returns annual premium for the rider
 */
export function calculateRiderPremium(
  riderId: 'accidental_death' | 'critical_illness' | 'disability',
  coverageAmount: number,
  age: number,
  smokingStatus: 'never' | 'past' | 'current'
): number {
  // Use exact ACKO pricing if available
  const pricingMap = ACKO_RIDER_PRICING_MAP[riderId];
  
  if (pricingMap && pricingMap[coverageAmount]) {
    return pricingMap[coverageAmount];
  }
  
  // Fallback: Calculate based on closest available coverage amount
  const availableCoverages = Object.keys(pricingMap || {}).map(Number).sort((a, b) => a - b);
  
  if (availableCoverages.length > 0) {
    // Find closest coverage
    const closest = availableCoverages.reduce((prev, curr) => 
      Math.abs(curr - coverageAmount) < Math.abs(prev - coverageAmount) ? curr : prev
    );
    
    const closestPremium = pricingMap[closest];
    const ratio = coverageAmount / closest;
    return Math.round(closestPremium * ratio);
  }
  
  // Ultimate fallback: Use base rate
  const rider = RIDER_PRICING[riderId];
  if (!rider) return 0;

  const coverageInLakhs = coverageAmount / 100000;
  let premium = rider.basePremiumPerLakh * coverageInLakhs * 100;

  // Age adjustment for riders (minimal for actual ACKO pricing)
  const ageMultiplier = age <= 35 ? 1.0 : age <= 45 ? 1.1 : 1.2;
  
  // Smoking adjustment for critical illness only
  const smokingMultiplier = riderId === 'critical_illness' 
    ? SMOKING_MULTIPLIERS[smokingStatus] 
    : 1.0;

  premium = premium * ageMultiplier * smokingMultiplier;

  // Round to nearest 10
  return Math.round(premium / 10) * 10;
}

/**
 * Calculate total premium with riders
 */
export interface PremiumBreakdown {
  basePremium: number;
  ridersPremium: number;
  accidentalRidersPremium: number;
  criticalIllnessRidersPremium: number;
  totalPremium: number;
  monthlyPremium: number;
  dailyPremium: number;
  
  // Business rule checks
  accidentalPremiumLimit: number; // 30% of base
  accidentalLimitUsedPercent: number;
  criticalIllnessPremiumLimit: number; // 100% of base
  isAccidentalOverLimit: boolean;
  isCriticalIllnessOverLimit: boolean;
}

export interface SelectedRider {
  riderId: 'accidental_death' | 'critical_illness' | 'disability';
  coverageAmount: number;
}

export function calculateTotalPremium(
  basePremiumFactors: PricingFactors,
  selectedRiders: SelectedRider[]
): PremiumBreakdown {
  // Calculate base premium
  const basePremium = calculateBasePremium(basePremiumFactors);

  // Calculate business rule limits
  const accidentalPremiumLimit = basePremium * 0.3; // 30% cap
  const criticalIllnessPremiumLimit = basePremium * 1.0; // 100% cap

  let accidentalRidersPremium = 0;
  let criticalIllnessRidersPremium = 0;

  // Calculate each rider's premium
  for (const rider of selectedRiders) {
    const riderPremium = calculateRiderPremium(
      rider.riderId,
      rider.coverageAmount,
      basePremiumFactors.age,
      basePremiumFactors.smokingStatus
    );

    const riderInfo = RIDER_PRICING[rider.riderId];
    if (riderInfo.isAccidental) {
      accidentalRidersPremium += riderPremium;
    } else {
      criticalIllnessRidersPremium += riderPremium;
    }
  }

  // Check business rules
  const accidentalLimitUsedPercent = (accidentalRidersPremium / accidentalPremiumLimit) * 100;
  const isAccidentalOverLimit = accidentalLimitUsedPercent >= 100;
  const isCriticalIllnessOverLimit = criticalIllnessRidersPremium > criticalIllnessPremiumLimit;

  const ridersPremium = accidentalRidersPremium + criticalIllnessRidersPremium;
  const totalPremium = basePremium + ridersPremium;

  return {
    basePremium,
    ridersPremium,
    accidentalRidersPremium,
    criticalIllnessRidersPremium,
    totalPremium,
    monthlyPremium: Math.round(totalPremium / 12),
    dailyPremium: Math.round(totalPremium / 365),
    accidentalPremiumLimit,
    accidentalLimitUsedPercent,
    criticalIllnessPremiumLimit,
    isAccidentalOverLimit,
    isCriticalIllnessOverLimit,
  };
}

/**
 * Get example premiums for different age groups and coverage amounts
 * Useful for displaying sample pricing to users
 */
export function getExamplePremiums() {
  const examples = [
    {
      profile: '25-year-old male, non-smoker',
      coverage: 10000000, // ₹1 Cr
      term: 30,
      factors: {
        age: 25,
        gender: 'male' as const,
        smokingStatus: 'never' as const,
        sumAssured: 10000000,
        policyTerm: 30,
        occupationRisk: 'low' as const,
      },
    },
    {
      profile: '30-year-old female, non-smoker',
      coverage: 5000000, // ₹50 L
      term: 25,
      factors: {
        age: 30,
        gender: 'female' as const,
        smokingStatus: 'never' as const,
        sumAssured: 5000000,
        policyTerm: 25,
        occupationRisk: 'low' as const,
      },
    },
    {
      profile: '35-year-old male, smoker',
      coverage: 20000000, // ₹2 Cr
      term: 20,
      factors: {
        age: 35,
        gender: 'male' as const,
        smokingStatus: 'current' as const,
        sumAssured: 20000000,
        policyTerm: 20,
        occupationRisk: 'medium' as const,
      },
    },
  ];

  return examples.map((example) => ({
    ...example,
    annualPremium: calculateBasePremium(example.factors),
    monthlyPremium: Math.round(calculateBasePremium(example.factors) / 12),
  }));
}
