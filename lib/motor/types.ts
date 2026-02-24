/* ── Motor Insurance Journey Types ── */

import { BaseJourneyState, ChatMessage, Option } from '../core/types';

export type VehicleType = 'car' | 'bike';

export type VehicleEntryType = 'existing' | 'brand_new';

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric';

export type PolicyStatus = 'active' | 'expired' | 'not_sure';

export type PolicyType = 'comprehensive' | 'third_party' | 'not_sure';

export type ExpiryWindow = 'within_10_days' | '10_to_90_days' | 'over_90_days';

export type NcbPercentage = 0 | 20 | 25 | 35 | 45 | 50;

export type DeliveryWindow = 'today_tomorrow' | 'next_1_week' | 'next_2_weeks' | 'not_sure';

export type MotorModule =
  | 'entry'
  | 'vehicle_type'
  | 'registration'
  | 'vehicle_fetch'
  | 'manual_entry'
  | 'pre_quote'
  | 'quote'
  | 'addons'
  | 'owner_details'
  | 'review'
  | 'payment'
  | 'completion'
  | 'dashboard'
  | 'claims'
  | 'edit_policy';

export type MotorWidgetType =
  | 'selection_cards'
  | 'text_input'
  | 'number_input'
  | 'vehicle_reg_input'
  | 'progressive_loader'
  | 'vehicle_details_card'
  | 'brand_selector'
  | 'model_selector'
  | 'variant_selector'
  | 'fuel_selector'
  | 'year_selector'
  | 'ncb_selector'
  | 'insurer_selector'
  | 'editable_summary'
  | 'confirmation_dialog'
  | 'ncb_reward'
  | 'rejection_screen'
  | 'plan_calculator'
  | 'plan_selector'
  | 'plan_recommendation'
  | 'garage_tier_selector'
  | 'addon_selector'
  | 'out_of_pocket_addons'
  | 'protect_everyone_addons'
  | 'premium_breakdown'
  | 'motor_celebration'
  | 'dashboard_cta'
  | 'document_upload'
  /* ── Claims ── */
  | 'safety_condition_picker'
  | 'damage_photo_capture'
  | 'self_inspection'
  | 'surveyor_assigned'
  | 'settlement_offer'
  | 'garage_selector_claim'
  | 'reimbursement_upload'
  | 'claim_heartbeat'
  | 'claim_closure'
  | 'none';

export interface VehicleData {
  make: string;
  model: string;
  variant: string;
  fuelType: FuelType | '';
  registrationYear: number | null;
  registrationMonth: string;
  hasCngKit: boolean | null;
  isCommercialVehicle: boolean | null;
}

export interface PreviousPolicyData {
  insurer: string;
  expiryDate: string;
  policyType: PolicyType;
  ncbPercentage: NcbPercentage;
  hadClaims: boolean | null;
}

export interface ExpiredPolicyData {
  previousPolicyType: PolicyType;
  expiryWindow: ExpiryWindow;
  hadClaims: boolean | null;
  previousInsurer: string;
  requiresInspection: boolean;
  ncbAtRisk: boolean;
}

/* ── Dashboard: Claim Data (FNOL) ── */
export interface MotorClaim {
  id: string;
  type: 'own_damage_accident' | 'own_damage_theft' | 'own_damage_accessories' | 'third_party';
  date: string;
  seriousInjuries: boolean | null;
  wasDriverOwner: boolean | null;
  driverName: string;
  driverRelation: string;
  description: string;
  vehicleLocation: string;
  safeToDriver: boolean | null;
  needsTowing: boolean | null;
  rcUploaded?: boolean;
  dlUploaded?: boolean;
  status: string;
  submittedAt: number;
}

/* ── Dashboard: Edit Request ── */
export interface MotorEditRequest {
  id: string;
  type: string;
  summary: string;
  status: string;
  submittedAt: number;
}

