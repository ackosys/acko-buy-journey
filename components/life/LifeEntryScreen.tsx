'use client';

import { motion, AnimatePresence } from 'framer-motion';
import AckoLogo from '../AckoLogo';

type StepState = 'completed' | 'current' | 'upcoming';

function getStepState(stepIndex: number, completedStep: number): StepState {
  if (stepIndex < completedStep) return 'completed';
  if (stepIndex === completedStep) return 'current';
  return 'upcoming';
}

function StepIndicator({ stepNumber, state }: { stepNumber: number; state: StepState }) {
  if (state === 'completed') {
    return (
      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center border border-emerald-400">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    );
  }

  if (state === 'current') {
    return (
      <div className="w-7 h-7 rounded-full bg-white text-purple-700 text-xs font-bold flex items-center justify-center shadow-lg shadow-white/20">
        {stepNumber}
      </div>
    );
  }

  return (
    <div className="w-7 h-7 rounded-full bg-white/10 text-white/40 text-xs font-bold flex items-center justify-center border border-white/10">
      {stepNumber}
    </div>
  );
}

function StepBadge({ state }: { state: StepState }) {
  if (state === 'completed') {
    return (
      <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
        Done
      </span>
    );
  }
  if (state === 'current') {
    return (
      <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
        Start
      </span>
    );
  }
  return null;
}

interface LifeEntryScreenProps {
  completedStep?: number;
  onBuyJourney: (path: 'direct' | 'guided') => void;
  onJumpToEkyc?: () => void;
  onJumpToVerification?: () => void;
}

export default function LifeEntryScreen({ completedStep = 0, onBuyJourney, onJumpToEkyc, onJumpToVerification }: LifeEntryScreenProps) {
  const step1State = getStepState(0, completedStep);
  const step2State = getStepState(1, completedStep);
  const step3State = getStepState(2, completedStep);
  const step4State = getStepState(3, completedStep);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col px-6 pt-10 pb-8"
      style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #3a1d8e 30%, #6C4DE8 60%, #9b7bf7 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <AckoLogo variant="white" className="h-8" />
        <span className="text-[10px] bg-white/10 text-purple-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-white/15">
          Life Insurance
        </span>
      </div>

      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">

        {/* Step 1: Buy Life Insurance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`mb-8 transition-opacity duration-300 ${step1State === 'upcoming' ? 'opacity-35' : ''}`}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <StepIndicator stepNumber={1} state={step1State} />
            <h2 className="text-white text-lg font-semibold">Buy Life Insurance</h2>
            <StepBadge state={step1State} />
          </div>

          <AnimatePresence>
            {step1State !== 'completed' && (
              <motion.div
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-purple-200/70 text-sm mb-4 ml-10">Start a conversational journey to find the right term plan</p>
                <div className="flex gap-3 ml-10">
                  <button
                    onClick={step1State === 'current' ? () => onBuyJourney('direct') : undefined}
                    disabled={step1State !== 'current'}
                    className="flex-1 group bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-xl p-4 text-left transition-all active:scale-[0.97] disabled:pointer-events-none"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-2.5">
                      <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M12 2C6.477 2 2 6.477 2 12h4a6 6 0 0 1 12 0h4c0-5.523-4.477-10-10-10Z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 12v8c0 1.105-.895 2-2 2s-2-.895-2-2" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h3 className="text-white text-sm font-semibold mb-0.5">Get your term plan quote</h3>
                    <p className="text-purple-200/60 text-xs">Coverage calculator, plan selection & payment</p>
                  </button>
                  <button
                    onClick={step1State === 'current' ? () => onBuyJourney('guided') : undefined}
                    disabled={step1State !== 'current'}
                    className="flex-1 group bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-xl p-4 text-left transition-all active:scale-[0.97] disabled:pointer-events-none"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-2.5">
                      <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <h3 className="text-white text-sm font-semibold mb-0.5">Help me decide</h3>
                    <p className="text-purple-200/60 text-xs">We'll calculate the right coverage for you</p>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Step 2: e-KYC */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`mb-6 transition-opacity duration-300 ${step2State === 'upcoming' ? 'opacity-35' : ''}`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <StepIndicator stepNumber={2} state={step2State} />
            <h2 className={`text-white ${step2State === 'upcoming' ? 'text-base' : 'text-lg'} font-semibold`}>e-KYC Verification</h2>
            <StepBadge state={step2State} />
          </div>

          <AnimatePresence>
            {step2State !== 'completed' && (
              <motion.div
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                {step2State === 'current' ? (
                  <>
                    <p className="text-purple-200/70 text-sm mb-3 ml-10">Once you purchase life insurance, then you have to do e-KYC using Aadhaar</p>
                    <div className="ml-10 space-y-2">
                      <button
                        onClick={onJumpToEkyc}
                        className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium">Aadhaar based verification</p>
                        </div>
                        <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-purple-200/50 text-xs ml-10">Once you purchase life insurance, then you have to do e-KYC using Aadhaar</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Step 3: Income & Medical */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`mb-6 transition-opacity duration-300 ${step3State === 'upcoming' ? 'opacity-35' : ''}`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <StepIndicator stepNumber={3} state={step3State} />
            <h2 className={`text-white ${step3State === 'upcoming' ? 'text-base' : 'text-lg'} font-semibold`}>Income & Medical verification</h2>
            <StepBadge state={step3State} />
          </div>

          <AnimatePresence>
            {step3State !== 'completed' && (
              <motion.div
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                {step3State === 'current' ? (
                  <>
                    <p className="text-purple-200/70 text-sm mb-3 ml-10">Give income proof, video call with doctor and if required need to do medical tests</p>
                    <div className="ml-10 space-y-2">
                      <button
                        onClick={onJumpToVerification}
                        className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium">Income proof submission</p>
                          <p className="text-purple-200/50 text-[11px] mt-0.5">Salary slips, ITR, or bank statements</p>
                        </div>
                        <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={onJumpToVerification}
                        className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98] text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium">Tele-medical & health tests</p>
                          <p className="text-purple-200/50 text-[11px] mt-0.5">Video call with doctor, lab tests if needed</p>
                        </div>
                        <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-purple-200/50 text-xs ml-10">Give income proof, video call with doctor and if required need to do medical tests</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Step 4: Underwriting Decision */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className={`mb-8 transition-opacity duration-300 ${step4State === 'upcoming' ? 'opacity-35' : ''}`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <StepIndicator stepNumber={4} state={step4State} />
            <h2 className={`text-white ${step4State === 'upcoming' ? 'text-base' : 'text-lg'} font-semibold`}>Underwriting Decision</h2>
            <StepBadge state={step4State} />
          </div>

          <AnimatePresence>
            {step4State !== 'completed' && (
              <motion.div
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                {step4State === 'current' ? (
                  <>
                    <p className="text-purple-200/70 text-sm mb-3 ml-10">Final review and policy issuance</p>
                    <div className="ml-10">
                      <div
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 text-left opacity-80"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium">Underwriting decision</p>
                          <p className="text-purple-200/50 text-[11px] mt-0.5">Approval, modification, or refund</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-purple-200/50 text-xs ml-10">Approval, modification, or refund after review</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div className="mt-auto pt-6">
          <div className="flex items-center justify-center gap-3 text-[11px] text-purple-200/40">
            <span>IRDAI Licensed</span>
            <span className="w-px h-3 bg-white/15" />
            <span>₹100 Cr Max Coverage</span>
            <span className="w-px h-3 bg-white/15" />
            <span>100% Digital</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
