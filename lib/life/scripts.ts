/**
 * Life Insurance LOB — Conversation scripts for the Life buy journey.
 * Follows the same pattern as Health scripts with Life-specific questions.
 */

import type { ConversationStep, Option } from '../core/types';
import type { LifeJourneyState, LifeModule, LifePersonaType, LifeRider } from './types';
import { LIFE_PERSONA_CONFIG } from './personas';

// Helper to get user name
function userName(state: LifeJourneyState): string {
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

// Helper to calculate recommended coverage (HLV method)
function calculateRecommendedCoverage(state: LifeJourneyState): number {
  const { annualIncome, age, resolvedPersona } = state;
  if (!annualIncome || annualIncome === 0) return 0;
  
  const multiplier = LIFE_PERSONA_CONFIG[resolvedPersona]?.recommendedCoverageMultiplier || 10;
  const workingYearsRemaining = Math.max(60 - age, 10); // Assume retirement at 60, min 10 years
  
  return Math.round(annualIncome * multiplier);
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
      `Hi ${userName(state)}! 👋`,
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
        `I'm here to make this simple for you.`,
        `Let's start with a simple question: If your income stopped tomorrow, how long would your family manage?`,
        `Don't worry — we'll help you figure out the right coverage. No overthinking needed.`
      );
    }
    
    return { botMessages: messages };
  },
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_should_buy_check',
};

// NEW: Ethical check — "Should you even buy term?"
const lifeShouldBuyCheck: ConversationStep<LifeJourneyState> = {
  id: 'life_should_buy_check',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `Before we proceed, let's check if term insurance makes sense for you.`,
      ``,
      `You may not need term insurance if:`,
      `• You have no dependents`,
      `• You have no liabilities (loans, EMIs)`,
      `• You have enough assets to cover your dependents' needs`,
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
      return 'life_no_need_explanation';
    }
    if (response === 'not_sure') {
      return 'life_need_discussion';
    }
    return 'life_education_what_is';
  },
};

// Explanation if they don't need term — offers meaningful next actions
const lifeNoNeedExplanation: ConversationStep<LifeJourneyState> = {
  id: 'life_no_need_explanation',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `That's perfectly fine!`,
      `Term insurance is for protecting dependents and financial obligations.`,
      `If you don't have those right now, you can revisit this when your situation changes.`,
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
      return 'life_education_what_is';
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
    return 'life_education_what_is';
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
    return 'life_basic_name';
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
  getNextStep: (_response, _state) => 'life_basic_name',
};

const lifeBasicName: ConversationStep<LifeJourneyState> = {
  id: 'life_basic_name',
  module: 'basic_info',
  widgetType: 'text_input',
  getScript: (persona, state) => ({
    botMessages: [
      `First, what's your name?`,
      `I'll use this to personalize your journey.`,
    ],
    placeholder: 'Enter your name',
    inputType: 'text',
  }),
  processResponse: (response, _state) => ({ name: String(response), userName: String(response) }),
  getNextStep: (_response, _state) => 'life_basic_gender',
};

const lifeBasicGender: ConversationStep<LifeJourneyState> = {
  id: 'life_basic_gender',
  module: 'basic_info',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `Nice to meet you, ${userName(state)}! 👋`,
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
    return 'life_basic_phone';
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
    const recommendedCoverage = calculateRecommendedCoverage({
      ...state,
      annualIncome: income,
    });
    return { annualIncome: income, recommendedCoverage };
  },
  getNextStep: (response, state) => {
    // Check if user response indicates Growth Seeker concerns
    const responseStr = String(response).toLowerCase();
    if (responseStr.includes('return') || responseStr.includes('ulip') || responseStr.includes('investment')) {
      return 'life_growth_seeker_education'; // Insert education step
    }
    return 'life_basic_summary';
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
      return 'life_growth_seeker_education'; // Loop back for more questions
    }
    return 'life_basic_summary';
  },
};

