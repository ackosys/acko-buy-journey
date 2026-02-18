/**
 * Persona Framework — LOB-agnostic interface for persona resolution.
 * Each LOB implements its own PersonaConfig with domain-specific logic.
 */

import { Language } from './types';

/** Interface that each LOB's persona system must implement */
export interface PersonaConfig<TState, TPersona extends string = string> {
  /** Resolve persona from accumulated user signals */
  resolve: (state: TState) => TPersona;
  /** Display names for each persona */
  names: Record<TPersona, string>;
  /** Expert nudge message per persona */
  getExpertNudge: (persona: TPersona, language?: Language) => string;
  /** AI chat starter prompts per persona */
  getAIChatStarters: (persona: TPersona, language?: Language) => string[];
}
