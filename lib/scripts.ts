import { ConversationStep, PersonaType, JourneyState, StepScript, Option } from './types';
import { getConditionsList, getSiOptions, formatSI } from './plans';
import { getT } from './translations';

/* ═══════════════════════════════════════════════════════════════════
   ACKO Health Insurance — Persona-Driven Conversation Scripts
   ─────────────────────────────────────────────────────────────────
   PRINCIPLES:
   1. Every question explains WHY we're asking — build trust, not friction
   2. Every response is personalized using accumulated user context
   3. Emojis: subtle, on answers/options only, not in bot messages
   4. Bot sends SINGLE merged message (array joined with \n\n)
   5. Conversational acknowledgments between key steps
   ═══════════════════════════════════════════════════════════════════ */

type PersonaScripts = Record<PersonaType, StepScript>;

function userName(state: JourneyState): string {
  return state.userName || 'there';
}

function cityFromPincode(pincode: string): string {
  const map: Record<string, string> = {
    '560': 'Bangalore', '400': 'Mumbai', '110': 'Delhi', '500': 'Hyderabad',
    '600': 'Chennai', '411': 'Pune', '380': 'Ahmedabad', '700': 'Kolkata',
    '302': 'Jaipur', '226': 'Lucknow',
  };
  return map[pincode?.substring(0, 3)] || 'your city';
}

function familySummary(state: JourneyState): string {
  const count = state.members.length;
  if (count === 1) return 'you';
  const others = state.coverageFor.filter(c => c !== 'self').map(c => c.charAt(0).toUpperCase() + c.slice(1));
  if (others.length === 0) return 'you';
  return `you and your ${others.join(', ')}`;
}

/* ═══════════════════════════════════════════════
   MODULE: ENTRY — Welcome + Name
   ═══════════════════════════════════════════════ */

const entryWelcome: ConversationStep = {
  id: 'entry.welcome',
  module: 'entry',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const name = state.userName || 'Rahul';
    // If coming from "Check my gaps" on landing page
    if (state.intent === 'check_gaps') {
      return {
        botMessages: [t.scripts.welcomeGapCheck],
      };
    }
    // If coming from "Switch" on landing page
    if (state.intent === 'switch') {
      return {
        botMessages: [t.scripts.welcomeSwitch],
      };
    }
    if (state.isExistingAckoUser) {
      return {
        botMessages: [t.scripts.welcomeExisting(name)],
      };
    }
    return {
      botMessages: [t.scripts.welcomeNew],
    };
  },
  processResponse: () => ({}),
  getNextStep: (_, state) => state.isExistingAckoUser ? 'intent.readiness' : 'entry.ask_name',
};

const entryAskName: ConversationStep = {
  id: 'entry.ask_name',
  module: 'entry',
  widgetType: 'text_input',
  condition: (state) => !state.isExistingAckoUser,
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.askName],
      placeholder: t.scripts.namePlaceholder,
      inputType: 'text',
    };
  },
  processResponse: (response) => ({ userName: response }),
  getNextStep: () => 'entry.name_ack',
};

const entryNameAck: ConversationStep = {
  id: 'entry.name_ack',
  module: 'entry',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const name = userName(state);
    if (state.intent === 'check_gaps') {
      return {
        botMessages: [t.scripts.nameAckGap(name)],
      };
    }
    if (state.intent === 'switch') {
      return {
        botMessages: [t.scripts.nameAckSwitch(name)],
      };
    }
    return {
      botMessages: [t.scripts.nameAck(name)],
    };
  },
  processResponse: () => ({}),
  getNextStep: (_, state) => {
    // If coming from landing page with specific intent, skip the intent selection
    if (state.intent === 'check_gaps') return 'gap_analysis.intro';
    if (state.intent === 'switch') return 'gap_analysis.switch_intro';
    return 'intent.readiness';
  },
};

/* ═══════════════════════════════════════════════
   MODULE: INTENT — Where are you in your journey?
   ═══════════════════════════════════════════════ */

