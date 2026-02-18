import { MotorConversationStep, MotorJourneyState } from './types';
import { getMotorDashboardStep } from './dashboardScripts';

/* ═══════════════════════════════════════════════════════════════════
   ACKO Motor Insurance — Conversational Scripts
   ─────────────────────────────────────────────────────────────────
   Flow: Vehicle Type → Reg Number (or Brand New fork) →
         Progressive Loading → Pre-Quote → Quote
   ═══════════════════════════════════════════════════════════════════ */

function vLabel(state: MotorJourneyState): string {
  return state.vehicleType === 'bike' ? 'bike' : 'car';
}

function vLabelCap(state: MotorJourneyState): string {
  return state.vehicleType === 'bike' ? 'Bike' : 'Car';
}

/* ═══════════════════════════════════════════════
   MODULE: VEHICLE TYPE — Car or Bike?
   ═══════════════════════════════════════════════ */

const vehicleTypeSelect: MotorConversationStep = {
  id: 'vehicle_type.select',
  module: 'vehicle_type',
  widgetType: 'selection_cards',
  getScript: () => ({
    botMessages: [
      "Welcome to ACKO Motor Insurance! 🚗\n\nLet's get your vehicle insured — quick, simple, and affordable.\n\nWhat would you like to insure?",
    ],
    options: [
      { id: 'car', label: 'Car', description: 'Hatchback, Sedan, SUV, etc.', icon: 'car' },
      { id: 'bike', label: 'Bike', description: 'Scooter, Motorcycle, etc.', icon: 'bike' },
    ],
  }),
  processResponse: (response) => ({
    vehicleType: response as 'car' | 'bike',
  }),
  getNextStep: () => 'registration.has_number',
};

/* ═══════════════════════════════════════════════
   MODULE: REGISTRATION — Do you have reg number?
   ═══════════════════════════════════════════════ */

const registrationHasNumber: MotorConversationStep = {
  id: 'registration.has_number',
  module: 'registration',
  widgetType: 'selection_cards',
  getScript: (state) => ({
    botMessages: [
      `Great choice! Let's find the best insurance for your ${vLabel(state)}.\n\nDo you have your vehicle registration number?`,
    ],
    options: [
      { id: 'yes', label: 'Yes, I have it', description: 'Enter your registration number', icon: 'document' },
      { id: 'no', label: 'No, brand new vehicle', description: `Just bought a new ${vLabel(state)}`, icon: 'star' },
    ],
  }),
  processResponse: (response) => ({
    vehicleEntryType: response === 'yes' ? 'existing' : 'brand_new',
  }),
  getNextStep: (response) => {
    if (response === 'yes') return 'registration.enter_number';
    return 'manual_entry.congratulations';
  },
};

/* ── Enter Registration Number ── */

const registrationEnterNumber: MotorConversationStep = {
  id: 'registration.enter_number',
  module: 'registration',
  widgetType: 'vehicle_reg_input',
  getScript: (state) => ({
    botMessages: [
      `Please enter your ${vLabel(state)}'s registration number`,
    ],
    placeholder: 'e.g. MH 04 EQ 4392',
    inputType: 'text',
  }),
  processResponse: (response) => ({
    registrationNumber: (response as string).toUpperCase().replace(/\s+/g, ''),
  }),
  getNextStep: () => 'vehicle_fetch.loading',
};

/* ═══════════════════════════════════════════════
   MODULE: VEHICLE FETCH — Progressive Loading
   ═══════════════════════════════════════════════ */

const vehicleFetchLoading: MotorConversationStep = {
  id: 'vehicle_fetch.loading',
  module: 'vehicle_fetch',
  widgetType: 'progressive_loader',
  getScript: (state) => ({
    botMessages: [
      `Looking up ${state.registrationNumber}...`,
    ],
  }),
  processResponse: (response) => {
    // response is 'success' or 'failed'
    if (response === 'success') {
      return {
        autoFetchSuccess: true,
        vehicleDataSource: 'auto_fetched',
        vehicleData: {
          make: 'Maruti',
          model: 'Swift Dzire',
          variant: 'LXI',
          fuelType: 'petrol' as const,
          registrationYear: 2020,
          registrationMonth: 'March',
          hasCngKit: null,
          isCommercialVehicle: null,
        },
        previousPolicy: {
          insurer: 'TATA AIG',
          expiryDate: '28/06/2024',
          policyType: 'comprehensive' as const,
          ncbPercentage: 35 as const,
          hadClaims: null,
        },
      };
    }
    return {
      autoFetchSuccess: false,
      vehicleDataSource: 'manual_entry',
    };
  },
  getNextStep: (response) => {
    if (response === 'success') return 'vehicle_fetch.found';
    return 'manual_entry.start';
  },
};

const vehicleFetchFound: MotorConversationStep = {
  id: 'vehicle_fetch.found',
  module: 'vehicle_fetch',
  widgetType: 'vehicle_details_card',
  getScript: (state) => ({
    botMessages: [
      `We found your ${vLabel(state)}!`,
    ],
  }),
  processResponse: () => ({}),
  getNextStep: () => 'pre_quote.cng_check',
};

