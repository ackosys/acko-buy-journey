'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useMotorStore } from '../../../lib/motor/store';

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
      <div className="text-center mb-6">
        <h3 className="text-[18px] font-bold text-white mb-2">Your Final Premium</h3>
        <p className="text-[13px] text-[#94A3B8]">Complete breakdown of your {selectedPlan?.name || 'insurance plan'}</p>
      </div>

      <div className="bg-[#1E1E22] border border-[#A855F7]/20 rounded-2xl p-5">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/5">
          <div className="w-12 h-12 bg-[#2D2D35] rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-9M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-white">{vehicleData.make} {vehicleData.model}</p>
            <p className="text-[12px] text-[#94A3B8]">{vehicleData.variant} • {vehicleData.registrationYear}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-white">{selectedPlan?.name}</p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">{selectedPlan?.description}</p>
            </div>
            <p className="text-[14px] font-bold text-white ml-4">₹{basePremium.toLocaleString()}</p>
          </div>
          <div className="flex justify-between text-[12px] text-[#94A3B8]">
            <span>GST (18%)</span>
            <span>₹{gstOnBase.toLocaleString()}</span>
          </div>
        </div>

        {addons.length > 0 && (
          <div className="border-t border-white/5 pt-4 mb-4">
            <p className="text-[13px] font-semibold text-[#94A3B8] mb-3">Selected Add-ons ({addons.length})</p>
            {addons.map((addon: any, i: number) => (
              <div key={i} className="flex justify-between text-[12px] text-[#94A3B8] mb-2">
                <span>{addon.id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                <span>₹{addon.price.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-[12px] text-[#94A3B8] mt-2">
              <span>GST on add-ons (18%)</span>
              <span>₹{gstOnAddons.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="border-t-2 border-[#A855F7]/20 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-[15px] font-bold text-white">Total Premium</span>
            <span className="text-[24px] font-bold text-white">₹{grandTotal.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">For 1 year policy term</p>
        </div>
      </div>

      <div className="bg-[#1E1E22] rounded-xl p-4 border border-white/5">
        <p className="text-[12px] font-semibold text-[#94A3B8] mb-3">What's included:</p>
        <div className="space-y-2">
          {selectedPlan?.features.slice(0, 4).map((feature: string, i: number) => {
            const [title] = feature.split(' — ');
            return (
              <div key={i} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-[11px] text-[#94A3B8]">{title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-4 rounded-xl text-[15px] font-bold text-white hover:opacity-90 transition-opacity active:scale-[0.98] shadow-lg shadow-black/30"
        style={{ background: 'linear-gradient(135deg, #A855F7, #7E22CE)' }}
      >
        Proceed to Payment
      </button>
    </motion.div>
  );
}

// Motor Celebration Widget
export function MotorCelebration({ onContinue }: { onContinue?: () => void }) {
  const [confetti, setConfetti] = useState(true);

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
              style={{ backgroundColor: ['#A855F7', '#C084FC', '#22C55E', '#3B82F6', '#EC4899'][Math.floor(Math.random() * 5)] }}
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

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-[14px] text-[#94A3B8] mb-6 leading-relaxed">
          Your motor insurance is now active.<br />Welcome to ACKO!
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-[#1E1E22] rounded-xl p-4 border border-white/5">
          <p className="text-[12px] text-[#94A3B8] mb-2">Policy Number</p>
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
      <button onClick={() => onSelect('dashboard')} className="w-full p-4 bg-[#2D2D35] hover:bg-[#2D2D35] border border-white/8 hover:border-[#A855F7]/30 rounded-xl text-left transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#A855F7]/15 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-[#C084FC]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-white mb-0.5">Go to Dashboard</p>
            <p className="text-[11px] text-[#94A3B8]">View policy details & manage claims</p>
          </div>
          <svg className="w-5 h-5 text-[#64748B] group-hover:text-[#94A3B8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </button>

      <button onClick={() => onSelect('download')} className="w-full p-4 bg-[#2D2D35] hover:bg-[#2D2D35] border border-white/8 hover:border-[#A855F7]/30 rounded-xl text-left transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-white mb-0.5">Download Policy</p>
            <p className="text-[11px] text-[#94A3B8]">Get your policy document as PDF</p>
          </div>
          <svg className="w-5 h-5 text-[#64748B] group-hover:text-[#94A3B8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </button>
    </motion.div>
  );
}