const intentReadiness: ConversationStep = {
  id: 'intent.readiness',
  module: 'intent',
  widgetType: 'selection_cards',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.intentQuestion(userName(state))],
      options: [
        { id: 'exploring', label: t.scripts.justExploring, description: t.scripts.justExploringSub, icon: 'search' },
        { id: 'comparing', label: t.scripts.seeHowDifferent, description: t.scripts.seeHowDifferentSub, icon: 'compare' },
        { id: 'ready_to_buy', label: t.scripts.readyToPurchase, description: t.scripts.readyToPurchaseSub, icon: 'check' },
        { id: 'switch', label: t.scripts.checkGapsSwitch, description: t.scripts.checkGapsSwitchSub, icon: 'switch' },
      ],
    };
  },
  processResponse: (response) => {
    const intentMap: Record<string, any> = {
      exploring: 'exploring',
      comparing: 'compare',
      ready_to_buy: 'which_plan',
      switch: 'switch',
    };
    return { intent: intentMap[response] || 'exploring', wantsGapAnalysis: response === 'switch' };
  },
  getNextStep: (response) => {
    if (response === 'switch') return 'gap_analysis.switch_intro';
    if (response === 'comparing' || response === 'exploring') return 'intent.acko_usps';
    return 'family.who_to_cover';
  },
};

/* ═══════════════════════════════════════════════
   MODULE: INTENT — ACKO USPs (for "comparing" flow)
   ═══════════════════════════════════════════════ */

const intentAckoUsps: ConversationStep = {
  id: 'intent.acko_usps',
  module: 'intent',
  widgetType: 'usp_cards',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const isExploring = state.intent === 'exploring';
    return {
      botMessages: [
        isExploring ? t.scripts.uspsExploring(userName(state)) : t.scripts.uspsComparing(userName(state)),
      ],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'family.who_to_cover',
};

/* ═══════════════════════════════════════════════
   MODULE: GAP ANALYSIS — Understand coverage gaps
   ═══════════════════════════════════════════════ */

const gapAnalysisIntro: ConversationStep = {
  id: 'gap_analysis.intro',
  module: 'gap_analysis',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.gapIntro(userName(state))],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'gap_analysis.method',
};

const gapAnalysisSwitchIntro: ConversationStep = {
  id: 'gap_analysis.switch_intro',
  module: 'gap_analysis',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.gapSwitchIntro(userName(state))],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'gap_analysis.method',
};

const gapAnalysisMethod: ConversationStep = {
  id: 'gap_analysis.method',
  module: 'gap_analysis',
  widgetType: 'selection_cards',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.gapMethodQ],
      options: [
        { id: 'upload', label: t.scripts.uploadPdf, description: t.scripts.uploadPdfSub, icon: 'document' },
        { id: 'questions', label: t.scripts.answerQuestions, description: t.scripts.answerQuestionsSub, icon: 'chat_bubble' },
      ],
    };
  },
  processResponse: () => ({}),
  getNextStep: (response) => response === 'upload' ? 'gap_analysis.upload_pdf' : 'gap_analysis.insurer_name',
};

/* ── PDF Upload path ── */

const gapAnalysisUploadPdf: ConversationStep = {
  id: 'gap_analysis.upload_pdf',
  module: 'gap_analysis',
  widgetType: 'pdf_upload',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.pdfUploadMsg],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'gap_analysis.pdf_results',
};

const gapAnalysisPdfResults: ConversationStep = {
  id: 'gap_analysis.pdf_results',
  module: 'gap_analysis',
  widgetType: 'gap_results',
  getScript: (persona, state) => {
    const insurer = state.pdfExtractedData?.insurer || 'your insurer';
    const plan = state.pdfExtractedData?.planName || 'your plan';
    return {
      botMessages: [
        `${userName(state)}, I've analysed your ${plan} from ${insurer}. Here's a side-by-side comparison showing exactly where your current plan falls short — and how ACKO fills those gaps.`,
      ],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'gap_analysis.pdf_next',
};

const gapAnalysisPdfNext: ConversationStep = {
  id: 'gap_analysis.pdf_next',
  module: 'gap_analysis',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const extracted = state.pdfExtractedData;
    const memberInfo = extracted?.members?.length
      ? `I can see your policy covers ${extracted.members.join(' and ')}.`
      : '';
    return {
      botMessages: [t.scripts.pdfNextPreFill(memberInfo)],
    };
  },
  processResponse: (_, state) => {
    // Pre-populate family data from PDF extraction
    const extracted = state.pdfExtractedData;
    if (!extracted) return {};
    return {
      coverageFor: ['self', 'spouse'],
      members: [
        { id: 'self', relation: 'self' as const, name: 'You', age: 32, conditions: [] },
        { id: 'spouse', relation: 'spouse' as const, name: 'Spouse', age: 30, conditions: [] },
      ],
      pincode: '560001',
      nearbyHospitals: 42,
    };
  },
  getNextStep: () => 'gap_analysis.confirm_details',
};

const gapAnalysisConfirmDetails: ConversationStep = {
  id: 'gap_analysis.confirm_details',
  module: 'gap_analysis',
  widgetType: 'confirm_details',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.pdfPreFill],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'health.conditions',
};