/* ═══════════════════════════════════════════════
   MODULE: MANUAL ENTRY — When auto-fetch fails
   ═══════════════════════════════════════════════ */

const manualEntryCongratulations: MotorConversationStep = {
  id: 'manual_entry.congratulations',
  module: 'manual_entry',
  widgetType: 'none',
  getScript: (state) => ({
    botMessages: [
      `Getting a brand new ${vLabel(state)} from the dealership?\n\nSave up to ₹40,000 on your new ${vLabel(state)}'s on-road price. Let's insure it with ACKO!`,
    ],
  }),
  processResponse: () => ({}),
  getNextStep: () => 'brand_new.popular_cars',
};

const manualEntryStart: MotorConversationStep = {
  id: 'manual_entry.start',
  module: 'manual_entry',
  widgetType: 'none',
  getScript: (state) => ({
    botMessages: [
      `I'm having trouble fetching your ${vLabel(state)} details automatically.\n\nNo worries! I can help you enter them manually. This will just take a minute.`,
    ],
  }),
  processResponse: () => ({}),
  getNextStep: () => 'manual_entry.select_brand',
};

const manualEntrySelectBrand: MotorConversationStep = {
  id: 'manual_entry.select_brand',
  module: 'manual_entry',
  widgetType: 'brand_selector',
  getScript: (state) => ({
    botMessages: [
      `What brand is your ${vLabel(state)}?`,
    ],
  }),
  processResponse: (response) => ({
    vehicleData: {
      make: response,
      model: '',
      variant: '',
      fuelType: '' as const,
      registrationYear: null,
      registrationMonth: '',
      hasCngKit: null,
      isCommercialVehicle: null,
    },
  }),
  getNextStep: () => 'manual_entry.select_model',
};

const manualEntrySelectModel: MotorConversationStep = {
  id: 'manual_entry.select_model',
  module: 'manual_entry',
  widgetType: 'model_selector',
  getScript: (state) => ({
    botMessages: [
      `Which model of ${state.vehicleData.make}?`,
    ],
  }),
  processResponse: (response, state) => ({
    vehicleData: { ...state.vehicleData, model: response },
  }),
  getNextStep: () => 'manual_entry.select_fuel',
};

const manualEntrySelectFuel: MotorConversationStep = {
  id: 'manual_entry.select_fuel',
  module: 'manual_entry',
  widgetType: 'selection_cards',
  getScript: (state) => ({
    botMessages: [
      `What fuel type does your ${state.vehicleData.model} use?`,
    ],
    options: [
      { id: 'petrol', label: 'Petrol', icon: 'fuel' },
      { id: 'diesel', label: 'Diesel', icon: 'fuel' },
      { id: 'electric', label: 'Electric', icon: 'electric' },
      { id: 'cng', label: 'CNG', icon: 'fuel' },
    ],
  }),
  processResponse: (response, state) => ({
    vehicleData: { ...state.vehicleData, fuelType: response },
  }),
  getNextStep: () => 'manual_entry.select_variant',
};

const manualEntrySelectVariant: MotorConversationStep = {
  id: 'manual_entry.select_variant',
  module: 'manual_entry',
  widgetType: 'variant_selector',
  getScript: (state) => ({
    botMessages: [
      state.vehicleEntryType === 'brand_new'
        ? `Select your ${state.vehicleData.model} variant`
        : `Which ${state.vehicleData.model} variant do you drive?`,
    ],
  }),
  processResponse: (response, state) => ({
    vehicleData: {
      ...state.vehicleData,
      variant: response,
      ...(state.vehicleEntryType === 'brand_new' ? { registrationYear: new Date().getFullYear() } : {}),
    },
  }),
  getNextStep: (_, state) => {
    if (state.vehicleEntryType === 'brand_new') return 'brand_new.commercial_check';
    return 'manual_entry.select_year';
  },
};

const manualEntrySelectYear: MotorConversationStep = {
  id: 'manual_entry.select_year',
  module: 'manual_entry',
  widgetType: 'year_selector',
  getScript: (state) => {
    const isBrandNew = state.vehicleEntryType === 'brand_new';
    return {
      botMessages: [
        isBrandNew
          ? `What year is your ${vLabel(state)}?`
          : `When was your ${vLabel(state)} registered?`,
      ],
    };
  },
  processResponse: (response, state) => ({
    vehicleData: {
      ...state.vehicleData,
      registrationYear: parseInt(response),
    },
  }),
  getNextStep: (_, state) => {
    if (state.vehicleEntryType === 'brand_new') return 'brand_new.purchase_month';
    return 'pre_quote.cng_check';
  },
};

/* ═══════════════════════════════════════════════
   MODULE: BRAND NEW VEHICLE — Purchase flow
   (matches ACKO new car buy journey design)
   ═══════════════════════════════════════════════ */

const POPULAR_CARS = [
  { id: 'tata_nexon', label: 'TATA Nexon', description: '2020-2023' },
  { id: 'tata_punch', label: 'TATA Punch' },
  { id: 'mahindra_xuv700', label: 'Mahindra XUV 700' },
  { id: 'honda_city', label: 'Honda City' },
  { id: 'kia_carens', label: 'Kia Carens' },
  { id: 'hyundai_creta', label: 'Hyundai Creta' },
  { id: 'kia_seltos', label: 'Kia Seltos' },
  { id: 'tata_tiago', label: 'Tata Tiago' },
  { id: 'maruti_swift', label: 'Maruti Swift' },
];

