/**
 * Life Insurance LOB — Conversation scripts for the Life buy journey.
 * Follows the same pattern as Health scripts with Life-specific questions.
 */

import type { ConversationStep, Option } from '../core/types';
import type { LifeJourneyState, LifeModule, LifePersonaType, LifeRider } from './types';
import { LIFE_PERSONA_CONFIG } from './personas';

// Helper to get user name
function userName(state: LifeJourneyState): string {
  // Since we don't ask for name anymore, this will likely return 'there' or empty string
  return state.name || state.userName || 'there';
}

// Helper to calculate age from DOB
function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Indian inflation rate for future value calculations
const INDIA_INFLATION_RATE = 0.06; // 6% avg CPI inflation
const INDIA_EDUCATION_INFLATION = 0.10; // ~10% education cost inflation
const INDIA_RETIREMENT_AGE = 60;
const PER_CHILD_EDUCATION_FUND = 2500000; // ₹25L base for higher education per child
const PER_CHILD_MARRIAGE_FUND = 1500000; // ₹15L base for marriage expenses per child

// Calculate recommended policy term based on age (cover till 60, min 10 years, max 40)
export function calculatePolicyTerm(age: number): number {
  const tillRetirement = INDIA_RETIREMENT_AGE - age;
  return Math.min(Math.max(tillRetirement, 10), 40);
}

// Needs-based coverage calculation with Indian context
function calculateRecommendedCoverage(state: LifeJourneyState): {
  recommended: number;
  breakdown: import('./types').CoverageBreakdown;
} {
  const {
    annualIncome, age,
    outstandingLoans, monthlyExpenses,
    numberOfChildren, youngestChildAge,
    existingLifeCover, existingCorpusSavings,
  } = state;
  if (!annualIncome || annualIncome === 0) return {
    recommended: 0,
    breakdown: { incomeReplacement: 0, loanCoverage: 0, childEducationFund: 0, emergencyBuffer: 0, totalNeed: 0, existingCover: 0, recommendedCover: 0, multiplierUsed: 0 },
  };
  
  const workingYearsLeft = Math.max(INDIA_RETIREMENT_AGE - age, 10);

  // 1. Income replacement — present value of future income (discounted by inflation)
  //    Using simplified formula: income × years × inflation factor
  //    In India, financial planners recommend 10-15x annual income as a rule of thumb.
  //    We use a more precise approach: PV of income stream with 6% inflation, 8% discount rate
  const realDiscountRate = 0.02; // ~8% return - 6% inflation
  let incomeReplacement = 0;
  for (let y = 1; y <= workingYearsLeft; y++) {
    incomeReplacement += annualIncome / Math.pow(1 + realDiscountRate, y);
  }
  incomeReplacement = Math.round(incomeReplacement);

  // 2. Loan coverage — pay off all outstanding loans immediately
  const loanCoverage = outstandingLoans || 0;

  // 3. Children's education + marriage fund (inflation-adjusted to future value)
  let childEducationFund = 0;
  if (numberOfChildren > 0) {
    for (let c = 0; c < numberOfChildren; c++) {
      const childAge = youngestChildAge + c * 2; // approximate age spread
      const yearsToCollege = Math.max(18 - childAge, 0);
      const yearsToMarriage = Math.max(25 - childAge, 0);

      // Future value of education cost (10% education inflation in India)
      const futureEduCost = PER_CHILD_EDUCATION_FUND * Math.pow(1 + INDIA_EDUCATION_INFLATION, yearsToCollege);
      // Future value of marriage cost (6% general inflation)
      const futureMarriageCost = PER_CHILD_MARRIAGE_FUND * Math.pow(1 + INDIA_INFLATION_RATE, yearsToMarriage);

      childEducationFund += Math.round(futureEduCost + futureMarriageCost);
    }
  }

  // 4. Emergency buffer — 6 months of household expenses
  const emergencyBuffer = (monthlyExpenses || Math.round(annualIncome * 0.5 / 12)) * 6;

  // 5. Total need
  const totalNeed = incomeReplacement + loanCoverage + childEducationFund + emergencyBuffer;

  // 6. Subtract existing cover
  const existingCover = (existingLifeCover || 0) + (existingCorpusSavings || 0);

  // 7. Final recommended cover (min ₹25L, max ₹100 Cr, rounded to nearest ₹5L)
  let recommendedCover = Math.max(totalNeed - existingCover, 2500000);
  recommendedCover = Math.min(recommendedCover, 10000000000); // ₹100 Cr cap
  recommendedCover = Math.round(recommendedCover / 500000) * 500000; // Round to nearest ₹5L

  const multiplierUsed = annualIncome > 0 ? Math.round((recommendedCover / annualIncome) * 10) / 10 : 0;

  return {
    recommended: recommendedCover,
    breakdown: {
      incomeReplacement,
      loanCoverage,
      childEducationFund,
      emergencyBuffer,
      totalNeed,
      existingCover,
      recommendedCover,
      multiplierUsed,
    },
  };
}

/* ═══════════════════════════════════════════════
   MODULE: BASIC INFO — Name, Gender, DOB, Contact, Smoking
   ═══════════════════════════════════════════════ */

const lifeIntro: ConversationStep<LifeJourneyState> = {
  id: 'life_intro',
  module: 'basic_info',
  widgetType: 'none',
  getScript: (persona, state) => {
    const personaConfig = LIFE_PERSONA_CONFIG[persona as LifePersonaType];
    const messages: string[] = [
      `Hi! 👋`,
    ];
    
    // Persona-specific intro messaging with ethical hook
    if (persona === 'protector') {
      messages.push(
        `I'm here to help you secure maximum protection for your family at the best price.`,
        `Before we start, let me ask: If your income stopped tomorrow, how long would your family manage?`,
        `This helps us understand your protection needs — no pressure, just reflection.`
      );
    } else if (persona === 'growth_seeker') {
      messages.push(
        `I'm here to help you understand why separating protection from investment gives you better results.`,
        `First, let's think: If your income stopped tomorrow, how long would your family manage?`,
        `Then we'll show you how term insurance + separate investment works better than mixing both.`
      );
    } else { // passive_aware
      messages.push(
        `I'm here to make this simple for you. Will help you figure out the right coverage. No overthinking needed.`
      );
    }
    
    return { botMessages: messages };
  },
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_path_choice',
};

// Path choice — "I know my coverage" vs "Help me decide"
const lifePathChoice: ConversationStep<LifeJourneyState> = {
  id: 'life_path_choice',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (_persona, _state) => ({
    botMessages: [
      `How would you like to proceed?`,
    ],
    options: [
      { id: 'direct', label: 'I know my coverage needs', description: 'Get a quick quote' },
      { id: 'guided', label: 'Help me decide', description: 'We\'ll calculate the right coverage for you' },
    ],
  }),
  processResponse: (response, _state) => ({
    userPath: response as 'direct' | 'guided',
  }),
  getNextStep: (response, _state) => {
    if (response === 'direct') {
      return 'life_dq_gender';
    }
    return 'life_should_buy_check';
  },
};