export interface MotorJourneyState extends BaseJourneyState {
  /* ── Theme ── */
  theme: 'midnight' | 'dark' | 'light';

  /* ── Vehicle Type ── */
  vehicleType: VehicleType | null;

  /* ── Entry Method ── */
  vehicleEntryType: VehicleEntryType | null;

  /* ── Registration ── */
  registrationNumber: string;

  /* ── Vehicle Data (auto-fetched or manual) ── */
  vehicleDataSource: 'auto_fetched' | 'manual_entry' | null;
  autoFetchSuccess: boolean | null;
  vehicleData: VehicleData;

  /* ── Policy Status ── */
  policyStatus: PolicyStatus | null;

  /* ── Active Policy Data ── */
  previousPolicy: PreviousPolicyData;

  /* ── Expired Policy Data ── */
  expiredPolicyData: ExpiredPolicyData;

  /* ── Pre-Quote State ── */
  newNcbPercentage: NcbPercentage | null;
  ncbIncreased: boolean;
  preQuoteComplete: boolean;

  /* ── Existing Quote ── */
  hasExistingQuote: boolean;

  /* ── Brand New Vehicle ── */
  deliveryWindow: DeliveryWindow | '';
  pincode: string;
  ownerName: string;
  ownerEmail: string;
  ownerMobile: string;
  engineNumber: string;
  chassisNumber: string;
  gstNumber: string;
  hasCarLoan: boolean | null;
  loanProvider: string;

  /* ── Feedback ── */
  missingVehicleFeedback: string;

  /* ── Plan Selection ── */
  calculatingPlans: boolean;
  availablePlans: any[]; // MotorPlanDetails[] from plans.ts
  selectedPlanType: 'comprehensive' | 'zero_dep' | 'third_party' | null;
  selectedGarageTier: 'network' | 'all' | null;
  selectedPlan: any | null; // MotorPlanDetails
  selectedAddOns: string[];

  /* ── Help Me Choose ── */
  helpAnswers: Record<string, string>;
  recommendedPlanType: 'comprehensive' | 'zero_dep' | 'third_party' | null;
  recommendedPlanReason: string;
  
  /* ── Pricing ── */
  idv: number;
  idvMin: number;
  idvMax: number;
  odPremium: number;
  tpPremium: number;
  ncbDiscount: number;
  addOnPremium: number;
  netPremium: number;
  gst: number;
  totalPremium: number;

  /* ── Dashboard: Claims (FNOL) ── */
  dashboardSubmittedClaims: MotorClaim[];
  dashboardClaimType: 'own_damage_accident' | 'own_damage_theft' | 'own_damage_accessories' | 'third_party' | '';
  dashboardClaimSeriousInjuries: boolean | null;
  dashboardClaimDate: string;
  dashboardClaimWasDriverOwner: boolean | null;
  dashboardClaimDriverName: string;
  dashboardClaimDriverRelation: string;
  dashboardClaimDescription: string;
  dashboardClaimVehicleLocation: string;
  dashboardClaimSafeToDriver: boolean | null;
  dashboardClaimNeedsTowing: boolean | null;

  /* ── Dashboard: Document Uploads (Claims) ── */
  dashboardClaimRcUploaded: boolean;
  dashboardClaimDlUploaded: boolean;
  dashboardClaimPrevPolicyUploaded: boolean;
  dashboardClaimDamagePhotosUploaded: boolean;
  dashboardClaimFirUploaded: boolean;

  /* ── Dashboard: Extended FNOL ── */
  dashboardClaimDamagedParts: string[];
  dashboardClaimSafetyConditions: string[];

  /* ── Dashboard: Post-submission ── */
  dashboardClaimInspectionType: 'self' | 'surveyor' | null;
  dashboardClaimSettlementType: 'instant' | 'cashless' | 'reimbursement' | null;
  dashboardClaimSelectedGarage: string;
  dashboardClaimSettlementAmount: number;

