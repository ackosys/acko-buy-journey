'use client';

import { motion } from 'framer-motion';
import AckoLogo from '../AckoLogo';

interface LifeShowcaseScreenProps {
  onBuyJourney: (path: 'direct' | 'guided') => void;
  onJumpToEkyc?: () => void;
  onJumpToIncomeVerification?: () => void;
  onJumpToMedicalVerification?: () => void;
  onJumpToUnderwriting?: () => void;
  onJumpToClaims?: () => void;
}

export default function LifeShowcaseScreen({
  onBuyJourney,
  onJumpToEkyc,
  onJumpToIncomeVerification,
  onJumpToMedicalVerification,
  onJumpToUnderwriting,
  onJumpToClaims,
}: LifeShowcaseScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col px-6 pt-10 pb-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #3a1d8e 30%, #6C4DE8 60%, #9b7bf7 100%)' }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-400/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-10 relative z-10">
        <AckoLogo variant="white" className="h-8" />
        <span className="text-[10px] bg-white/10 text-purple-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-white/10">
          PROTOTYPE
        </span>
      </div>

      <div className="max-w-lg mx-auto w-full relative z-10 flex-1 flex flex-col">
        {/* ─── Section 1: Buy Life Insurance ─── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-full bg-white/15 text-white text-xs font-bold flex items-center justify-center border border-white/20">1</div>
            <h2 className="text-white text-lg font-semibold">Buy Life Insurance</h2>
          </div>
          <p className="text-purple-300/80 text-sm mb-4 ml-10">Start a conversational journey to find the right term plan</p>
          <div className="flex gap-3 ml-10">
            <button
              onClick={() => onBuyJourney('direct')}
              className="flex-1 group bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-xl p-4 text-left transition-all active:scale-[0.97]"
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-2.5">
                <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 2C6.477 2 2 6.477 2 12h4a6 6 0 0 1 12 0h4c0-5.523-4.477-10-10-10Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12v8c0 1.105-.895 2-2 2s-2-.895-2-2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-white text-sm font-semibold mb-0.5">I know my coverage</h3>
              <p className="text-purple-300/60 text-xs">Direct quote path</p>
            </button>
            <button
              onClick={() => onBuyJourney('guided')}
              className="flex-1 group bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-xl p-4 text-left transition-all active:scale-[0.97]"
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-2.5">
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-white text-sm font-semibold mb-0.5">Help me decide</h3>
              <p className="text-purple-300/60 text-xs">Guided calculation</p>
            </button>
          </div>
        </motion.div>

        {/* ─── Section 2: e-KYC Verification ─── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-full bg-white/15 text-white text-xs font-bold flex items-center justify-center border border-white/20">2</div>
            <h2 className="text-white text-lg font-semibold">e-KYC Verification</h2>
          </div>
          <p className="text-purple-300/80 text-sm mb-3 ml-10">Digital identity verification after payment</p>
          {onJumpToEkyc && (
            <div className="ml-10">
              <button
                onClick={onJumpToEkyc}
                className="w-full bg-white/6 hover:bg-white/12 border border-white/10 hover:border-white/25 rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">Aadhaar OTP verification</p>
                </div>
                <svg className="w-3.5 h-3.5 text-purple-400/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>

        {/* ─── Section 3: Income Verification ─── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-full bg-white/15 text-white text-xs font-bold flex items-center justify-center border border-white/20">3</div>
            <h2 className="text-white text-lg font-semibold">Income Verification</h2>
          </div>
          <p className="text-purple-300/80 text-sm mb-3 ml-10">Submit income proof for underwriting</p>
          {onJumpToIncomeVerification && (
            <div className="ml-10">
              <button
                onClick={onJumpToIncomeVerification}
                className="w-full bg-white/6 hover:bg-white/12 border border-white/10 hover:border-white/25 rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">Salary slips, ITR, or bank statements</p>
                </div>
                <svg className="w-3.5 h-3.5 text-purple-400/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>

        {/* ─── Section 4: Medical Verification ─── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-full bg-white/15 text-white text-xs font-bold flex items-center justify-center border border-white/20">4</div>
            <h2 className="text-white text-lg font-semibold">Medical Verification</h2>
          </div>
          <p className="text-purple-300/80 text-sm mb-3 ml-10">Tele-medical call and health tests if required</p>
          {onJumpToMedicalVerification && (
            <div className="ml-10">
              <button
                onClick={onJumpToMedicalVerification}
                className="w-full bg-white/6 hover:bg-white/12 border border-white/10 hover:border-white/25 rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">Video call with doctor & lab tests</p>
                </div>
                <svg className="w-3.5 h-3.5 text-purple-400/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>

        {/* ─── Section 5: Underwriting Decision ─── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-full bg-white/15 text-white text-xs font-bold flex items-center justify-center border border-white/20">5</div>
            <h2 className="text-white text-lg font-semibold">Underwriting Decision</h2>
          </div>
          <p className="text-purple-300/80 text-sm mb-3 ml-10">Final review and policy issuance scenarios</p>
          {onJumpToUnderwriting && (
            <div className="ml-10">
              <button
                onClick={onJumpToUnderwriting}
                className="w-full bg-white/6 hover:bg-white/12 border border-white/10 hover:border-white/25 rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">Approval / Rejection / Modification scenarios</p>
                </div>
                <svg className="w-3.5 h-3.5 text-purple-400/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>

        {/* ─── Section 6: Claims Experience ─── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-full bg-white/15 text-white text-xs font-bold flex items-center justify-center border border-white/20">6</div>
            <h2 className="text-white text-lg font-semibold">Claims Experience</h2>
          </div>
          <p className="text-purple-300/80 text-sm mb-3 ml-10">Policy holder dashboard and claims journey</p>
          {onJumpToClaims && (
            <div className="ml-10">
              <button
                onClick={onJumpToClaims}
                className="w-full bg-white/6 hover:bg-white/12 border border-white/10 hover:border-white/25 rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">Submit claim, track status & policy details</p>
                </div>
                <svg className="w-3.5 h-3.5 text-purple-400/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>

        {/* Trust badges at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-auto flex items-center justify-center gap-5 text-purple-400/70 text-xs pt-4"
        >
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            1.6 Cr+ Customers
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            IRDAI Licensed
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            100% Digital
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
