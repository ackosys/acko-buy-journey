'use client';

/**
 * Life Insurance Journey — Page orchestrator.
 * Flows: landing → language → chat (with optional expert/AI panels)
 * Mirrors Health journey page patterns.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLifeJourneyStore } from '../../lib/life/store';
import LanguageSelector from '../../components/LanguageSelector';
import LifeChatContainer from '../../components/life/LifeChatContainer';
import LifeLandingPage from '../../components/life/LifeLandingPage';
import LifeHeader from '../../components/life/LifeHeader';
import { LifeExpertPanel, LifeAIChatPanel } from '../../components/life/LifePanels';
import AckoLogo from '../../components/AckoLogo';

type Screen = 'landing' | 'language' | 'chat';

export default function LifeJourneyPage() {
  const store = useLifeJourneyStore();
  const { showExpertPanel, showAIChat, journeyComplete, paymentComplete } = store;
  const [screen, setScreen] = useState<Screen>('landing');
  const [hydrated, setHydrated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    setHydrated(true);
    // Reset journey on mount
    store.updateState({
      currentStepId: 'life_intro',
      conversationHistory: [],
      journeyComplete: false,
      paymentComplete: false,
      currentModule: 'basic_info',
    });
  }, []);

  const handleGetStarted = () => {
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      setScreen('chat');
      store.updateState({ currentStepId: 'life_intro' });
    }, 2500);
  };

  const handleLanguageSelect = () => {
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      setScreen('chat');
      store.updateState({ currentStepId: 'life_intro' });
    }, 2500);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #2A1463 50%, #1C0B47 100%)' }}>
        <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {/* Landing Page */}
      {screen === 'landing' && !showWelcome && (
        <LifeLandingPage key="landing" onGetStarted={handleGetStarted} />
      )}

      {/* Language Selection */}
      {screen === 'language' && !showWelcome && (
        <LanguageSelector key="lang" onSelect={handleLanguageSelect} />
      )}

      {/* Welcome Overlay */}
      {showWelcome && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #2A1463 50%, #1C0B47 100%)' }}
        >
          <div className="text-center px-8">
            {/* Animated shield */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400/30 to-purple-600/30 border border-purple-400/20 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-heading-lg font-bold text-white mb-2"
            >
              Let&apos;s find your right coverage
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-body-md text-purple-300/70"
            >
              Simple, transparent, no pressure.
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 w-48 mx-auto h-1 bg-white/10 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
              />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Main Chat Journey */}
      {screen === 'chat' && !showWelcome && (
        <motion.div
          key="chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen flex flex-col"
          style={{ background: 'linear-gradient(180deg, #1a0a3e 0%, #2A1463 40%, #1C0B47 100%)' }}
        >
          {/* Header with progress */}
          <LifeHeader />

          {/* Main Chat Container */}
          <div className="flex-1 flex relative overflow-hidden">
            <div className="flex-1 flex flex-col">
              <LifeChatContainer />
            </div>

            {/* Expert & AI Panels */}
            <AnimatePresence>
              {showExpertPanel && <LifeExpertPanel key="expert" />}
              {showAIChat && <LifeAIChatPanel key="ai" />}
            </AnimatePresence>
          </div>

          {/* Footer — shows when journey is complete */}
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
  );
}