// Ethical check — "Should you even buy term?"
const lifeShouldBuyCheck: ConversationStep<LifeJourneyState> = {
  id: 'life_should_buy_check',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `Before we proceed, let's check if term insurance makes sense for you.`,
      ``,
      `You may need term insurance if:`,
      `• You have dependents who rely on your income`,
      `• You have liabilities (loans, EMIs)`,
      `• You want to financially secure your family's future`,
      ``,
      `Do you have dependents or financial obligations?`,
    ],
    options: [
      { id: 'yes', label: 'Yes, I have dependents/obligations', description: 'Continue with term insurance' },
      { id: 'no', label: 'No dependents or obligations', description: 'You may not need term insurance' },
      { id: 'not_sure', label: 'Not sure', description: 'Let\'s discuss' },
    ],
  }),
  processResponse: (response, state) => {
    if (response === 'no') {
      return { intentSignals: { ...state.intentSignals, mayNotNeedTerm: true } };
    }
    return {};
  },
  getNextStep: (response, _state) => {
    if (response === 'no') {
      return 'life_no_dependents_age_check';
    }
    if (response === 'not_sure') {
      return 'life_need_discussion';
    }
    return 'life_basic_gender';
  },
};

// Ask age when user says no dependents
const lifeNoDependentsAgeCheck: ConversationStep<LifeJourneyState> = {
  id: 'life_no_dependents_age_check',
  module: 'basic_info',
  widgetType: 'number_input',
  getScript: (_persona, _state) => ({
    botMessages: [
      `No worries! But before you go — may I know your age?`,
      `This will help me give you a better recommendation.`,
    ],
    inputConfig: {
      placeholder: 'Your age',
      min: 18,
      max: 65,
      suffix: 'years',
    },
  }),
  processResponse: (response, _state) => {
    const age = parseInt(response);
    return { age };
  },
  getNextStep: (response, _state) => {
    const age = parseInt(response);
    if (age <= 35) {
      return 'life_young_recommendation';
    }
    return 'life_no_need_explanation';
  },
};

