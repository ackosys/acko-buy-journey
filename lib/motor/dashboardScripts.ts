/* ═══════════════════════════════════════════════════════
   Motor Dashboard Conversational Scripts
   Defines conversation steps for the motor dashboard:
   - Policy home / overview with key details
   - Raise a claim (own damage & third party)
   - Track requests (claims & policy edits)
   - Get answers (coverage Q&A)
   - Download documents
   - Edit policy (add/remove add-ons, update nominee)
   ═══════════════════════════════════════════════════════ */

import { MotorConversationStep, MotorJourneyState } from './types';

const NETWORK_GARAGES = [
  { id: 'gomechanic', name: 'GoMechanic - Sector 29, Gurgaon', distance: '2.3 km' },
  { id: 'carnation', name: 'Carnation Auto - Cyber City', distance: '4.1 km' },
  { id: 'pitstop', name: 'Pit Stop - MG Road', distance: '5.8 km' },
  { id: 'autobahn', name: 'Autobahn Motors - DLF Phase 3', distance: '3.7 km' },
  { id: 'wheelz', name: 'Wheelz Service Center - Udyog Vihar', distance: '6.2 km' },
];

const MOTOR_DOCUMENTS = [
  { id: 'policy', name: 'Policy Certificate (1.8 MB)' },
  { id: 'insurance_card', name: 'Vehicle Insurance Card (124 KB)' },
  { id: 'ncb_cert', name: 'NCB Certificate (256 KB)' },
  { id: 'tax_invoice', name: 'Tax Invoice (412 KB)' },
  { id: 'addon_cert', name: 'Add-on Certificates (890 KB)' },
];

