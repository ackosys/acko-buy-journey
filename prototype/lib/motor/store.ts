'use client';

import { createJourneyStore } from '../core/createStore';
import { MotorJourneyState, MOTOR_INITIAL_STATE } from './types';

export const useMotorStore = createJourneyStore<MotorJourneyState>(
  MOTOR_INITIAL_STATE,
  undefined,
  undefined,
);