// Recommend term insurance for young users — premiums are cheaper
const lifeYoungRecommendation: ConversationStep<LifeJourneyState> = {
  id: 'life_young_recommendation',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (_persona, state) => ({
    botMessages: [
      `Here's the thing — at ${state.age}, this is actually the best time to buy term insurance. Here's why:`,
      ``,
      `• Premiums are significantly cheaper when you're young — they only go up with age`,
      `• As life changes (marriage, kids, home loan), you'll already be covered`,
      `• With our Flexi Cover feature, you can increase your coverage later as dependents are added — without buying a new policy`,
      ``,
      `A ₹1 Cr cover at ${state.age} could cost as low as ₹500/month. The same plan at 40 could be 2-3x more.`,
      ``,
      `Would you like to see what it costs for you?`,
    ],
    options: [
      { id: 'yes', label: 'Yes, show me my quote', description: 'Lock in low premiums now' },
      { id: 'learn', label: 'Tell me more about Flexi Cover', description: 'How to increase coverage later' },
      { id: 'skip', label: 'Maybe later', description: 'Explore other insurance options' },
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (response, _state) => {
    if (response === 'yes') {
      return 'life_basic_gender';
    }
    if (response === 'learn') {
      return 'life_flexi_cover_explanation';
    }
    return 'life_explore_other_lobs';
  },
};

// Flexi Cover explanation
const lifeFlexiCoverExplanation: ConversationStep<LifeJourneyState> = {
  id: 'life_flexi_cover_explanation',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (_persona, state) => ({
    botMessages: [
      `Flexi Cover is designed for exactly your situation — life changes, and your insurance should too.`,
      ``,
      `Here's how it works:`,
      `• Start with a base cover today at low premiums`,
      `• When you get married, have kids, or take a home loan — increase your cover`,
      `• No new medical tests, no new policy needed`,
      `• Premium for the additional cover is based on your age when you purchased your policy — helps you save money`,
      ``,
      `It's like future-proofing your finances while locking in today's low rates.`,
    ],
    options: [
      { id: 'yes', label: 'Great, show me my quote', description: 'Let\'s get started' },
      { id: 'skip', label: 'Maybe later', description: 'Explore other options' },
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (response, _state) => {
    if (response === 'yes') {
      return 'life_basic_gender';
    }
    return 'life_explore_other_lobs';
  },
};

// Explanation if they don't need term (older users with no dependents)
const lifeNoNeedExplanation: ConversationStep<LifeJourneyState> = {
  id: 'life_no_need_explanation',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (_persona, _state) => ({
    botMessages: [
      `That's perfectly fine!`,
      `Term insurance is primarily for protecting dependents and covering financial obligations.`,
      `If your situation changes in the future, you can always come back and we'll help you find the right plan.`,
      ``,
      `What would you like to do?`,
    ],
    options: [
      { id: 'learn', label: 'Learn about term insurance', description: 'Understand how it works for future planning' },
      { id: 'explore', label: 'Explore other insurance', description: 'Health, Car & Bike insurance' },
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (response, _state) => {
    if (response === 'learn') {
      return 'life_basic_gender';
    }
    return 'life_explore_other_lobs';
  },
};

// Redirect to other LOBs
const lifeExploreOtherLobs: ConversationStep<LifeJourneyState> = {
  id: 'life_explore_other_lobs',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `No problem! Here are other ways ACKO can help you:`,
    ],
    options: [
      { id: 'health', label: 'Health Insurance', description: 'Cover for hospitalisation, surgeries & more — plans from ₹436/month' },
      { id: 'motor', label: 'Car & Bike Insurance', description: 'Comprehensive cover, instant policy, hassle-free claims' },
      { id: 'home', label: 'Go back to homepage', description: 'Explore all ACKO products' },
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_explore_other_lobs',
};

// NEW: Discussion if not sure
const lifeNeedDiscussion: ConversationStep<LifeJourneyState> = {
  id: 'life_need_discussion',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `Let's think about it together.`,
      ``,
      `Term insurance makes sense if:`,
      `• You have family members who depend on your income`,
      `• You have loans (home loan, car loan, etc.)`,
      `• You want to secure your children's education`,
      `• You want to ensure your spouse's financial security`,
      ``,
      `Does any of this apply to you?`,
    ],
    options: [
      { id: 'yes', label: 'Yes, some apply', description: 'Continue with term insurance' },
      { id: 'no', label: 'No, none apply', description: 'I may not need it' },
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (response, _state) => {
    if (response === 'no') {
      return 'life_no_need_explanation';
    }
    return 'life_basic_gender';
  },
};

// NEW: Education — What life insurance actually is
const lifeEducationWhatIs: ConversationStep<LifeJourneyState> = {
  id: 'life_education_what_is',
  module: 'basic_info',
  widgetType: 'none',
  getScript: (persona, state) => {
    const messages: string[] = [
      `Let me explain what life insurance actually is.`,
      ``,
      `Life insurance = Income replacement`,
      `• Not investment`,
      `• Not savings`,
      `• Not tax product`,
      ``,
      `It's designed to replace your income if something happens to you,`,
      `so your family can maintain their lifestyle and meet financial obligations.`,
    ];
    
    if (persona === 'growth_seeker') {
      messages.push(
        ``,
        `Here's a simple comparison:`,
        ``,
        `Term Insurance:`,
        `• High cover (₹1 Cr+)`,
        `• Low premium (₹5K-10K/year)`,
        `• Pure protection`,
        ``,
        `Investment-Linked Plans:`,
        `• Lower cover for same premium`,
        `• Higher premium`,
        `• Mixed purpose (protection + investment)`,
        ``,
        `We'll show you why separating them works better.`
      );
    }
    
    return { botMessages: messages };
  },
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_common_myths',
};

// NEW: Common myths section (especially for Growth Seekers)
const lifeCommonMyths: ConversationStep<LifeJourneyState> = {
  id: 'life_common_myths',
  module: 'basic_info',
  widgetType: 'selection_cards',
  condition: (state) => state.resolvedPersona === 'growth_seeker' || state.resolvedPersona === 'passive_aware',
  getScript: (persona, state) => ({
    botMessages: [
      `Let me address a common concern:`,
      ``,
      `Myth: "If I survive the term, my money is wasted."`,
      ``,
      `Reality: Insurance is like a seatbelt.`,
      `You don't regret not crashing — you're grateful you were protected.`,
      ``,
      `Term insurance protects you during your earning years,`,
      `when your family depends on your income most.`,
      ``,
      `Does this make sense?`,
    ],
    options: [
      { id: 'yes', label: 'Yes, I understand', description: 'Continue' },
      { id: 'more', label: 'Tell me more', description: 'Explain further' },
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (response, _state) => {
    if (response === 'more') {
      return 'life_myths_detailed';
    }
    return 'life_basic_gender';
  },
};

// NEW: Detailed myths explanation
const lifeMythsDetailed: ConversationStep<LifeJourneyState> = {
  id: 'life_myths_detailed',
  module: 'basic_info',
  widgetType: 'none',
  getScript: (persona, state) => ({
    botMessages: [
      `Here's why term insurance makes sense even if you "don't get money back":`,
      ``,
      `1. Maximum protection at minimum cost`,
      `   ₹5,000/year for ₹1 Cr coverage vs ₹50,000/year for same coverage in mixed plans`,
      ``,
      `2. You can invest the difference separately`,
      `   ₹45,000/year invested in mutual funds typically gives better returns than insurance-linked plans`,
      ``,
      `3. Flexibility`,
      `   You can adjust coverage as life changes (ACKO Flexi)`,
      `   You can stop/change investments anytime`,
      ``,
      `Think of it this way:`,
      `Term insurance = Protection`,
      `Mutual funds = Growth`,
      `Keep them separate for better results.`,
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_basic_gender',
};

/* ═══════════════════════════════════════════════
   DIRECT QUOTE PATH — Streamlined for users who know their coverage
   ═══════════════════════════════════════════════ */

const lifeDqGender: ConversationStep<LifeJourneyState> = {
  id: 'life_dq_gender',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (_persona, state) => ({
    botMessages: [
      `What's your gender?`,
    ],
    options: [
      { id: 'male', label: 'Male', icon: '👨' },
      { id: 'female', label: 'Female', icon: '👩' },
    ],
  }),
  processResponse: (response, _state) => ({ gender: response as 'male' | 'female' }),
  getNextStep: (_response, _state) => 'life_dq_dob',
};

const lifeDqDob: ConversationStep<LifeJourneyState> = {
  id: 'life_dq_dob',
  module: 'basic_info',
  widgetType: 'date_picker',
  getScript: (_persona, _state) => ({
    botMessages: [
      `What's your date of birth?`,
    ],
    placeholder: 'Select date of birth',
  }),
  processResponse: (response, _state) => {
    const age = calculateAge(String(response));
    return { dateOfBirth: response, age };
  },
  getNextStep: (_, state) => {
    if (state.age < 18 || state.age > 65) {
      return 'life_age_ineligible';
    }
    return 'life_dq_pincode';
  },
};

const lifeDqPincode: ConversationStep<LifeJourneyState> = {
  id: 'life_dq_pincode',
  module: 'basic_info',
  widgetType: 'text_input',
  getScript: (_persona, _state) => ({
    botMessages: [
      `What's your pin code?`,
    ],
    placeholder: 'Enter 6-digit pin code',
    inputType: 'text',
  }),
  processResponse: (response, _state) => ({ pinCode: String(response) }),
  getNextStep: (_response, _state) => 'life_dq_smoking',
};

const lifeDqSmoking: ConversationStep<LifeJourneyState> = {
  id: 'life_dq_smoking',
  module: 'basic_info',
  widgetType: 'yes_no',
  getScript: (_persona, _state) => ({
    botMessages: [
      `Have you used any tobacco products in the past 12 months?`,
    ],
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
  }),
  processResponse: (response, _state) => ({
    smokingStatus: response === 'yes' ? 'current' as const : 'never' as const,
  }),
  getNextStep: (_response, _state) => 'life_dq_income',
};

const lifeDqIncome: ConversationStep<LifeJourneyState> = {
  id: 'life_dq_income',
  module: 'basic_info',
  widgetType: 'number_input',
  getScript: (_persona, _state) => ({
    botMessages: [
      `What's your annual income?`,
    ],
    placeholder: 'Enter annual income (₹)',
    inputType: 'number',
    min: 100000,
    max: 100000000,
  }),
  processResponse: (response, _state) => ({
    annualIncome: parseInt(String(response)) || 0,
  }),
  getNextStep: (_response, _state) => 'life_dq_alcohol',
};

const lifeDqAlcohol: ConversationStep<LifeJourneyState> = {
  id: 'life_dq_alcohol',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (_persona, _state) => ({
    botMessages: [
      `Do you consume alcohol?`,
    ],
    options: [
      { id: 'never', label: 'Never' },
      { id: 'occasional', label: 'Occasionally' },
      { id: 'regular', label: 'Regularly' },
    ],
  }),
  processResponse: (response, _state) => ({ alcoholConsumption: response as 'never' | 'occasional' | 'regular' }),
  getNextStep: (_response, _state) => 'life_dq_occupation',
};

const lifeDqOccupation: ConversationStep<LifeJourneyState> = {
  id: 'life_dq_occupation',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (_persona, _state) => ({
    botMessages: [
      `What do you do for a living?`,
    ],
    options: [
      { id: 'salaried', label: 'Salaried', description: 'I work for an organisation' },
      { id: 'self_employed', label: 'Self-employed', description: 'I work as a freelancer/contractor' },
      { id: 'business_owner', label: 'Business owner', description: 'I run a registered business' },
      { id: 'not_earning', label: "I don't earn", description: 'I am student, homemaker or retired' },
    ],
  }),
  processResponse: (response, _state) => {
    const risk: 'low' | 'medium' | 'high' = 'low';
    return { occupation: String(response), occupationRisk: risk };
  },
  getNextStep: (_response, _state) => 'life_quote_display',
};

const lifeDqCoverageInput: ConversationStep<LifeJourneyState> = {
  id: 'life_dq_coverage_input',
  module: 'basic_info',
  widgetType: 'coverage_input',
  getScript: (_persona, state) => ({
    botMessages: [
      `Almost there! Select your desired coverage and policy term.`,
    ],
  }),
  processResponse: (_response, state) => {
    return { currentModule: 'quote' as LifeModule };
  },
  getNextStep: (_response, _state) => 'life_quote_display',
};

/* ═══════════════════════════════════════════════
   GUIDED PATH — Thorough recommendation flow
   ═══════════════════════════════════════════════ */

const lifeBasicGender: ConversationStep<LifeJourneyState> = {
  id: 'life_basic_gender',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `What's your gender? This helps us calculate accurate premiums.`,
    ],
    options: [
      { id: 'male', label: 'Male', icon: '👨' },
      { id: 'female', label: 'Female', icon: '👩' },
    ],
  }),
  processResponse: (response, _state) => ({ gender: response as 'male' | 'female' }),
  getNextStep: (_response, _state) => 'life_basic_dob',
};

const lifeBasicDob: ConversationStep<LifeJourneyState> = {
  id: 'life_basic_dob',
  module: 'basic_info',
  widgetType: 'date_picker',
  getScript: (persona, state) => ({
    botMessages: [
      `What's your date of birth?`,
      `Your age affects your premium — the younger you are, the lower your premium.`,
    ],
    placeholder: 'Select date of birth',
  }),
  processResponse: (response, _state) => {
    const age = calculateAge(String(response));
    return { dateOfBirth: response, age };
  },
  getNextStep: (_, state) => {
    if (state.age < 18 || state.age > 65) {
      return 'life_age_ineligible';
    }
    return 'life_basic_pincode';
  },
};

const lifeAgeIneligible: ConversationStep<LifeJourneyState> = {
  id: 'life_age_ineligible',
  module: 'basic_info',
  widgetType: 'none',
  getScript: (persona, state) => ({
    botMessages: [
      `I see you're ${state.age} years old.`,
      `ACKO Life Insurance is available for ages 18-65.`,
      state.age < 18
        ? `You'll be eligible once you turn 18. Until then, consider talking to your parents about family coverage.`
        : `For ages above 65, please contact our support team for alternative options.`,
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_intro', // Restart journey
};

const lifeBasicPhone: ConversationStep<LifeJourneyState> = {
  id: 'life_basic_phone',
  module: 'basic_info',
  widgetType: 'text_input',
  getScript: (persona, state) => ({
    botMessages: [
      `Great! Now, what's your phone number?`,
      `We'll use this to send you policy updates and quotes.`,
    ],
    placeholder: 'Enter 10-digit mobile number',
    inputType: 'tel',
  }),
  processResponse: (response, _state) => ({ phone: String(response) }),
  getNextStep: (_response, _state) => 'life_basic_pincode',
};

const lifeBasicPincode: ConversationStep<LifeJourneyState> = {
  id: 'life_basic_pincode',
  module: 'basic_info',
  widgetType: 'text_input',
  getScript: (persona, state) => ({
    botMessages: [
      `What's your pin code?`,
      `This helps us provide location-specific information.`,
    ],
    placeholder: 'Enter 6-digit pin code',
    inputType: 'text',
  }),
  processResponse: (response, _state) => ({ pinCode: String(response) }),
  getNextStep: (_response, _state) => 'life_basic_smoking',
};

const lifeBasicSmoking: ConversationStep<LifeJourneyState> = {
  id: 'life_basic_smoking',
  module: 'basic_info',
  widgetType: 'yes_no',
  getScript: (persona, state) => ({
    botMessages: [
      `Have you smoked or used any tobacco products in the past 12 months?`,
      `This includes cigarettes, cigars, e-cigarettes, chewing tobacco, gutka, or paan masala.`,
      `Honest disclosure helps us give you accurate premiums.`,
    ],
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
  }),
  processResponse: (response, _state) => ({
    smokingStatus: response === 'yes' ? 'current' : 'never',
  }),
  getNextStep: (_response, _state) => 'life_basic_income',
};

const lifeBasicIncome: ConversationStep<LifeJourneyState> = {
  id: 'life_basic_income',
  module: 'basic_info',
  widgetType: 'number_input',
  getScript: (persona, state) => {
    const personaConfig = LIFE_PERSONA_CONFIG[persona as LifePersonaType];
    const messages: string[] = [
      `What's your annual income?`,
    ];
    
    // Persona-specific income question messaging
    if (persona === 'protector') {
      messages.push(
        `This helps us recommend the right coverage amount for your family's needs.`,
        `Your coverage should ideally be 10-15 times your annual income.`
      );
    } else if (persona === 'growth_seeker') {
      messages.push(
        `This helps us calculate how much coverage you need — and how much you can invest separately.`,
        `We'll show you: coverage cost vs. investment potential.`
      );
    } else { // passive_aware
      messages.push(
        `This helps us recommend the right coverage — we'll do the math for you.`
      );
    }
    
    return {
      botMessages: messages,
      placeholder: 'Enter annual income (₹)',
      inputType: 'number',
      min: 100000,
      max: 100000000,
    };
  },
  processResponse: (response, state) => {
    const income = parseInt(String(response)) || 0;
    return { annualIncome: income };
  },
  getNextStep: (response, state) => {
    const responseStr = String(response).toLowerCase();
    if (responseStr.includes('return') || responseStr.includes('ulip') || responseStr.includes('investment')) {
      return 'life_growth_seeker_education';
    }
    return 'life_financial_dependents';
  },
};

// Education step for Growth Seekers (inserted dynamically)
const lifeGrowthSeekerEducation: ConversationStep<LifeJourneyState> = {
  id: 'life_growth_seeker_education',
  module: 'basic_info',
  widgetType: 'selection_cards',
  condition: (state) => state.resolvedPersona === 'growth_seeker',
  getScript: (persona, state) => ({
    botMessages: [
      `I understand you're thinking about returns. Let me explain why separating protection from investment works better.`,
      ``,
      `When you mix insurance and investment (like ULIPs):`,
      `• Part of your premium goes to mortality charges`,
      `• Part goes to agent commissions`,
      `• Part goes to fund management charges`,
      `• You get lower coverage AND lower returns`,
      ``,
      `With term insurance + separate investment:`,
      `• ₹5,000/year for ₹1 Cr term coverage`,
      `• ₹45,000/year invested separately in mutual funds`,
      `• You get maximum protection + better growth potential`,
      ``,
      `Does this make sense?`,
    ],
    options: [
      { id: 'yes', label: 'Yes, I understand', description: 'Continue with term insurance' },
      { id: 'no', label: 'I still have questions', description: 'Let\'s discuss more' },
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (response, _state) => {
    if (response === 'no') {
      return 'life_growth_seeker_education';
    }
    return 'life_financial_dependents';
  },
};

/* ── Financial obligations collection (for accurate coverage calc) ── */

const lifeFinancialDependents: ConversationStep<LifeJourneyState> = {
  id: 'life_financial_dependents',
  module: 'basic_info',
  widgetType: 'multi_select',
  getScript: (persona, state) => ({
    botMessages: [
      `Who depend on you financially?`,
    ],
    options: [
      { id: 'spouse', label: 'Spouse' },
      { id: 'kids', label: 'Kids' },
      { id: 'parents', label: 'Parents' },
      { id: 'parents_in_law', label: 'Parents-in-law' },
      { id: 'extended_family', label: 'Extended family' },
      { id: 'none', label: 'No one right now' },
    ],
  }),
  processResponse: (response, _state) => {
    const selected = String(response).split(',').filter(Boolean);
    const hasNone = selected.includes('none');
    const count = hasNone ? 0 : selected.length;
    return { numberOfDependents: count, dependentTypes: selected };
  },
  getNextStep: (response, _state) => {
    const selected = String(response).split(',').filter(Boolean);
    if (selected.includes('kids')) {
      return 'life_financial_children';
    }
    return 'life_financial_loans';
  },
};

const lifeFinancialChildren: ConversationStep<LifeJourneyState> = {
  id: 'life_financial_children',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `How many kids do you have?`,
      `Their education and future needs are a big part of coverage planning.`,
    ],
    options: [
      { id: '1', label: '1 child' },
      { id: '2', label: '2 children' },
      { id: '3+', label: '3 or more' },
    ],
  }),
  processResponse: (response, _state) => {
    const count = response === '3+' ? 3 : parseInt(response) || 1;
    return { numberOfChildren: count };
  },
  getNextStep: (_response, _state) => 'life_financial_youngest_child',
};

const lifeFinancialYoungestChild: ConversationStep<LifeJourneyState> = {
  id: 'life_financial_youngest_child',
  module: 'basic_info',
  widgetType: 'number_input',
  getScript: (persona, state) => ({
    botMessages: [
      `What's your youngest child's age?`,
      `This helps us estimate when education costs will arise.`,
    ],
    placeholder: 'Age in years',
    inputType: 'number',
    min: 0,
    max: 25,
  }),
  processResponse: (response, _state) => ({
    youngestChildAge: parseInt(String(response)) || 0,
  }),
  getNextStep: (_response, _state) => 'life_financial_loans',
};

const lifeFinancialLoans: ConversationStep<LifeJourneyState> = {
  id: 'life_financial_loans',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `Do you have any outstanding loans?`,
      `Home loan, car loan, education loan, personal loan — include all.`,
      `Your term cover should at minimum clear these obligations.`,
    ],
    options: [
      { id: '0', label: 'No loans' },
      { id: 'small', label: 'Under ₹25 lakh', description: 'Car/personal/education loan' },
      { id: 'medium', label: '₹25L – ₹75L', description: 'Home loan or multiple loans' },
      { id: 'large', label: '₹75L – ₹1.5 Cr', description: 'Large home loan' },
      { id: 'very_large', label: 'Above ₹1.5 Cr', description: 'Multiple properties or large EMIs' },
    ],
  }),
  processResponse: (response, _state) => {
    const loanMap: Record<string, number> = {
      '0': 0,
      'small': 1500000,
      'medium': 5000000,
      'large': 11000000,
      'very_large': 20000000,
    };
    return { outstandingLoans: loanMap[response] || 0 };
  },
  getNextStep: (_response, _state) => 'life_financial_monthly_expenses',
};

const lifeFinancialMonthlyExpenses: ConversationStep<LifeJourneyState> = {
  id: 'life_financial_monthly_expenses',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `What are your monthly household expenses?`,
      `Include rent/EMI, groceries, utilities, school fees, etc.`,
      `This helps us add an emergency buffer to your coverage.`,
    ],
    options: [
      { id: '30000', label: '₹20K – ₹40K/month' },
      { id: '60000', label: '₹40K – ₹80K/month' },
      { id: '100000', label: '₹80K – ₹1.2L/month' },
      { id: '150000', label: '₹1.2L – ₹2L/month' },
      { id: '250000', label: 'Above ₹2L/month' },
    ],
  }),
  processResponse: (response, _state) => ({
    monthlyExpenses: parseInt(response) || 50000,
  }),
  getNextStep: (_response, _state) => 'life_financial_existing_cover',
};

const lifeFinancialExistingCover: ConversationStep<LifeJourneyState> = {
  id: 'life_financial_existing_cover',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `Do you have any existing life insurance or significant savings?`,
      `This includes term plans, employer group cover, EPF, PPF, or mutual fund corpus.`,
      `We'll subtract this from your coverage need — no point over-insuring.`,
    ],
    options: [
      { id: '0', label: 'None / negligible' },
      { id: '2500000', label: 'Under ₹25L', description: 'Small savings or employer cover' },
      { id: '5000000', label: '₹25L – ₹75L', description: 'EPF + some savings' },
      { id: '10000000', label: '₹75L – ₹1.5 Cr', description: 'Significant corpus' },
      { id: '20000000', label: 'Above ₹1.5 Cr', description: 'Large corpus / existing term plan' },
    ],
  }),
  processResponse: (response, _state) => {
    const total = parseInt(response) || 0;
    return { existingLifeCover: Math.round(total * 0.4), existingCorpusSavings: Math.round(total * 0.6) };
  },
  getNextStep: (_response, _state) => 'life_basic_summary',
};

const lifeBasicSummary: ConversationStep<LifeJourneyState> = {
  id: 'life_basic_summary',
  module: 'basic_info',
  widgetType: 'coverage_card',
  getScript: (persona, state) => {
    const { recommended, breakdown } = calculateRecommendedCoverage(state);
    const policyTerm = calculatePolicyTerm(state.age);

    const formatAmt = (n: number) => {
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
      return `₹${n.toLocaleString('en-IN')}`;
    };

    const breakdownItems: { label: string; value: string }[] = [
      { label: 'Income replacement', value: formatAmt(breakdown.incomeReplacement) },
    ];
    if (breakdown.loanCoverage > 0) {
      breakdownItems.push({ label: 'Outstanding loans', value: formatAmt(breakdown.loanCoverage) });
    }
    if (breakdown.childEducationFund > 0) {
      breakdownItems.push({ label: "Children's future needs", value: formatAmt(breakdown.childEducationFund) });
    }
    breakdownItems.push({ label: 'Emergency buffer', value: formatAmt(breakdown.emergencyBuffer) });
    if (breakdown.existingCover > 0) {
      breakdownItems.push({ label: 'Existing cover (deducted)', value: `-${formatAmt(breakdown.existingCover)}` });
    }

    return {
      botMessages: [
        `Here's your recommended plan.`,
      ],
      coverageAmount: formatAmt(recommended),
      policyTerm: `${policyTerm} years`,
      coversTillAge: state.age + policyTerm,
      breakdownItems,
    };
  },
  processResponse: (_response, state) => {
    const { recommended, breakdown } = calculateRecommendedCoverage(state);
    const policyTerm = calculatePolicyTerm(state.age);
    return {
      currentModule: 'lifestyle' as LifeModule,
      recommendedCoverage: recommended,
      selectedCoverage: recommended,
      coverageBreakdown: breakdown,
      selectedTerm: policyTerm,
    };
  },
  getNextStep: (_response, _state) => 'life_lifestyle_alcohol',
};

/* ═══════════════════════════════════════════════
   MODULE: LIFESTYLE — Alcohol, Occupation, Medical History
   ═══════════════════════════════════════════════ */

const lifeLifestyleAlcohol: ConversationStep<LifeJourneyState> = {
  id: 'life_lifestyle_alcohol',
  module: 'lifestyle',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `Do you consume alcohol?`,
      `This helps us assess risk and calculate accurate premiums.`,
    ],
    options: [
      { id: 'never', label: 'Never', description: 'I don\'t drink' },
      { id: 'occasional', label: 'Occasionally', description: 'Social drinking only' },
      { id: 'regular', label: 'Regularly', description: 'Weekly or more' },
    ],
  }),
  processResponse: (response, _state) => ({ alcoholConsumption: response as 'never' | 'occasional' | 'regular' }),
  getNextStep: (_response, _state) => 'life_lifestyle_occupation',
};

const lifeLifestyleOccupation: ConversationStep<LifeJourneyState> = {
  id: 'life_lifestyle_occupation',
  module: 'lifestyle',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `What do you do for a living?`,
    ],
    options: [
      { id: 'salaried', label: 'Salaried', description: 'I work for an organisation' },
      { id: 'self_employed', label: 'Self-employed', description: 'I work as a freelancer/contractor' },
      { id: 'business_owner', label: 'Business owner', description: 'I run a registered business' },
      { id: 'not_earning', label: "I don't earn", description: 'I am student, homemaker or retired' },
    ],
  }),
  processResponse: (response, _state) => {
    const risk: 'low' | 'medium' | 'high' = 'low';
    return { occupation: String(response), occupationRisk: risk };
  },
  getNextStep: (_response, _state) => 'life_lifestyle_summary',
};

