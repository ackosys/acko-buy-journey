/**
 * Health LOB Types — re-exports core types and defines Health-specific extensions.
 * All Health journey code should import from this file.
 */

// Re-export all core types for convenience
export type {
  Language,
  PaymentFrequency,
  Option,
  StepScript,
  ChatMessage,
  BaseJourneyState,
  BaseJourneyActions,
  LobType,
  LobConfig,
} from '../core/types';

// Re-export the original Health types (JourneyState, ConversationStep, etc.)
export type {
  PersonaType,
  Intent,
  CoverageStatus,
  PlanTier,
  Module,
  WidgetType,
  PostPaymentScenario,
  FamilyMember,
  ConversationStep,
  PlanDetails,
  JourneyState,
} from '../types';

export { INITIAL_STATE } from '../types';
