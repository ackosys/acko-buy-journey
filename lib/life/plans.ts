/**
 * Life Insurance Plans & Riders — Product data
 */

import { LifeRider } from './types';

/**
 * Available Life Insurance Riders
 */
export const LIFE_RIDERS: LifeRider[] = [
  {
    id: 'accidental_death',
    name: 'Accidental Death Benefit Rider',
    description: 'Provides additional payout (up to 3x your base sum assured) if death occurs due to an accident',
    coverageMultiplier: 3,
    premiumImpact: 50, // ₹50 per ₹1L coverage
    selected: false,
  },
  {
    id: 'critical_illness',
    name: 'Critical Illness Benefit Rider',
    description: 'Pays a lump sum if diagnosed with any of 21 critical illnesses (cancer, heart attack, stroke, etc.)',
    coverageMultiplier: 1,
    premiumImpact: 100, // ₹100 per ₹1L coverage
    selected: false,
  },
  {
    id: 'disability',
    name: 'Accidental Total Permanent Disability Benefit Rider',
    description: 'Provides financial support if an accident leaves you permanently disabled and unable to work',
    coverageMultiplier: 1,
    premiumImpact: 75, // ₹75 per ₹1L coverage
    selected: false,
  },
];

/**
 * Critical illnesses covered under Critical Illness Rider
 */
export const CRITICAL_ILLNESSES = [
  'Cancer of Specified Severity',
  'Myocardial Infarction (First Heart Attack)',
  'Open Chest CABG',
  'Open Heart Replacement or Repair of Heart Valves',
  'Coma of Specified Severity',
  'Kidney Failure Requiring Regular Dialysis',
  'Stroke Resulting in Permanent Symptoms',
  'Major Organ / Bone Marrow Transplant',
  'Permanent Paralysis of Limbs',
  'Motor Neuron Disease',
  'Multiple Sclerosis',
  'Benign Brain Tumor',
  'Blindness',
  'Deafness',
  'End Stage Lung Failure',
  'End Stage Liver Failure',
  'Loss of Speech',
  'Loss of Limbs',
  'Major Head Trauma',
  'Primary Pulmonary Hypertension',
  'Third Degree Burns',
];

/**
 * Calculate premium with riders
 */
export function calculatePremiumWithRiders(
  basePremium: number,
  sumAssured: number,
  riders: LifeRider[]
): number {
  let totalPremium = basePremium;
  
  riders.forEach((rider) => {
    if (rider.selected) {
      const riderPremium = (sumAssured / 100000) * rider.premiumImpact;
      totalPremium += riderPremium;
    }
  });
  
  return Math.round(totalPremium);
}