/* ── Helper: build policy summary string ── */
function buildMotorPolicySummary(state: MotorJourneyState): string {
  const vehicle = `${state.vehicleData.make} ${state.vehicleData.model}`;
  const plan = state.selectedPlan?.name || 'Motor Insurance';
  const premium = state.totalPremium ? `₹${state.totalPremium.toLocaleString()}/yr` : '₹12,999/yr';
  const addons = state.selectedAddOns?.length || 0;
  const idv = state.idv ? `₹${state.idv.toLocaleString()}` : '₹7,50,000';
  const regNo = state.registrationNumber || 'DL01XX1234';

  return `Vehicle: ${vehicle} (${regNo})\nPlan: ${plan}\nIDV: ${idv}\nPremium: ${premium}\nAdd-ons: ${addons} selected\nStatus: Active\nPolicy start: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

/* ── Helper: active requests count ── */
function hasActiveRequests(state: MotorJourneyState): boolean {
  return state.dashboardSubmittedClaims.length > 0 || state.dashboardSubmittedEdits.length > 0;
}

/* ── All dashboard conversation steps ── */
const motorDashboardSteps: MotorConversationStep[] = [

  /* ═════ Welcome — Policy overview + actions ═════ */
  {
    id: 'db.welcome',
    module: 'dashboard',
    widgetType: 'none',
    getScript: (state) => {
      return {
        botMessages: [
          `Welcome back${state.userName ? ', ' + state.userName : ''}! 🚗`,
          buildMotorPolicySummary(state),
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: () => 'db.actions',
  },

  {
    id: 'db.actions',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const options = [
        { id: 'raise_claim', label: 'Raise a Claim', icon: 'document', description: 'File accident or damage claim' },
        { id: 'get_answers', label: 'Get Answers', icon: 'help', description: 'Coverage FAQs' },
        { id: 'download_doc', label: 'Download Documents', icon: 'upload', description: 'Policy, RC card, certificates' },
        { id: 'edit_policy', label: 'Edit Policy', icon: 'refresh', description: 'Modify add-ons, nominee' },
      ];
      if (hasActiveRequests(state)) {
        const claimCount = state.dashboardSubmittedClaims.length;
        const editCount = state.dashboardSubmittedEdits.length;
        const totalCount = claimCount + editCount;
        const claimStr = claimCount ? `${claimCount} claim${claimCount > 1 ? 's' : ''}` : '';
        const editStr = editCount ? `${editCount} edit${editCount > 1 ? 's' : ''}` : '';
        const desc = [claimStr, editStr].filter(Boolean).join(', ');
        options.unshift({
          id: 'track_requests',
          label: `Track Requests (${totalCount})`,
          icon: 'clock',
          description: desc,
        });
      }
      return {
        botMessages: ['What would you like to do?'],
        options,
      };
    },
    processResponse: () => ({}),
    getNextStep: (response) => {
      switch (response) {
        case 'raise_claim': return 'db.claim_intro';
        case 'get_answers': return 'db.answers_intro';
        case 'download_doc': return 'db.docs_list';
        case 'edit_policy': return 'db.edit_options';
        case 'track_requests': return 'db.track_overview';
        default: return 'db.actions';
      }
    },
  },

  /* ═════ TRACK REQUESTS ═════ */
  {
    id: 'db.track_overview',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const items: { id: string; label: string; description: string; icon?: string }[] = [];

      state.dashboardSubmittedClaims.forEach((c, i) => {
        const age = Math.round((Date.now() - c.submittedAt) / 60000);
        const timeLabel = age < 60 ? `${age}m ago` : `${Math.round(age / 60)}h ago`;
        items.push({
          id: `claim_${i}`,
          label: `Claim ${c.id}`,
          description: `${c.type === 'own_damage' ? 'Own Damage' : 'Third Party'} · ${c.description} · ${c.status} · ${timeLabel}`,
          icon: 'document',
        });
      });

      state.dashboardSubmittedEdits.forEach((e, i) => {
        const age = Math.round((Date.now() - e.submittedAt) / 60000);
        const timeLabel = age < 60 ? `${age}m ago` : `${Math.round(age / 60)}h ago`;
        items.push({
          id: `edit_${i}`,
          label: `Edit: ${e.type}`,
          description: `${e.summary} · ${e.status} · ${timeLabel}`,
          icon: 'refresh',
        });
      });

      items.push({ id: 'back', label: 'Back to Dashboard', description: '', icon: 'switch' });

      return {
        botMessages: [
          items.length > 1 ? `Here are your active requests:` : 'No active requests at the moment.',
        ],
        options: items,
      };
    },
    processResponse: () => ({}),
    getNextStep: (response) => {
      if (response === 'back') return 'db.actions';
      if (response.startsWith('claim_')) return 'db.track_claim_detail';
      if (response.startsWith('edit_')) return 'db.track_edit_detail';
      return 'db.actions';
    },
  },

  {
    id: 'db.track_claim_detail',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const claim = state.dashboardSubmittedClaims[0];
      if (!claim) return { botMessages: ['No claim found.'], options: [{ id: 'back', label: 'Back' }] };
      const garage = NETWORK_GARAGES.find(g => g.id === claim.garage)?.name || claim.garage;

      return {
        botMessages: [
          `Claim ${claim.id} — ${claim.type === 'own_damage' ? 'Own Damage' : 'Third Party'}\n\nGarage: ${garage}\nDate: ${claim.date}\nDescription: ${claim.description}\nEstimated Amount: ₹${claim.amount}`,
          `Status timeline:\n\n1. Claim submitted — Done\n2. ${claim.type === 'own_damage' ? 'Inspection scheduled' : 'Third party verification'} — In progress\n3. ${claim.type === 'own_damage' ? 'Approval & repair' : 'Liability assessment'} — Pending\n4. ${claim.type === 'own_damage' ? 'Vehicle repaired' : 'Settlement processed'} — Pending\n\nCurrent status: ${claim.status}\nExpected resolution: 3-5 working days`,
        ],
        options: [
          { id: 'track', label: 'Back to All Requests', icon: 'clock' },
          { id: 'back', label: 'Back to Dashboard', icon: 'switch' },
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: (response) => response === 'track' ? 'db.track_overview' : 'db.actions',
  },

  {
    id: 'db.track_edit_detail',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const edit = state.dashboardSubmittedEdits[0];
      if (!edit) return { botMessages: ['No edit request found.'], options: [{ id: 'back', label: 'Back' }] };

      return {
        botMessages: [
          `Edit request: ${edit.type}\n\n${edit.summary}`,
          `Status timeline:\n\n1. Request submitted — Done\n2. Review — In progress\n3. Policy update — Pending\n\nCurrent status: ${edit.status}\nExpected completion: 2-3 working days`,
        ],
        options: [
          { id: 'track', label: 'Back to All Requests', icon: 'clock' },
          { id: 'back', label: 'Back to Dashboard', icon: 'switch' },
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: (response) => response === 'track' ? 'db.track_overview' : 'db.actions',
  },

  /* ═════ RAISE A CLAIM ═════ */
  {
    id: 'db.claim_intro',
    module: 'claims',
    widgetType: 'none',
    getScript: () => {
      return {
        botMessages: [
          `I'll help you file a claim for your vehicle.`,
          `We offer two types of claims:\n\n• Own Damage: For damage to your vehicle (accidents, theft, natural calamities)\n• Third Party: For damage caused to others' property or injury`,
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_type',
  },

  {
    id: 'db.claim_type',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: () => {
      return {
        botMessages: ['What type of claim would you like to file?'],
        options: [
          { id: 'own_damage', label: 'Own Damage', icon: 'car', description: 'Damage to your vehicle' },
          { id: 'third_party', label: 'Third Party', icon: 'shield', description: 'Damage caused to others' },
        ],
      };
    },
    processResponse: (response) => ({ dashboardClaimType: response as 'own_damage' | 'third_party' }),
    getNextStep: () => 'db.claim_garage',
  },

  {
    id: 'db.claim_garage',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      return {
        botMessages: [
          state.dashboardClaimType === 'own_damage' 
            ? 'Select a garage from our 5,400+ network garages near you:' 
            : 'Select the garage where the incident occurred:',
        ],
        options: NETWORK_GARAGES.map(g => ({ id: g.id, label: g.name, description: g.distance })),
      };
    },
    processResponse: (response) => ({ dashboardClaimGarage: response }),
    getNextStep: () => 'db.claim_date',
  },

  {
    id: 'db.claim_date',
    module: 'claims',
    widgetType: 'text_input',
    getScript: () => {
      return {
        botMessages: ['When did the incident occur?'],
        placeholder: 'e.g., 15 Feb 2026',
        inputType: 'text' as const,
      };
    },
    processResponse: (response) => ({ dashboardClaimDate: response }),
    getNextStep: () => 'db.claim_description',
  },

  {
    id: 'db.claim_description',
    module: 'claims',
    widgetType: 'text_input',
    getScript: () => {
      return {
        botMessages: ['Please describe what happened:'],
        placeholder: 'e.g., Rear-end collision at traffic signal',
        inputType: 'text' as const,
      };
    },
    processResponse: (response) => ({ dashboardClaimDescription: response }),
    getNextStep: () => 'db.claim_amount',
  },

  {
    id: 'db.claim_amount',
    module: 'claims',
    widgetType: 'number_input',
    getScript: () => {
      return {
        botMessages: ['What is the estimated repair/damage cost?'],
        placeholder: 'Enter amount in ₹',
        inputType: 'number' as const,
      };
    },
    processResponse: (response) => ({ dashboardClaimAmount: String(response) }),
    getNextStep: () => 'db.claim_review',
  },

  {
    id: 'db.claim_review',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const garage = NETWORK_GARAGES.find(g => g.id === state.dashboardClaimGarage)?.name || state.dashboardClaimGarage;
      const typeLabel = state.dashboardClaimType === 'own_damage' ? 'Own Damage' : 'Third Party';
      return {
        botMessages: [
          `Claim Summary:\n\nType: ${typeLabel}\nGarage: ${garage}\nDate: ${state.dashboardClaimDate}\nDescription: ${state.dashboardClaimDescription}\nEstimated Amount: ₹${state.dashboardClaimAmount}`,
          'Please confirm to submit your claim.',
        ],
        options: [
          { id: 'confirm', label: 'Submit Claim' },
          { id: 'cancel', label: 'Cancel' },
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: (response) => response === 'confirm' ? 'db.claim_submitted' : 'db.actions',
  },

  {
    id: 'db.claim_submitted',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const claimId = `MCL-${Math.floor(100000 + Math.random() * 900000)}`;
      const statusText = state.dashboardClaimType === 'own_damage' ? 'Inspection scheduled' : 'Under review';
      return {
        botMessages: [
          `✅ Claim submitted successfully!\n\nClaim ID: ${claimId}\nStatus: ${statusText}\n\nExpected resolution: 3-5 working days`,
          `We'll send you updates via SMS and email.`,
        ],
        options: [
          { id: 'track', label: 'Track This Request', icon: 'clock' },
          { id: 'back', label: 'Back to Dashboard', icon: 'switch' },
        ],
      };
    },
    processResponse: (response, state) => {
      const claimId = `MCL-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        dashboardSubmittedClaims: [
          ...state.dashboardSubmittedClaims,
          {
            id: claimId,
            type: state.dashboardClaimType || 'own_damage',
            garage: state.dashboardClaimGarage,
            date: state.dashboardClaimDate,
            description: state.dashboardClaimDescription,
            amount: state.dashboardClaimAmount,
            status: state.dashboardClaimType === 'own_damage' ? 'Inspection scheduled' : 'Under review',
            submittedAt: Date.now(),
          },
        ],
        dashboardClaimType: '' as const,
        dashboardClaimGarage: '',
        dashboardClaimDate: '',
        dashboardClaimDescription: '',
        dashboardClaimAmount: '',
      };
    },
    getNextStep: (response) => response === 'track' ? 'db.track_overview' : 'db.actions',
  },

  /* ═════ GET ANSWERS ═════ */
  {
    id: 'db.answers_intro',
    module: 'dashboard',
    widgetType: 'none',
    getScript: (state) => {
      const plan = state.selectedPlan;
      const planName = plan?.name || 'Motor Insurance';
      const highlights = [
        `IDV: ${state.idv ? '₹' + state.idv.toLocaleString() : '₹7,50,000'}`,
        'Cashless claims at 5,400+ network garages',
        plan?.type === 'zero_dep' ? 'Zero depreciation on parts' : '',
        'Free towing & roadside assistance',
        'Quick claim settlement',
        plan?.type === 'comprehensive' ? 'Own damage + Third party coverage' : '',
      ].filter(Boolean);
      return {
        botMessages: [
          `Quick snapshot of your ${planName}:\n\n${highlights.join('\n')}`,
          `Not covered:\n• Normal wear and tear\n• Consequential damage\n• Mechanical/electrical breakdown\n• Driving without valid license`,
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: () => 'db.answers_topics',
  },

  {
    id: 'db.answers_topics',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => {
      const allTopics = [
        { id: 'q_zero_dep', label: 'How does Zero Depreciation work?' },
        { id: 'q_claim', label: 'How to file a claim?' },
        { id: 'q_garages', label: 'Where are network garages?' },
        { id: 'q_ncb', label: 'What is NCB and how does it work?' },
        { id: 'q_addons', label: 'What add-ons should I buy?' },
        { id: 'q_third_party', label: 'What is third party coverage?' },
        { id: 'q_idv', label: 'How is IDV calculated?' },
        { id: 'q_roadside', label: 'Roadside assistance included?' },
      ];
      const shuffled = [...allTopics].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, 4);
      return {
        botMessages: ['Pick a question or ask me anything:'],
        options: [
          ...picked,
          { id: 'ask_custom', label: 'Ask anything else', icon: 'chat_bubble' },
          { id: 'back', label: 'Back to Dashboard', icon: 'switch' },
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: (response) => {
      const faqMap: Record<string, string> = {
        q_zero_dep: 'db.answers_zero_dep',
        q_claim: 'db.answers_claim',
        q_garages: 'db.answers_garages',
        q_ncb: 'db.answers_ncb',
        q_addons: 'db.answers_addons',
        q_third_party: 'db.answers_third_party',
        q_idv: 'db.answers_idv',
        q_roadside: 'db.answers_roadside',
        ask_custom: 'db.answers_custom',
        back: 'db.actions',
      };
      return faqMap[response] || 'db.answers_topics';
    },
  },

  /* ── FAQ answer steps ── */
  {
    id: 'db.answers_zero_dep',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [`Zero Depreciation cover pays the full cost of replaced parts without deducting depreciation. For example, if your bumper costs ₹10,000, you get ₹10,000 — not ₹6,000 after depreciation. This saves you significant out-of-pocket costs during claims.`],
      options: [{ id: 'more', label: 'Ask Another Question' }, { id: 'custom', label: 'Ask Something Else', icon: 'chat_bubble' }, { id: 'back', label: 'Back to Dashboard', icon: 'switch' }],
    }),
    processResponse: () => ({}),
    getNextStep: (r) => r === 'more' ? 'db.answers_topics' : r === 'custom' ? 'db.answers_custom' : 'db.actions',
  },

  {
    id: 'db.answers_claim',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [`Filing a claim is easy:\n\n1. Inform us immediately after the incident\n2. Take photos of the damage\n3. Visit any of our 5,400+ network garages\n4. Our team inspects and approves\n5. Garage repairs your vehicle\n6. We settle directly with the garage\n\nYou can raise a claim directly from this dashboard!`],
      options: [{ id: 'raise', label: 'Raise Claim Now' }, { id: 'more', label: 'Ask Another Question' }, { id: 'back', label: 'Back to Dashboard', icon: 'switch' }],
    }),
    processResponse: () => ({}),
    getNextStep: (r) => r === 'raise' ? 'db.claim_intro' : r === 'more' ? 'db.answers_topics' : 'db.actions',
  },

  {
    id: 'db.answers_garages',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [`ACKO has 5,400+ network garages across India including authorized service centers and multi-brand garages.\n\nNearby garages:\n• GoMechanic - Sector 29, Gurgaon — 2.3 km\n• Carnation Auto - Cyber City — 4.1 km\n• Autobahn Motors - DLF Phase 3 — 3.7 km\n• Pit Stop - MG Road — 5.8 km`],
      options: [{ id: 'more', label: 'Ask Another Question' }, { id: 'custom', label: 'Ask Something Else', icon: 'chat_bubble' }, { id: 'back', label: 'Back to Dashboard', icon: 'switch' }],
    }),
    processResponse: () => ({}),
    getNextStep: (r) => r === 'more' ? 'db.answers_topics' : r === 'custom' ? 'db.answers_custom' : 'db.actions',
  },

  {
    id: 'db.answers_ncb',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [`No Claim Bonus (NCB) is a discount on your Own Damage premium for every claim-free year. It starts at 20% and goes up to 50% over 5 years.\n\nNCB Progression:\n• 1 year claim-free: 20%\n• 2 years: 25%\n• 3 years: 35%\n• 4 years: 45%\n• 5 years: 50%\n\nImportant: NCB is on the vehicle owner, not the vehicle. If you sell your car, you can transfer your NCB to a new vehicle.`],
      options: [{ id: 'more', label: 'Ask Another Question' }, { id: 'custom', label: 'Ask Something Else', icon: 'chat_bubble' }, { id: 'back', label: 'Back to Dashboard', icon: 'switch' }],
    }),
    processResponse: () => ({}),
    getNextStep: (r) => r === 'more' ? 'db.answers_topics' : r === 'custom' ? 'db.answers_custom' : 'db.actions',
  },

  {
    id: 'db.answers_addons',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [`Popular add-ons:\n\n• Zero Depreciation: Saves 30-50% on claim costs\n• Engine Protection: Covers water damage to engine (₹1,500-3,000)\n• Consumables Cover: Covers engine oil, nuts, bolts (₹500-1,000)\n• Personal Accident: ₹15L-50L coverage for owner-driver\n• Passenger Protection: Covers co-passengers\n\nRecommended: Zero Dep for new cars, Engine Protection for monsoon-prone areas.`],
      options: [{ id: 'more', label: 'Ask Another Question' }, { id: 'custom', label: 'Ask Something Else', icon: 'chat_bubble' }, { id: 'back', label: 'Back to Dashboard', icon: 'switch' }],
    }),
    processResponse: () => ({}),
    getNextStep: (r) => r === 'more' ? 'db.answers_topics' : r === 'custom' ? 'db.answers_custom' : 'db.actions',
  },

  {
    id: 'db.answers_third_party',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [`Third Party insurance is mandatory by law. It covers:\n\n• Injury or death to any third party\n• Damage to third party property\n\nWhat's NOT covered:\n• Your own vehicle damage\n• Your own injuries\n\nThat's why we recommend Comprehensive plans — they include third party PLUS own damage coverage for complete protection.`],
      options: [{ id: 'more', label: 'Ask Another Question' }, { id: 'custom', label: 'Ask Something Else', icon: 'chat_bubble' }, { id: 'back', label: 'Back to Dashboard', icon: 'switch' }],
    }),
    processResponse: () => ({}),
    getNextStep: (r) => r === 'more' ? 'db.answers_topics' : r === 'custom' ? 'db.answers_custom' : 'db.actions',
  },

  {
    id: 'db.answers_idv',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [`IDV (Insured Declared Value) is the current market value of your vehicle. It's calculated as:\n\nIDV = Manufacturer's price - Depreciation based on age\n\nDepreciation rates:\n• 0-6 months: 5%\n• 6-12 months: 15%\n• 1-2 years: 20%\n• 2-3 years: 30%\n• 3-4 years: 40%\n• 4-5 years: 50%\n\nYour IDV is the maximum amount we'll pay if your vehicle is stolen or totally damaged. Higher IDV = higher premium.`],
      options: [{ id: 'more', label: 'Ask Another Question' }, { id: 'custom', label: 'Ask Something Else', icon: 'chat_bubble' }, { id: 'back', label: 'Back to Dashboard', icon: 'switch' }],
    }),
    processResponse: () => ({}),
    getNextStep: (r) => r === 'more' ? 'db.answers_topics' : r === 'custom' ? 'db.answers_custom' : 'db.actions',
  },

  {
    id: 'db.answers_roadside',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [`Yes! Roadside assistance is included with your policy. We provide:\n\n• 24/7 towing service (up to 50 km)\n• Flat tire replacement\n• Emergency fuel delivery\n• Battery jump-start\n• Key lockout assistance\n\nJust call our helpline at 1800-266-2256 (toll-free) anytime you need help on the road.`],
      options: [{ id: 'more', label: 'Ask Another Question' }, { id: 'custom', label: 'Ask Something Else', icon: 'chat_bubble' }, { id: 'back', label: 'Back to Dashboard', icon: 'switch' }],
    }),
    processResponse: () => ({}),
    getNextStep: (r) => r === 'more' ? 'db.answers_topics' : r === 'custom' ? 'db.answers_custom' : 'db.actions',
  },

  /* ── Free-text custom question ── */
  {
    id: 'db.answers_custom',
    module: 'dashboard',
    widgetType: 'text_input',
    getScript: () => ({
      botMessages: ['What would you like to know about your motor insurance?'],
      placeholder: 'Type your question...',
      inputType: 'text' as const,
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.answers_custom_reply',
  },

  {
    id: 'db.answers_custom_reply',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [
        `Based on your policy, most vehicle damages and third-party liabilities are covered. For specific scenarios, coverage depends on your plan type (Comprehensive, Zero Dep, or Third Party) and selected add-ons.\n\nFor a definitive answer on a specific situation, you can call our helpline at 1800-266-2256 (toll-free, 24/7).`,
      ],
      options: [
        { id: 'more_topics', label: 'Browse More Topics' },
        { id: 'another', label: 'Ask Another Question', icon: 'chat_bubble' },
        { id: 'back', label: 'Back to Dashboard', icon: 'switch' },
      ],
    }),
    processResponse: () => ({}),
    getNextStep: (r) => r === 'more_topics' ? 'db.answers_topics' : r === 'another' ? 'db.answers_custom' : 'db.actions',
  },

  /* ═════ DOWNLOAD DOCUMENTS ═════ */
  {
    id: 'db.docs_list',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: ['Select a document to download:'],
      options: [
        ...MOTOR_DOCUMENTS.map(d => ({ id: d.id, label: d.name, icon: 'document' })),
        { id: 'back', label: 'Back to Dashboard', icon: 'switch' },
      ],
    }),
    processResponse: () => ({}),
    getNextStep: (response) => {
      if (response === 'back') return 'db.actions';
      return 'db.doc_downloaded';
    },
  },

  {
    id: 'db.doc_downloaded',
    module: 'dashboard',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [
        '✅ Download started! Your document will be saved to your device.',
        'Need anything else?',
      ],
      options: [
        { id: 'more', label: 'Download More Documents' },
        { id: 'back', label: 'Back to Dashboard' },
      ],
    }),
    processResponse: () => ({}),
    getNextStep: (response) => response === 'more' ? 'db.docs_list' : 'db.actions',
  },

  /* ═════ EDIT POLICY ═════ */
  {
    id: 'db.edit_options',
    module: 'edit_policy',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: ['What would you like to modify?'],
      options: [
        { id: 'add_addon', label: 'Add Add-ons', description: 'Enhance your coverage' },
        { id: 'update_nominee', label: 'Update Nominee', description: 'Change nominee details' },
        { id: 'update_address', label: 'Update Address', description: 'Change registered address' },
        { id: 'back', label: 'Back to Dashboard' },
      ],
    }),
    processResponse: (response) => ({ dashboardEditType: response }),
    getNextStep: (response) => {
      switch (response) {
        case 'add_addon': return 'db.edit_addon_select';
        case 'update_nominee': return 'db.edit_nominee_name';
        case 'update_address': return 'db.edit_address';
        default: return 'db.actions';
      }
    },
  },

  /* ── Add Add-on ── */
  {
    id: 'db.edit_addon_select',
    module: 'edit_policy',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: ['Select an add-on to include in your policy:'],
      options: [
        { id: 'engine_protect', label: 'Engine Protection (₹2,500)' },
        { id: 'consumables', label: 'Consumables Cover (₹750)' },
        { id: 'key_replacement', label: 'Key Replacement (₹500)' },
        { id: 'cancel', label: 'Cancel' },
      ],
    }),
    processResponse: () => ({}),
    getNextStep: (response) => response === 'cancel' ? 'db.edit_options' : 'db.edit_done',
  },

  /* ── Update Nominee ── */
  {
    id: 'db.edit_nominee_name',
    module: 'edit_policy',
    widgetType: 'text_input',
    getScript: () => ({
      botMessages: ['Enter the new nominee name:'],
      placeholder: 'Full name',
      inputType: 'text' as const,
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.edit_done',
  },

  /* ── Update Address ── */
  {
    id: 'db.edit_address',
    module: 'edit_policy',
    widgetType: 'text_input',
    getScript: () => ({
      botMessages: ['Enter your new address:'],
      placeholder: 'Complete address',
      inputType: 'text' as const,
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.edit_done',
  },

  /* ── Edit Done ── */
  {
    id: 'db.edit_done',
    module: 'edit_policy',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const editType = state.dashboardEditType;
      let summary = '';
      if (editType === 'add_addon') summary = 'Add selected add-on to policy';
      else if (editType === 'update_nominee') summary = 'Update nominee details';
      else if (editType === 'update_address') summary = 'Update registered address';
      return {
        botMessages: [
          '✅ Your request has been submitted successfully!',
          `Our team will review and update your policy within 2-3 working days. You'll receive a confirmation via email and SMS.`,
        ],
        options: [
          { id: 'track', label: 'Track This Request', icon: 'clock' },
          { id: 'more', label: 'Make Another Change', icon: 'refresh' },
          { id: 'back', label: 'Back to Dashboard', icon: 'switch' },
        ],
      };
    },
    processResponse: (response, state) => {
      const editType = state.dashboardEditType;
      let summary = '';
      if (editType === 'add_addon') summary = 'Add selected add-on to policy';
      else if (editType === 'update_nominee') summary = 'Update nominee details';
      else if (editType === 'update_address') summary = 'Update registered address';
      const editLabel = editType === 'add_addon' ? 'Add Add-on' : editType === 'update_nominee' ? 'Update Nominee' : 'Update Address';
      return {
        dashboardSubmittedEdits: [
          ...state.dashboardSubmittedEdits,
          {
            id: `MEDT-${Math.floor(100000 + Math.random() * 900000)}`,
            type: editLabel,
            summary,
            status: 'Under review',
            submittedAt: Date.now(),
          },
        ],
        dashboardEditType: '',
      };
    },
    getNextStep: (response) => {
      if (response === 'track') return 'db.track_overview';
      if (response === 'more') return 'db.edit_options';
      return 'db.actions';
    },
  },
];

/* ── Step lookup ── */
const stepMap = new Map(motorDashboardSteps.map(s => [s.id, s]));

export function getMotorDashboardStep(stepId: string): MotorConversationStep | undefined {
  return stepMap.get(stepId);
}