const lifeLifestyleMedical: ConversationStep<LifeJourneyState> = {
  id: 'life_lifestyle_medical',
  module: 'lifestyle',
  widgetType: 'yes_no',
  getScript: (persona, state) => ({
    botMessages: [
      `Do you have any pre-existing medical conditions?`,
      `This includes conditions like diabetes, hypertension, heart disease, or any chronic illnesses.`,
      `Honest disclosure ensures accurate underwriting.`,
    ],
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
  }),
  processResponse: (response, _state) => ({
    medicalHistory: response === 'yes' ? ['disclosed'] : [],
  }),
  getNextStep: (_response, _state) => 'life_lifestyle_summary',
};

const lifeLifestyleSummary: ConversationStep<LifeJourneyState> = {
  id: 'life_lifestyle_summary',
  module: 'lifestyle',
  widgetType: 'none',
  getScript: (persona, state) => ({
    botMessages: [
      `Great! I have all the information I need.`,
      `Now let me calculate your personalized premium quote.`,
    ],
  }),
  processResponse: (_response, _state) => ({ currentModule: 'quote' }),
  getNextStep: (_response, _state) => 'life_quote_display',
};

/* ═══════════════════════════════════════════════
   MODULE: QUOTE — Coverage & Premium Calculation
   ═══════════════════════════════════════════════ */

