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
  const { selectedPlan, selectedAddOns = [], vehicleData, idv, newNcbPercentage } = useMotorStore();

  const addons = (selectedAddOns as any[]) || [];
  const isThirdParty = selectedPlan?.type === 'third_party';
  const isZeroDep = selectedPlan?.type === 'zero_dep';

  const tpPremium: number = selectedPlan?.tpPremium || 0;
  const odPremium: number = selectedPlan?.odPremium || 0;
  const ncbDiscount: number = selectedPlan?.ncbDiscount || 0;
  const addonTotal: number = addons.reduce((sum: number, a: any) => sum + (a.price || 0), 0);
  const netPremium: number = selectedPlan?.basePrice || 0;
  const gst: number = Math.round((netPremium + addonTotal) * 0.18);
  const totalPremium: number = netPremium + addonTotal + gst;

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtIdv = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)} Lakh` : fmt(n);

  const Divider = () => (
    <div className="my-4" style={{ height: '1px', background: 'var(--motor-border)' }} />
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header — purple tinted, rounded top */}
      <div
        className="relative rounded-t-2xl px-4 pt-4 pb-5 overflow-hidden"
        style={{ background: 'var(--motor-selected-bg)', border: '1px solid var(--motor-border)', borderBottom: 'none' }}
      >
        <div className="pr-24">
          <p className="text-[16px] font-semibold" style={{ color: 'var(--motor-text)' }}>
            {vehicleData.make} {vehicleData.model}
          </p>
          <p className="text-[12px] mt-1 leading-snug" style={{ color: 'var(--motor-text-muted)' }}>
            {selectedPlan?.name}
            {vehicleData.variant ? ` · ${vehicleData.variant}` : ''}
          </p>
          {idv > 0 && (
            <p className="text-[12px] mt-1.5" style={{ color: 'var(--motor-text-muted)' }}>
              IDV :{' '}
              <span className="text-[14px] font-semibold" style={{ color: 'var(--motor-text)' }}>
                {fmtIdv(idv)}
              </span>
            </p>
          )}
        </div>
        <div className="absolute right-3 top-3 w-[80px] h-[60px]">
          <Image
            src={assetPath(VEHICLE_IMAGES[vehicleData.make] || '/car-images/Swift.png')}
            alt={vehicleData.model}
            width={80}
            height={60}
            className="object-contain w-full h-full"
          />
        </div>
      </div>

      {/* Body — detailed breakdown, rounded bottom */}
      <div
        className="rounded-b-2xl px-4 pt-4 pb-4"
        style={{ background: 'var(--motor-surface)', border: '1px solid var(--motor-border)', borderTop: 'none', boxShadow: '0px 4px 10px -2px rgba(54,53,76,0.08)' }}
      >
        {/* Base policy premium */}
        <p className="text-[14px] font-semibold mb-3" style={{ color: 'var(--motor-text)' }}>Base policy premium</p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[14px]">
            <span style={{ color: 'var(--motor-text-muted)' }}>Third-party (TP) premium</span>
            <span style={{ color: 'var(--motor-text-muted)' }}>{fmt(tpPremium)}</span>
          </div>
          {!isThirdParty && odPremium > 0 && (
            <div className="flex items-center justify-between text-[14px]">
              <span style={{ color: 'var(--motor-text-muted)' }}>
                {isZeroDep ? 'Zero Depreciation (ZD) premium' : 'Own Damage (OD) premium'}
              </span>
              <span style={{ color: 'var(--motor-text-muted)' }}>{fmt(odPremium)}</span>
            </div>
          )}
        </div>

        {/* Add-on premium */}
        {addons.length > 0 && (
          <>
            <Divider />
            <p className="text-[14px] font-semibold mb-3" style={{ color: 'var(--motor-text)' }}>Add-on premium</p>
            <div className="space-y-2.5">
              {addons.map((addon: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-[14px]">
                  <span style={{ color: 'var(--motor-text-muted)' }}>
                    {addon.id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                  <span style={{ color: 'var(--motor-text-muted)' }}>{fmt(addon.price)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Discounts */}
        {ncbDiscount > 0 && (
          <>
            <Divider />
            <p className="text-[14px] font-semibold mb-3" style={{ color: 'var(--motor-text)' }}>Discounts</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[14px]">
                <span style={{ color: 'var(--motor-text-muted)' }}>
                  NCB discount{newNcbPercentage ? ` (${newNcbPercentage}% of OD)` : ''}
                </span>
                <span className="font-medium" style={{ color: '#0FA457' }}>-{fmt(ncbDiscount)}</span>
              </div>
            </div>
          </>
        )}

        <Divider />

        {/* Net, GST, Total */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between text-[14px]">
            <span style={{ color: 'var(--motor-text-muted)' }}>Net Premium</span>
            <span style={{ color: 'var(--motor-text-muted)' }}>{fmt(netPremium)}</span>
          </div>
          <div className="flex items-center justify-between text-[14px]">
            <span style={{ color: 'var(--motor-text-muted)' }}>18% GST</span>
            <span style={{ color: 'var(--motor-text-muted)' }}>{fmt(gst)}</span>
          </div>
        </div>

        <Divider />

        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-semibold" style={{ color: 'var(--motor-text)' }}>
            Total{' '}
            <span className="text-[12px] font-normal" style={{ color: 'var(--motor-text-muted)' }}>(Including GST)</span>
          </p>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--motor-text)' }}>{fmt(totalPremium)}</p>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl text-[15px] font-semibold transition-all active:scale-[0.97]"
          style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', boxShadow: 'var(--btn-primary-shadow)' }}
        >
          Proceed to Payment
        </button>
      </div>
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