/* Step 1: Popular car suggestions */
const brandNewPopularCars: MotorConversationStep = {
  id: 'brand_new.popular_cars',
  module: 'manual_entry',
  widgetType: 'selection_cards',
  getScript: (state) => ({
    botMessages: [
      `Which ${vLabel(state)} are you planning to buy?`,
    ],
    options: [
      ...POPULAR_CARS.map(c => ({ ...c, icon: 'car' })),
      { id: 'other', label: 'Other — Select make & model', icon: 'search' },
    ],
  }),
  processResponse: (response) => {
    if (response === 'other') return {};
    const car = POPULAR_CARS.find(c => c.id === response);
    if (!car) return {};
    const [make, ...modelParts] = car.label.split(' ');
    return {
      vehicleData: {
        make: make,
        model: modelParts.join(' '),
        variant: '',
        fuelType: '' as const,
        registrationYear: new Date().getFullYear(),
        registrationMonth: '',
        hasCngKit: null,
        isCommercialVehicle: null,
      },
    };
  },
  getNextStep: (response) => {
    if (response === 'other') return 'manual_entry.select_brand';
    return 'manual_entry.select_fuel';
  },
};

/* Step 2: Commercial vehicle check */
const brandNewCommercialCheck: MotorConversationStep = {
  id: 'brand_new.commercial_check',
  module: 'manual_entry',
  widgetType: 'selection_cards',
  getScript: () => ({
    botMessages: ['Is this a commercial vehicle?'],
    subText: 'Vehicle used as a taxi, to deliver goods, etc.',
    options: [
      { id: 'no', label: 'No, personal use', icon: 'user' },
      { id: 'yes', label: 'Yes, commercial', icon: 'building' },
    ],
  }),
  processResponse: (response, state) => ({
    vehicleData: { ...state.vehicleData, isCommercialVehicle: response === 'yes' },
  }),
  getNextStep: (response) => {
    if (response === 'yes') return 'pre_quote.commercial_rejection';
    return 'brand_new.delivery_date';
  },
};

/* Step 3: Delivery date */
const brandNewDeliveryDate: MotorConversationStep = {
  id: 'brand_new.delivery_date',
  module: 'manual_entry',
  widgetType: 'selection_cards',
  getScript: (state) => ({
    botMessages: [
      `When will your ${state.vehicleData.make} ${state.vehicleData.model} be delivered?`,
    ],
    options: [
      { id: 'today_tomorrow', label: 'Today or tomorrow', icon: 'check' },
      { id: 'next_1_week', label: 'In the next 1 week', icon: 'clock' },
      { id: 'next_2_weeks', label: 'In the next 2 weeks', icon: 'clock' },
      { id: 'not_sure', label: 'I am not sure yet', icon: 'help' },
    ],
  }),
  processResponse: (response) => ({ deliveryWindow: response }),
  getNextStep: () => 'brand_new.mobile_pincode',
};

/* Step 4: Mobile number */
const brandNewMobilePincode: MotorConversationStep = {
  id: 'brand_new.mobile_pincode',
  module: 'manual_entry',
  widgetType: 'text_input',
  getScript: () => ({
    botMessages: [
      `Just a few more details.\n\nWhat is your mobile number?`,
    ],
    subText: 'We will share quote and policy details.',
    placeholder: 'e.g., 9876543210',
    inputType: 'tel' as const,
  }),
  processResponse: (response) => ({ ownerMobile: response, phone: response }),
  getNextStep: () => 'brand_new.pincode',
};

/* Step 5: Pincode */
const brandNewPincode: MotorConversationStep = {
  id: 'brand_new.pincode',
  module: 'manual_entry',
  widgetType: 'text_input',
  getScript: () => ({
    botMessages: ['What is your current address pincode?'],
    placeholder: 'e.g., 560099',
    inputType: 'text' as const,
  }),
  processResponse: (response) => ({ pincode: response }),
  getNextStep: () => 'brand_new.summary',
};

/* Step 6: Summary + View plans */
const brandNewSummary: MotorConversationStep = {
  id: 'brand_new.summary',
  module: 'manual_entry',
  widgetType: 'editable_summary',
  getScript: (state) => {
    const v = state.vehicleData;
    return {
      botMessages: [
        `${v.make} ${v.model}\n${v.variant} • ${v.fuelType ? v.fuelType.charAt(0).toUpperCase() + v.fuelType.slice(1) : ''}\n\nLet me find the best plans for your brand new ${vLabel(state)}.`,
      ],
    };
  },
  processResponse: () => ({
    preQuoteComplete: true,
    policyStatus: null,
    vehicleDataSource: 'manual_entry' as const,
  }),
  getNextStep: () => 'brand_new.view_prices',
};

