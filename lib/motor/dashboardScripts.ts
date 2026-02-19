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

import { MotorConversationStep, MotorJourneyState, MotorClaim } from './types';

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

/* ── Claim type display labels ── */
const CLAIM_TYPE_LABELS: Record<string, string> = {
  own_damage_accident: 'Accident',
  own_damage_theft: 'Stolen Vehicle',
  own_damage_accessories: 'Accessories Stolen',
  third_party: 'Third Party Damage',
};

/* ── Vehicle location display labels ── */
const VEHICLE_LOCATION_LABELS: Record<string, string> = {
  home_office: 'Home / Office',
  garage_dealership: 'Garage / Dealership',
  accident_site: 'Accident site',
  police_station: 'Police station',
};

/* ── Driver relationship options ── */
const DRIVER_RELATIONS = [
  { id: 'spouse', label: 'Spouse' },
  { id: 'child', label: 'Child' },
  { id: 'parent', label: 'Parent' },
  { id: 'sibling', label: 'Sibling' },
  { id: 'friend', label: 'Friend' },
  { id: 'appointed_driver', label: 'Appointed Driver' },
  { id: 'other', label: 'Other' },
];

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
          `Welcome back${state.userName ? ', ' + state.userName : ''}.`,
          `Here is your policy overview.`,
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
        { id: 'raise_claim', label: 'Raise a Claim', icon: 'claim', description: 'File accident or damage claim' },
        { id: 'get_answers', label: 'Get Answers', icon: 'help', description: 'Coverage FAQs' },
        { id: 'download_doc', label: 'Download Documents', icon: 'download', description: 'Policy, RC card, certificates' },
        { id: 'edit_policy', label: 'Edit Policy', icon: 'edit', description: 'Modify add-ons, nominee' },
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
          description: `${CLAIM_TYPE_LABELS[c.type] || c.type} · ${c.status} · ${timeLabel}`,
          icon: 'claim',
        });
      });

      state.dashboardSubmittedEdits.forEach((e, i) => {
        const age = Math.round((Date.now() - e.submittedAt) / 60000);
        const timeLabel = age < 60 ? `${age}m ago` : `${Math.round(age / 60)}h ago`;
        items.push({
          id: `edit_${i}`,
          label: `Edit: ${e.type}`,
          description: `${e.summary} · ${e.status} · ${timeLabel}`,
          icon: 'edit',
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

      const typeLabel = CLAIM_TYPE_LABELS[claim.type] || claim.type;
      const isTheft = claim.type === 'own_damage_theft';
      const isTP = claim.type === 'third_party';
      const injuryText = claim.seriousInjuries ? 'Yes — High priority' : 'No';
      const driverText = claim.wasDriverOwner ? 'Owner' : `${claim.driverName || 'Other'} (${claim.driverRelation || ''})`;
      const locationText = VEHICLE_LOCATION_LABELS[claim.vehicleLocation] || claim.vehicleLocation || 'N/A';
      const safeText = claim.safeToDriver === true ? 'Yes' : claim.safeToDriver === false ? 'No' : 'N/A';
      const towingText = claim.needsTowing ? 'Yes — Arranged' : 'No';

      let timeline = '';
      if (isTheft) {
        timeline = '1. Claim registered — Done\n2. Police verification — In progress\n3. Investigation — Pending\n4. Settlement — Pending';
      } else if (isTP) {
        timeline = '1. Claim registered — Done\n2. Third-party verification — In progress\n3. Liability assessment — Pending\n4. Settlement processed — Pending';
      } else {
        timeline = '1. Claim registered — Done\n2. Surveyor inspection — In progress\n3. Repair authorization — Pending\n4. Vehicle repaired — Pending\n5. Claim settled — Pending';
      }

      return {
        botMessages: [
          `Claim ${claim.id} — ${typeLabel}`,
          `Date: ${claim.date}\nSerious injuries: ${injuryText}\nWho was driving: ${driverText}\nDescription: ${claim.description}\nVehicle location: ${locationText}\nSafe to drive: ${safeText}\nTowing: ${towingText}`,
          `Status timeline:\n\n${timeline}\n\nCurrent status: ${claim.status}\nExpected resolution: ${isTheft ? '7-10' : '3-5'} working days`,
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

  /* ═════ RAISE A CLAIM — FNOL Flow (PDF model) ═════ */

  /* Step 1: Intro */
  {
    id: 'db.claim_intro',
    module: 'claims',
    widgetType: 'none',
    getScript: () => ({
      botMessages: [
        `We will help you file a claim. Just a few quick questions about the incident.`,
        `This should take about 2 minutes.`,
      ],
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_type',
  },

  /* Step 2: What happened? */
  {
    id: 'db.claim_type',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const v = state.vehicleType === 'bike' ? 'bike' : 'car';
      return {
        botMessages: [`What happened?`],
        options: [
          { id: 'own_damage_accident', label: `My ${v} was in an accident`, icon: v, description: 'Collision, hit & run, natural calamity, fire' },
          { id: 'own_damage_theft', label: `My ${v} was stolen`, icon: 'theft', description: 'Vehicle theft or break-in' },
          { id: 'own_damage_accessories', label: `My ${v} accessories were stolen`, icon: 'theft', description: 'Parts or accessories stolen' },
          { id: 'third_party', label: 'I caused damage to someone else', icon: 'shield_search', description: 'Property or injury to a third party' },
        ],
      };
    },
    processResponse: (response) => ({ dashboardClaimType: response }),
    getNextStep: () => 'db.claim_injuries',
  },

  /* Step 3: Deaths or serious injuries? (Q1 from PDF) */
  {
    id: 'db.claim_injuries',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [`Did the incident result in any deaths or serious injuries?`],
      subText: `If yes, your claim will be immediately escalated for urgent assistance.`,
      options: [
        { id: 'yes', label: 'Yes', description: 'Someone was seriously hurt or killed' },
        { id: 'no', label: 'No', description: 'No deaths or serious injuries' },
      ],
    }),
    processResponse: (response) => ({ dashboardClaimSeriousInjuries: response === 'yes' }),
    getNextStep: () => 'db.claim_when',
  },

  /* Step 4: When did it happen? (Q2 from PDF — Yesterday / Today chips) */
  {
    id: 'db.claim_when',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return {
        botMessages: [`When did it happen?`],
        options: [
          { id: `today|${fmt(today)}`, label: 'Today', description: fmt(today) },
          { id: `yesterday|${fmt(yesterday)}`, label: 'Yesterday', description: fmt(yesterday) },
          { id: 'other', label: 'Earlier date', description: 'Pick a specific date' },
        ],
      };
    },
    processResponse: (response) => {
      if (response === 'other') return {};
      const [, dateStr] = (response as string).split('|');
      return { dashboardClaimDate: dateStr };
    },
    getNextStep: (response) => response === 'other' ? 'db.claim_when_custom' : 'db.claim_driver',
  },

  /* Step 4a: Custom date (conditional) */
  {
    id: 'db.claim_when_custom',
    module: 'claims',
    widgetType: 'text_input',
    getScript: () => ({
      botMessages: [`Please enter the date of the incident.`],
      placeholder: 'e.g., 10 Jan 2026',
      inputType: 'text' as const,
    }),
    processResponse: (response) => ({ dashboardClaimDate: response }),
    getNextStep: () => 'db.claim_driver',
  },

  /* Step 5: Who was driving? (Q3 from PDF) */
  {
    id: 'db.claim_driver',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const ownerName = state.ownerName || state.userName || 'You (owner)';
      return {
        botMessages: [`Who was driving when it happened?`],
        subText: `You can file a claim even if someone else was driving.`,
        options: [
          { id: 'owner', label: `Myself — ${ownerName}`, description: 'Policy holder was driving' },
          { id: 'other', label: 'Someone else', description: 'Another person was driving' },
        ],
      };
    },
    processResponse: (response) => ({ dashboardClaimWasDriverOwner: response === 'owner' }),
    getNextStep: (response) => response === 'other' ? 'db.claim_driver_name' : 'db.claim_how',
  },

  /* Step 5a: Driver's name (conditional) */
  {
    id: 'db.claim_driver_name',
    module: 'claims',
    widgetType: 'text_input',
    getScript: () => ({
      botMessages: [`What is the name of the person who was driving?`],
      placeholder: 'e.g., Rajesh Kumar',
      inputType: 'text' as const,
    }),
    processResponse: (response) => ({ dashboardClaimDriverName: response }),
    getNextStep: () => 'db.claim_driver_relation',
  },

  /* Step 5b: Driver's relation (conditional) */
  {
    id: 'db.claim_driver_relation',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => ({
      botMessages: [`How is ${state.dashboardClaimDriverName || 'this person'} related to you?`],
      options: DRIVER_RELATIONS,
    }),
    processResponse: (response) => ({ dashboardClaimDriverRelation: response }),
    getNextStep: () => 'db.claim_how',
  },

  /* Step 6: How did it happen? (Q4 from PDF) */
  {
    id: 'db.claim_how',
    module: 'claims',
    widgetType: 'text_input',
    getScript: (state) => {
      const isTheft = state.dashboardClaimType === 'own_damage_theft' || state.dashboardClaimType === 'own_damage_accessories';
      return {
        botMessages: [`How did it happen?`],
        subText: isTheft
          ? `Describe what was stolen and any circumstances you noticed. Include as much detail as you can.`
          : `Describe the accident and which parts of your vehicle were damaged. Include as much detail as you can — this helps speed up your claim.`,
        placeholder: isTheft
          ? 'e.g., Vehicle was parked outside my office overnight. Found it missing in the morning.'
          : 'e.g., Was turning left at the traffic signal when another vehicle hit the front bumper.',
        inputType: 'text' as const,
      };
    },
    processResponse: (response) => ({ dashboardClaimDescription: response }),
    getNextStep: () => 'db.claim_vehicle_loc',
  },

  /* Step 7: Where is your vehicle now? (Q5 from PDF) */
  {
    id: 'db.claim_vehicle_loc',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const v = state.vehicleType === 'bike' ? 'bike' : 'car';
      const isTheft = state.dashboardClaimType === 'own_damage_theft';
      if (isTheft) {
        return {
          botMessages: [`Where was your ${v} when it was stolen?`],
          options: [
            { id: 'home_office', label: 'Home / Office', description: 'Parked at a familiar place' },
            { id: 'public_place', label: 'Public place', description: 'Market, mall, street, etc.' },
            { id: 'police_station', label: 'FIR already filed', description: 'Police report submitted' },
            { id: 'other', label: 'Other location', description: '' },
          ],
        };
      }
      return {
        botMessages: [`Where is your ${v} right now?`],
        subText: `This helps us arrange towing or a surveyor visit if needed.`,
        options: [
          { id: 'home_office', label: 'Home / Office', description: 'Drove it back or towed it home', icon: 'map_pin' },
          { id: 'garage_dealership', label: 'Garage / Dealership', description: 'Already at a repair shop', icon: 'garage' },
          { id: 'accident_site', label: 'Still at accident site', description: 'Vehicle has not been moved', icon: 'accident' },
          { id: 'police_station', label: 'Police station', description: 'Vehicle is with the police', icon: 'police' },
        ],
      };
    },
    processResponse: (response) => ({ dashboardClaimVehicleLocation: response }),
    getNextStep: (response, state) => {
      if (state.dashboardClaimType === 'own_damage_theft') return 'db.claim_review';
      return 'db.claim_safe_to_drive';
    },
  },

  /* Step 8: Is the vehicle safe to drive? (Q6 from PDF) */
  {
    id: 'db.claim_safe_to_drive',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const v = state.vehicleType === 'bike' ? 'bike' : 'car';
      return {
        botMessages: [`Is your ${v} safe to drive?`],
        options: [
          { id: 'yes', label: 'Yes, it is drivable', description: 'Minor damage, can be driven' },
          { id: 'no', label: 'No, it is not safe', description: 'Needs towing or is unsafe to drive' },
        ],
      };
    },
    processResponse: (response) => ({ dashboardClaimSafeToDriver: response === 'yes' }),
    getNextStep: (response) => response === 'no' ? 'db.claim_safety_conditions' : 'db.claim_towing',
  },

  /* Step 8a: Safety condition picker (conditional — if not safe) */
  {
    id: 'db.claim_safety_conditions',
    module: 'claims',
    widgetType: 'safety_condition_picker',
    getScript: () => ({
      botMessages: [`Which of these safety issues apply?`],
      subText: `Select all that apply — this helps us prioritise your claim.`,
    }),
    processResponse: (response) => ({ dashboardClaimSafetyConditions: response as string[] }),
    getNextStep: () => 'db.claim_towing',
  },

  /* Step 9: Towing help? (Q7 from PDF — conditional) */
  {
    id: 'db.claim_towing',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [`Do you need help with towing?`],
      subText: `Our towing team will contact you within 15 minutes of your claim being filed.`,
      options: [
        { id: 'yes', label: 'Yes, I need towing', description: 'Our team will call you shortly', icon: 'towing' },
        { id: 'no', label: 'No, I will manage', description: 'I have arranged transport', icon: 'check' },
      ],
    }),
    processResponse: (response) => ({ dashboardClaimNeedsTowing: response === 'yes' }),
    getNextStep: () => 'db.claim_docs_intro',
  },

  /* Step 10: Document upload intro */
  {
    id: 'db.claim_docs_intro',
    module: 'claims',
    widgetType: 'none',
    getScript: (state) => {
      const hasTowing = state.dashboardClaimNeedsTowing === true;
      const hasAutoRC = !!(state.registrationNumber && state.vehicleData?.make);
      const towingAck = hasTowing
        ? `Got it — our towing team will reach you within 15 minutes. 🚛`
        : `Got it, glad you're sorted.`;
      const rcNote = hasAutoRC
        ? `We've already fetched your RC details from the Vahan portal, so that's taken care of.`
        : `We'll need you to upload your Registration Certificate (RC).`;
      return {
        botMessages: [
          towingAck,
          `One last thing before we file your claim.`,
          `${rcNote} We also need your Driving Licence (DL) to verify the driver's identity.`,
          `This helps us process your claim faster. 📄`,
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_docs_upload',
  },

  /* Step 11: Document upload widget */
  {
    id: 'db.claim_docs_upload',
    module: 'claims',
    widgetType: 'document_upload',
    getScript: () => ({ botMessages: [] }),
    processResponse: (response) => ({
      dashboardClaimRcUploaded: !!response?.rcUploaded,
      dashboardClaimDlUploaded: !!response?.dlUploaded,
      dashboardClaimPrevPolicyUploaded: !!response?.prevPolicyUploaded,
    }),
    getNextStep: (_, state) => {
      const isTheft = state.dashboardClaimType === 'own_damage_theft';
      return isTheft ? 'db.claim_review' : 'db.claim_damage_photos_intro';
    },
  },

  /* Step 11a: Damage photos intro (for non-theft claims) */
  {
    id: 'db.claim_damage_photos_intro',
    module: 'claims',
    widgetType: 'none',
    getScript: () => ({
      botMessages: [
        `Almost there — one more thing.`,
        `Please upload a few photos of the damage. This helps our team assess the extent of damage and speeds up your claim significantly.`,
      ],
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_damage_photos',
  },

  /* Step 11b: Damage photo capture widget */
  {
    id: 'db.claim_damage_photos',
    module: 'claims',
    widgetType: 'damage_photo_capture',
    getScript: () => ({ botMessages: [] }),
    processResponse: (response) => ({ dashboardClaimDamagePhotosUploaded: !!response?.photosUploaded }),
    getNextStep: () => 'db.claim_review',
  },

  /* Step 13: Review & confirm */
  {
    id: 'db.claim_review',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const typeLabel = CLAIM_TYPE_LABELS[state.dashboardClaimType] || state.dashboardClaimType;
      const driverText = state.dashboardClaimWasDriverOwner
        ? (state.ownerName || 'Owner')
        : `${state.dashboardClaimDriverName || 'Someone else'} (${state.dashboardClaimDriverRelation || 'other'})`;
      const injuryText = state.dashboardClaimSeriousInjuries ? 'Yes — High priority' : 'No';
      const locationText = VEHICLE_LOCATION_LABELS[state.dashboardClaimVehicleLocation] || state.dashboardClaimVehicleLocation || 'N/A';
      const safeText = state.dashboardClaimSafeToDriver === true ? 'Yes' : state.dashboardClaimSafeToDriver === false ? 'No' : 'N/A';
      const towingText = state.dashboardClaimNeedsTowing === true ? 'Yes — Team will call shortly' : state.dashboardClaimNeedsTowing === false ? 'No' : 'N/A';

      return {
        botMessages: [
          `Here is a summary of your claim.`,
          `Type: ${typeLabel}\nDate: ${state.dashboardClaimDate}\nSerious injuries: ${injuryText}\nWho was driving: ${driverText}\nDescription: ${state.dashboardClaimDescription}\nVehicle location: ${locationText}\nSafe to drive: ${safeText}\nTowing needed: ${towingText}`,
          `Does everything look correct?`,
        ],
        options: [
          { id: 'confirm', label: 'Submit Claim', icon: 'document' },
          { id: 'cancel', label: 'Cancel', icon: 'switch' },
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: (response) => response === 'confirm' ? 'db.claim_submitted' : 'db.actions',
  },

  /* Step 14: Submission confirmation → triggers heartbeat + next steps */
  {
    id: 'db.claim_submitted',
    module: 'claims',
    widgetType: 'none',
    getScript: (state) => {
      const isTheft = state.dashboardClaimType === 'own_damage_theft';
      const hasSerious = state.dashboardClaimSeriousInjuries === true;
      const needsTowing = state.dashboardClaimNeedsTowing === true;
      const claimId = `MCL-${Math.floor(100000 + Math.random() * 900000)}`;

      const notes: string[] = [];
      if (hasSerious) notes.push(`Your claim has been marked as high priority due to reported injuries.`);
      if (needsTowing) notes.push(`Our towing team will call you within 15 minutes. 🚛`);

      return {
        botMessages: [
          `Claim submitted successfully.`,
          `Claim ID: ${claimId}\nPolicy validated ✓\nCoverage confirmed ✓\nExpected resolution: ${isTheft ? '7–10' : '3–5'} working days`,
          ...notes,
          `Here is your live claim status:`,
        ],
      };
    },
    processResponse: (_response, state) => {
      const claimId = `MCL-${Math.floor(100000 + Math.random() * 900000)}`;
      const isTheft = state.dashboardClaimType === 'own_damage_theft';
      const hasSerious = state.dashboardClaimSeriousInjuries === true;
      const needsTowing = state.dashboardClaimNeedsTowing === true;

      let status = 'Surveyor inspection scheduled';
      if (isTheft) status = 'Police verification in progress';
      if (hasSerious) status = 'High priority — Under review';
      if (needsTowing) status = 'Towing arranged — Inspection pending';

      return {
        dashboardSubmittedClaims: [
          ...state.dashboardSubmittedClaims,
          {
            id: claimId,
            type: (state.dashboardClaimType || 'own_damage_accident') as MotorClaim['type'],
            date: state.dashboardClaimDate,
            seriousInjuries: state.dashboardClaimSeriousInjuries,
            wasDriverOwner: state.dashboardClaimWasDriverOwner,
            driverName: state.dashboardClaimDriverName,
            driverRelation: state.dashboardClaimDriverRelation,
            description: state.dashboardClaimDescription,
            vehicleLocation: state.dashboardClaimVehicleLocation,
            safeToDriver: state.dashboardClaimSafeToDriver,
            needsTowing: state.dashboardClaimNeedsTowing,
            rcUploaded: state.dashboardClaimRcUploaded,
            dlUploaded: state.dashboardClaimDlUploaded,
            status,
            submittedAt: Date.now(),
          },
        ],
        dashboardClaimType: '' as const,
        dashboardClaimSeriousInjuries: null,
        dashboardClaimDate: '',
        dashboardClaimWasDriverOwner: null,
        dashboardClaimDriverName: '',
        dashboardClaimDriverRelation: '',
        dashboardClaimDescription: '',
        dashboardClaimVehicleLocation: '',
        dashboardClaimSafeToDriver: null,
        dashboardClaimNeedsTowing: null,
        dashboardClaimRcUploaded: false,
        dashboardClaimDlUploaded: false,
        dashboardClaimPrevPolicyUploaded: false,
        dashboardClaimDamagePhotosUploaded: false,
        dashboardClaimDamagedParts: [],
        dashboardClaimSafetyConditions: [],
      };
    },
    getNextStep: (_, state) => {
      const isTheft = state.dashboardClaimType === 'own_damage_theft';
      return isTheft ? 'db.claim_heartbeat' : 'db.claim_heartbeat';
    },
  },

  /* Step 15: Heartbeat — live status timeline */
  {
    id: 'db.claim_heartbeat',
    module: 'claims',
    widgetType: 'claim_heartbeat',
    getScript: () => ({ botMessages: [] }),
    processResponse: () => ({}),
    getNextStep: (_, state) => {
      const isTheft = state.dashboardSubmittedClaims[state.dashboardSubmittedClaims.length - 1]?.type === 'own_damage_theft';
      return isTheft ? 'db.actions' : 'db.claim_inspection_type';
    },
  },

  /* Step 16: Inspection type — self or surveyor? */
  {
    id: 'db.claim_inspection_type',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [
        `Next step: we need to assess the damage.`,
        `You can do a quick self-inspection right now, or we can assign a surveyor to visit you.`,
      ],
      options: [
        { id: 'self', label: 'Self Inspection', description: 'Guided photo capture — takes 3 minutes', icon: 'camera' },
        { id: 'surveyor', label: 'Assign a Surveyor', description: 'We will visit you within 24–48 hours', icon: 'document' },
      ],
    }),
    processResponse: (response) => ({ dashboardClaimInspectionType: response as 'self' | 'surveyor' }),
    getNextStep: (response) => response === 'self' ? 'db.claim_self_inspection' : 'db.claim_surveyor_assigned',
  },

  /* Step 17a: Self inspection widget */
  {
    id: 'db.claim_self_inspection',
    module: 'claims',
    widgetType: 'self_inspection',
    getScript: () => ({
      botMessages: [`Great — let's start the self inspection. I'll guide you through each photo step.`],
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_assessment_result',
  },

  /* Step 17b: Surveyor assigned */
  {
    id: 'db.claim_surveyor_assigned',
    module: 'claims',
    widgetType: 'surveyor_assigned',
    getScript: () => ({
      botMessages: [`A surveyor has been assigned to your claim.`],
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_assessment_result',
  },

  /* Step 18: Assessment result → settlement path */
  {
    id: 'db.claim_assessment_result',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const baseAmount = state.totalPremium ? Math.round(state.totalPremium * 0.6) : 18500;
      const deductible = state.selectedPlan?.type === 'zero_dep' ? 0 : 2500;
      const netAmount = baseAmount - deductible;
      return {
        botMessages: [
          `Damage assessment complete.`,
          `Estimated repair cost: ₹${baseAmount.toLocaleString('en-IN')}\nDeductible: ₹${deductible.toLocaleString('en-IN')}\nApproved amount: ₹${netAmount.toLocaleString('en-IN')}`,
          `How would you like to proceed?`,
        ],
        options: [
          { id: 'instant', label: 'Instant Settlement', description: `₹${netAmount.toLocaleString('en-IN')} direct bank transfer`, icon: 'check' },
          { id: 'cashless', label: 'Cashless Repair', description: 'We pay the garage directly', icon: 'garage' },
          { id: 'reimbursement', label: 'Reimbursement', description: 'Repair anywhere, claim later', icon: 'document' },
        ],
      };
    },
    processResponse: (response) => ({ dashboardClaimSettlementType: response as 'instant' | 'cashless' | 'reimbursement' }),
    getNextStep: (response) => {
      switch (response) {
        case 'instant': return 'db.claim_instant_offer';
        case 'cashless': return 'db.claim_garage_cashless';
        case 'reimbursement': return 'db.claim_reimbursement';
        default: return 'db.claim_assessment_result';
      }
    },
  },

  /* Step 19a: Instant settlement offer */
  {
    id: 'db.claim_instant_offer',
    module: 'claims',
    widgetType: 'settlement_offer',
    getScript: () => ({
      botMessages: [`Here is your instant settlement offer:`],
    }),
    processResponse: (response, state) => {
      const netAmount = typeof response === 'number' ? response : state.dashboardClaimSettlementAmount || 18500;
      return { dashboardClaimSettlementAmount: netAmount };
    },
    getNextStep: (response) => {
      if (response === 'declined') return 'db.claim_assessment_result';
      return 'db.claim_payment_initiated';
    },
  },

  /* Step 19b: Cashless garage selection */
  {
    id: 'db.claim_garage_cashless',
    module: 'claims',
    widgetType: 'garage_selector_claim',
    getScript: () => ({
      botMessages: [`Choose a cashless garage near you:`],
    }),
    processResponse: (response) => ({ dashboardClaimSelectedGarage: response as string }),
    getNextStep: () => 'db.claim_repair_progress',
  },

  /* Step 19c: Reimbursement invoice upload */
  {
    id: 'db.claim_reimbursement',
    module: 'claims',
    widgetType: 'reimbursement_upload',
    getScript: () => ({
      botMessages: [`Get your vehicle repaired at any garage of your choice.`],
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_payment_initiated',
  },

  /* Step 20a: Repair in progress (cashless path) */
  {
    id: 'db.claim_repair_progress',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const garage = state.dashboardClaimSelectedGarage || 'GoMechanic';
      const GARAGE_NAMES: Record<string, string> = {
        gomechanic: 'GoMechanic, Sector 29',
        carnation: 'Carnation Auto, Cyber City',
        pitstop: 'Pit Stop, MG Road',
        autobahn: 'Autobahn Motors, DLF Phase 3',
        outside_network: 'your selected garage',
      };
      const garageName = GARAGE_NAMES[garage] || garage;
      return {
        botMessages: [
          `Repair approval sent to ${garageName}.`,
          `Status: Repair in progress\nEstimated completion: 2–3 working days\nWe will notify you when your vehicle is ready for pickup.`,
        ],
        options: [
          { id: 'done', label: 'Got it', icon: 'check' },
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_closure',
  },

  /* Step 20b: Payment initiated (instant + reimbursement path) */
  {
    id: 'db.claim_payment_initiated',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const amount = state.dashboardClaimSettlementAmount || 18500;
      return {
        botMessages: [
          `Payment initiated.`,
          `₹${amount.toLocaleString('en-IN')} has been transferred to your bank account ending ····3845.\n\nTransfer reference: TXN${Math.floor(1000000 + Math.random() * 9000000)}\nExpected credit: within 24 hours`,
        ],
        options: [
          { id: 'done', label: 'Continue', icon: 'check' },
        ],
      };
    },
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_closure',
  },

  /* Step 21: Claim Closure */
  {
    id: 'db.claim_closure',
    module: 'claims',
    widgetType: 'claim_closure',
    getScript: () => ({
      botMessages: [`Your claim has been fully resolved.`],
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.actions',
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
      botMessages: [`No Claim Bonus (NCB) is a discount on your Own Damage premium for every claim-free year. It starts at 20% and goes up to 50% over 5 years.\n\nNCB Progression:\n• 1 year claim-free: 20%\n• 2 years: 25%\n• 3 years: 35%\n• 4 years: 45%\n• 5 years: 50%\n\nImportant: NCB is on the vehicle owner, not the vehicle. If you sell your vehicle, you can transfer your NCB to a new one.`],
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
      botMessages: [`Popular add-ons:\n\n• Zero Depreciation: Saves 30-50% on claim costs\n• Engine Protection: Covers water damage to engine (₹1,500-3,000)\n• Consumables Cover: Covers engine oil, nuts, bolts (₹500-1,000)\n• Personal Accident: ₹15L-50L coverage for owner-driver\n• Passenger Protection: Covers co-passengers\n\nRecommended: Zero Dep for new vehicles, Engine Protection for monsoon-prone areas.`],
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
        ...MOTOR_DOCUMENTS.map(d => ({ id: d.id, label: d.name, icon: 'pdf' })),
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
        `Download started. Your document will be saved to your device.`,
        `Need anything else?`,
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
          `Your request has been submitted successfully.`,
          `Our team will review and update your policy within 2-3 working days. You will receive a confirmation via email and SMS.`,
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