/* ── Questions path ── */

const gapAnalysisInsurerName: ConversationStep = {
  id: 'gap_analysis.insurer_name',
  module: 'gap_analysis',
  widgetType: 'selection_cards',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.currentInsurerQ],
    options: [
      { id: 'star_health', label: 'Star Health' },
      { id: 'hdfc_ergo', label: 'HDFC ERGO' },
      { id: 'care_health', label: 'Care Health' },
      { id: 'niva_bupa', label: 'Niva Bupa' },
      { id: 'bajaj_allianz', label: 'Bajaj Allianz' },
      { id: 'icici_lombard', label: 'ICICI Lombard' },
      { id: 'employer_gmc', label: 'Employer GMC only' },
      { id: 'other', label: 'Other insurer' },
    ],
    };
  },
  processResponse: (response) => ({ existingInsurer: response }),
  getNextStep: () => 'gap_analysis.current_si',
};

const gapAnalysisCurrentSI: ConversationStep = {
  id: 'gap_analysis.current_si',
  module: 'gap_analysis',
  widgetType: 'selection_cards',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.currentSIQ],
    options: [
      { id: '300000', label: '₹3 Lakhs' },
      { id: '500000', label: '₹5 Lakhs' },
      { id: '1000000', label: '₹10 Lakhs' },
      { id: '2500000', label: '₹25 Lakhs or more' },
      { id: '0', label: 'Not sure' },
    ],
    };
  },
  processResponse: (response) => ({
    totalExistingCover: parseInt(response) || null,
    gmcAmount: parseInt(response) || null,
  }),
  getNextStep: () => 'gap_analysis.plan_features',
};

const gapAnalysisPlanFeatures: ConversationStep = {
  id: 'gap_analysis.plan_features',
  module: 'gap_analysis',
  widgetType: 'multi_select',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.planFeaturesQ],
    options: [
      { id: 'no_room_limit', label: 'No room rent limit', icon: 'hospital' },
      { id: 'consumables', label: 'Consumables covered', icon: 'pill' },
      { id: 'inflation_protect', label: 'Inflation Protect (SI increase)', icon: 'refresh' },
      { id: 'no_copay', label: 'No co-payment', icon: 'shield' },
      { id: 'zero_waiting', label: 'Zero/low waiting period', icon: 'clock' },
      { id: 'not_sure', label: 'Not sure about any of these', icon: 'help' },
    ],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'gap_analysis.questions_results',
};

const gapAnalysisQuestionsResults: ConversationStep = {
  id: 'gap_analysis.questions_results',
  module: 'gap_analysis',
  widgetType: 'gap_results',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const cover = state.totalExistingCover;
    const coverLabel = cover ? `₹${(cover / 100000).toFixed(0)} lakhs` : 'your current cover';
    const insurer = state.existingInsurer?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Your insurer';
    return {
      botMessages: [t.scripts.gapResults(userName(state), coverLabel, insurer)],
    };
  },
  processResponse: () => ({}),
  // The gap_results widget has a built-in CTA "Find the right ACKO plan" — routes to family profiling
  getNextStep: (_, state) => {
    // If we have PDF data, skip some questions since we already know insurer, SI, etc.
    if (state.pdfExtractedData) return 'gap_analysis.pdf_next';
    return 'gap_analysis.proceed';
  },
};

/* ── Common gap analysis post-results ── */

const gapAnalysisProceed: ConversationStep = {
  id: 'gap_analysis.proceed',
  module: 'gap_analysis',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.gapProceed],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'family.who_to_cover',
};


/* ═══════════════════════════════════════════════
   MODULE: FAMILY PROFILING
   ═══════════════════════════════════════════════ */

const familyWhoToCover: ConversationStep = {
  id: 'family.who_to_cover',
  module: 'family',
  widgetType: 'multi_select',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.whoToCoverQ],
      options: [
        { id: 'self', label: t.widgets.myself, icon: 'user' },
        { id: 'spouse', label: t.widgets.spouse, icon: 'heart' },
        { id: 'children', label: t.widgets.children, icon: 'child' },
        { id: 'father', label: t.widgets.father, icon: 'father' },
        { id: 'mother', label: t.widgets.mother, icon: 'mother' },
      ],
    };
  },
  processResponse: (response) => ({
    coverageFor: response,
    buyingForParents: (response.includes('father') || response.includes('mother')) && !response.includes('self'),
  }),
  getNextStep: () => 'family.cover_ack',
};