/**
 * Premium calculation based on Indian term insurance market rates (2024-25).
 * Reference: ACKO Life, HDFC Life, ICICI Pru, Max Life rate cards.
 *
 * Base rates per ₹1L sum assured per year (non-smoker male):
 *   Age 20-24: ₹4-5     Age 25-29: ₹5-7     Age 30-34: ₹7-10
 *   Age 35-39: ₹11-16   Age 40-44: ₹18-28   Age 45-49: ₹32-50
 *   Age 50-54: ₹55-85   Age 55-59: ₹95-150  Age 60-65: ₹160-250
 *
 * Loadings: Smoker +70-80%, Female discount -15-20%, High-risk occupation +25-30%
 * GST: 18% on premium (mandatory in India)
 */
export function calculateBasePremium(state: LifeJourneyState): {
  basePremium: number;
  gst: number;
  totalPremium: number;
} {
  const { age, gender, smokingStatus, occupationRisk } = state;
  const sumAssured = state.recommendedCoverage || state.selectedCoverage || 10000000;
  const policyTerm = state.selectedTerm || calculatePolicyTerm(age);

  // Base rate per ₹1L sum assured (non-smoker male, low-risk occupation)
  let ratePerLakh: number;
  if (age <= 24) ratePerLakh = 4.5;
  else if (age <= 29) ratePerLakh = 6;
  else if (age <= 34) ratePerLakh = 9;
  else if (age <= 39) ratePerLakh = 14;
  else if (age <= 44) ratePerLakh = 23;
  else if (age <= 49) ratePerLakh = 40;
  else if (age <= 54) ratePerLakh = 70;
  else if (age <= 59) ratePerLakh = 120;
  else ratePerLakh = 200;

  // Longer policy terms cost slightly more per year
  if (policyTerm > 30) ratePerLakh *= 1.08;
  else if (policyTerm > 20) ratePerLakh *= 1.0;
  else if (policyTerm > 10) ratePerLakh *= 0.95;
  else ratePerLakh *= 0.88;

  // Female discount: women live longer on average, ~15-20% lower premium
  if (gender === 'female') ratePerLakh *= 0.82;

  // Smoker/tobacco loading: +75% (Indian market standard)
  if (smokingStatus === 'current') ratePerLakh *= 1.75;
  else if (smokingStatus === 'past') ratePerLakh *= 1.25;

  // Occupation risk loading
  if (occupationRisk === 'high') ratePerLakh *= 1.30;
  else if (occupationRisk === 'medium') ratePerLakh *= 1.12;

  // Volume discount for higher sum assured (common in India)
  const sumAssuredInCr = sumAssured / 10000000;
  if (sumAssuredInCr >= 5) ratePerLakh *= 0.85;
  else if (sumAssuredInCr >= 2) ratePerLakh *= 0.90;
  else if (sumAssuredInCr >= 1) ratePerLakh *= 0.95;

  const basePremium = Math.round((sumAssured / 100000) * ratePerLakh);
  const gst = 0;
  const totalPremium = basePremium;

  return { basePremium, gst, totalPremium };
}

