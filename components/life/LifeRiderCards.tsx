'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { LifeRider, LifeJourneyState } from '../../lib/life/types';
import { useLifeJourneyStore } from '../../lib/life/store';

// Test component to verify file works
export function LifeRiderCards({
  onContinue,
}: {
  onContinue: () => void;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto pb-6">
      <p className="text-white">Rider Cards Component - Under Construction</p>
      <button
        onClick={onContinue}
        className="mt-4 w-full py-4 bg-white text-[#1C0B47] rounded-2xl text-base font-bold"
      >
        Continue
      </button>
    </div>
  );
}