const familyCoverAck: ConversationStep = {
  id: 'family.cover_ack',
  module: 'family',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const covering = state.coverageFor;
    const count = covering.length;
    const hasParents = covering.includes('father') || covering.includes('mother');
    const hasSpouse = covering.includes('spouse');
    const hasKids = covering.includes('children');
    const onlySelf = count === 1 && covering.includes('self');
    const name = userName(state);

    let message = '';
    if (onlySelf) {
      message = t.scripts.coverAckSelf(name);
    } else if (hasParents && hasSpouse) {
      message = t.scripts.coverAckParentsSpouse(name, count);
    } else if (hasParents && !hasSpouse) {
      message = t.scripts.coverAckParents(name);
    } else if (hasSpouse && hasKids) {
      message = t.scripts.coverAckSpouseKids(name);
    } else if (hasSpouse && !hasParents) {
      message = t.scripts.coverAckSpouse(name);
    } else {
      message = t.scripts.coverAckGeneric(name, count);
    }

    return { botMessages: [message] };
  },
  processResponse: () => ({}),
  getNextStep: () => 'family.your_age',
};

const familyYourAge: ConversationStep = {
  id: 'family.your_age',
  module: 'family',
  widgetType: 'number_input',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.ageQ],
      placeholder: t.scripts.agePlaceholder,
      inputType: 'number',
      min: 18,
      max: 99,
    };
  },
  processResponse: (response, state) => {
    const age = parseInt(response);
    const member = { id: 'self', relation: 'self' as const, name: 'You', age, conditions: [] };
    return {
      members: [...state.members.filter(m => m.relation !== 'self'), member],
      hasSenior: age >= 45,
    };
  },
  getNextStep: (_, state) => {
    const coveringOthers = state.coverageFor.some(c => c !== 'self');
    if (coveringOthers) return 'family.eldest_age';
    return 'family.age_ack';
  },
};

const familyEldestAge: ConversationStep = {
  id: 'family.eldest_age',
  module: 'family',
  widgetType: 'number_input',
  condition: (state) => state.coverageFor.some(c => c !== 'self'),
  getScript: (persona, state) => {
    const t = getT(state.language);
    const others = state.coverageFor.filter(c => c !== 'self');
    const who = others.length === 1 ? `your ${others[0]}` : 'the eldest family member you\'d like to cover';
    return {
      botMessages: [t.scripts.eldestAgeQ(who, others.length > 1)],
      placeholder: t.scripts.eldestAgePlaceholder,
      inputType: 'number',
      min: 1,
      max: 99,
    };
  },
  processResponse: (response, state) => {
    const age = parseInt(response);
    const others = state.coverageFor.filter(c => c !== 'self');
    const newMembers = others.map((relation, i) => ({
      id: relation,
      relation: relation as any,
      name: relation.charAt(0).toUpperCase() + relation.slice(1),
      age: i === 0 ? age : Math.max(1, age - 5 * (i)),
      conditions: [],
    }));
    return {
      members: [...state.members.filter(m => m.relation === 'self'), ...newMembers],
      hasSenior: state.hasSenior || age >= 45,
    };
  },
  getNextStep: () => 'family.age_ack',
};

const familyAgeAck: ConversationStep = {
  id: 'family.age_ack',
  module: 'family',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const selfAge = state.members.find(m => m.relation === 'self')?.age || 0;
    const memberCount = state.members.length;
    const eldestAge = Math.max(...state.members.map(m => m.age || 0));
    const name = userName(state);
    const hasParents = state.coverageFor.some(c => ['father', 'mother', 'father_in_law', 'mother_in_law'].includes(c));

    let ageInsight = '';
    if (eldestAge >= 55) {
      ageInsight = hasParents ? t.scripts.ageInsightSeniorParents(name) : t.scripts.ageInsightSeniorOther(name);
    } else if (eldestAge >= 45) {
      ageInsight = hasParents ? t.scripts.ageInsightMidParents(name) : t.scripts.ageInsightMidOther(name);
    } else if (selfAge <= 30 && memberCount === 1) {
      ageInsight = t.scripts.ageInsightYoung(selfAge);
    } else if (selfAge <= 35 && memberCount >= 2 && eldestAge < 40) {
      ageInsight = t.scripts.ageInsightYoungFamily(name);
    } else {
      ageInsight = t.scripts.ageInsightGeneric(name);
    }

    return {
      botMessages: [`${ageInsight}\n\n${t.scripts.ageAckHospitalIntro}`],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'family.pincode',
};

/* ── Pincode ── */
const familyPincode: ConversationStep = {
  id: 'family.pincode',
  module: 'family',
  widgetType: 'pincode_input',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.pincodeQ],
      placeholder: t.scripts.pincodePlaceholder,
      inputType: 'tel',
      min: 100000,
      max: 999999,
    };
  },
  processResponse: (response) => {
    const { getHospitalCount } = require('./plans');
    const count = getHospitalCount(response);
    return { pincode: response, nearbyHospitals: count };
  },
  getNextStep: () => 'family.pincode_result',
};

