/**
 * Life Insurance Personas — resolves user persona based on life stage and responsibilities.
 * Similar to Health personas but focused on life insurance needs.
 */

import type { LifeJourneyState, LifePersonaType } from './types';
import type { ChatMessage } from '../core/types';

/**
 * Resolves Life persona based on psychological state indicators.
 * 
 * Detection logic:
 * - Protector: Already understands term insurance, asks about coverage/claims
 * - Growth Seeker: Asks about returns/maturity/ULIPs, mentions investment
 * - Passive Aware: Hesitant, asks "do I really need this?", procrastinates
 * 
 * For now, we'll use behavioral signals from conversation + age/income as proxies.
 * In production, this would analyze conversation history, questions asked, etc.
 */
export function resolveLifePersona(state: LifeJourneyState): LifePersonaType {
  // Check conversation history for psychological signals
  const recentMessages = state.conversationHistory.slice(-5);
  const messageText = recentMessages.map((m: ChatMessage) => m.content.toLowerCase()).join(' ');
  
  // Growth Seeker signals: asks about returns, maturity, investment, ULIP
  if (
    messageText.includes('return') ||
    messageText.includes('maturity') ||
    messageText.includes('investment') ||
    messageText.includes('ulip') ||
    messageText.includes('savings') ||
    messageText.includes('get back')
  ) {
    return 'growth_seeker';
  }
  
  // Passive Aware signals: hesitation, "do I need", "maybe later", "not sure"
  if (
    messageText.includes('do i need') ||
    messageText.includes('maybe later') ||
    messageText.includes('not sure') ||
    messageText.includes('think about') ||
    messageText.includes('complicated')
  ) {
    return 'passive_aware';
  }
  
  // Protector signals: asks about coverage, claims, protection, family security
  if (
    messageText.includes('coverage') ||
    messageText.includes('claim') ||
    messageText.includes('protect') ||
    messageText.includes('family') ||
    messageText.includes('security')
  ) {
    return 'protector';
  }
  
  // Default: Use age as proxy (younger = more likely passive aware, older = more likely protector)
  const { age } = state;
  if (age < 30) {
    return 'passive_aware'; // Younger users often procrastinate
  } else if (age > 40) {
    return 'protector'; // Older users understand protection needs
  }
  
  // Default fallback
  return 'protector';
}

/**
 * Persona-specific configuration — Psychological states for Life Insurance buyers.
 * 
 * Based on three core psychological segments:
 * 1. Protector: Protection-first, security-driven, low bias, easy conversion
 * 2. Growth Seeker: Return-first, returns-driven, return bias, needs education
 * 3. Passive Aware: Avoiding friction, procrastination bias, needs simplification
 */
export const LIFE_PERSONA_CONFIG: Record<
  LifePersonaType,
  {
    name: string;
    description: string;
    coreDriver: string;
    coreFear: string;
    coreBias: string;
    conversionDifficulty: 'easy' | 'medium' | 'high';
    nudgeMessages: string[];
    aiStarters: string[];
    recommendedCoverageMultiplier: number;
    messagingTone: 'direct' | 'educational' | 'reassuring';
    keyMessages: string[]; // Persona-specific messaging to use in conversation
  }
> = {
  protector: {
    name: 'The Protector',
    description: 'Protection-first mindset. Believes insurance is for risk, investment is separate.',
    coreDriver: 'Security',
    coreFear: 'Family instability',
    coreBias: 'Low bias',
    conversionDifficulty: 'easy',
    recommendedCoverageMultiplier: 12, // 12x annual income
    messagingTone: 'direct',
    nudgeMessages: [
      'Your family\'s security is non-negotiable. Term insurance gives you maximum protection at the lowest cost.',
      'High coverage, transparent pricing, reliable claims — that\'s what protection should be.',
    ],
    aiStarters: [
      'How much coverage do I need to protect my family?',
      'What\'s the difference between term and other life insurance?',
      'How do I know if my coverage is enough?',
    ],
    keyMessages: [
      'Term insurance is pure protection — no mixing, no compromise.',
      'Every rupee goes toward protecting your family.',
      'Simple, transparent, reliable — that\'s how protection should work.',
    ],
  },
  
  growth_seeker: {
    name: 'The Growth Seeker',
    description: 'Return-first mindset. Culturally conditioned to expect returns from insurance.',
    coreDriver: 'Returns',
    coreFear: '"Wasting money"',
    coreBias: 'Return bias',
    conversionDifficulty: 'medium',
    recommendedCoverageMultiplier: 10, // Lower multiplier — they may resist higher premiums
    messagingTone: 'educational',
    nudgeMessages: [
      'Separate protection from investment — you\'ll get better coverage AND better returns.',
      'Why pay for two things in one wrapper? Term insurance + mutual funds = more cover + more growth.',
    ],
    aiStarters: [
      'Why should I buy term insurance if I don\'t get returns?',
      'What\'s wrong with ULIPs or endowment plans?',
      'How do I invest separately if I buy term insurance?',
    ],
    keyMessages: [
      'Term insurance gives you maximum protection at minimum cost. Invest the rest separately for better returns.',
      'When you mix insurance and investment, you compromise on both — lower coverage AND lower returns.',
      'Think of it this way: ₹5,000 for ₹1 Cr term + ₹45,000 in mutual funds gives you more cover AND more flexibility.',
      'Insurance needs certainty. Investment needs risk. They have opposite purposes — keep them separate.',
    ],
  },
  
  passive_aware: {
    name: 'The Passive Aware',
    description: 'Avoiding friction. Believes term is important but procrastinates due to decision fatigue.',
    coreDriver: 'Avoiding friction',
    coreFear: 'Making wrong decision',
    coreBias: 'Procrastination',
    conversionDifficulty: 'high',
    recommendedCoverageMultiplier: 10, // Start conservative, can increase later
    messagingTone: 'reassuring',
    nudgeMessages: [
      'We\'ll help you figure out the right coverage — no overthinking needed.',
      'Every year you wait, premiums go up. Let\'s get you protected today.',
      'Simple process, clear recommendations, no jargon — we\'ll make this easy.',
    ],
    aiStarters: [
      'How do I know if I really need life insurance?',
      'What\'s the minimum coverage I should get?',
      'Can I buy life insurance without medical tests?',
    ],
    keyMessages: [
      'We\'ll recommend the right coverage based on your needs — no guesswork.',
      'Simple, straightforward, no hidden complexity.',
      'Every year you delay, premiums increase. Lock in lower rates now.',
      'We\'ll guide you through every step — you\'re not alone in this decision.',
    ],
  },
};

/**
 * Persona trigger keys — fields that, when updated, should trigger persona re-resolution.
 * 
 * Note: In production, persona resolution would also analyze conversation history
 * for psychological signals (questions asked, language used, hesitation patterns).
 */
export const LIFE_PERSONA_TRIGGER_KEYS: (keyof LifeJourneyState)[] = [
  'age',
  'annualIncome',
  'conversationHistory', // Key for detecting psychological signals
];
