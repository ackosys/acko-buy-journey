import { MotorConversationStep, MotorJourneyState } from './types';
import { getMotorDashboardStep } from './dashboardScripts';

/* ═══════════════════════════════════════════════════════════════════
   ACKO Motor Insurance — Conversational Scripts
   ─────────────────────────────────────────────────────────────────
   PRINCIPLES (aligned with Health LOB):
   1. Every question explains WHY we are asking — build trust
   2. Conversational acknowledgments between key steps
   3. No emojis in bot messages — only in option labels
   4. Short, single-purpose messages (one thought per message)
   5. Personalized responses using accumulated user context
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
      `Hi there, welcome to ACKO.`,
      `What would you like to insure today?`,
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
      `Happy to help! 😊`,
      `Are you looking to renew insurance for your current ${vLabel(state)}, or insure a brand-new one?`,
    ],
    options: [
      { id: 'yes', label: 'Renew / Switch insurance', description: `I already have a ${vLabel(state)}`, icon: 'document' },
      { id: 'no', label: `Insure my new ${vLabel(state)}`, description: `Just got a brand-new ${vLabel(state)}`, icon: 'star' },
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
      `Please enter your ${vLabel(state)}'s registration number.`,
    ],
    subText: `We will use this to fetch your vehicle and policy details from the government database.`,
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
      `We found your ${vLabel(state)}.`,
      `Please confirm these details are correct.`,
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
      `A brand new ${vLabel(state)} — that's exciting!`,
      `You can save up to Rs. 40,000 on your new ${vLabel(state)}'s on-road price by insuring with ACKO.`,
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
      `We could not fetch your ${vLabel(state)} details automatically.`,
      `No worries — I will help you enter them manually. This should only take a minute.`,
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
      `Which brand is your ${vLabel(state)}?`,
    ],
    subText: `We need your ${vLabel(state)} details to calculate the right premium.`,
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
      `What fuel type does your ${state.vehicleData.model} run on?`,
    ],
    subText: `Fuel type affects your premium calculation.`,
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
    if (state.vehicleEntryType === 'brand_new') return 'brand_new.commercial_check';
    return 'pre_quote.cng_check';
  },
};

/* ═══════════════════════════════════════════════
   MODULE: BRAND NEW VEHICLE — Purchase flow
   (matches ACKO new vehicle buy journey design)
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

const POPULAR_BIKES = [
  { id: 'hero_splendor', label: 'Hero Splendor Plus' },
  { id: 'honda_activa', label: 'Honda Activa 6G' },
  { id: 'bajaj_pulsar', label: 'Bajaj Pulsar NS200' },
  { id: 'tvs_apache', label: 'TVS Apache RTR 200' },
  { id: 'royal_enfield_classic', label: 'Royal Enfield Classic 350' },
  { id: 'yamaha_fz', label: 'Yamaha FZ-S' },
  { id: 'honda_shine', label: 'Honda Shine' },
  { id: 'tvs_jupiter', label: 'TVS Jupiter' },
  { id: 'royal_enfield_hunter', label: 'Royal Enfield Hunter 350' },
];

/* Step 1: Popular vehicle suggestions (car or bike) */
const brandNewPopularCars: MotorConversationStep = {
  id: 'brand_new.popular_cars',
  module: 'manual_entry',
  widgetType: 'selection_cards',
  getScript: (state) => {
    const isBike = state.vehicleType === 'bike';
    const popularList = isBike ? POPULAR_BIKES : POPULAR_CARS;
    return {
      botMessages: [
        `Let us start with the basics.`,
        `Which ${vLabel(state)} are you planning to buy?`,
      ],
      subText: `Select from popular models or search for yours.`,
      options: [
        ...popularList.map(c => ({ ...c, icon: isBike ? 'bike' : 'car' })),
        { id: 'other', label: 'Other — Select make & model', icon: 'search' },
      ],
    };
  },
  processResponse: (response, state) => {
    if (response === 'other') return {};
    const isBike = state.vehicleType === 'bike';
    const popularList = isBike ? POPULAR_BIKES : POPULAR_CARS;
    const vehicle = popularList.find(c => c.id === response);
    if (!vehicle) return {};
    const [make, ...modelParts] = vehicle.label.split(' ');
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
      `Got it, personal use.`,
      `When do you expect your ${state.vehicleData.make} ${state.vehicleData.model} to be delivered?`,
    ],
    subText: `This helps us time your policy start date correctly.`,
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
      `Thanks. Just a couple more details before we get your quotes.`,
      `What is your mobile number?`,
    ],
    subText: `We will share your quote and policy documents on this number.`,
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
    botMessages: [
      `And your current address pincode?`,
    ],
    subText: `Your pincode determines the Regional Transport Office (RTO) for your vehicle.`,
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
    const fuelLabel = v.fuelType ? v.fuelType.charAt(0).toUpperCase() + v.fuelType.slice(1) : '';
    return {
      botMessages: [
        `Here is a summary of your ${vLabel(state)} details.`,
        `${v.make} ${v.model} ${v.variant} — ${fuelLabel}`,
      ],
      subText: `Please review and confirm to see your insurance options.`,
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
      `Fetching the best plans for your ${state.vehicleData.make} ${state.vehicleData.model}...`,
    ],
  }),
  processResponse: () => ({}),
  getNextStep: () => 'quote.calculating',
};

