'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { LifeRider } from '../../lib/life/types';
import { useLifeJourneyStore } from '../../lib/life/store';
import { calculateRiderPremium, RIDER_PRICING } from '../../lib/life/pricing';

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

// Running Premium Summary
function RunningPremiumSummary({
  basePremium,
  accidentalPremium,
  criticalIllnessPremium,
}: {
  basePremium: number;
  accidentalPremium: number;
  criticalIllnessPremium: number;
}) {
  const total = basePremium + accidentalPremium + criticalIllnessPremium;

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-5 mt-4">
      <p className="text-xs text-white/60 mb-3">Premium Breakdown</p>
      
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/80">Base Premium</span>
          <span className="text-sm font-semibold text-white">{formatCurrency(basePremium)}/yr</span>
        </div>
        
        {accidentalPremium > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/80">Accidental Add-ons</span>
            <span className="text-sm font-semibold text-emerald-300">+{formatCurrency(accidentalPremium)}/yr</span>
          </div>
        )}
        
        {criticalIllnessPremium > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/80">Critical Illness</span>
            <span className="text-sm font-semibold text-emerald-300">+{formatCurrency(criticalIllnessPremium)}/yr</span>
          </div>
        )}
      </div>
      
      <div className="h-px bg-white/10 my-3" />
      
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-white">Total Premium</span>
        <span className="text-xl font-bold text-white">{formatCurrency(total)}/yr</span>
      </div>
      
      <p className="text-[10px] text-white/50 mt-2">
        ≈ {formatCurrency(Math.round(total / 12))}/month
      </p>
    </div>
  );
}

// Individual Rider Card
interface RiderCardProps {
  rider: LifeRider;
  isSelected: boolean;
  onToggle: () => void;
  onCoverageChange: (amount: number) => void;
  baseCoverage: number;
  disabled?: boolean;
}

