'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useJourneyStore } from '../lib/store';
import LanguageSelector from '../components/LanguageSelector';
import GlobalHero from '../components/global/GlobalHero';
import LobSelector from '../components/global/LobSelector';
import TrustBadges from '../components/global/TrustBadges';
import ValueProps from '../components/global/ValueProps';
import { LobConfig } from '../lib/core/types';

/* ── LOB Configuration ── */
const LOBS: LobConfig[] = [
  {
    id: 'car',
    label: 'Car Insurance',
    tagline: 'Comprehensive cover for your car',
    description: 'Instant policy. Hassle-free claims.',
    icon: 'car',
    active: true,
    route: '/motor',
  },
  {
    id: 'bike',
    label: 'Bike Insurance',
    tagline: 'Comprehensive cover for your bike',
    description: 'Instant policy. Hassle-free claims.',
    icon: 'bike',
    active: true,
    route: '/motor',
  },
  {
    id: 'health',
    label: 'Health Insurance',
    tagline: 'Cover for hospitalisation, surgeries & more',
    description: 'Plans from ₹436/month. 14,000+ cashless hospitals.',
    icon: 'health',
    active: true,
    route: '/health',
  },
  {
    id: 'life',
    label: 'Life Insurance',
    tagline: 'Financial security for your family',
    description: 'Term plans starting ₹490/month.',
    icon: 'life',
    active: true,
    route: '/life',
  },
];

type Screen = 'language' | 'home';

export default function GlobalHomepage() {
  const router = useRouter();
  const { setLanguage } = useJourneyStore();
  const userName = useJourneyStore(s => s.userName);
  const [screen, setScreen] = useState<Screen>('language');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const langChosen = localStorage.getItem('acko_lang_chosen');
    if (langChosen) {
      setScreen('home');
    }
  }, []);

  const handleLobSelect = (lob: LobConfig) => {
    if (lob.active) {
      router.push(lob.route);
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #3a1d8e 30%, #6C4DE8 60%, #9b7bf7 100%)' }}>
        <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {/* Language Selection — shown only once */}
      {screen === 'language' && (
        <LanguageSelector key="lang" onSelect={() => {
          localStorage.setItem('acko_lang_chosen', 'true');
          setScreen('home');
        }} />
      )}

      {/* Global Entry Homepage */}
      {screen === 'home' && (
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen"
          style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #3a1d8e 30%, #6C4DE8 60%, #9b7bf7 100%)' }}
        >
          <div className="relative z-10 max-w-lg mx-auto pb-16">
            {/* Hero Section */}
            <GlobalHero userName={userName || undefined} />

            {/* LOB Selector */}
            <div className="px-6 mb-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-purple-200/70 mb-4 font-medium"
              >
                Choose insurance type
              </motion.p>
              <LobSelector lobs={LOBS} onSelect={handleLobSelect} />
            </div>

            {/* Trust Badges */}
            <div className="px-6 mb-10">
              <TrustBadges />
            </div>

            {/* Value Props */}
            <div className="px-6 mb-10">
              <ValueProps />
            </div>

            {/* Quick Actions Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="px-6"
            >
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Need help choosing?</p>
                  <p className="text-xs text-purple-200/70">Talk to an insurance expert</p>
                </div>
                <svg className="w-5 h-5 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-10 text-center"
            >
              <p className="text-purple-300/60 text-xs">
                Powered by ACKO • IRDAI Licensed
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
