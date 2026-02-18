/**
 * Life Insurance LOB Types — extends core types with Life-specific fields.
 * Follows the same pattern as Health LOB.
 */

// Import for local use (re-export doesn't create local binding)
import type { BaseJourneyState, PaymentFrequency } from '../core/types';

// Re-export core types
export type {
  Language,
  PaymentFrequency,
  Option,
  StepScript,
  ChatMessage,
  BaseJourneyState,
  BaseJourneyActions,
  ConversationStep,
} from '../core/types';

// Life-specific persona types (psychological states used by personas.ts)
export type LifePersonaType =
  | 'protector'      // Protection-first, security-driven
  | 'growth_seeker'  // Return-first, returns-driven
  | 'passive_aware'; // Avoiding friction, procrastination

// Life journey modules
export type LifeModule = 
  | 'basic_info'              // Name, gender, DOB, contact, smoking
  | 'lifestyle'               // Alcohol, occupation, hobbies, medical
  | 'quote'                   // Coverage recommendation, premium
  | 'addons'                  // Riders selection
  | 'review';                 // Final summary

// Life widget types
export type LifeWidgetType =
  | 'selection_cards'         // Standard option cards
  | 'number_input'            // Age, income, coverage amount
  | 'date_picker'             // Date of birth
  | 'text_input'              // Name, phone, pin
  | 'yes_no'                  // Smoking, alcohol, medical questions
  | 'coverage_slider'         // Coverage amount selector
  | 'term_selector'           // Policy term selector
  | 'rider_toggle'            // Add-on riders with premium impact
  | 'premium_summary';        // Quote display with breakdown

// Smoking status
export type SmokingStatus = 'never' | 'past' | 'current';

// Occupation risk level
export type OccupationRisk = 'low' | 'medium' | 'high';

// Life Insurance Riders
export interface LifeRider {
  id: 'accidental_death' | 'critical_illness' | 'disability';
  name: string;
  description: string;
  coverageMultiplier: number; // e.g., 3x base sum assured for accidental death
  premiumImpact: number;      // Additional premium per ₹1L coverage
  selected: boolean;
}

// Life Insurance Plan/Quote
export interface LifeQuote {
  sumAssured: number;         // Coverage amount (₹10L - ₹100Cr)
  policyTerm: number;         // 10-40 years
  premiumFrequency: PaymentFrequency;
  basePremium: number;        // Annual premium
  riders: LifeRider[];
  totalPremium: number;       // Base + riders
  monthlyPremium: number;
  yearlyPremium: number;
}

// Life Journey State — extends BaseJourneyState
export interface LifeJourneyState extends BaseJourneyState {
  // Basic Information
  name: string;
  gender: 'male' | 'female' | '';
  dateOfBirth: string;         // YYYY-MM-DD
  age: number;
  phone: string;
  pinCode: string;
  smokingStatus: SmokingStatus;
  annualIncome: number;
  
  // Lifestyle Information
  alcoholConsumption: 'never' | 'occasional' | 'regular';
  occupation: string;
  occupationRisk: OccupationRisk;
  hobbies: string[];           // Hazardous activities
  medicalHistory: string[];    // Pre-existing conditions
  familyMedicalHistory: string[];
  height: number;              // cm
  weight: number;              // kg
  bmi: number;
  
  // Quote & Plan Selection
  recommendedCoverage: number; // Based on HLV or needs-based calc
  selectedCoverage: number;
  selectedTerm: number;
  quote: LifeQuote | null;
  
  // Add-ons
  selectedRiders: LifeRider[];
  
  // Journey progress
  currentModule: LifeModule;
  moduleOrder: LifeModule[];
  
  // Persona
  resolvedPersona: LifePersonaType;
  
  // Psychological state indicators (for persona detection)
  intentSignals?: {
    asksAboutReturns?: boolean;
    asksAboutCoverage?: boolean;
    showsHesitation?: boolean;
    mentionsInvestment?: boolean;
    mayNotNeedTerm?: boolean;
  };
}

// Initial state
export const LIFE_INITIAL_STATE: LifeJourneyState = {
  // Base state
  language: 'en',
  userName: '',
  phone: '',
  currentStepId: 'life_intro',
  currentModule: 'basic_info',
  conversationHistory: [],
  isTyping: false,
  showExpertPanel: false,
  showAIChat: false,
  journeyComplete: false,
  paymentComplete: false,
  paymentFrequency: 'yearly',
  resolvedPersona: 'protector',
  
  // Life-specific
  name: '',
  gender: '',
  dateOfBirth: '',
  age: 0,
  pinCode: '',
  smokingStatus: 'never',
  annualIncome: 0,
  
  alcoholConsumption: 'never',
  occupation: '',
  occupationRisk: 'low',
  hobbies: [],
  medicalHistory: [],
  familyMedicalHistory: [],
  height: 0,
  weight: 0,
  bmi: 0,
  
  recommendedCoverage: 0,
  selectedCoverage: 0,
  selectedTerm: 30,
  quote: null,
  
  selectedRiders: [],
  
  moduleOrder: ['basic_info', 'lifestyle', 'quote', 'addons', 'review'],
  
  intentSignals: {},
};