const familyPincodeResult: ConversationStep = {
  id: 'family.pincode_result',
  module: 'family',
  widgetType: 'hospital_list',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const count = state.nearbyHospitals || 0;
    return {
      botMessages: [t.scripts.hospitalResult(count)],
    };
  },
  processResponse: () => ({}),
  getNextStep: (_, state) => {
    // If user already provided insurance info via gap analysis or PDF, skip asking again
    if (state.pdfExtractedData || (state.intent === 'check_gaps' || state.intent === 'switch')) {
      if (state.totalExistingCover || state.coverageStatus) return 'health.conditions';
    }
    return 'coverage.current_insurance';
  },
};

/* ═══════════════════════════════════════════════
   MODULE: EXISTING COVERAGE
   ═══════════════════════════════════════════════ */

const coverageCurrentInsurance: ConversationStep = {
  id: 'coverage.current_insurance',
  module: 'coverage',
  widgetType: 'multi_select',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.currentInsuranceQ(userName(state))],
      options: [
        { id: 'gmc', label: t.scripts.employerGMC, icon: 'building' },
        { id: 'personal', label: t.scripts.personalPolicy, icon: 'document' },
        { id: 'none', label: t.scripts.noInsurance, icon: 'plus' },
      ],
    };
  },
  processResponse: (response) => {
    const hasGmc = response.includes('gmc');
    const hasPersonal = response.includes('personal');
    let status: any = 'none';
    if (hasGmc && hasPersonal) status = 'both';
    else if (hasGmc) status = 'gmc';
    else if (hasPersonal) status = 'individual_policy';
    return { coverageStatus: status };
  },
  getNextStep: (response) => {
    if (response.includes('none') && response.length === 1) return 'coverage.no_insurance_ack';
    return 'coverage.total_cover';
  },
};

const coverageTotalCover: ConversationStep = {
  id: 'coverage.total_cover',
  module: 'coverage',
  widgetType: 'selection_cards',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const hasGmc = state.coverageStatus === 'gmc' || state.coverageStatus === 'both';
    const hasPersonal = state.coverageStatus === 'individual_policy' || state.coverageStatus === 'both';
    let context = hasGmc && hasPersonal ? t.scripts.totalCoverContextGmcBoth : hasGmc ? t.scripts.totalCoverContextGmc : t.scripts.totalCoverContextPolicy;
    return {
      botMessages: [context + t.scripts.totalCoverSuffix],
      options: [
        { id: '300000', label: '₹3 lakhs' },
        { id: '500000', label: '₹5 lakhs' },
        { id: '1000000', label: '₹10 lakhs' },
        { id: '2500000', label: '₹25 lakhs or more' },
        { id: '0', label: 'Not sure' },
      ],
    };
  },
  processResponse: (response) => ({
    totalExistingCover: parseInt(response) || null,
    gmcAmount: parseInt(response) || null,
  }),
  getNextStep: (_, state) => {
    const hasGmc = state.coverageStatus === 'gmc' || state.coverageStatus === 'both';
    if (hasGmc || state.wantsGapAnalysis) return 'coverage.gap_check';
    if (state.coverageStatus === 'individual_policy') return 'coverage.switch_ack';
    return 'health.conditions';
  },
};

const coverageGapCheck: ConversationStep = {
  id: 'coverage.gap_check',
  module: 'coverage',
  widgetType: 'selection_cards',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.gapCheckQ],
      options: [
        { id: 'yes', label: t.scripts.gapCheckYes, icon: 'search', description: t.scripts.gapCheckYesSub },
        { id: 'skip', label: t.scripts.gapCheckSkip, icon: 'forward' },
      ],
    };
  },
  processResponse: (response) => ({ wantsGapAnalysis: response === 'yes' }),
  getNextStep: (response) => response === 'yes' ? 'coverage.gap_scenario' : 'health.conditions',
};