/* Step 7: Calculating plans */
const brandNewViewPrices: MotorConversationStep = {
  id: 'brand_new.view_prices',
  module: 'pre_quote',
  widgetType: 'none',
  getScript: (state) => ({
    botMessages: [
      `Calculating the best insurance plans for your brand new ${state.vehicleData.make} ${state.vehicleData.model}...`,
    ],
  }),
  processResponse: () => ({}),
  getNextStep: () => 'quote.calculating',
};

/* ═══════════════════════════════════════════════
   MODULE: OWNER DETAILS — Post-addon, pre-payment
   (Brand new car specific — engine/chassis, loan)
   ═══════════════════════════════════════════════ */

const ownerDetailsIntro: MotorConversationStep = {
  id: 'owner_details.intro',
  module: 'owner_details',
  widgetType: 'none',
  getScript: () => ({
    botMessages: [
      `Just a few more details to complete your policy.`,
    ],
  }),
  processResponse: () => ({}),
  getNextStep: () => 'owner_details.name',
};

const ownerDetailsName: MotorConversationStep = {
  id: 'owner_details.name',
  module: 'owner_details',
  widgetType: 'text_input',
  getScript: () => ({
    botMessages: [`Enter vehicle owner's full name`],
    placeholder: 'e.g., Bharath Kumar',
    inputType: 'text' as const,
  }),
  processResponse: (response) => ({ ownerName: response, userName: response }),
  getNextStep: () => 'owner_details.email',
};

const ownerDetailsEmail: MotorConversationStep = {
  id: 'owner_details.email',
  module: 'owner_details',
  widgetType: 'text_input',
  getScript: () => ({
    botMessages: ['What is your email address?'],
    placeholder: 'e.g., name@email.com',
    inputType: 'text' as const,
  }),
  processResponse: (response) => ({ ownerEmail: response }),
  getNextStep: (_, state) => {
    if (state.vehicleEntryType === 'brand_new') return 'owner_details.engine_number';
    return 'owner_details.loan_check';
  },
};

const ownerDetailsEngineNumber: MotorConversationStep = {
  id: 'owner_details.engine_number',
  module: 'owner_details',
  widgetType: 'text_input',
  getScript: () => ({
    botMessages: [`What is your car's engine number?`],
    subText: `You can get this from your car dealer.`,
    placeholder: 'e.g., 32IUYRQEWJHEJH',
    inputType: 'text' as const,
  }),
  processResponse: (response) => ({ engineNumber: response }),
  getNextStep: () => 'owner_details.chassis_number',
};

const ownerDetailsChassisNumber: MotorConversationStep = {
  id: 'owner_details.chassis_number',
  module: 'owner_details',
  widgetType: 'text_input',
  getScript: () => ({
    botMessages: ['And the chassis number?'],
    subText: `You can get your car's engine & chassis number from your car dealer.`,
    placeholder: 'e.g., QU983ER3FG63',
    inputType: 'text' as const,
  }),
  processResponse: (response) => ({ chassisNumber: response }),
  getNextStep: () => 'owner_details.gst',
};

const ownerDetailsGst: MotorConversationStep = {
  id: 'owner_details.gst',
  module: 'owner_details',
  widgetType: 'selection_cards',
  getScript: () => ({
    botMessages: ['Do you have a GST number? (Optional)'],
    options: [
      { id: 'skip', label: 'Skip — No GST number' },
      { id: 'enter', label: 'Yes, I have one' },
    ],
  }),
  processResponse: () => ({}),
  getNextStep: (response) => response === 'enter' ? 'owner_details.gst_input' : 'owner_details.loan_check',
};

const ownerDetailsGstInput: MotorConversationStep = {
  id: 'owner_details.gst_input',
  module: 'owner_details',
  widgetType: 'text_input',
  getScript: () => ({
    botMessages: ['Enter your GST number'],
    placeholder: 'e.g., 22AAAAA0000A1Z5',
    inputType: 'text' as const,
  }),
  processResponse: (response) => ({ gstNumber: response }),
  getNextStep: () => 'owner_details.loan_check',
};

const ownerDetailsLoanCheck: MotorConversationStep = {
  id: 'owner_details.loan_check',
  module: 'owner_details',
  widgetType: 'selection_cards',
  getScript: () => ({
    botMessages: ['Have you taken a car loan?'],
    subText: 'We need this information to help you better during claims.',
    options: [
      { id: 'no', label: 'No', icon: 'forward' },
      { id: 'yes', label: 'Yes', icon: 'document' },
    ],
  }),
  processResponse: (response) => ({ hasCarLoan: response === 'yes' }),
  getNextStep: (response) => response === 'yes' ? 'owner_details.loan_provider' : 'review.premium_breakdown',
};

const ownerDetailsLoanProvider: MotorConversationStep = {
  id: 'owner_details.loan_provider',
  module: 'owner_details',
  widgetType: 'text_input',
  getScript: () => ({
    botMessages: ['Enter your loan provider name'],
    placeholder: 'e.g., HDFC Bank, SBI, ICICI',
    inputType: 'text' as const,
  }),
  processResponse: (response) => ({ loanProvider: response }),
  getNextStep: () => 'review.premium_breakdown',
};

/* ═══════════════════════════════════════════════
   MODULE: PRE-QUOTE — Data collection for pricing
   ═══════════════════════════════════════════════ */

