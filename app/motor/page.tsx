'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotorStore } from '../../lib/motor/store';
import MotorEntryScreen from '../../components/motor/MotorEntryScreen';
import MotorHeader from '../../components/motor/MotorHeader';
import MotorChatContainer from '../../components/motor/MotorChatContainer';
import AckoLogo from '../../components/AckoLogo';
import { VehicleType, MotorJourneyState } from '../../lib/motor/types';

type Screen = 'entry' | 'chat';

/* ═══════════════════════════════════════════════
   Welcome Overlay — Auto-dismiss splash
   ═══════════════════════════════════════════════ */
function WelcomeOverlay({ onDone }: { onDone: () => void }) {
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
              background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6'][Math.floor(Math.random() * 5)],
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
          Motor Insurance
        </h1>
        <p className="text-lg text-purple-200 mb-4">
          Quick, simple, and affordable
        </p>
        <div className="flex items-center justify-center gap-3 mb-6">
          {/* Car icon */}
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <svg className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </motion.div>
          <span className="text-2xl text-white/40">&</span>
          {/* Bike icon */}
          <motion.div animate={{ x: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>
            <svg className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="5.5" cy="17" r="3" />
              <circle cx="18.5" cy="17" r="3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 6h2l3 8M5.5 17L10 9l3 3h4" />
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

export default function MotorJourney() {
  const { updateState, resetJourney } = useMotorStore();
  const [screen, setScreen] = useState<Screen>('entry');
  const [showWelcome, setShowWelcome] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    resetJourney();
    setHydrated(true);
  }, []);

  const dismissWelcome = useCallback(() => setShowWelcome(false), []);

  const handleVehicleSelect = (vehicleType: VehicleType) => {
    updateState({
      vehicleType,
      currentStepId: 'registration.has_number',
      currentModule: 'registration',
    } as Partial<MotorJourneyState>);
    setScreen('chat');
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showWelcome && screen === 'entry' && (
          <WelcomeOverlay key="welcome-overlay" onDone={dismissWelcome} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {screen === 'entry' && (
          <MotorEntryScreen key="entry" onSelect={handleVehicleSelect} />
        )}
        {screen === 'chat' && (
          <div key="chat" className="h-screen bg-[#1C0B47] flex flex-col overflow-hidden">
            <MotorHeader />
            <MotorChatContainer />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