const coverageGapScenario: ConversationStep = {
  id: 'coverage.gap_scenario',
  module: 'coverage',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const cover = state.totalExistingCover;
    const coverLabel = cover ? `₹${(cover / 100000).toFixed(0)} lakhs` : 'your current cover';
    const city = cityFromPincode(state.pincode);
    return {
      botMessages: [t.scripts.gapScenario(city, coverLabel)],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'coverage.gap_insight',
};

const coverageGapInsight: ConversationStep = {
  id: 'coverage.gap_insight',
  module: 'coverage',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const hasGmc = state.coverageStatus === 'gmc' || state.coverageStatus === 'both';
    return {
      botMessages: [hasGmc ? t.scripts.gapInsightGmc : t.scripts.gapInsightOther],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'health.conditions',
};

const coverageNoInsuranceAck: ConversationStep = {
  id: 'coverage.no_insurance_ack',
  module: 'coverage',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.noInsuranceAck(userName(state))],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'health.conditions',
};

const coverageSwitchAck: ConversationStep = {
  id: 'coverage.switch_ack',
  module: 'coverage',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.switchAck],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'health.conditions',
};

/* ═══════════════════════════════════════════════
   MODULE: HEALTH
   ═══════════════════════════════════════════════ */

const healthConditions: ConversationStep = {
  id: 'health.conditions',
  module: 'health',
  widgetType: 'multi_select',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const conditionsList = getConditionsList(state.language);
    return {
      botMessages: [t.scripts.conditionsQ],
      options: conditionsList.map(c => ({
        id: c.id,
        label: c.label,
        icon: c.id === 'none' ? 'check_circle' : undefined,
      })),
    };
  },
  processResponse: (response) => {
    const hasConditions = !response.includes('none') && response.length > 0;
    const hasHeartCondition = response.includes('heart_disease') || response.includes('stroke');
    const hasSevereCondition = response.includes('cancer') || response.includes('organ_transplant') || hasHeartCondition;
    return { hasConditions, hasHeartCondition, hasSevereCondition, memberConditions: { general: response } };
  },
  getNextStep: (response) => {
    if (response.includes('none') || response.length === 0) return 'health.healthy_ack';
    return 'health.conditions_ack';
  },
};

const healthHealthyAck: ConversationStep = {
  id: 'health.healthy_ack',
  module: 'health',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.healthyAck(userName(state), familySummary(state))],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'customization.si_selection',
};

const healthConditionsAck: ConversationStep = {
  id: 'health.conditions_ack',
  module: 'health',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.conditionsAck(userName(state))],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'customization.si_selection',
};

/* ═══════════════════════════════════════════════
   MODULE: SUM INSURED
   ═══════════════════════════════════════════════ */

const customizationSI: ConversationStep = {
  id: 'customization.si_selection',
  module: 'customization',
  widgetType: 'selection_cards',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const siOptions = getSiOptions(state.language);
    const eldestAge = Math.max(...state.members.map(m => m.age || 0), 0);
    const memberCount = state.members.length;
    const city = cityFromPincode(state.pincode);
    let recommendedSI = 2500000;
    let reason = '';

    if (eldestAge >= 50 || state.hasConditions || memberCount >= 3) {
      recommendedSI = 10000000;
      reason = state.hasConditions
        ? `With pre-existing conditions, higher coverage ensures you're protected even during long treatments.`
        : `With ${memberCount} members and age factors, higher coverage gives your family real protection.`;
    } else if (eldestAge >= 35 || memberCount >= 2) {
      recommendedSI = 5000000;
      reason = `For a family of ${memberCount} in the ${eldestAge < 45 ? '30s-40s' : '40s-50s'} range, this balances coverage and affordability well.`;
    } else {
      recommendedSI = 2500000;
      reason = 'For a young, healthy individual this provides solid coverage without overpaying.';
    }

    const existingCover = state.totalExistingCover;
    const gapNote = existingCover && existingCover > 0
      ? `\n\nYou already have ₹${(existingCover / 100000).toFixed(0)}L cover. A top-up or fresh plan at this level protects you for bills your current policy can't handle.`
      : '';

    const recLabel = siOptions.find(s => s.value === recommendedSI)?.label || t.plans.si25L;
    return {
      botMessages: [
        `Based on ${familySummary(state)}'s profile${state.pincode ? ` and location in ${city}` : ''}, I'd recommend ₹${recLabel} coverage.\n\n${reason} In ${city}, a major surgery like bypass costs ₹8-12 lakhs, and cancer treatment can go up to ₹25 lakhs.${gapNote}\n\nBut you can choose what feels right.`
      ],
      options: siOptions.map(si => ({
        id: String(si.value),
        label: '₹' + si.label,
        description: si.description,
        icon: si.value === recommendedSI ? 'star' : undefined,
        badge: si.value === recommendedSI ? t.common.recommended : undefined,
      })),
    };
  },
  processResponse: (response) => ({ sumInsured: parseInt(response) }),
  getNextStep: () => 'recommendation.calculating',
};