  /* ── Dashboard: Edits ── */
  dashboardSubmittedEdits: MotorEditRequest[];
  dashboardEditType: string;

  /* ── Entry Intent ── */
  motorIntent: MotorIntent | null;
  ackoDriveSelectedCar: { make: string; model: string; variant: string } | null;
}

export type MotorIntent = 'renew' | 'new_car' | 'acko_drive' | 'manage';

export interface MotorStepScript {
  botMessages: string[];
  subText?: string;
  options?: Option[];
  placeholder?: string;
  inputType?: 'text' | 'number' | 'tel';
}

export interface MotorConversationStep {
  id: string;
  module: MotorModule;
  widgetType: MotorWidgetType;
  condition?: (state: MotorJourneyState) => boolean;
  getScript: (state: MotorJourneyState) => MotorStepScript;
  processResponse: (response: any, state: MotorJourneyState) => Partial<MotorJourneyState>;
  getNextStep: (response: any, state: MotorJourneyState) => string;
}

export const MOTOR_INITIAL_STATE: MotorJourneyState = {
  /* Base */
  language: 'en',
  userName: '',
  phone: '',
  currentStepId: 'vehicle_type.select',
  currentModule: 'vehicle_type',
  theme: 'midnight',
  conversationHistory: [],
  isTyping: false,
  showExpertPanel: false,
  showAIChat: false,
  journeyComplete: false,
  paymentComplete: false,
  paymentFrequency: 'yearly',
  resolvedPersona: 'default',

  /* Motor-specific */
  vehicleType: null,
  vehicleEntryType: null,
  registrationNumber: '',
  vehicleDataSource: null,
  autoFetchSuccess: null,
  vehicleData: {
    make: '',
    model: '',
    variant: '',
    fuelType: '',
    registrationYear: null,
    registrationMonth: '',
    hasCngKit: null,
    isCommercialVehicle: null,
  },
  policyStatus: null,
  previousPolicy: {
    insurer: '',
    expiryDate: '',
    policyType: 'not_sure',
    ncbPercentage: 0,
    hadClaims: null,
  },
  expiredPolicyData: {
    previousPolicyType: 'not_sure',
    expiryWindow: 'within_10_days',
    hadClaims: null,
    previousInsurer: '',
    requiresInspection: false,
    ncbAtRisk: false,
  },
  newNcbPercentage: null,
  ncbIncreased: false,
  preQuoteComplete: false,
  hasExistingQuote: false,
  deliveryWindow: '',
  pincode: '',
  ownerName: '',
  ownerEmail: '',
  ownerMobile: '',
  engineNumber: '',
  chassisNumber: '',
  gstNumber: '',
  hasCarLoan: null,
  loanProvider: '',
  missingVehicleFeedback: '',
  
  /* Plan Selection */
  calculatingPlans: false,
  availablePlans: [],
  selectedPlanType: null,
  selectedGarageTier: null,
  selectedPlan: null,
  selectedAddOns: [],

  /* Help Me Choose */
  helpAnswers: {},
  recommendedPlanType: null,
  recommendedPlanReason: '',
  
  /* Pricing */
  idv: 0,
  idvMin: 0,
  idvMax: 0,
  odPremium: 0,
  tpPremium: 0,
  ncbDiscount: 0,
  addOnPremium: 0,
  netPremium: 0,
  gst: 0,
  totalPremium: 0,

  /* Dashboard */
  dashboardSubmittedClaims: [],
  dashboardClaimType: '',
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
  dashboardClaimFirUploaded: false,
  dashboardClaimDamagedParts: [],
  dashboardClaimSafetyConditions: [],
  dashboardClaimInspectionType: null,
  dashboardClaimSettlementType: null,
  dashboardClaimSelectedGarage: '',
  dashboardClaimSettlementAmount: 0,
  dashboardSubmittedEdits: [],
  dashboardEditType: '',

  /* Entry intent */
  motorIntent: null,
  ackoDriveSelectedCar: null,
};