const lifeQuoteDisplay: ConversationStep<LifeJourneyState> = {
  id: 'life_quote_display',
  module: 'quote',
  widgetType: 'premium_summary',
  getScript: (persona, state) => {
    if (state.userPath === 'direct') {
      return {
        botMessages: [
          `Here is a starter quote based on your details.`,
          `You can adjust the coverage and term below to match your needs.`,
        ],
      };
    }
    return { botMessages: [] };
  },
  processResponse: (response, state) => {
    const sumAssured = state.selectedCoverage || state.recommendedCoverage || 10000000;
    const policyTerm = state.selectedTerm || calculatePolicyTerm(state.age);
    const premium = calculateBasePremium({ ...state, recommendedCoverage: sumAssured, selectedTerm: policyTerm });
    const quote = {
      sumAssured,
      policyTerm,
      premiumFrequency: 'yearly' as const,
      basePremium: premium.basePremium,
      riders: [],
      totalPremium: premium.totalPremium,
      monthlyPremium: Math.round(premium.totalPremium / 12),
      yearlyPremium: premium.totalPremium,
    };
    return { quote, selectedCoverage: sumAssured, selectedTerm: policyTerm };
  },
  getNextStep: (_response, _state) => 'life_addons_intro',
};

/* ═══════════════════════════════════════════════
   MODULE: ADD-ONS — Riders Selection
   ═══════════════════════════════════════════════ */