/* ═══════════════════════════════════════════════
   MODULE: RECOMMENDATION
   ═══════════════════════════════════════════════ */

const recommendationCalculating: ConversationStep = {
  id: 'recommendation.calculating',
  module: 'recommendation',
  widgetType: 'calculation',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.calculating],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'recommendation.result',
};

const recommendationResult: ConversationStep = {
  id: 'recommendation.result',
  module: 'recommendation',
  widgetType: 'plan_switcher',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const name = userName(state);
    const hasGmc = state.coverageStatus === 'gmc' || state.coverageStatus === 'both';
    const siLabel = formatSI(state.sumInsured);
    const family = familySummary(state);
    const msg = hasGmc ? t.scripts.recommendationGmc(name, family, siLabel) : t.scripts.recommendationStandard(name, family, siLabel);
    return {
      botMessages: [msg],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'review.dob_collection',
};

/* ═══════════════════════════════════════════════
   MODULE: FREQUENCY
   ═══════════════════════════════════════════════ */

const customizationFrequency: ConversationStep = {
  id: 'customization.frequency',
  module: 'customization',
  widgetType: 'frequency_select',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.frequencyQ],
      options: [
        { id: 'monthly', label: t.common.monthly },
        { id: 'yearly', label: t.common.yearly, badge: t.scripts.saveEight },
      ],
    };
  },
  processResponse: (response) => ({ paymentFrequency: response }),
  getNextStep: () => 'review.summary',
};

/* ═══════════════════════════════════════════════
   MODULE: REVIEW
   ═══════════════════════════════════════════════ */

const reviewSummary: ConversationStep = {
  id: 'review.summary',
  module: 'review',
  widgetType: 'review_summary',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.reviewMsg(userName(state))],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'review.consent',
};

const reviewConsent: ConversationStep = {
  id: 'review.consent',
  module: 'review',
  widgetType: 'consent',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.consentMsg],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'payment.process',
};

const reviewDobCollection: ConversationStep = {
  id: 'review.dob_collection',
  module: 'review',
  widgetType: 'dob_collection',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const memberCount = state.members.length;
    return {
      botMessages: [t.scripts.dobMsg(userName(state), memberCount)],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'review.dob_ack',
};

const reviewDobAck: ConversationStep = {
  id: 'review.dob_ack',
  module: 'review',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.dobAck],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'customization.frequency',
};

/* ═══════════════════════════════════════════════
   MODULE: PAYMENT
   ═══════════════════════════════════════════════ */

const paymentProcess: ConversationStep = {
  id: 'payment.process',
  module: 'payment',
  widgetType: 'payment_widget',
  getScript: (_, state) => {
    const t = getT(state.language);
    const freq = state.paymentFrequency === 'monthly' ? t.common.monthly.toLowerCase() : 'annual';
    return {
      botMessages: [t.scripts.paymentReady(freq)],
    };
  },
  processResponse: () => ({ paymentComplete: true }),
  getNextStep: () => 'payment.success',
};

const paymentSuccess: ConversationStep = {
  id: 'payment.success',
  module: 'payment',
  widgetType: 'celebration',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.paymentSuccess(userName(state))],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'payment.success', // Stop here — PostPaymentJourney takes over via page.tsx useEffect
};

/* ═══════════════════════════════════════════════
   MODULE: HEALTH EVAL
   ═══════════════════════════════════════════════ */

const healthEvalIntro: ConversationStep = {
  id: 'health_eval.intro',
  module: 'health_eval',
  widgetType: 'none',
  getScript: (persona, state) => {
    const t = getT(state.language);
    const { getHealthEvalType } = require('./plans');
    const evalType = getHealthEvalType(
      state.members,
      Object.values(state.memberConditions).flat(),
      state.selectedPlan?.tier || 'platinum_lite'
    );

    if (evalType.type === 'lab_visit') {
      return { botMessages: [t.scripts.healthEvalLab] };
    }
    if (evalType.type === 'doctor_call') {
      return { botMessages: [t.scripts.healthEvalDoctorCall] };
    }
    return { botMessages: [t.scripts.healthEvalQuestionsOnly] };
  },
  processResponse: () => ({}),
  getNextStep: (_, state) => {
    return (state.hasHeartCondition || state.hasSevereCondition) ? 'health_eval.lab_schedule' : 'health_eval.schedule';
  },
};

