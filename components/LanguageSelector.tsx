'use client';

import { motion } from 'framer-motion';
import { useJourneyStore } from '../lib/store';
import { Language } from '../lib/types';
import AckoLogo from './AckoLogo';
import Link from 'next/link';

const LANGUAGES: { id: Language; label: string; sublabel: string; script: string }[] = [
  { id: 'en', label: 'English', sublabel: 'Continue in English', script: 'latin' },
  { id: 'hi', label: 'हिन्दी', sublabel: 'हिंदी में जारी रखें', script: 'devanagari' },
  { id: 'hinglish', label: 'Hinglish', sublabel: 'Hindi in English script', script: 'latin' },
  { id: 'kn', label: 'ಕನ್ನಡ', sublabel: 'ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಸಿ', script: 'kannada' },
];

interface LanguageSelectorProps {
  onSelect: () => void;
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const { setLanguage } = useJourneyStore();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    onSelect();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--app-home-gradient)' }}
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <Link href="/">
          <AckoLogo variant="full-white" className="h-8 mx-auto" />
        </Link>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Choose your language</h1>
        <p className="text-purple-200 text-sm">You can change this anytime</p>
      </motion.div>

      {/* Language Cards */}
      <div className="w-full max-w-sm space-y-3">
        {LANGUAGES.map((lang, i) => (
          <motion.button
            key={lang.id}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => handleSelect(lang.id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 hover:border-white/30 transition-all duration-200 group cursor-pointer"
          >
            {/* Language icon circle */}
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-xl font-semibold text-white shrink-0 group-hover:bg-white/25 transition-colors">
              {lang.id === 'en' ? 'A' : lang.id === 'hi' ? 'अ' : lang.id === 'hinglish' ? 'Hi' : 'ಅ'}
            </div>

            {/* Text */}
            <div className="text-left flex-1">
              <div className="text-white font-semibold text-lg leading-tight">{lang.label}</div>
              <div className="text-purple-200 text-sm mt-0.5">{lang.sublabel}</div>
            </div>

            {/* Arrow */}
            <svg className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        ))}
      </div>

      {/* Bottom subtle text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 text-purple-300/60 text-xs text-center"
      >
        Powered by ACKO • IRDAI Licensed
      </motion.p>
    </motion.div>
  );
}
