'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useJourneyStore } from '../lib/store';
import AckoLogo from '../components/AckoLogo';
import LanguageSelector from '../components/LanguageSelector';
import GlobalHero from '../components/global/GlobalHero';
import LobSelector from '../components/global/LobSelector';
import TrustBadges from '../components/global/TrustBadges';
import ValueProps from '../components/global/ValueProps';
import { LobConfig } from '../lib/core/types';

/* ── LOB Configuration ── */
const LOBS: LobConfig[] = [
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
    id: 'motor',
    label: 'Car & Bike Insurance',
    tagline: 'Comprehensive cover for your vehicle',
    description: 'Instant policy. Hassle-free claims.',
    icon: 'motor',
    active: false,
    route: '/motor',
  },
  {
    id: 'life',
    label: 'Life Insurance',
    tagline: 'Financial security for your family',
    description: 'Term plans starting ₹490/month.',
    icon: 'life',
    active: false,
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
  }, []);

  const handleLobSelect = (lob: LobConfig) => {
    if (lob.active) {
      router.push(lob.route);
    }
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
      {/* Language Selection */}
      {screen === 'language' && (
        <LanguageSelector key="lang" onSelect={() => setScreen('home')} />
      )}

      {/* Global Entry Homepage */}
      {screen === 'home' && (
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen"
          style={{ background: 'linear-gradient(180deg, #1a0a3e 0%, #2A1463 40%, #1C0B47 100%)' }}
        >
          {/* Decorative background elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-30%] right-[-20%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-15%] w-[500px] h-[500px] rounded-full bg-purple-500/8 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-lg mx-auto pb-16">
            {/* Hero Section */}
            <GlobalHero userName={userName || undefined} />

            {/* LOB Selector */}
            <div className="px-6 mb-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-white/50 mb-4 font-medium"
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
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/80 font-medium">Need help choosing?</p>
                  <p className="text-xs text-white/40">Talk to an insurance expert — no pressure, no sales pitch.</p>
                </div>
                <button className="px-4 py-2 bg-white/10 border border-white/15 rounded-xl text-xs font-semibold text-purple-300 hover:bg-white/15 transition-colors">
                  Talk to Expert
                </button>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-10 text-center"
            >
              <AckoLogo variant="white" className="h-5 mx-auto mb-2 opacity-40" />
              <p className="text-[11px] text-white/30">
                ACKO General Insurance Ltd. | IRDAI Reg. No. 157
              </p>
              <p className="text-[11px] text-white/20 mt-1">
                CIN: U66000MH2016PLC287385
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