const healthEvalLabSchedule: ConversationStep = {
  id: 'health_eval.lab_schedule',
  module: 'health_eval',
  widgetType: 'lab_schedule_widget',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.healthEvalLabSchedule],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'completion.celebration',
};

const healthEvalSchedule: ConversationStep = {
  id: 'health_eval.schedule',
  module: 'health_eval',
  widgetType: 'selection_cards',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.homeVisitQ],
      options: [
        { id: 'morning', label: t.scripts.morning, icon: 'sunrise' },
        { id: 'afternoon', label: t.scripts.afternoon, icon: 'sun' },
        { id: 'evening', label: t.scripts.evening, icon: 'sunset' },
      ],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'completion.celebration',
};

/* ═══════════════════════════════════════════════
   MODULE: COMPLETION
   ═══════════════════════════════════════════════ */

const completionCelebration: ConversationStep = {
  id: 'completion.celebration',
  module: 'completion',
  widgetType: 'celebration',
  getScript: (persona, state) => {
    const t = getT(state.language);
    return {
      botMessages: [t.scripts.completionMsg(userName(state))],
    };
  },
  processResponse: () => ({ journeyComplete: true }),
  getNextStep: () => 'completion.celebration',
};

/* ═══════════════════════════════════════════════
   STEP REGISTRY
   ═══════════════════════════════════════════════ */

export const STEPS: Record<string, ConversationStep> = {
  'entry.welcome': entryWelcome,
  'entry.ask_name': entryAskName,
  'entry.name_ack': entryNameAck,
  'intent.readiness': intentReadiness,
  'intent.acko_usps': intentAckoUsps,

  /* Gap Analysis */
  'gap_analysis.intro': gapAnalysisIntro,
  'gap_analysis.switch_intro': gapAnalysisSwitchIntro,
  'gap_analysis.method': gapAnalysisMethod,
  'gap_analysis.upload_pdf': gapAnalysisUploadPdf,
  'gap_analysis.pdf_results': gapAnalysisPdfResults,
  'gap_analysis.pdf_next': gapAnalysisPdfNext,
  'gap_analysis.confirm_details': gapAnalysisConfirmDetails,
  'gap_analysis.insurer_name': gapAnalysisInsurerName,
  'gap_analysis.current_si': gapAnalysisCurrentSI,
  'gap_analysis.plan_features': gapAnalysisPlanFeatures,
  'gap_analysis.questions_results': gapAnalysisQuestionsResults,
  'gap_analysis.proceed': gapAnalysisProceed,

  /* Family */
  'family.who_to_cover': familyWhoToCover,
  'family.cover_ack': familyCoverAck,
  'family.your_age': familyYourAge,
  'family.eldest_age': familyEldestAge,
  'family.age_ack': familyAgeAck,
  'family.pincode': familyPincode,
  'family.pincode_result': familyPincodeResult,

  /* Coverage */
  'coverage.current_insurance': coverageCurrentInsurance,
  'coverage.total_cover': coverageTotalCover,
  'coverage.gap_check': coverageGapCheck,
  'coverage.gap_scenario': coverageGapScenario,
  'coverage.gap_insight': coverageGapInsight,
  'coverage.no_insurance_ack': coverageNoInsuranceAck,
  'coverage.switch_ack': coverageSwitchAck,

  /* Health */
  'health.conditions': healthConditions,
  'health.healthy_ack': healthHealthyAck,
  'health.conditions_ack': healthConditionsAck,

  /* Sum Insured */
  'customization.si_selection': customizationSI,

  /* Recommendation */
  'recommendation.calculating': recommendationCalculating,
  'recommendation.result': recommendationResult,

  /* Frequency */
  'customization.frequency': customizationFrequency,

  /* Review */
  'review.summary': reviewSummary,
  'review.consent': reviewConsent,
  'review.dob_collection': reviewDobCollection,
  'review.dob_ack': reviewDobAck,

  /* Payment */
  'payment.process': paymentProcess,
  'payment.success': paymentSuccess,

  /* Health Eval */
  'health_eval.intro': healthEvalIntro,
  'health_eval.lab_schedule': healthEvalLabSchedule,
  'health_eval.schedule': healthEvalSchedule,

  /* Completion */
  'completion.celebration': completionCelebration,
};

export function getStep(stepId: string): ConversationStep | undefined {
  return STEPS[stepId];
}
