/**
 * Life Insurance LOB Store — uses the core store factory.
 */

import { createJourneyStore } from '../core/createStore';
import { LIFE_INITIAL_STATE, LifeJourneyState } from './types';
import { resolveLifePersona, LIFE_PERSONA_TRIGGER_KEYS } from './personas';

// Create Life journey store using the factory
export const useLifeJourneyStore = createJourneyStore<LifeJourneyState>(
  LIFE_INITIAL_STATE,
  resolveLifePersona,
  LIFE_PERSONA_TRIGGER_KEYS,
);