const preQuoteCngCheck: MotorConversationStep = {
  id: 'pre_quote.cng_check',
  module: 'pre_quote',
  widgetType: 'selection_cards',
  getScript: (state) => ({
    botMessages: [
      `Just one quick question to ensure you get the right coverage.\n\nDoes your ${vLabel(state)} have an external CNG kit?`,
    ],
    subText: `Any external CNG kit needs to be included in your insurance coverage.`,
    options: [
      { id: 'yes', label: 'Yes', icon: 'check' },
      { id: 'no', label: 'No', icon: 'forward' },
    ],
  }),
  processResponse: (response, state) => ({
    vehicleData: { ...state.vehicleData, hasCngKit: response === 'yes' },
  }),
  getNextStep: (_, state) => {
    // If auto-fetched, we already have policy data — go to commercial check
    if (state.vehicleDataSource === 'auto_fetched') {
      return 'pre_quote.commercial_check';
    }
    // Manual entry — need to check if insured
    return 'pre_quote.commercial_check';
  },
};

const preQuoteCommercialCheck: MotorConversationStep = {
  id: 'pre_quote.commercial_check',
  module: 'pre_quote',
  widgetType: 'selection_cards',
  getScript: (state) => ({
    botMessages: [
      `Is this a commercial vehicle?`,
    ],
    subText: 'Vehicle used as a taxi, to deliver goods, etc.',
    options: [
      { id: 'no', label: 'No, personal use', icon: 'user' },
      { id: 'yes', label: 'Yes, commercial', icon: 'building' },
    ],
  }),
  processResponse: (response, state) => ({
    vehicleData: { ...state.vehicleData, isCommercialVehicle: response === 'yes' },
  }),
  getNextStep: (response, state) => {
    if (response === 'yes') return 'pre_quote.commercial_rejection';
    // If auto-fetched with previous policy, ask about expiry status
    if (state.vehicleDataSource === 'auto_fetched') {
      return 'pre_quote.policy_status';
    }
    // Manual/brand new — ask if they have insurance
    return 'pre_quote.policy_status';
  },
};

const preQuoteCommercialRejection: MotorConversationStep = {
  id: 'pre_quote.commercial_rejection',
  module: 'pre_quote',
  widgetType: 'rejection_screen',
  getScript: (state) => ({
    botMessages: [
      `Unfortunately, we are unable to cover commercial vehicles at this time.\n\nWe are working hard to expand our coverage and will let you know when we're ready.`,
    ],
  }),
  processResponse: () => ({}),
  getNextStep: () => 'pre_quote.commercial_rejection', // dead end
};

/* ── Policy Status ── */

const preQuotePolicyStatus: MotorConversationStep = {
  id: 'pre_quote.policy_status',
  module: 'pre_quote',
  widgetType: 'selection_cards',
  getScript: (state) => ({
    botMessages: [
      `Has your ${vLabel(state)} insurance policy expired?`,
    ],
    options: [
      { id: 'no', label: 'No, it\'s still active', icon: 'shield' },
      { id: 'yes', label: 'Yes, it has expired', icon: 'clock' },
      { id: 'not_sure', label: 'Not sure', icon: 'help' },
    ],
  }),
  processResponse: (response) => ({
    policyStatus: response as 'active' | 'expired' | 'not_sure',
  }),
  getNextStep: (response) => {
    if (response === 'no') return 'pre_quote.claim_history';
    return 'pre_quote.expired_policy_type';
  },
};

/* ── Active Policy Path ── */

const preQuoteClaimHistory: MotorConversationStep = {
  id: 'pre_quote.claim_history',
  module: 'pre_quote',
  widgetType: 'selection_cards',
  getScript: (state) => {
    const insurer = state.previousPolicy.insurer || 'your insurer';
    const expiry = state.previousPolicy.expiryDate || '';
    const expiryMsg = expiry ? `\n\nCurrent policy: Your ${insurer} policy expiring ${expiry}` : '';
    return {
      botMessages: [
        `Have you made a claim in your current policy?${expiryMsg}`,
      ],
      options: [
        { id: 'no', label: 'No', description: 'No claims made', icon: 'check' },
        { id: 'yes', label: 'Yes', description: 'I made a claim', icon: 'document' },
      ],
    };
  },
  processResponse: (response, state) => ({
    previousPolicy: { ...state.previousPolicy, hadClaims: response === 'yes' },
  }),
  getNextStep: () => 'pre_quote.ncb_selection',
};

const preQuoteNcbSelection: MotorConversationStep = {
  id: 'pre_quote.ncb_selection',
  module: 'pre_quote',
  widgetType: 'ncb_selector',
  getScript: (state) => ({
    botMessages: [
      `Select your previous policy No Claim Bonus (NCB).\n\nNo Claim Bonus is a reward for good driving and not making any claims. You can check your NCB in your previous policy.`,
    ],
    subText: 'In case of incorrect NCB details, the discount amount will be adjusted during claims.',
  }),
  processResponse: (response, state) => {
    const ncb = parseInt(response) as 0 | 20 | 25 | 35 | 45 | 50;
    const oldNcb = state.previousPolicy.ncbPercentage;
    return {
      previousPolicy: { ...state.previousPolicy, ncbPercentage: ncb },
      newNcbPercentage: ncb,
      ncbIncreased: ncb > oldNcb,
    };
  },
  getNextStep: (_, state) => {
    // Check if NCB increased
    const ncb = parseInt(_) as number;
    const oldNcb = state.previousPolicy.ncbPercentage;
    if (ncb > oldNcb) return 'pre_quote.ncb_reward';
    return 'pre_quote.summary';
  },
};