const lifeBasicSummary: ConversationStep<LifeJourneyState> = {
  id: 'life_basic_summary',
  module: 'basic_info',
  widgetType: 'none',
  getScript: (persona, state) => {
    const personaConfig = LIFE_PERSONA_CONFIG[persona as LifePersonaType];
    const messages: string[] = [
      `Perfect! I've got your basic information.`,
    ];
    
    // Calculate coverage using ethical method: Annual income × multiplier + loans + goals - assets
    const baseCoverage = state.annualIncome * (personaConfig.recommendedCoverageMultiplier || 10);
    const recommendedCoverage = Math.max(baseCoverage, 10000000); // Min ₹1Cr
    
    // Persona-specific coverage recommendation messaging (ETHICAL: explain why, allow adjustment)
    if (persona === 'protector') {
      messages.push(
        `Based on your age (${state.age}) and income (₹${(state.annualIncome / 100000).toFixed(1)}L), I recommend a coverage of ₹${(recommendedCoverage / 10000000).toFixed(1)}Cr.`,
        ``,
        `Why this number?`,
        `• Your annual income × ${personaConfig.recommendedCoverageMultiplier} = ₹${(baseCoverage / 10000000).toFixed(1)}Cr`,
        `• This ensures your family maintains their lifestyle for ${personaConfig.recommendedCoverageMultiplier} years`,
        ``,
        `You can adjust this later — we'll show you how.`,
        `Now let's understand your lifestyle to calculate accurate premiums.`
      );
    } else if (persona === 'growth_seeker') {
      messages.push(
        `Based on your income (₹${(state.annualIncome / 100000).toFixed(1)}L), I recommend a coverage of ₹${(recommendedCoverage / 10000000).toFixed(1)}Cr.`,
        ``,
        `Why this number?`,
        `• Income replacement: ₹${(baseCoverage / 10000000).toFixed(1)}Cr`,
        `• Premium: ~₹${(recommendedCoverage * 0.001 / 1000).toFixed(0)}K/year`,
        `• Leaves ₹${((state.annualIncome - recommendedCoverage * 0.001) / 1000).toFixed(0)}K/year for investments`,
        ``,
        `You can adjust coverage — we'll show you the impact.`,
        `Now let's calculate your exact premium.`
      );
    } else { // passive_aware
      messages.push(
        `Based on your profile, I recommend a coverage of ₹${(recommendedCoverage / 10000000).toFixed(1)}Cr.`,
        ``,
        `Don't worry — you can adjust this anytime.`,
        `We'll explain everything clearly.`,
        `Now let's understand your lifestyle to get you an accurate quote.`
      );
    }
    
    return { botMessages: messages };
  },
  processResponse: (_response, _state) => ({ currentModule: 'lifestyle' }),
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
  widgetType: 'text_input',
  getScript: (persona, state) => ({
    botMessages: [
      `What's your occupation?`,
      `Some occupations have higher risk, which may affect premiums.`,
    ],
    placeholder: 'e.g., Software Engineer, Doctor, Business Owner',
    inputType: 'text',
  }),
  processResponse: (response, _state) => {
    // Simple risk assessment based on occupation keywords
    const occupation = String(response).toLowerCase();
    let risk: 'low' | 'medium' | 'high' = 'low';
    if (occupation.includes('pilot') || occupation.includes('firefighter') || occupation.includes('military')) {
      risk = 'high';
    } else if (occupation.includes('construction') || occupation.includes('mining') || occupation.includes('driver')) {
      risk = 'medium';
    }
    return { occupation: String(response), occupationRisk: risk };
  },
  getNextStep: (_response, _state) => 'life_lifestyle_medical',
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

// Helper to calculate base premium (simplified)
function calculateBasePremium(state: LifeJourneyState): number {
  const { age, gender, smokingStatus, annualIncome, occupationRisk } = state;
  const baseCoverage = state.recommendedCoverage || 10000000; // ₹1Cr
  
  // Base rate per ₹1L coverage (simplified)
  let ratePerLakh = 200; // Base rate
  
  // Age factor
  if (age < 30) ratePerLakh *= 0.8;
  else if (age < 40) ratePerLakh *= 1.0;
  else if (age < 50) ratePerLakh *= 1.5;
  else ratePerLakh *= 2.5;
  
  // Gender factor (women typically pay less)
  if (gender === 'female') ratePerLakh *= 0.9;
  
  // Smoking factor
  if (smokingStatus === 'current') ratePerLakh *= 1.5;
  
  // Occupation risk factor
  if (occupationRisk === 'high') ratePerLakh *= 1.3;
  else if (occupationRisk === 'medium') ratePerLakh *= 1.1;
  
  const premium = (baseCoverage / 100000) * ratePerLakh;
  return Math.round(premium);
}

const lifeQuoteDisplay: ConversationStep<LifeJourneyState> = {
  id: 'life_quote_display',
  module: 'quote',
  widgetType: 'premium_summary',
  getScript: (persona, state) => {
    const personaConfig = LIFE_PERSONA_CONFIG[persona as LifePersonaType];
    const basePremium = calculateBasePremium(state);
    const quote = {
      sumAssured: state.recommendedCoverage || 10000000,
      policyTerm: 30,
      premiumFrequency: 'yearly' as const,
      basePremium,
      riders: [],
      totalPremium: basePremium,
      monthlyPremium: Math.round(basePremium / 12),
      yearlyPremium: basePremium,
    };
    
    const messages: string[] = [
      `Here's your personalized quote, ${userName(state)}!`,
    ];
    
    // Persona-specific quote messaging
    if (persona === 'protector') {
      messages.push(
        `You're getting ₹${(quote.sumAssured / 10000000).toFixed(1)}Cr coverage for ₹${(quote.yearlyPremium / 1000).toFixed(0)}K/year.`,
        `Every rupee goes toward protecting your family — no mixing, no compromise.`,
        `Simple, transparent, reliable protection.`
      );
    } else if (persona === 'growth_seeker') {
      const remainingForInvestment = state.annualIncome - quote.yearlyPremium;
      messages.push(
        `You're getting ₹${(quote.sumAssured / 10000000).toFixed(1)}Cr coverage for just ₹${(quote.yearlyPremium / 1000).toFixed(0)}K/year.`,
        ``,
        `Here's the opportunity cost breakdown:`,
        ``,
        `If you have ₹${(state.annualIncome / 1000).toFixed(0)}K/year:`,
        `• ₹${(quote.yearlyPremium / 1000).toFixed(0)}K → Term insurance (₹${(quote.sumAssured / 10000000).toFixed(1)}Cr coverage)`,
        `• ₹${(remainingForInvestment / 1000).toFixed(0)}K → Invest separately (mutual funds, stocks, etc.)`,
        ``,
        `This gives you:`,
        `• Maximum protection (₹${(quote.sumAssured / 10000000).toFixed(1)}Cr)`,
        `• Better growth potential (₹${(remainingForInvestment / 1000).toFixed(0)}K invested separately)`,
        `• More flexibility (can adjust investments anytime)`,
        ``,
        `Separate protection from investment — you get better coverage AND better returns.`
      );
    } else { // passive_aware
      messages.push(
        `Based on your profile, here's your quote:`,
        `Coverage: ₹${(quote.sumAssured / 10000000).toFixed(1)}Cr`,
        `Premium: ₹${(quote.monthlyPremium / 1000).toFixed(0)}K/month (₹${(quote.yearlyPremium / 1000).toFixed(0)}K/year)`,
        `Simple, straightforward, no hidden costs.`
      );
    }
    
    return { botMessages: messages };
  },
  processResponse: (response, state) => {
    // Store quote in state
    const basePremium = calculateBasePremium(state);
    const quote = {
      sumAssured: state.recommendedCoverage || 10000000,
      policyTerm: 30,
      premiumFrequency: 'yearly' as const,
      basePremium,
      riders: [],
      totalPremium: basePremium,
      monthlyPremium: Math.round(basePremium / 12),
      yearlyPremium: basePremium,
    };
    return { quote, selectedCoverage: quote.sumAssured, selectedTerm: quote.policyTerm };
  },
  getNextStep: (_response, _state) => 'life_addons_intro',
};

/* ═══════════════════════════════════════════════
   MODULE: ADD-ONS — Riders Selection
   ═══════════════════════════════════════════════ */

const lifeAddonsIntro: ConversationStep<LifeJourneyState> = {
  id: 'life_addons_intro',
  module: 'addons',
  widgetType: 'none',
  getScript: (persona, state) => {
    const messages: string[] = [
      `Before we finalize, let me explain ACKO Flexi — our flexible coverage feature.`,
      ``,
      `Why Flexi matters:`,
      `• Your income grows over time`,
      `• Your loans change`,
      `• Your family size changes`,
      ``,
      `With ACKO Flexi, you can increase or decrease coverage anytime.`,
      `This means: You don't have to get it perfect today.`,
      ``,
      `Now, would you like to add extra protection with riders?`,
      `Riders enhance your coverage for specific situations.`,
      `You can always add or remove them later.`,
    ];
    
    return { botMessages: messages };
  },
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_addons_accidental_death',
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
  getScript: (persona, state) => {
    const messages: string[] = [
      `Perfect! Here's a summary of your life insurance plan:`,
      ``,
      `• Coverage: ₹${(state.selectedCoverage / 10000000).toFixed(1)}Cr`,
      `• Term: ${state.selectedTerm} years`,
      `• Riders: ${state.selectedRiders.length} selected`,
      `• Premium: ₹${(state.quote?.yearlyPremium || 0) / 1000}K/year (₹${(state.quote?.monthlyPremium || 0) / 1000}K/month)`,
      ``,
      `Before you proceed, let me explain what happens after payment:`,
    ];
    
    return { botMessages: messages };
  },
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_post_payment_process',
};

// NEW: Transparent post-payment process explanation
const lifePostPaymentProcess: ConversationStep<LifeJourneyState> = {
  id: 'life_post_payment_process',
  module: 'review',
  widgetType: 'none',
  getScript: (persona, state) => ({
    botMessages: [
      `What happens after payment:`,
      ``,
      `1. Tele-medical call`,
      `   We'll schedule a quick call to understand your health better`,
      ``,
      `2. Possible medical tests`,
      `   Depending on your age and coverage, we may request basic health tests`,
      `   (Usually for coverage above ₹1 Cr or age above 40)`,
      ``,
      `3. Income proof submission`,
      `   We'll need documents to verify your income`,
      ``,
      `4. Underwriting review`,
      `   Our team reviews everything — usually takes 2-3 business days`,
      ``,
      `5. Final approval`,
      `   Once approved, your policy is active!`,
      ``,
      `What could delay approval?`,
      `• Incomplete health information`,
      `• Income mismatch`,
      `• Missing documents`,
      ``,
      `What could lead to modification?`,
      `• Health conditions we discover`,
      `• Lifestyle factors`,
      `• We'll discuss any changes before finalizing`,
      ``,
      `When refund happens:`,
      `If you're not approved, we refund 100% of your premium — no questions asked.`,
      ``,
      `We'd rather insure you correctly than reject later.`,
      `Full disclosure helps us give you the right coverage at the right price.`,
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_claims_expectations',
};

// NEW: Set expectations about claims
const lifeClaimsExpectations: ConversationStep<LifeJourneyState> = {
  id: 'life_claims_expectations',
  module: 'review',
  widgetType: 'none',
  getScript: (persona, state) => ({
    botMessages: [
      `About claims:`,
      ``,
      `ACKO has a 99.29% claim settlement ratio.`,
      `But let me be transparent about when claims are rejected:`,
      ``,
      `Claims are rejected when:`,
      `• Income was misdeclared`,
      `• Health conditions were not disclosed`,
      `• Fraud is detected`,
      ``,
      `That's why we encourage full disclosure upfront.`,
      `We'd rather insure you correctly than reject later.`,
      ``,
      `This builds long-term trust — and protects your family.`,
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_gentle_urgency',
};

// NEW: Gentle urgency (not fear-based)
const lifeGentleUrgency: ConversationStep<LifeJourneyState> = {
  id: 'life_gentle_urgency',
  module: 'review',
  widgetType: 'selection_cards',
  getScript: (persona, state) => ({
    botMessages: [
      `One thing to know:`,
      ``,
      `Premium depends on:`,
      `• Your age`,
      `• Your health`,
      `• Your lifestyle`,
      ``,
      `So buying earlier locks in lower premium.`,
      `Every year you wait, premiums typically increase by 5-10%.`,
      ``,
      `This is fact-based, not pressure — just good to know.`,
      ``,
      `Ready to proceed with payment?`,
    ],
    options: [
      { id: 'yes', label: 'Yes, proceed', description: 'Continue to payment' },
      { id: 'later', label: 'I\'ll think about it', description: 'No pressure' },
    ],
  }),
  processResponse: (_response, _state) => ({ currentModule: 'review', journeyComplete: true }),
  getNextStep: (response, _state) => {
    if (response === 'later') {
      return 'life_later_message';
    }
    return 'life_complete';
  },
};

// NEW: Graceful exit message
const lifeLaterMessage: ConversationStep<LifeJourneyState> = {
  id: 'life_later_message',
  module: 'review',
  widgetType: 'none',
  getScript: (persona, state) => ({
    botMessages: [
      `That's perfectly fine!`,
      ``,
      `Take your time to think about it.`,
      `When you're ready, you can come back and continue where you left off.`,
      ``,
      `Remember: Every year you wait, premiums increase slightly.`,
      `But there's no rush — make the decision when you're comfortable.`,
      ``,
      `If you have any questions, feel free to reach out.`,
      `We're here to help, not pressure.`,
    ],
  }),
  processResponse: (_response, _state) => ({ journeyComplete: true }),
  getNextStep: (_response, _state) => 'life_complete',
};

const lifeComplete: ConversationStep<LifeJourneyState> = {
  id: 'life_complete',
  module: 'review',
  widgetType: 'none',
  getScript: (persona, state) => ({
    botMessages: [
      `Great choice, ${userName(state)}! 🎉`,
      ``,
      `You're one step away from protecting your family's future.`,
      ``,
      `Before you proceed to payment:`,
      `• Review your coverage amount`,
      `• Check your premium`,
      `• Make sure all information is correct`,
      ``,
      `If you need to change anything, just let us know.`,
      `We're here to help.`,
      ``,
      `Ready to proceed?`,
    ],
  }),
  processResponse: (_response, _state) => ({}),
  getNextStep: (_response, _state) => 'life_complete',
};

/* ═══════════════════════════════════════════════
   EXPORT — All Life conversation steps
   ═══════════════════════════════════════════════ */

export const LIFE_STEPS: ConversationStep<LifeJourneyState>[] = [
  // Ethical hook and eligibility check
  lifeIntro,
  lifeShouldBuyCheck,
  lifeNoNeedExplanation,
  lifeExploreOtherLobs,
  lifeNeedDiscussion,
  
  // Education
  lifeEducationWhatIs,
  lifeCommonMyths,
  lifeMythsDetailed,
  
  // Basic information collection
  lifeBasicName,
  lifeBasicGender,
  lifeBasicDob,
  lifeAgeIneligible,
  lifeBasicPhone,
  lifeBasicPincode,
  lifeBasicSmoking,
  lifeBasicIncome,
  lifeGrowthSeekerEducation, // Dynamic education step for Growth Seekers
  lifeBasicSummary,
  
  // Lifestyle information
  lifeLifestyleAlcohol,
  lifeLifestyleOccupation,
  lifeLifestyleMedical,
  lifeLifestyleSummary,
  
  // Quote and add-ons
  lifeQuoteDisplay,
  lifeAddonsIntro,
  lifeAddonsAccidentalDeath,
  lifeAddonsCriticalIllness,
  lifeAddonsDisability,
  
  // Review and transparency
  lifeReview,
  lifePostPaymentProcess,
  lifeClaimsExpectations,
  lifeGentleUrgency,
  lifeLaterMessage,
  lifeComplete,
];

export function getLifeStep(stepId: string): ConversationStep<LifeJourneyState> | undefined {
  return LIFE_STEPS.find((s) => s.id === stepId);
}
