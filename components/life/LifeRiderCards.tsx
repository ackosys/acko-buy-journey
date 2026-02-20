'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { LifeRider, LifeJourneyState } from '../../lib/life/types';
import { useLifeJourneyStore } from '../../lib/life/store';

// Helper to format currency
function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Accidental Limit Progress Bar
function AccidentalLimitProgressBar({ 
  used, 
  limit, 
  percentage 
}: { 
  used: number; 
  limit: number; 
  percentage: number;
}) {
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-white/70">Accidental Protection Limit</p>
        <p className="text-xs font-semibold text-white">
          {formatCurrency(used)} of {formatCurrency(limit)}
        </p>
      </div>
      
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isOverLimit 
              ? 'bg-red-400' 
              : isNearLimit 
                ? 'bg-amber-400' 
                : 'bg-emerald-400'
          }`}
        />
      </div>
      
      <p className={`text-[10px] mt-2 ${
        isOverLimit 
          ? 'text-red-300' 
          : isNearLimit 
            ? 'text-amber-300' 
            : 'text-white/50'
      }`}>
        {isOverLimit 
          ? '⚠️ You have reached the maximum limit for accidental protection' 
          : isNearLimit 
            ? `${percentage.toFixed(0)}% used — approaching the 30% limit` 
            : `You can add accidental protection up to 30% of your base premium`}
      </p>
    </div>
  );
}

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
