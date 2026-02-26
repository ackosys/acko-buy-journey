'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMotorStore } from '../../lib/motor/store';
import { useUserProfileStore } from '../../lib/userProfileStore';
import { assetPath } from '../../lib/assetPath';

const VEHICLE_IMAGES: Record<string, string> = {
  'Maruti Suzuki': '/car-images/Swift.png',
  'Hyundai': '/car-images/Venue.png',
  'Tata': '/car-images/Nexon.png',
  'Kia': '/car-images/Verna.png',
  'Mahindra': '/car-images/XUV700.png',
  'Toyota': '/car-images/Toyota.png',
  'Honda': '/car-images/Citroen.png',
  'MG': '/car-images/MG comet.png',
  'Volkswagen': '/car-images/Citroen.png',
  'Renault': '/car-images/Citroen.png',
  'BMW': '/car-images/harrier.png',
  'Hero': '/car-images/Splendor.png',
  'Bajaj': '/car-images/Pulsar.png',
  'TVS': '/car-images/CT 100.png',
  'Royal Enfield': '/car-images/KTM.png',
  'Yamaha': '/car-images/Pulsar.png',
};

// Premium Breakdown Widget
export function PremiumBreakdown({ onContinue }: { onContinue: () => void }) {
  const { selectedPlan, selectedAddOns = [], vehicleData } = useMotorStore();

  const basePremium = selectedPlan?.basePrice || 0;
  const gstOnBase = selectedPlan?.gst || 0;
  
  const addons = (selectedAddOns as any[]) || [];
  const addonTotal = addons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  const gstOnAddons = Math.round(addonTotal * 0.18);
  
  const grandTotal = basePremium + gstOnBase + addonTotal + gstOnAddons;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-white/10 border border-purple-400/40 rounded-2xl p-5" style={{ boxShadow: '0 4px 24px rgba(168, 85, 247, 0.12), 0 1px 4px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
            <Image
              src={assetPath(VEHICLE_IMAGES[vehicleData.make] || '/car-images/Swift.png')}
              alt={`${vehicleData.make} ${vehicleData.model}`}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-white">{vehicleData.make} {vehicleData.model}</p>
            <p className="text-[12px] text-white/50">{vehicleData.variant} • {vehicleData.registrationYear}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-white">{selectedPlan?.name}</p>
              <p className="text-[11px] text-white/50 mt-0.5">{selectedPlan?.description}</p>
            </div>
            <p className="text-[14px] font-bold text-white ml-4">₹{basePremium.toLocaleString()}</p>
          </div>
          <div className="flex justify-between text-[12px] text-white/60">
            <span>GST (18%)</span>
            <span>₹{gstOnBase.toLocaleString()}</span>
          </div>
        </div>

        {addons.length > 0 && (
          <div className="border-t border-white/10 pt-4 mb-4">
            <p className="text-[13px] font-semibold text-white/70 mb-3">Selected Add-ons ({addons.length})</p>
            {addons.map((addon: any, i: number) => (
              <div key={i} className="flex justify-between text-[12px] text-white/70 mb-2">
                <span>{addon.id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                <span>₹{addon.price.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-[12px] text-white/60 mt-2">
              <span>GST on add-ons (18%)</span>
              <span>₹{gstOnAddons.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="border-t-2 border-purple-400/30 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-[15px] font-bold text-white">Total Premium</span>
            <span className="text-[24px] font-bold text-white">₹{grandTotal.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">For 1 year policy term</p>
        </div>
      </div>

      <button onClick={onContinue} className="w-full py-4 rounded-xl text-[15px] font-semibold transition-colors active:scale-[0.97]" style={{ background: 'var(--motor-cta-bg)', color: 'var(--motor-cta-text)' }}>
        Proceed to Payment
      </button>
    </motion.div>
  );
}

// Motor Celebration Widget
export function MotorCelebration({ onContinue }: { onContinue?: () => void }) {
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    const motorState = useMotorStore.getState();
    const profileStore = useUserProfileStore.getState();
    const lob = motorState.vehicleType === 'bike' ? 'bike' as const : 'car' as const;
    const hasPolicy = profileStore.policies.some((p) => p.lob === lob && p.active);
    if (!hasPolicy) {
      const name = motorState.ownerName || (motorState as any).userName;
      if (name) {
        profileStore.setProfile({ firstName: name, isLoggedIn: true });
      }
      const vehicleName = `${motorState.vehicleData?.make || ''} ${motorState.vehicleData?.model || ''}`.trim();
      const planLabel = motorState.selectedPlanType === 'zero_dep' ? 'Zero Dep' : motorState.selectedPlanType === 'third_party' ? 'Third Party' : 'Comprehensive';
      profileStore.addPolicy({
        id: `${lob}_${Date.now()}`,
        lob,
        policyNumber: `ACKO-M-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        label: `${planLabel} ${lob === 'bike' ? 'Bike' : 'Car'} Insurance`,
        active: true,
        purchasedAt: new Date().toISOString(),
        premium: motorState.totalPremium || 0,
        premiumFrequency: 'yearly',
        details: `${vehicleName}${motorState.registrationNumber ? ' · ' + motorState.registrationNumber.toUpperCase() : ''}`,
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance after celebration
  useEffect(() => {
    if (onContinue) {
      const advanceTimer = setTimeout(() => {
        onContinue();
      }, 3500); // Advance after confetti ends
      return () => clearTimeout(advanceTimer);
    }
  }, [onContinue]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative py-8">
      {confetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 300, opacity: 1 }}
              animate={{ y: 600, opacity: 0, rotate: Math.random() * 720 }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'linear' }}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6'][Math.floor(Math.random() * 5)] }}
            />
          ))}
        </div>
      )}

      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-[22px] font-bold text-white mb-3">
          Payment Successful! 🎉
        </motion.h2>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-[14px] text-white/70 mb-6 leading-relaxed">
          Your motor insurance is now active.<br />Welcome to ACKO!
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-[12px] text-white/50 mb-2">Policy Number</p>
          <p className="text-[16px] font-bold text-white">ACKO/MOT/{Math.floor(Math.random() * 9000000 + 1000000)}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Dashboard CTA Widget
export function DashboardCTA({ onSelect }: { onSelect: (choice: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <button onClick={() => onSelect('dashboard')} className="w-full p-4 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-purple-400/50 rounded-xl text-left transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-white mb-0.5">Go to Dashboard</p>
            <p className="text-[11px] text-white/50">View policy details & manage claims</p>
          </div>
          <svg className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </button>

      <button onClick={() => onSelect('download')} className="w-full p-4 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-purple-400/50 rounded-xl text-left transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-white mb-0.5">Download Policy</p>
            <p className="text-[11px] text-white/50">Get your policy document as PDF</p>
          </div>
          <svg className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </button>
    </motion.div>
  );
}