function RiderCard({ rider, isSelected, onToggle, onCoverageChange, baseCoverage, disabled }: RiderCardProps) {
  const [showCoverageInput, setShowCoverageInput] = useState(false);
  
  // ACKO coverage options based on rider type
  const getCoverageOptions = () => {
    if (rider.id === 'disability') {
      return [1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 4500000, 5000000, 5500000, 6000000];
    } else if (rider.id === 'accidental_death') {
      return [1000000, 1500000, 2000000, 2500000, 3000000];
    } else if (rider.id === 'critical_illness') {
      return [500000, 600000, 700000, 800000, 900000, 1000000];
    }
    return [baseCoverage * 0.5, baseCoverage, baseCoverage * 2];
  };
  
  const coverageOptions = getCoverageOptions();

  const handleToggle = () => {
    if (disabled) return;
    if (!isSelected) {
      setShowCoverageInput(true);
    }
    onToggle();
  };

  const handleCoverageSelect = (amount: number) => {
    onCoverageChange(amount);
    setShowCoverageInput(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 border rounded-2xl p-4 transition-all ${
        disabled 
          ? 'opacity-50 border-white/5' 
          : isSelected 
            ? 'border-emerald-400 bg-emerald-400/5' 
            : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-semibold text-white">{rider.name}</h4>
            {rider.recommended && (
              <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-medium rounded-full">
                Recommended
              </span>
            )}
          </div>
          <p className="text-xs text-white/60 leading-relaxed">{rider.description}</p>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={`ml-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            disabled
              ? 'bg-white/5 text-white/30 cursor-not-allowed'
              : isSelected
                ? 'bg-emerald-400 text-gray-900'
                : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isSelected ? 'Added' : 'Add'}
        </button>
      </div>
      
      {rider.premium && rider.premium > 0 && (
        <p className="text-sm font-semibold text-emerald-300 mt-2">
          +{formatCurrency(rider.premium)}/yr
        </p>
      )}
      
      <AnimatePresence>
        {showCoverageInput && isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-white/10"
          >
            <p className="text-xs text-white/70 mb-2">Select coverage amount:</p>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {coverageOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleCoverageSelect(amount)}
                  className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-all"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main LifeRiderCards Component
export function LifeRiderCards({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const { quote, selectedRiders, updateState, age, smokingStatus } = useLifeJourneyStore();
  
  const basePremium = quote?.basePremium || 10000;
  const baseCoverage = quote?.sumAssured || 5000000;
  const accidentalLimit = basePremium * 0.3;
  const criticalIllnessLimit = basePremium;
  
  // Available riders - using real ACKO pricing
  const [riders, setRiders] = useState<LifeRider[]>([
    {
      id: 'accidental_death',
      name: 'Accidental Death Cover',
      description: 'Extra payout if death occurs due to an accident',
      coverageMultiplier: 2,
      premiumImpact: RIDER_PRICING.accidental_death.basePremiumPerLakh * 10,
      selected: false,
      isAccidental: true,
      category: 'accidental',
      maxCoverageMultiplier: 2,
      recommended: true,
      coverageAmount: 0,
      premium: 0,
    },
    {
      id: 'disability',
      name: 'Permanent Disability Cover',
      description: 'Waiver of premium if permanently disabled',
      coverageMultiplier: 1,
      premiumImpact: RIDER_PRICING.disability.basePremiumPerLakh * 10,
      selected: false,
      isAccidental: true,
      category: 'accidental',
      maxCoverageMultiplier: 1,
      recommended: false,
      coverageAmount: 0,
      premium: 0,
    },
    {
      id: 'critical_illness',
      name: 'Critical Illness Cover',
      description: 'Lump sum payout on diagnosis of major illnesses like cancer, heart attack, stroke',
      coverageMultiplier: 1,
      premiumImpact: RIDER_PRICING.critical_illness.basePremiumPerLakh * 10,
      selected: false,
      isAccidental: false,
      category: 'critical_illness',
      maxCoverageMultiplier: 1,
      recommended: true,
      coverageAmount: 0,
      premium: 0,
    },
  ]);
  
  const [hasAccidentalRiders, setHasAccidentalRiders] = useState(false);
  
  // Calculate totals
  const accidentalPremium = riders
    .filter(r => r.isAccidental && r.selected)
    .reduce((sum, r) => sum + (r.premium || 0), 0);
  
  const criticalIllnessPremium = riders
    .filter(r => !r.isAccidental && r.selected)
    .reduce((sum, r) => sum + (r.premium || 0), 0);
  
  const accidentalPercentage = (accidentalPremium / accidentalLimit) * 100;
  const isAccidentalOverLimit = accidentalPercentage >= 100;
  
  useEffect(() => {
    setHasAccidentalRiders(riders.some(r => r.isAccidental && r.selected));
  }, [riders]);
  
  const handleToggleRider = (riderId: string) => {
    setRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        const newSelected = !r.selected;
        
        // Get default coverage based on rider type
        const getDefaultCoverage = () => {
          if (r.id === 'disability') return 1000000; // ₹10L
          if (r.id === 'accidental_death') return 1000000; // ₹10L
          if (r.id === 'critical_illness') return 500000; // ₹5L
          return baseCoverage;
        };
        
        const defaultCoverage = getDefaultCoverage();
        
        // Calculate real premium using the pricing module
        const realPremium = newSelected 
          ? calculateRiderPremium(
              r.id as any,
              defaultCoverage,
              age || 30,
              smokingStatus || 'never'
            )
          : 0;
        
        return {
          ...r,
          selected: newSelected,
          coverageAmount: newSelected ? defaultCoverage : 0,
          premium: realPremium,
        };
      }
      return r;
    }));
  };
  
  const handleCoverageChange = (riderId: string, amount: number) => {
    setRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        // Calculate real premium using the pricing module
        const realPremium = calculateRiderPremium(
          r.id as any,
          amount,
          age || 30,
          smokingStatus || 'never'
        );
        
        return {
          ...r,
          coverageAmount: amount,
          premium: realPremium,
        };
      }
      return r;
    }));
  };
  
  const handleContinue = () => {
    const selected = riders.filter(r => r.selected);
    updateState({ 
      selectedRiders: selected,
      accidentalRidersPremium: accidentalPremium,
      accidentalPremiumLimit: accidentalLimit,
      accidentalLimitUsedPercent: accidentalPercentage,
      criticalIllnessPremiumLimit: criticalIllnessLimit,
    });
    onContinue();
  };
  
  const accidentalRiders = riders.filter(r => r.isAccidental);
  const criticalIllnessRiders = riders.filter(r => !r.isAccidental);

  return (
    <div className="w-full max-w-2xl mx-auto pb-6 space-y-4">
      {/* Accidental Protection Section */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Accidental Protection</h3>
        <div className="space-y-3">
          {accidentalRiders.map(rider => (
            <RiderCard
              key={rider.id}
              rider={rider}
              isSelected={rider.selected}
              onToggle={() => handleToggleRider(rider.id)}
              onCoverageChange={(amount) => handleCoverageChange(rider.id, amount)}
              baseCoverage={baseCoverage}
              disabled={isAccidentalOverLimit && !rider.selected}
            />
          ))}
        </div>
        
        {hasAccidentalRiders && (
          <AccidentalLimitProgressBar
            used={accidentalPremium}
            limit={accidentalLimit}
            percentage={accidentalPercentage}
          />
        )}
      </div>
      
      {/* Critical Illness Section */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Critical Illness Protection</h3>
        <div className="space-y-3">
          {criticalIllnessRiders.map(rider => (
            <RiderCard
              key={rider.id}
              rider={rider}
              isSelected={rider.selected}
              onToggle={() => handleToggleRider(rider.id)}
              onCoverageChange={(amount) => handleCoverageChange(rider.id, amount)}
              baseCoverage={baseCoverage}
            />
          ))}
        </div>
        
        {criticalIllnessPremium > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 mt-3">
            <p className="text-[10px] text-white/60">
              Critical illness cover can be up to {formatCurrency(criticalIllnessLimit)}/yr (100% of base premium)
            </p>
          </div>
        )}
      </div>
      
      {/* Premium Summary */}
      <RunningPremiumSummary
        basePremium={basePremium}
        accidentalPremium={accidentalPremium}
        criticalIllnessPremium={criticalIllnessPremium}
      />
      
      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={handleContinue}
          disabled={isAccidentalOverLimit}
          className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
            isAccidentalOverLimit
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-purple-700 text-white hover:bg-purple-600'
          }`}
        >
          {riders.some(r => r.selected) ? 'Continue with selected add-ons' : 'Continue without add-ons'}
        </button>
        
        {riders.some(r => r.selected) && (
          <button
            onClick={() => {
              setRiders(prev => prev.map(r => ({ ...r, selected: false, premium: 0, coverageAmount: 0 })));
            }}
            className="w-full py-3 text-white/70 hover:text-white text-sm transition-all"
          >
            Remove all add-ons
          </button>
        )}
      </div>
    </div>
  );
}
