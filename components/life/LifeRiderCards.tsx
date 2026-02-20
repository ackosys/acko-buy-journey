'use client';

/**
 * Life Insurance Rider Cards - Card-based modular rider selection
 * with real-time premium updates and business rule enforcement
 * 
 * Business Rules:
 * - Accidental riders: max 30% of base premium
 * - Critical illness: max 100% of base premium
 * - Real-time premium calculation
 * - Visual progress bar for accidental limit
 */

import { motion, AnimatePresence } from 'framer-motion';
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
  const isNearLimit = percentage > 79 && percentage < 100;
  const isOverLimit = percentage > 99;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-white/70">Accidental Protection Limit</p>
        <p className="text-xs font-semibold text-white">
          {formatCurrency(used)} of {formatCurrency(limit)}
        </p>
      </div>
      
      {/* Progress bar */}
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
          ? '⚠️ You've reached the maximum limit for accidental protection' 
          : isNearLimit 
            ? `${percentage.toFixed(0)}% used — approaching the 30% limit` 
            : `You can add accidental protection up to 30% of your base premium`}
      </p>
    </div>
  );
}

// Running Premium Summary
function RunningPremiumSummary({ 
  basePremium, 
  riders, 
  total 
}: { 
  basePremium: number; 
  riders: LifeRider[]; 
  total: number;
}) {
  const accidentalRiders = riders.filter(r => r.category === 'accidental' && r.selected);
  const ciRiders = riders.filter(r => r.category === 'critical_illness' && r.selected);
  
  const accidentalTotal = accidentalRiders.reduce((sum, r) => sum + (r.premium || 0), 0);
  const ciTotal = ciRiders.reduce((sum, r) => sum + (r.premium || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-4 mt-4"
    >
      <p className="text-xs text-white/60 uppercase tracking-wider mb-3 font-semibold">Your Plan Summary</p>
      
      <div className="space-y-2 mb-3 pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Base Premium</span>
          <span className="text-sm font-semibold text-white">{formatCurrency(basePremium)}</span>
        </div>
        
        {accidentalTotal > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Accidental Add-ons</span>
            <span className="text-sm font-semibold text-emerald-300">+{formatCurrency(accidentalTotal)}</span>
          </div>
        )}
        
        {ciTotal > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Critical Illness</span>
            <span className="text-sm font-semibold text-blue-300">+{formatCurrency(ciTotal)}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-white">Total Premium</span>
        <motion.span
          key={total}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-lg font-bold text-white"
        >
          {formatCurrency(total)}<span className="text-sm text-white/50">/year</span>
        </motion.span>
      </div>
      
      <p className="text-[10px] text-white/40 mt-2">
        ≈ {formatCurrency(Math.round(total / 12))}/month
      </p>
    </motion.div>
  );
}

// Individual Rider Card Component
function RiderCard({
  rider,
  basePremium,
  baseCoverage,
  onToggle,
  onCoverageChange,
  disabled,
  disabledReason,
}: {
  rider: LifeRider;
  basePremium: number;
  baseCoverage: number;
  onToggle: (riderId: string) => void;
  onCoverageChange: (riderId: string, amount: number) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [tempCoverage, setTempCoverage] = useState(rider.coverageAmount || baseCoverage);

  const coverageOptions = [
    { multiplier: 1, label: '1x Base', value: baseCoverage },
    { multiplier: 2, label: '2x Base', value: baseCoverage * 2 },
    { multiplier: 3, label: '3x Base', value: baseCoverage * 3 },
  ].filter(opt => !rider.maxCoverageMultiplier || opt.multiplier <= rider.maxCoverageMultiplier);

  const handleAdd = () => {
    if (disabled) return;
    onToggle(rider.id);
    if (!rider.selected) {
      setShowCustomize(true);
    }
  };

  const handleSaveCoverage = () => {
    onCoverageChange(rider.id, tempCoverage);
    setShowCustomize(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative bg-white/6 backdrop-blur-sm border rounded-2xl p-4 transition-all
        ${disabled 
          ? 'opacity-60 cursor-not-allowed border-white/5' 
          : rider.selected 
            ? 'border-purple-400/50 bg-purple-500/10 shadow-lg shadow-purple-900/20' 
            : 'border-white/10 hover:border-white/20 hover:bg-white/8'
        }
      `}
    >
      {/* Recommended Badge */}
      {rider.recommended && !rider.selected && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-400 text-[#1C0B47] text-[10px] font-bold rounded-full">
          RECOMMENDED
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${rider.selected ? 'bg-purple-500/20' : 'bg-white/10'}
        `}>
          {rider.category === 'accidental' ? (
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white mb-1">{rider.name}</h4>
          <p className="text-xs text-white/60 leading-relaxed">{rider.description}</p>
        </div>
      </div>

      {/* Premium & Action */}
      {!showCustomize ? (
        <div className="flex items-center justify-between gap-3 mt-4">
          <div className="flex-1">
            <p className="text-xs text-white/50">Starting from</p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(rider.premium || rider.premiumImpact * (baseCoverage / 100000))}
              <span className="text-xs text-white/50 font-normal">/month</span>
            </p>
          </div>
          
          {rider.selected ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomize(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-all border border-white/20"
              >
                Customize
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-all border border-white/20"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={disabled}
              className={`
                px-6 py-2 rounded-lg text-xs font-semibold transition-all
                ${disabled 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                  : 'bg-white text-[#1C0B47] hover:bg-white/90 active:scale-95'
                }
              `}
            >
              Add
            </button>
          )}
        </div>
      ) : (
        /* Coverage Customization */
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/70 mb-3 font-semibold">Choose coverage amount:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {coverageOptions.map((opt) => (
              <button
                key={opt.multiplier}
                onClick={() => setTempCoverage(opt.value)}
                className={`
                  p-3 rounded-lg border text-center transition-all
                  ${tempCoverage === opt.value
                    ? 'border-purple-400 bg-purple-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                  }
                `}
              >
                <p className="text-[10px] text-white/50 mb-1">{opt.label}</p>
                <p className="text-xs font-semibold">{formatCurrency(opt.value)}</p>
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCustomize(false);
                setTempCoverage(rider.coverageAmount || baseCoverage);
              }}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-lg transition-all border border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCoverage}
              className="flex-1 px-4 py-2 bg-white text-[#1C0B47] hover:bg-white/90 text-xs font-semibold rounded-lg transition-all"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Disabled Message */}
      {disabled && disabledReason && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-[10px] text-amber-300">⚠️ {disabledReason}</p>
        </div>
      )}
    </motion.div>
  );
}