const preQuoteNcbReward: MotorConversationStep = {
  id: 'pre_quote.ncb_reward',
  module: 'pre_quote',
  widgetType: 'ncb_reward',
  getScript: (state) => ({
    botMessages: [
      `Here's your reward for staying claim-free!\n\nWe've applied a ${state.newNcbPercentage}% discount to your new plan since your NCB has increased.`,
    ],
  }),
  processResponse: () => ({}),
  getNextStep: () => 'pre_quote.summary',
};

/* ── Expired Policy Path ── */

const preQuoteExpiredPolicyType: MotorConversationStep = {
  id: 'pre_quote.expired_policy_type',
  module: 'pre_quote',
  widgetType: 'selection_cards',
  getScript: (state) => ({
    botMessages: [
      `What was your previous policy type?`,
    ],
    options: [
      { id: 'comprehensive', label: 'Comprehensive', description: 'Covers own damage + third party', icon: 'shield' },
      { id: 'third_party', label: 'Third Party', description: 'Only covers damage to others', icon: 'shield_search' },
      { id: 'not_sure', label: 'Not sure', icon: 'help' },
    ],
  }),
  processResponse: (response, state) => ({
    expiredPolicyData: { ...state.expiredPolicyData, previousPolicyType: response },
  }),
  getNextStep: () => 'pre_quote.expiry_window',
};

const preQuoteExpiryWindow: MotorConversationStep = {
  id: 'pre_quote.expiry_window',
  module: 'pre_quote',
  widgetType: 'selection_cards',
  getScript: (state) => ({
    botMessages: [
      `Tell us approximately when it expired`,
    ],
    options: [
      { id: 'within_10_days', label: 'Within last 10 days', icon: 'clock' },
      { id: '10_to_90_days', label: '10–90 days ago', icon: 'clock' },
      { id: 'over_90_days', label: 'More than 90 days ago', icon: 'clock' },
    ],
  }),
  processResponse: (response, state) => ({
    expiredPolicyData: {
      ...state.expiredPolicyData,
      expiryWindow: response,
      requiresInspection: response === 'over_90_days',
      ncbAtRisk: response === 'over_90_days',
    },
  }),
  getNextStep: () => 'pre_quote.expired_claim_history',
};

const preQuoteExpiredClaimHistory: MotorConversationStep = {
  id: 'pre_quote.expired_claim_history',
  module: 'pre_quote',
  widgetType: 'selection_cards',
  getScript: (state) => ({
    botMessages: [
      `Have you made a claim in your previous policy?`,
    ],
    options: [
      { id: 'no', label: 'No', icon: 'check' },
      { id: 'yes', label: 'Yes', icon: 'document' },
    ],
  }),
  processResponse: (response, state) => ({
    expiredPolicyData: { ...state.expiredPolicyData, hadClaims: response === 'yes' },
  }),
  getNextStep: () => 'pre_quote.expired_insurer',
};

const preQuoteExpiredInsurer: MotorConversationStep = {
  id: 'pre_quote.expired_insurer',
  module: 'pre_quote',
  widgetType: 'insurer_selector',
  getScript: (state) => ({
    botMessages: [
      `Who was your previous insurer? (Optional)\n\nThis helps us process your policy faster.`,
    ],
    placeholder: 'Select or skip',
  }),
  processResponse: (response, state) => ({
    expiredPolicyData: { ...state.expiredPolicyData, previousInsurer: response || '' },
  }),
  getNextStep: () => 'pre_quote.summary',
};

/* ── Summary ── */

const preQuoteSummary: MotorConversationStep = {
  id: 'pre_quote.summary',
  module: 'pre_quote',
  widgetType: 'editable_summary',
  getScript: (state) => {
    const v = state.vehicleData;
    const reg = state.registrationNumber || 'New Vehicle';
    return {
      botMessages: [
        `Perfect! Here's a summary of your ${vLabel(state)} details.\n\nPlease review and confirm to see your insurance options.`,
      ],
    };
  },
  processResponse: () => ({
    preQuoteComplete: true,
  }),
  getNextStep: () => 'pre_quote.view_prices',
};

