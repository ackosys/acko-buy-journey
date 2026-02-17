import { PersonaType, JourneyState } from './types';
import { Language } from './types';

/* ── Persona Resolver ──
   Takes accumulated user signals and returns the primary persona.
   Priority order: anxious_senior > caring_child > switcher > gap_filler > first_timer > window_shopper
   Vulnerability-first: anxiety and senior concerns take precedence. */

export function resolvePersona(state: JourneyState): PersonaType {
  const { intent, hasSenior, buyingForParents, coverageStatus, members } = state;

  // Window Shopper — always override if intent is exploring
  if (intent === 'exploring') {
    // Unless there's a senior involved, then anxiety > curiosity
    if (hasSenior || buyingForParents) {
      return buyingForParents ? 'caring_child' : 'anxious_senior';
    }
    return 'window_shopper';
  }

  // Buying for parents (60+) — Caring Child
  if (buyingForParents) {
    return 'caring_child';
  }

  // Any 45+ member buying for self — Anxious Senior
  const selfMember = members.find(m => m.relation === 'self');
  if (selfMember && selfMember.age >= 45) {
    return 'anxious_senior';
  }
  if (hasSenior && !buyingForParents) {
    // Covering a senior who isn't a parent (rare but handle)
    return 'anxious_senior';
  }

  // Has individual policy elsewhere — Switcher
  if (coverageStatus === 'individual_policy' || intent === 'compare') {
    return 'switcher';
  }

  // Has GMC — Gap Filler
  if (coverageStatus === 'gmc' || coverageStatus === 'both' || intent === 'cover_enough') {
    return 'gap_filler';
  }

  // No existing cover — First Timer
  if (coverageStatus === 'none') {
    return 'first_timer';
  }

  // Default fallback based on intent
  if (intent === 'which_plan') return 'first_timer';

  return 'first_timer';
}

/* ── Persona Display Names ── */
export const PERSONA_NAMES: Record<PersonaType, string> = {
  first_timer: 'First-Timer',
  gap_filler: 'Gap Filler',
  switcher: 'Switcher',
  anxious_senior: 'Anxious Senior',
  caring_child: 'Caring Child',
  window_shopper: 'Window Shopper',
};

/* ── Persona-aware expert nudge messages ── */
export function getExpertNudge(persona: PersonaType, _language?: Language): string {
  // For prototype, keep English content for all languages
  const nudges: Record<PersonaType, string> = {
    first_timer: 'Have questions about health insurance? Our expert can help — no pressure, no sales pitch.',
    gap_filler: 'Want to understand exactly what your employer cover misses? Our expert can review it with you.',
    switcher: 'Want a detailed side-by-side of your current plan vs. what ACKO offers? Our expert can walk you through it.',
    anxious_senior: 'Many people in your situation find it helpful to speak with our health insurance expert. Not sales — just clear, honest answers to your questions.',
    caring_child: 'Want to discuss the best coverage for your parents with someone who has helped many families like yours?',
    window_shopper: 'Curious about anything? Happy to connect you with someone who can answer — no commitment at all.',
  };
  return nudges[persona];
}

/* ── Persona-aware AI chat starter prompts ── */
export function getAIChatStarters(persona: PersonaType, _language?: Language): string[] {
  // For prototype, keep English content for all languages
  const starters: Record<PersonaType, string[]> = {
    first_timer: [
      'Why do I need health insurance if I\'m young and healthy?',
      'What happens if I need surgery — how much would it cost without insurance?',
      'How is ACKO different from traditional insurers?',
      'What does "sum insured" actually mean?',
    ],
    gap_filler: [
      'What does my employer insurance NOT cover?',
      'What happens to my cover if I switch jobs?',
      'Do I need a separate policy or just a top-up?',
      'How does a Super Top-up work with my GMC?',
    ],
    switcher: [
      'How does porting work — what benefits carry over?',
      'How does ACKO\'s claim settlement compare to my current insurer?',
      'Will my waiting periods reset if I switch?',
      'What are the key differences between ACKO and Star Health / HDFC Ergo?',
    ],
    anxious_senior: [
      'Will my claim actually be honoured if I need hospitalisation?',
      'What happens to my premium every year — will it keep increasing?',
      'A family member has a pre-existing condition — will they be covered?',
      'What medical tests will be required after payment?',
    ],
    caring_child: [
      'How will my parents file a claim if I\'m not around?',
      'Is OPD covered — my parents spend a lot on medicines and checkups',
      'What happens if my parent is hospitalised — step by step?',
      'Can I manage the policy on my parents\' behalf?',
    ],
    window_shopper: [
      'How much does health insurance actually cost?',
      'Is health insurance really necessary if I feel fine?',
      'How is ACKO different from other insurance companies?',
      'What does a basic plan cover?',
    ],
  };
  return starters[persona];
}