// Main Rider Cards Widget
export function LifeRiderCards({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const store = useLifeJourneyStore();
  const state = store as unknown as LifeJourneyState;
  
  const basePremium = state.quote?.basePremium || 10000;
  const baseCoverage = state.selectedCoverage || 10000000;
  
  // Calculate premium limits
  const accidentalLimit = basePremium * 0.30; // 30% cap
  const criticalIllnessLimit = basePremium; // 100% cap
  
  // Initialize riders if not already set
  const [availableRiders, setAvailableRiders] = useState<LifeRider[]>([
    {
      id: 'accidental_death',
      name: 'Accidental Death Benefit Rider',
      description: 'Provides additional payout (up to 3x your base coverage) if death occurs due to an accident.',
      coverageMultiplier: 2,
      premiumImpact: 50,
      selected: false,
      category: 'accidental',
      isAccidental: true,
      coverageAmount: baseCoverage * 2,
      premium: 0,
      maxCoverageMultiplier: 3,
      recommended: true,
    },
    {
      id: 'critical_illness',
      name: 'Critical Illness Benefit Rider',
      description: 'Pays a lump sum if you\'re diagnosed with any of 21 critical illnesses (cancer, heart attack, stroke, etc.).',
      coverageMultiplier: 1,
      premiumImpact: 100,
      selected: false,
      category: 'critical_illness',
      isAccidental: false,
      coverageAmount: baseCoverage,
      premium: 0,
      maxCoverageMultiplier: 1,
    },
    {
      id: 'disability',
      name: 'Accidental Total Permanent Disability Rider',
      description: 'Provides financial support if an accident leaves you permanently disabled and unable to work.',
      coverageMultiplier: 1,
      premiumImpact: 75,
      selected: false,
      category: 'accidental',
      isAccidental: true,
      coverageAmount: baseCoverage,
      premium: 0,
      maxCoverageMultiplier: 1,
    },
  ]);
  
  // Calculate current accidental premium
  const accidentalRidersPremium = availableRiders
    .filter(r => r.isAccidental && r.selected)
    .reduce((sum, r) => sum + (r.premium || 0), 0);
  
  const accidentalLimitUsedPercent = (accidentalRidersPremium / accidentalLimit) * 100;
  
  // Calculate total premium
  const totalRidersPremium = availableRiders
    .filter(r => r.selected)
    .reduce((sum, r) => sum + (r.premium || 0), 0);
  
  const totalPremium = basePremium + totalRidersPremium;
  
  const handleToggleRider = (riderId: string) => {
    setAvailableRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        const newSelected = !r.selected;
        // Calculate premium if toggling on
        if (newSelected) {
          const premium = r.premiumImpact * ((r.coverageAmount || baseCoverage) / 100000);
          return { ...r, selected: newSelected, premium };
        }
        return { ...r, selected: newSelected, premium: 0 };
      }
      return r;
    }));
  };
  
  const handleCoverageChange = (riderId: string, amount: number) => {
    setAvailableRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        const premium = r.premiumImpact * (amount / 100000);
        return { ...r, coverageAmount: amount, premium };
      }
      return r;
    }));
  };
  
  const handleContinue = () => {
    const selectedRiders = availableRiders.filter(r => r.selected);
    store.updateState({ 
      selectedRiders,
      accidentalRidersPremium,
      accidentalPremiumLimit: accidentalLimit,
      accidentalLimitUsedPercent,
      criticalIllnessPremiumLimit: criticalIllnessLimit,
    });
    onContinue();
  };
  
  const hasAnySelected = availableRiders.some(r => r.selected);
  const accidentalRiders = availableRiders.filter(r => r.isAccidental);
  const ciRiders = availableRiders.filter(r => r.category === 'critical_illness');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto pb-6"
    >
      {/* Riders Grid */}
      <div className="space-y-4">
        {/* Accidental Section */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-3 px-1">Accidental Protection</h3>
          <div className="space-y-3">
            {accidentalRiders.map(rider => {
              const canAdd = accidentalLimitUsedPercent < 100 || rider.selected;
              return (
                <RiderCard
                  key={rider.id}
                  rider={rider}
                  basePremium={basePremium}
                  baseCoverage={baseCoverage}
                  onToggle={handleToggleRider}
                  onCoverageChange={handleCoverageChange}
                  disabled={!canAdd}
                  disabledReason={!canAdd ? 'You\'ve reached the 30% accidental protection limit' : undefined}
                />
              );
            })}
          </div>
          
          {/* Show progress bar if any accidental rider is selected */}
          {accidentalRidersPremium > 0 && (
            <AccidentalLimitProgressBar
              used={accidentalRidersPremium}
              limit={accidentalLimit}
              percentage={accidentalLimitUsedPercent}
            />
          )}
        </div>
        
        {/* Critical Illness Section */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-3 px-1">Critical Illness Protection</h3>
          <div className="space-y-3">
            {ciRiders.map(rider => (
              <RiderCard
                key={rider.id}
                rider={rider}
                basePremium={basePremium}
                baseCoverage={baseCoverage}
                onToggle={handleToggleRider}
                onCoverageChange={handleCoverageChange}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Running Summary */}
      <RunningPremiumSummary
        basePremium={basePremium}
        riders={availableRiders}
        total={totalPremium}
      />
      
      {/* Continue Buttons */}
      <div className="mt-6 space-y-3">
        <button
          onClick={handleContinue}
          className="w-full py-4 bg-white text-[#1C0B47] rounded-2xl text-base font-bold transition-all hover:bg-white/90 active:scale-[0.98]"
        >
          {hasAnySelected ? `Continue with selected add-ons` : 'Continue without add-ons'}
        </button>
        
        {hasAnySelected && (
          <button
            onClick={() => {
              setAvailableRiders(prev => prev.map(r => ({ ...r, selected: false, premium: 0 })));
            }}
            className="w-full py-3 bg-transparent text-white/60 rounded-2xl text-sm font-semibold transition-all hover:text-white/80"
          >
            Skip all add-ons
          </button>
        )}
      </div>
      
      <p className="text-[10px] text-white/40 text-center mt-4">
        You can modify or remove add-ons anytime before policy issuance
      </p>
    </motion.div>
  );
}