const lifeAddonsIntro: ConversationStep<LifeJourneyState> = {
  id: 'life_addons_intro',
  module: 'addons',
  widgetType: 'rider_cards',
  getScript: (persona, state) => {
    const messages: string[] = [
      `Would you like to strengthen your coverage with additional protection?`,
      ``,
      `**Accidental protection** — extra payout for accidental death or disability`,
      `**Critical illness protection** — lump sum payment if diagnosed with major illnesses`,
      ``,
      `All add-ons are optional and can be modified later.`,
    ];
    
    return { botMessages: messages };
  },
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_review',
};

const lifeAddonsAccidentalDeath: ConversationStep<LifeJourneyState> = {
  id: 'life_addons_accidental_death',
  module: 'addons',
  widgetType: 'rider_toggle',
  getScript: (persona, state) => ({
    botMessages: [
      `Accidental Death Benefit Rider`,
      `Provides additional payout (up to 3x your base coverage) if death occurs due to an accident.`,
      `Would you like to add this?`,
    ],
    options: [
      { id: 'yes', label: 'Yes, add this rider' },
      { id: 'no', label: 'No, skip' },
    ],
  }),
  processResponse: (response, _state) => {
    const riders: LifeRider[] = response === 'yes'
      ? [{ id: 'accidental_death', name: 'Accidental Death Benefit', description: '3x coverage for accidental death', coverageMultiplier: 3, premiumImpact: 50, selected: true }]
      : [];
    return { selectedRiders: riders };
  },
  getNextStep: (_response, _state) => 'life_addons_critical_illness',
};

const lifeAddonsCriticalIllness: ConversationStep<LifeJourneyState> = {
  id: 'life_addons_critical_illness',
  module: 'addons',
  widgetType: 'rider_toggle',
  getScript: (persona, state) => ({
    botMessages: [
      `Critical Illness Benefit Rider`,
      `Pays a lump sum if you're diagnosed with any of 21 critical illnesses (cancer, heart attack, stroke, etc.).`,
      `This helps cover treatment costs without waiting for death benefit.`,
      `Add this rider?`,
    ],
    options: [
      { id: 'yes', label: 'Yes, add this rider' },
      { id: 'no', label: 'No, skip' },
    ],
  }),
  processResponse: (response, state) => {
    const existingRiders = state.selectedRiders || [];
    if (response === 'yes') {
      const newRider: LifeRider = {
        id: 'critical_illness',
        name: 'Critical Illness Benefit',
        description: 'Coverage for 21 critical illnesses',
        coverageMultiplier: 1,
        premiumImpact: 100,
        selected: true,
      };
      return { selectedRiders: [...existingRiders, newRider] };
    }
    return { selectedRiders: existingRiders };
  },
  getNextStep: (_response, _state) => 'life_addons_disability',
};

const lifeAddonsDisability: ConversationStep<LifeJourneyState> = {
  id: 'life_addons_disability',
  module: 'addons',
  widgetType: 'rider_toggle',
  getScript: (persona, state) => ({
    botMessages: [
      `Accidental Total Permanent Disability Rider`,
      `Provides financial support if an accident leaves you permanently disabled and unable to work.`,
      `Add this rider?`,
    ],
    options: [
      { id: 'yes', label: 'Yes, add this rider' },
      { id: 'no', label: 'No, skip' },
    ],
  }),
  processResponse: (response, state) => {
    const existingRiders = state.selectedRiders || [];
    if (response === 'yes') {
      const newRider: LifeRider = {
        id: 'disability',
        name: 'Accidental Total Permanent Disability',
        description: 'Coverage for permanent disability',
        coverageMultiplier: 1,
        premiumImpact: 75,
        selected: true,
      };
      return { selectedRiders: [...existingRiders, newRider] };
    }
    return { selectedRiders: existingRiders };
  },
  getNextStep: (_response, _state) => 'life_review',
};

/* ═══════════════════════════════════════════════
   MODULE: REVIEW — Final Summary
   ═══════════════════════════════════════════════ */

const lifeReview: ConversationStep<LifeJourneyState> = {
  id: 'life_review',
  module: 'review',
  widgetType: 'none',
  getScript: (_persona, state) => {
    const formatAmt = (n: number) => {
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
      if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
      return `₹${n.toLocaleString('en-IN')}`;
    };

    const yearlyPremium = state.quote?.yearlyPremium || 0;
    const monthlyPremium = state.quote?.monthlyPremium || 0;

    const messages: string[] = [
      `Here's a summary of your life insurance plan:`,
      ``,
      `• Coverage: ${formatAmt(state.selectedCoverage)}`,
      `• Term: ${state.selectedTerm} years (till age ${state.age + state.selectedTerm})`,
      `• Riders: ${state.selectedRiders.length} selected`,
      `• Premium: ${formatAmt(yearlyPremium)}/year (${formatAmt(monthlyPremium)}/month)`,
      ``,
      `Let's proceed to payment.`,
    ];
    
    return { botMessages: messages };
  },
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_payment',
};