/* ═══════════════════════════════════════════════
   MODULE: OWNER DETAILS — Post-addon, pre-payment
   (Brand new vehicle specific — engine/chassis, loan)
   ═══════════════════════════════════════════════ */

const ownerDetailsIntro: MotorConversationStep = {
  id: 'owner_details.intro',
  module: 'owner_details',
  widgetType: 'none',
  getScript: () => ({
    botMessages: [
      `Almost there. We need a few details about the vehicle owner to issue the policy.`,
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
    botMessages: [
      `What is the vehicle owner's full name?`,
    ],
    subText: `This should match the name on your RC (Registration Certificate).`,
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
    botMessages: [
      `And your email address?`,
    ],
    subText: `We will send your policy document and updates to this email.`,
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
  getScript: (state) => ({
    botMessages: [
      `What is your ${vLabel(state)}'s engine number?`,
    ],
    subText: `You can get this from your ${vLabel(state)} dealer or the vehicle invoice.`,
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
    botMessages: [
      `And the chassis number?`,
    ],
    subText: `Both the engine and chassis numbers are available on your vehicle invoice from the dealer.`,
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
    botMessages: [
      `Do you have a GST number?`,
    ],
    subText: `This is optional. If you are GST-registered, you can claim input tax credit on the premium.`,
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
  getScript: (state) => ({
    botMessages: [
      `Have you taken a ${vLabel(state)} loan for this vehicle?`,
    ],
    subText: `If yes, your lender will be added as a beneficiary on the policy. This is required by most banks and NBFCs.`,
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
      `One quick question before we build your quote.`,
      `Does your ${vLabel(state)} have an external CNG kit fitted?`,
    ],
    subText: `An external CNG kit needs to be covered separately in your insurance.`,
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
      `Is your ${vLabel(state)} used for personal or commercial purposes?`,
    ],
    subText: `Commercial vehicles (taxis, delivery, etc.) have different insurance requirements.`,
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
  getScript: () => ({
    botMessages: [
      `We are currently unable to cover commercial vehicles.`,
      `We are working to expand our coverage and will notify you when this changes.`,
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
      `What is the current status of your ${vLabel(state)} insurance?`,
    ],
    subText: `This determines which plans and No Claim Bonus discounts are available to you.`,
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
    const msgs: string[] = [`Good, your policy is still active.`];
    if (expiry) {
      msgs.push(`Your ${insurer} policy expires on ${expiry}.`);
    }
    msgs.push(`Have you made any claims in your current policy?`);
    return {
      botMessages: msgs,
      subText: `Your claim history affects the No Claim Bonus discount on your new policy.`,
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
  getScript: () => ({
    botMessages: [
      `What is your current No Claim Bonus (NCB) percentage?`,
    ],
    subText: `NCB is a discount you earn for each claim-free year. You can find this on your existing policy document. Incorrect NCB details may be adjusted during claims.`,
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
      `Great news — your NCB has increased.`,
      `We have applied a ${state.newNcbPercentage}% discount on your new premium as a reward for staying claim-free.`,
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
  getScript: () => ({
    botMessages: [
      `Understood, your policy has expired.`,
      `What type of policy did you have before?`,
    ],
    subText: `This helps us determine your renewal options and any applicable discounts.`,
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
  getScript: () => ({
    botMessages: [
      `Approximately when did your policy expire?`,
    ],
    subText: `If your policy expired more than 90 days ago, a vehicle inspection may be required.`,
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
  getScript: () => ({
    botMessages: [
      `Did you make any claims during your previous policy period?`,
    ],
    subText: `Your claim history determines your No Claim Bonus eligibility.`,
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
  getScript: () => ({
    botMessages: [
      `Who was your previous insurer?`,
    ],
    subText: `This is optional, but helps us process your policy transfer faster.`,
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
    return {
      botMessages: [
        `Here is a summary of your ${vLabel(state)} details.`,
        `Please review and confirm to see your insurance options.`,
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
        `Fetching the best insurance plans for your ${v.make} ${v.model}...`,
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
  getScript: () => ({
    botMessages: [
      `Fetching your personalized quotes...`,
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
    return {
      botMessages: [
        `We found the best plans for your ${v.make} ${v.model}.`,
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
  getScript: () => {
    return {
      botMessages: [
        `Choose a plan that fits your needs.`,
      ],
      subText: `All plans include 1 year Own Damage and 3 years Third-party coverage. You can add more protection with add-ons in the next step.`,
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
        `${planName} — good choice.`,
        `Now let us customise it with add-ons that suit your needs.`,
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
      `These add-ons reduce what you pay out of pocket during a claim.`,
    ],
    subText: `Select the ones that matter to you. You can add multiple.`,
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
          `You have selected ${totalAddons} add-on${totalAddons > 1 ? 's' : ''}.`,
          `Let us put together your final premium.`,
        ],
      };
    }
    return {
      botMessages: [
        `No add-ons selected — your base plan already provides solid coverage.`,
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
        `Processing your payment of Rs. ${Math.round(grandTotal).toLocaleString()}...`,
        `Payment successful.`,
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
        `Congratulations! Your ${vehicleName} is now insured with ACKO.`,
        `Your policy is active and you are fully covered on the road.`,
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
  }),
  getNextStep: (response) => {
    const choice = response?.choice || response;
    if (choice === 'dashboard') return 'db.welcome';
    return 'completion.download_confirm';
  },
};

const completionDownloadConfirm: MotorConversationStep = {
  id: 'completion.download_confirm',
  module: 'completion',
  widgetType: 'selection_cards',
  getScript: () => ({
    botMessages: [
      `Your policy document is being downloaded. You'll find it in your device's downloads folder.`,
      `Would you like to do anything else?`,
    ],
    options: [
      { id: 'dashboard', label: 'Go to Dashboard', icon: 'forward', description: 'View policy details & manage claims' },
      { id: 'done', label: 'I\'m all set', icon: 'check' },
    ],
  }),
  processResponse: () => ({}),
  getNextStep: (response) => {
    if (response === 'dashboard') return 'db.welcome';
    return 'completion.end';
  },
};

const completionEnd: MotorConversationStep = {
  id: 'completion.end',
  module: 'completion',
  widgetType: 'none',
  getScript: () => ({
    botMessages: [
      `You're all set! If you need anything, you can always come back to your dashboard. Drive safe!`,
    ],
  }),
  processResponse: () => ({
    journeyComplete: true,
  }),
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
  'completion.download_confirm': completionDownloadConfirm,
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
