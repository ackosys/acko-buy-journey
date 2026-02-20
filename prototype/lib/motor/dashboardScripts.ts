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

/* ── Incident type display labels ── */
const INCIDENT_LABELS: Record<string, string> = {
  collision: 'Collision / Accident',
  theft: 'Theft / Break-in',
  natural_calamity: 'Natural Calamity',
  fire: 'Fire',
  hit_and_run: 'Hit & Run',
  injury: 'Injury to Person',
  property_damage: 'Property Damage',
  other: 'Other',
};

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
      const incidentLabel = INCIDENT_LABELS[claim.incidentType] || claim.incidentType;
      const typeLabel = claim.type === 'own_damage' ? 'Own Damage' : 'Third Party';
      const injuryText = claim.injury === true ? 'Yes' : 'No';
      const policeText = claim.policeReport ? `Yes (${claim.firNumber || 'Pending'})` : 'No';
      const isTheft = claim.incidentType === 'theft';

      let timeline = '';
      if (isTheft) {
        timeline = '1. Claim registered — Done\n2. Police verification — In progress\n3. Investigation — Pending\n4. Settlement — Pending';
      } else if (claim.type === 'own_damage') {
        timeline = '1. Claim registered — Done\n2. Surveyor inspection — In progress\n3. Repair authorization — Pending\n4. Vehicle repaired — Pending\n5. Claim settled — Pending';
      } else {
        timeline = '1. Claim registered — Done\n2. Third-party verification — In progress\n3. Liability assessment — Pending\n4. Settlement processed — Pending';
      }

      return {
        botMessages: [
          `Claim ${claim.id} — ${typeLabel}\n\nIncident: ${incidentLabel}\nLocation: ${claim.location}\nDate: ${claim.date}\nDescription: ${claim.description}\nInjuries: ${injuryText}\nPolice Report: ${policeText}\nGarage: ${garage}\nEstimated Amount: ₹${Number(claim.amount).toLocaleString()}`,
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

  /* ═════ RAISE A CLAIM — Full FNOL Flow ═════ */

  /* Step 1: Intro */
  {
    id: 'db.claim_intro',
    module: 'claims',
    widgetType: 'none',
    getScript: () => ({
      botMessages: [
        `I'll help you file a claim. We'll need a few details about the incident so we can process it quickly.`,
        `This should take about 2-3 minutes.`,
      ],
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_type',
  },

  /* Step 2: Claim type — OD or TP */
  {
    id: 'db.claim_type',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: ['What type of claim are you filing?'],
      options: [
        { id: 'own_damage', label: 'Own Damage', icon: 'car', description: 'Your vehicle was damaged' },
        { id: 'third_party', label: 'Third Party', icon: 'shield', description: 'Damage caused to someone else' },
      ],
    }),
    processResponse: (response) => ({ dashboardClaimType: response as 'own_damage' | 'third_party' }),
    getNextStep: () => 'db.claim_incident_type',
  },

  /* Step 3: What kind of incident */
  {
    id: 'db.claim_incident_type',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const isOD = state.dashboardClaimType === 'own_damage';
      const options = isOD
        ? [
            { id: 'collision', label: 'Collision / Accident', description: 'Hit another vehicle, object, or barrier' },
            { id: 'theft', label: 'Theft / Break-in', description: 'Vehicle stolen or parts missing' },
            { id: 'natural_calamity', label: 'Natural Calamity', description: 'Flood, storm, earthquake, hail' },
            { id: 'fire', label: 'Fire', description: 'Vehicle caught fire or was vandalized' },
            { id: 'hit_and_run', label: 'Hit & Run', description: 'Other vehicle hit and fled' },
            { id: 'other', label: 'Something Else', description: 'Other type of damage' },
          ]
        : [
            { id: 'collision', label: 'Collision / Accident', description: 'You hit another vehicle or property' },
            { id: 'injury', label: 'Injury to Person', description: 'A person was injured in the incident' },
            { id: 'property_damage', label: 'Property Damage', description: 'Damaged someone else\'s property' },
            { id: 'other', label: 'Something Else', description: 'Other type of third-party claim' },
          ];
      return {
        botMessages: ['What kind of incident was it?'],
        options,
      };
    },
    processResponse: (response) => ({ dashboardClaimIncidentType: response }),
    getNextStep: () => 'db.claim_where',
  },

  /* Step 4: Where did it happen */
  {
    id: 'db.claim_where',
    module: 'claims',
    widgetType: 'text_input',
    getScript: () => ({
      botMessages: ['Where did the incident happen?'],
      placeholder: 'e.g., MG Road near Cyber City, Gurgaon',
      inputType: 'text' as const,
    }),
    processResponse: (response) => ({ dashboardClaimLocation: response }),
    getNextStep: () => 'db.claim_when',
  },

  /* Step 5: When did it happen */
  {
    id: 'db.claim_when',
    module: 'claims',
    widgetType: 'text_input',
    getScript: () => ({
      botMessages: ['When did this happen?'],
      placeholder: 'e.g., 15 Feb 2026, around 3:30 PM',
      inputType: 'text' as const,
    }),
    processResponse: (response) => ({ dashboardClaimDate: response }),
    getNextStep: () => 'db.claim_how',
  },

  /* Step 6: Description — what happened */
  {
    id: 'db.claim_how',
    module: 'claims',
    widgetType: 'text_input',
    getScript: (state) => {
      const incidentLabel = INCIDENT_LABELS[state.dashboardClaimIncidentType] || 'the incident';
      return {
        botMessages: [`Please describe how ${incidentLabel} happened. Include as much detail as you can.`],
        placeholder: 'e.g., Was turning left at traffic signal when a bike hit the rear bumper',
        inputType: 'text' as const,
      };
    },
    processResponse: (response) => ({ dashboardClaimDescription: response }),
    getNextStep: () => 'db.claim_injury',
  },

  /* Step 7: Was anyone injured? */
  {
    id: 'db.claim_injury',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: ['Was anyone injured in the incident?'],
      options: [
        { id: 'yes', label: 'Yes', description: 'Someone was hurt' },
        { id: 'no', label: 'No', description: 'No injuries' },
      ],
    }),
    processResponse: (response) => ({ dashboardClaimInjury: response === 'yes' }),
    getNextStep: () => 'db.claim_driver',
  },

  /* Step 8: Were you driving? */
  {
    id: 'db.claim_driver',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: ['Who was driving the vehicle at the time of the incident?'],
      options: [
        { id: 'owner', label: 'I was driving (owner)', description: 'Policy holder was behind the wheel' },
        { id: 'other', label: 'Someone else was driving', description: 'Another authorized person' },
      ],
    }),
    processResponse: (response) => ({ dashboardClaimWasDriverOwner: response === 'owner' }),
    getNextStep: () => 'db.claim_other_vehicle',
  },

  /* Step 9: Was another vehicle involved? */
  {
    id: 'db.claim_other_vehicle',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: ['Was another vehicle involved?'],
      options: [
        { id: 'yes', label: 'Yes', description: 'Another vehicle was part of the incident' },
        { id: 'no', label: 'No', description: 'Single vehicle incident' },
      ],
    }),
    processResponse: (response) => ({ dashboardClaimOtherVehicle: response === 'yes' }),
    getNextStep: (response) => response === 'yes' ? 'db.claim_other_driver_info' : 'db.claim_police',
  },

  /* Step 9a: Other driver / vehicle details (conditional) */
  {
    id: 'db.claim_other_driver_info',
    module: 'claims',
    widgetType: 'text_input',
    getScript: () => ({
      botMessages: ['Please share any details about the other vehicle or driver — registration number, contact info, or anything you noted.'],
      placeholder: 'e.g., White Hyundai i20, DL 4C XX 1234',
      inputType: 'text' as const,
    }),
    processResponse: (response) => ({ dashboardClaimOtherDriverInfo: response }),
    getNextStep: () => 'db.claim_police',
  },

  /* Step 10: Police report filed? */
  {
    id: 'db.claim_police',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const needsFir = state.dashboardClaimIncidentType === 'theft' || state.dashboardClaimInjury;
      const msg = needsFir
        ? 'A police report is typically required for this type of incident. Have you filed one?'
        : 'Was a police report / FIR filed for this incident?';
      return {
        botMessages: [msg],
        options: [
          { id: 'yes', label: 'FIR filed' },
          { id: 'no', label: 'Not yet' },
        ],
      };
    },
    processResponse: (response) => ({ dashboardClaimPoliceReport: response === 'yes' }),
    getNextStep: (response) => response === 'yes' ? 'db.claim_fir_number' : 'db.claim_photos',
  },

  /* Step 10a: FIR number (conditional) */
  {
    id: 'db.claim_fir_number',
    module: 'claims',
    widgetType: 'text_input',
    getScript: () => ({
      botMessages: ['Please enter the FIR number:'],
      placeholder: 'e.g., FIR-2026/0234',
      inputType: 'text' as const,
    }),
    processResponse: (response) => ({ dashboardClaimFirNumber: response }),
    getNextStep: () => 'db.claim_photos',
  },

  /* Step 11: Photos / evidence */
  {
    id: 'db.claim_photos',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: () => ({
      botMessages: [
        'Do you have photos of the damage? Clear photos speed up claim processing significantly.',
      ],
      options: [
        { id: 'yes', label: 'I have photos', description: 'Upload now or share later' },
        { id: 'later', label: 'I\'ll share later', description: 'Our team will follow up' },
        { id: 'no', label: 'No photos available' },
      ],
    }),
    processResponse: (response) => ({ dashboardClaimPhotos: response === 'yes' }),
    getNextStep: (response) => {
      if (response === 'yes') return 'db.claim_photos_ack';
      return 'db.claim_garage';
    },
  },

  /* Step 11a: Photo upload acknowledgement */
  {
    id: 'db.claim_photos_ack',
    module: 'claims',
    widgetType: 'none',
    getScript: () => ({
      botMessages: [
        'Our claims team will reach out via WhatsApp or email so you can share the photos. Having them ready will help expedite your claim.',
      ],
    }),
    processResponse: () => ({}),
    getNextStep: () => 'db.claim_garage',
  },

  /* Step 12: Garage selection */
  {
    id: 'db.claim_garage',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const isTheft = state.dashboardClaimIncidentType === 'theft';
      if (isTheft) {
        return {
          botMessages: ['Since this is a theft claim, we\'ll handle this directly. Let\'s move to the cost estimate.'],
          options: [{ id: 'skip', label: 'Continue' }],
        };
      }
      return {
        botMessages: [
          'Where would you like to get your vehicle repaired? Here are some network garages near you:',
        ],
        options: [
          ...NETWORK_GARAGES.map(g => ({ id: g.id, label: g.name, description: g.distance })),
          { id: 'other_garage', label: 'I have a preferred garage', description: 'Non-network garage' },
        ],
      };
    },
    processResponse: (response) => ({ dashboardClaimGarage: response }),
    getNextStep: () => 'db.claim_amount',
  },

  /* Step 13: Estimated amount */
  {
    id: 'db.claim_amount',
    module: 'claims',
    widgetType: 'number_input',
    getScript: (state) => {
      const isTheft = state.dashboardClaimIncidentType === 'theft';
      return {
        botMessages: [
          isTheft
            ? 'What is the estimated value of the stolen vehicle / parts?'
            : 'What is the estimated repair cost? (An approximate figure is fine — our surveyor will assess the exact amount.)',
        ],
        placeholder: 'Enter amount in ₹',
        inputType: 'number' as const,
      };
    },
    processResponse: (response) => ({ dashboardClaimAmount: String(response) }),
    getNextStep: () => 'db.claim_review',
  },

  /* Step 14: Review summary */
  {
    id: 'db.claim_review',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const typeLabel = state.dashboardClaimType === 'own_damage' ? 'Own Damage' : 'Third Party';
      const incidentLabel = INCIDENT_LABELS[state.dashboardClaimIncidentType] || state.dashboardClaimIncidentType;
      const garage = NETWORK_GARAGES.find(g => g.id === state.dashboardClaimGarage)?.name || state.dashboardClaimGarage || 'N/A';
      const injuryText = state.dashboardClaimInjury === true ? 'Yes' : state.dashboardClaimInjury === false ? 'No' : 'Not specified';
      const driverText = state.dashboardClaimWasDriverOwner === true ? 'Owner' : state.dashboardClaimWasDriverOwner === false ? 'Other person' : 'Not specified';
      const policeText = state.dashboardClaimPoliceReport === true ? `Yes (${state.dashboardClaimFirNumber || 'FIR number pending'})` : 'No';
      const otherVehicleText = state.dashboardClaimOtherVehicle === true ? `Yes — ${state.dashboardClaimOtherDriverInfo || 'Details pending'}` : 'No';
      const photosText = state.dashboardClaimPhotos === true ? 'Will be shared' : 'Not available';

      return {
        botMessages: [
          `Here's a summary of your claim:\n\nClaim Type: ${typeLabel}\nIncident: ${incidentLabel}\nLocation: ${state.dashboardClaimLocation}\nDate & Time: ${state.dashboardClaimDate}\nDescription: ${state.dashboardClaimDescription}\nInjuries: ${injuryText}\nDriver: ${driverText}\nOther Vehicle: ${otherVehicleText}\nPolice Report: ${policeText}\nPhotos: ${photosText}\nGarage: ${garage}\nEstimated Cost: ₹${Number(state.dashboardClaimAmount).toLocaleString()}`,
          'Does everything look correct?',
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

  /* Step 15: Submission confirmation */
  {
    id: 'db.claim_submitted',
    module: 'claims',
    widgetType: 'selection_cards',
    getScript: (state) => {
      const claimId = `MCL-${Math.floor(100000 + Math.random() * 900000)}`;
      const isOD = state.dashboardClaimType === 'own_damage';
      const isTheft = state.dashboardClaimIncidentType === 'theft';
      const hasInjury = state.dashboardClaimInjury === true;

      let nextSteps = '';
      if (isTheft) {
        nextSteps = '1. Claim registered — Done\n2. Police verification — In progress\n3. Investigation & assessment — Pending\n4. Settlement — Pending';
      } else if (isOD) {
        nextSteps = '1. Claim registered — Done\n2. Surveyor inspection — Scheduled within 24h\n3. Repair authorization — Pending\n4. Vehicle repaired — Pending\n5. Claim settled — Pending';
      } else {
        nextSteps = '1. Claim registered — Done\n2. Third-party verification — In progress\n3. Liability assessment — Pending\n4. Settlement processed — Pending';
      }

      const urgencyNote = hasInjury
        ? '\n\nSince injuries were reported, your claim has been marked as high priority.'
        : '';

      return {
        botMessages: [
          `Claim submitted successfully!\n\nClaim ID: ${claimId}\nExpected resolution: ${isTheft ? '7-10' : '3-5'} working days${urgencyNote}`,
          `What happens next:\n\n${nextSteps}\n\nWe will keep you updated via SMS and email at every step.`,
        ],
        options: [
          { id: 'track', label: 'Track This Claim', icon: 'clock' },
          { id: 'back', label: 'Back to Dashboard', icon: 'switch' },
        ],
      };
    },
    processResponse: (_response, state) => {
      const claimId = `MCL-${Math.floor(100000 + Math.random() * 900000)}`;
      const isOD = state.dashboardClaimType === 'own_damage';
      const isTheft = state.dashboardClaimIncidentType === 'theft';
      const hasInjury = state.dashboardClaimInjury === true;

      let status = isOD ? 'Surveyor inspection scheduled' : 'Under review';
      if (isTheft) status = 'Police verification in progress';
      if (hasInjury) status = 'High priority — Under review';

      return {
        dashboardSubmittedClaims: [
          ...state.dashboardSubmittedClaims,
          {
            id: claimId,
            type: (state.dashboardClaimType || 'own_damage') as 'own_damage' | 'third_party',
            incidentType: state.dashboardClaimIncidentType,
            location: state.dashboardClaimLocation,
            date: state.dashboardClaimDate,
            description: state.dashboardClaimDescription,
            injury: state.dashboardClaimInjury,
            policeReport: state.dashboardClaimPoliceReport,
            firNumber: state.dashboardClaimFirNumber,
            otherVehicle: state.dashboardClaimOtherVehicle,
            otherDriverInfo: state.dashboardClaimOtherDriverInfo,
            wasDriverOwner: state.dashboardClaimWasDriverOwner,
            photos: state.dashboardClaimPhotos,
            garage: state.dashboardClaimGarage,
            amount: state.dashboardClaimAmount,
            status,
            submittedAt: Date.now(),
          },
        ],
        dashboardClaimType: '' as 'own_damage' | 'third_party' | '',
        dashboardClaimIncidentType: '',
        dashboardClaimLocation: '',
        dashboardClaimDate: '',
        dashboardClaimDescription: '',
        dashboardClaimInjury: null,
        dashboardClaimPoliceReport: null,
        dashboardClaimFirNumber: '',
        dashboardClaimOtherVehicle: null,
        dashboardClaimOtherDriverInfo: '',
        dashboardClaimWasDriverOwner: null,
        dashboardClaimPhotos: null,
        dashboardClaimGarage: '',
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
