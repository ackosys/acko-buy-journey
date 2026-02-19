'use client';

/**
 * Life Insurance Journey — Page orchestrator.
 * Flows: splash → landing → chat (with optional expert/AI panels)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLifeJourneyStore } from '../../lib/life/store';
import LifeChatContainer from '../../components/life/LifeChatContainer';
import LifeShowcaseScreen from '../../components/life/LifeShowcaseScreen';
import LifeEntryScreen from '../../components/life/LifeEntryScreen';
import LifeLandingPage from '../../components/life/LifeLandingPage';
import LifeHeader from '../../components/life/LifeHeader';
import { LifeExpertPanel, LifeAIChatPanel } from '../../components/life/LifePanels';
import AckoLogo from '../../components/AckoLogo';

type Screen = 'showcase' | 'entry' | 'landing' | 'chat';

/* ═══════════════════════════════════════════════
   Splash Screen — Auto-dismiss on entry
   ═══════════════════════════════════════════════ */
function LifeSplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #3a1d8e 30%, #6C4DE8 60%, #9b7bf7 100%)' }}
      onClick={onDone}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: [0, 0.6, 0.6, 0], y: [80, -400] }}
            transition={{ duration: 2.5 + Math.random() * 1.5, repeat: Infinity, delay: Math.random() * 1.5, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              bottom: 0,
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              background: ['#A78BFA', '#C4B5FD', '#7C3AED', '#DDD6FE', '#EDE9FE'][Math.floor(Math.random() * 5)],
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10 text-center px-6"
      >
        <AckoLogo variant="white" className="h-10 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">
          Life Insurance
        </h1>
        <p className="text-lg text-purple-200 mb-4">
          Simple, transparent, no pressure
        </p>
        <div className="flex items-center justify-center gap-3 mb-6">
          {/* Umbrella icon */}
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <svg className="w-10 h-10 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 2C6.477 2 2 6.477 2 12h4a6 6 0 0 1 12 0h4c0-5.523-4.477-10-10-10Z" fill="currentColor" opacity="0.3" stroke="none" />
              <path d="M12 2C6.477 2 2 6.477 2 12h4a6 6 0 0 1 12 0h4c0-5.523-4.477-10-10-10Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 12v8c0 1.105-.895 2-2 2s-2-.895-2-2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
        <div className="w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: 'linear' }}
            className="h-full bg-white/60 rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LifeJourneyPage() {
  const store = useLifeJourneyStore();
  const { showExpertPanel, showAIChat, journeyComplete, paymentComplete, ekycComplete, medicalComplete } = store as unknown as { showExpertPanel: boolean; showAIChat: boolean; journeyComplete: boolean; paymentComplete: boolean; ekycComplete: boolean; medicalComplete: boolean };

  const completedStep = paymentComplete
    ? (ekycComplete
      ? (medicalComplete ? 4 : 3)
      : 2)
    : (journeyComplete ? 1 : 0);
  const [screen, setScreen] = useState<Screen>('showcase');
  const [hydrated, setHydrated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setHydrated(true);
    store.updateState({
      currentStepId: 'life_intro',
      conversationHistory: [],
      journeyComplete: false,
      paymentComplete: false,
      ekycComplete: false,
      medicalComplete: false,
      userPath: '',
      currentModule: 'basic_info',
    });
  }, []);

  const dismissSplash = useCallback(() => setShowSplash(false), []);

  const handleBuyJourney = (path: 'direct' | 'guided') => {
    store.updateState({ userPath: path });
    setScreen('chat');
    store.updateState({ currentStepId: 'life_intro' });
  };

  const handleJumpToEkyc = () => {
    // TODO: Implement e-KYC jump
    console.log('Jump to e-KYC');
  };

  const handleJumpToIncomeVerification = () => {
    // TODO: Implement income verification jump
    console.log('Jump to Income Verification');
  };

  const handleJumpToMedicalVerification = () => {
    // TODO: Implement medical verification jump
    console.log('Jump to Medical Verification');
  };

  const handleJumpToUnderwriting = () => {
    // TODO: Implement underwriting jump
    console.log('Jump to Underwriting');
  };

  const handleJumpToClaims = () => {
    // TODO: Implement claims jump
    console.log('Jump to Claims');
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #2A1463 50%, #1C0B47 100%)' }}>
        <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <LifeSplashScreen key="splash" onDone={dismissSplash} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Showcase Screen — all journey options */}
        {screen === 'showcase' && !showSplash && (
          <LifeShowcaseScreen
            key="showcase"
            onBuyJourney={handleBuyJourney}
            onJumpToEkyc={handleJumpToEkyc}
            onJumpToIncomeVerification={handleJumpToIncomeVerification}
            onJumpToMedicalVerification={handleJumpToMedicalVerification}
            onJumpToUnderwriting={handleJumpToUnderwriting}
            onJumpToClaims={handleJumpToClaims}
          />
        )}

        {/* Entry Screen — stepper journey overview */}
        {screen === 'entry' && !showSplash && (
          <LifeEntryScreen
            key="entry"
            completedStep={completedStep}
            onBuyJourney={handleBuyJourney}
            onJumpToEkyc={() => setScreen('landing')}
            onJumpToVerification={() => setScreen('landing')}
          />
        )}

        {/* Landing Page */}
        {screen === 'landing' && (
          <LifeLandingPage key="landing" onGetStarted={handleBuyJourney} />
        )}

        {/* Main Chat Journey */}
        {screen === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
            style={{ background: 'linear-gradient(180deg, #1a0a3e 0%, #2A1463 40%, #1C0B47 100%)' }}
          >
            <LifeHeader />

            <div className="flex-1 flex relative overflow-hidden">
              <div className="flex-1 flex flex-col">
                <LifeChatContainer />
              </div>

              <AnimatePresence>
                {showExpertPanel && <LifeExpertPanel key="expert" />}
                {showAIChat && <LifeAIChatPanel key="ai" />}
              </AnimatePresence>
            </div>

            {journeyComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 text-center border-t border-white/10"
              >
                <AckoLogo variant="white" className="h-5 mx-auto mb-2 opacity-40" />
                <p className="text-[11px] text-white/30">
                  ACKO Life Insurance Ltd. | IRDAI Reg. No. 157
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