const preQuoteViewPrices: MotorConversationStep = {
  id: 'pre_quote.view_prices',
  module: 'pre_quote',
  widgetType: 'none',
  getScript: (state) => {
    const v = state.vehicleData;
    return {
      botMessages: [
        `Great! Calculating the best insurance plans for your ${v.make} ${v.model}...`,
      ],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'quote.calculating',
};

/* ═══════════════════════════════════════════════
   MODULE: QUOTE — Plan calculation & selection
   ═══════════════════════════════════════════════ */

const quoteCalculating: MotorConversationStep = {
  id: 'quote.calculating',
  module: 'quote',
  widgetType: 'plan_calculator',
  getScript: (state) => ({
    botMessages: [
      `Hold on, fetching your personalized quotes...`,
    ],
  }),
  processResponse: (response) => ({
    calculatingPlans: false,
    availablePlans: response.plans || [],
    idv: response.idv || 0,
    idvMin: response.idvMin || 0,
    idvMax: response.idvMax || 0,
  }),
  getNextStep: () => 'quote.plans_ready',
};

const quotePlansReady: MotorConversationStep = {
  id: 'quote.plans_ready',
  module: 'quote',
  widgetType: 'none',
  getScript: (state) => {
    const v = state.vehicleData;
    const vType = state.vehicleType === 'bike' ? 'bike' : 'car';
    return {
      botMessages: [
        `Perfect! I've found the best plans for your ${v.make} ${v.model}.\n\nLet me show you your options 👇`,
      ],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'quote.plan_selection',
};

const quotePlanSelection: MotorConversationStep = {
  id: 'quote.plan_selection',
  module: 'quote',
  widgetType: 'plan_selector',
  getScript: (state) => {
    const v = state.vehicleData;
    const isBrandNew = state.vehicleEntryType === 'brand_new';
    const age = v.registrationYear ? new Date().getFullYear() - v.registrationYear : 0;
    const carLabel = isBrandNew
      ? `your brand new ${v.make} ${v.model}`
      : `your ${age}-year-old ${v.make} ${v.model}`;
    return {
      botMessages: [
        `Select your plan\n\nAll plans include 1 year Own Damage and 3 years Third-party coverage.`,
      ],
      subText: 'Up next: Explore 14+ add-ons to enhance your coverage',
    };
  },
  processResponse: (response, state) => ({
    selectedPlanType: response.planType,
    selectedGarageTier: response.garageTier,
    selectedPlan: response.plan,
  }),
  getNextStep: (response) => {
    // After plan selection, go to add-ons
    return 'quote.plan_selected';
  },
};

const quotePlanSelected: MotorConversationStep = {
  id: 'quote.plan_selected',
  module: 'quote',
  widgetType: 'none',
  getScript: (state) => {
    const planName = state.selectedPlan?.name || 'plan';
    return {
      botMessages: [
        `Great choice! You've selected the ${planName}.\n\nNow let's customize it with add-ons that make sense for you.`,
      ],
    };
  },
  processResponse: () => ({}),
  getNextStep: (_, state) => {
    // Third-party plans only get protect_everyone addons
    if (state.selectedPlanType === 'third_party') {
      return 'addons.protect_everyone';
    }
    // Comprehensive and Zero Dep get all addons
    return 'addons.out_of_pocket';
  },
};

const addonsOutOfPocket: MotorConversationStep = {
  id: 'addons.out_of_pocket',
  module: 'addons',
  widgetType: 'out_of_pocket_addons',
  getScript: () => ({
    botMessages: [
      `Let's add some protection to reduce your out-of-pocket expenses.`,
    ],
  }),
  processResponse: (response) => ({
    selectedAddOns: response.addons || [],
  }),
  getNextStep: () => 'addons.protect_everyone',
};

const addonsProtectEveryone: MotorConversationStep = {
  id: 'addons.protect_everyone',
  module: 'addons',
  widgetType: 'protect_everyone_addons',
  getScript: () => ({
    botMessages: [],
  }),
  processResponse: (response, state) => {
    // The widget already merged addons, just pass through what it gives us
    return {
      selectedAddOns: response.addons || state.selectedAddOns || [],
    };
  },
  getNextStep: () => 'addons.complete',
};

const addonsComplete: MotorConversationStep = {
  id: 'addons.complete',
  module: 'addons',
  widgetType: 'none',
  getScript: (state) => {
    const totalAddons = (state.selectedAddOns as any[])?.length || 0;
    if (totalAddons > 0) {
      return {
        botMessages: [
          `Perfect! You've selected ${totalAddons} add-on${totalAddons > 1 ? 's' : ''}.`,
        ],
      };
    }
    return {
      botMessages: [
        `No worries! Your base plan provides great coverage.`,
      ],
    };
  },
  processResponse: () => ({}),
  getNextStep: (_, state) => {
    if (state.vehicleEntryType === 'brand_new') return 'owner_details.intro';
    return 'review.premium_breakdown';
  },
};

const reviewPremiumBreakdown: MotorConversationStep = {
  id: 'review.premium_breakdown',
  module: 'review',
  widgetType: 'premium_breakdown',
  getScript: () => ({
    botMessages: [],
  }),
  processResponse: () => ({}),
  getNextStep: () => 'payment.process',
};

const paymentProcess: MotorConversationStep = {
  id: 'payment.process',
  module: 'payment',
  widgetType: 'none',
  getScript: (state) => {
    const basePremium = state.selectedPlan?.totalPrice || 0;
    const addonPremium = (state.selectedAddOns as any[])?.reduce((sum: number, a: any) => sum + (a.price || 0) * 1.18, 0) || 0;
    const grandTotal = basePremium + addonPremium;
    return {
      botMessages: [
        `Initiating secure payment for ₹${Math.round(grandTotal).toLocaleString()}...\n\n✓ Payment successful!`,
      ],
    };
  },
  processResponse: () => ({ paymentComplete: true }),
  getNextStep: () => 'payment.success',
};

const paymentSuccess: MotorConversationStep = {
  id: 'payment.success',
  module: 'payment',
  widgetType: 'motor_celebration',
  getScript: (state) => {
    const vehicleName = `${state.vehicleData.make} ${state.vehicleData.model}`;
    return {
      botMessages: [
        `Congratulations! Your ${vehicleName} is now insured with ACKO.\n\nYour policy is active and you're fully protected on the road.`,
      ],
    };
  },
  processResponse: () => ({}),
  getNextStep: () => 'completion.dashboard',
};

const completionDashboard: MotorConversationStep = {
  id: 'completion.dashboard',
  module: 'completion',
  widgetType: 'dashboard_cta',
  getScript: () => ({
    botMessages: [
      `What would you like to do next?`,
    ],
  }),
  processResponse: (response) => ({
    paymentComplete: true,
    journeyComplete: response?.choice === 'download',
  }),
  getNextStep: (response) => {
    const choice = response?.choice || response;
    if (choice === 'dashboard') return 'db.welcome';
    return 'completion.end';
  },
};

const completionEnd: MotorConversationStep = {
  id: 'completion.end',
  module: 'completion',
  widgetType: 'none',
  getScript: () => ({
    botMessages: [],
  }),
  processResponse: () => ({}),
  getNextStep: () => 'completion.end',
};

/* ═══════════════════════════════════════════════
   STEP REGISTRY
   ═══════════════════════════════════════════════ */

const MOTOR_STEPS: Record<string, MotorConversationStep> = {
  'vehicle_type.select': vehicleTypeSelect,
  'registration.has_number': registrationHasNumber,
  'registration.enter_number': registrationEnterNumber,
  'vehicle_fetch.loading': vehicleFetchLoading,
  'vehicle_fetch.found': vehicleFetchFound,
  'manual_entry.congratulations': manualEntryCongratulations,
  'manual_entry.start': manualEntryStart,
  'manual_entry.select_brand': manualEntrySelectBrand,
  'manual_entry.select_model': manualEntrySelectModel,
  'manual_entry.select_fuel': manualEntrySelectFuel,
  'manual_entry.select_variant': manualEntrySelectVariant,
  'manual_entry.select_year': manualEntrySelectYear,
  'brand_new.popular_cars': brandNewPopularCars,
  'brand_new.commercial_check': brandNewCommercialCheck,
  'brand_new.delivery_date': brandNewDeliveryDate,
  'brand_new.mobile_pincode': brandNewMobilePincode,
  'brand_new.pincode': brandNewPincode,
  'brand_new.summary': brandNewSummary,
  'brand_new.view_prices': brandNewViewPrices,
  'owner_details.intro': ownerDetailsIntro,
  'owner_details.name': ownerDetailsName,
  'owner_details.email': ownerDetailsEmail,
  'owner_details.engine_number': ownerDetailsEngineNumber,
  'owner_details.chassis_number': ownerDetailsChassisNumber,
  'owner_details.gst': ownerDetailsGst,
  'owner_details.gst_input': ownerDetailsGstInput,
  'owner_details.loan_check': ownerDetailsLoanCheck,
  'owner_details.loan_provider': ownerDetailsLoanProvider,
  'pre_quote.cng_check': preQuoteCngCheck,
  'pre_quote.commercial_check': preQuoteCommercialCheck,
  'pre_quote.commercial_rejection': preQuoteCommercialRejection,
  'pre_quote.policy_status': preQuotePolicyStatus,
  'pre_quote.claim_history': preQuoteClaimHistory,
  'pre_quote.ncb_selection': preQuoteNcbSelection,
  'pre_quote.ncb_reward': preQuoteNcbReward,
  'pre_quote.expired_policy_type': preQuoteExpiredPolicyType,
  'pre_quote.expiry_window': preQuoteExpiryWindow,
  'pre_quote.expired_claim_history': preQuoteExpiredClaimHistory,
  'pre_quote.expired_insurer': preQuoteExpiredInsurer,
  'pre_quote.summary': preQuoteSummary,
  'pre_quote.view_prices': preQuoteViewPrices,
  'quote.calculating': quoteCalculating,
  'quote.plans_ready': quotePlansReady,
  'quote.plan_selection': quotePlanSelection,
  'quote.plan_selected': quotePlanSelected,
  'addons.out_of_pocket': addonsOutOfPocket,
  'addons.protect_everyone': addonsProtectEveryone,
  'addons.complete': addonsComplete,
  'review.premium_breakdown': reviewPremiumBreakdown,
  'payment.process': paymentProcess,
  'payment.success': paymentSuccess,
  'completion.dashboard': completionDashboard,
  'completion.end': completionEnd,
};

export function getMotorStep(stepId: string): MotorConversationStep | undefined {
  // Check dashboard steps first
  if (stepId.startsWith('db.')) {
    return getMotorDashboardStep(stepId);
  }
  // Then check regular motor steps
  return MOTOR_STEPS[stepId];
}