/* ═══════════════════════════════════════════════
   MODULE: PAYMENT — Secure payment
   ═══════════════════════════════════════════════ */

const lifePayment: ConversationStep<LifeJourneyState> = {
  id: 'life_payment',
  module: 'payment',
  widgetType: 'payment_screen',
  getScript: (_persona, state) => {
    const formatAmt = (n: number) => {
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
      return `₹${n.toLocaleString('en-IN')}`;
    };
    return {
      botMessages: [
        `Your plan is ready.`,
        `Coverage: ${formatAmt(state.selectedCoverage)} | Premium: ₹${(state.quote?.yearlyPremium || 0).toLocaleString('en-IN')}/year`,
      ],
    };
  },
  processResponse: (_response, _state) => ({
    paymentComplete: true,
    currentModule: 'ekyc' as LifeModule,
  }),
  getNextStep: (_response, _state) => 'life_ekyc',
};

/* ═══════════════════════════════════════════════
   MODULE: E-KYC — Aadhaar-based verification
   ═══════════════════════════════════════════════ */

const lifeEkyc: ConversationStep<LifeJourneyState> = {
  id: 'life_ekyc',
  module: 'ekyc',
  widgetType: 'ekyc_screen',
  getScript: (_persona, state) => ({
    botMessages: [
      `Payment received — your coverage of ₹${((state.selectedCoverage || 10000000) / 10000000).toFixed(1)} Cr is reserved for you. 🎉`,
      `Now let's complete your e-KYC. It's mandatory for policy issuance and takes under 2 minutes.\n\nYou'll need your **Aadhaar number** and access to the **mobile linked with Aadhaar**.`,
    ],
  }),
  processResponse: (_response, _state) => ({
    ekycComplete: true,
    currentModule: 'financial' as LifeModule,
  }),
  getNextStep: (_response, _state) => 'life_financial',
};

/* ═══════════════════════════════════════════════
   MODULE: FINANCIAL — Income verification
   ═══════════════════════════════════════════════ */

const lifeFinancial: ConversationStep<LifeJourneyState> = {
  id: 'life_financial',
  module: 'financial',
  widgetType: 'financial_screen',
  getScript: (_persona, _state) => ({
    botMessages: [
      `e-KYC verified! ✅`,
      `Next, we need to verify your income. This helps us confirm the coverage amount you've selected.\n\nYou can verify via **EPFO/PF**, **Account Aggregator** (bank statements), or by **uploading salary slips** — pick whichever works best for you.`,
    ],
  }),
  processResponse: (_response, _state) => ({
    financialComplete: true,
    currentModule: 'medical' as LifeModule,
  }),
  getNextStep: (_response, _state) => 'life_medical_eval',
};

/* ═══════════════════════════════════════════════
   MODULE: MEDICAL — Tele-medical & health tests
   ═══════════════════════════════════════════════ */

const lifeMedicalEval: ConversationStep<LifeJourneyState> = {
  id: 'life_medical_eval',
  module: 'medical',
  widgetType: 'medical_screen',
  getScript: (_persona, _state) => ({
    botMessages: [
      `Income verified! ✅`,
      `Now for your **Video Medical Evaluation (VMER)** — a 15–20 minute video call with a licensed doctor.\n\nAfter the call, you'll review and confirm your health & lifestyle responses. Additional home tests may be required based on your profile.`,
    ],
  }),
  processResponse: (_response, _state) => ({
    medicalComplete: true,
    currentModule: 'underwriting' as LifeModule,
  }),
  getNextStep: (_response, _state) => 'life_underwriting',
};

/* ═══════════════════════════════════════════════
   MODULE: UNDERWRITING — Review & approval
   ═══════════════════════════════════════════════ */

const lifeUnderwriting: ConversationStep<LifeJourneyState> = {
  id: 'life_underwriting',
  module: 'underwriting',
  widgetType: 'underwriting_status',
  getScript: (_persona, state) => ({
    botMessages: [
      `All done! 🎉 Your application is now with our underwriting team.`,
      `They'll review your KYC, financial verification, and medical evaluation — typically takes **3–5 business days**.\n\nYou'll be notified by Email & WhatsApp the moment a decision is made.`,
    ],
  }),
  processResponse: (_response, _state) => ({
    journeyComplete: true,
  }),
  getNextStep: (_response, _state) => 'life_complete',
};

const lifeComplete: ConversationStep<LifeJourneyState> = {
  id: 'life_complete',
  module: 'underwriting',
  widgetType: 'celebration',
  getScript: (_persona, state) => ({
    botMessages: [
      `You're all set! 🎉`,
      `Your application has been submitted. We'll keep you updated at every step.`,
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_complete',
};

/* ═══════════════════════════════════════════════
   EXPORT — All Life conversation steps
   ═══════════════════════════════════════════════ */

export const LIFE_STEPS: ConversationStep<LifeJourneyState>[] = [
  // Intro and path choice
  lifeIntro,
  lifePathChoice,

  // Guided path: eligibility check
  lifeShouldBuyCheck,
  lifeNoDependentsAgeCheck,
  lifeYoungRecommendation,
  lifeFlexiCoverExplanation,
  lifeNoNeedExplanation,
  lifeExploreOtherLobs,
  lifeNeedDiscussion,

  // Direct quote path
  lifeDqGender,
  lifeDqDob,
  lifeDqPincode,
  lifeDqSmoking,
  lifeDqIncome,
  lifeDqAlcohol,
  lifeDqOccupation,
  lifeDqCoverageInput,
  
  // Guided path: basic information
  lifeBasicGender,
  lifeBasicDob,
  lifeAgeIneligible,
  lifeBasicPincode,
  lifeBasicSmoking,
  lifeBasicIncome,
  lifeGrowthSeekerEducation,
  
  // Guided path: financial obligations
  lifeFinancialDependents,
  lifeFinancialChildren,
  lifeFinancialYoungestChild,
  lifeFinancialLoans,
  lifeFinancialMonthlyExpenses,
  lifeFinancialExistingCover,
  lifeBasicSummary,
  
  // Guided path: lifestyle
  lifeLifestyleAlcohol,
  lifeLifestyleOccupation,
  lifeLifestyleSummary,
  
  // Shared: quote and add-ons
  lifeQuoteDisplay,
  lifeAddonsIntro,
  lifeAddonsAccidentalDeath,
  lifeAddonsCriticalIllness,
  lifeAddonsDisability,
  
  // Shared: review and post-purchase
  lifeReview,
  lifePayment,
  lifeEkyc,
  lifeFinancial,
  lifeMedicalEval,
  lifeUnderwriting,
  lifeComplete,
];

export function getLifeStep(stepId: string): ConversationStep<LifeJourneyState> | undefined {
  return LIFE_STEPS.find((s) => s.id === stepId);
}
