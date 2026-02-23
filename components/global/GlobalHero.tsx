'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '../../lib/themeStore';
import AckoLogo from '../AckoLogo';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';

interface GlobalHeroProps {
  userName?: string;
}

export default function GlobalHero({ userName }: GlobalHeroProps) {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  return (
    <div className="text-center pt-12 pb-8 px-6">
      {/* Logo + Theme Toggle */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10 flex items-center justify-center relative"
      >
        <Link href="/">
          <AckoLogo variant={isLight ? 'color' : 'white'} className="h-8" />
        </Link>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {userName ? (
          <>
            <p className="text-purple-200 text-sm mb-2">Welcome back, {userName}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              What would you like<br />to protect today?
            </h1>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
              All your insurance,<br />
              <span className="text-purple-200">one place.</span>
            </h1>
            <p className="text-sm text-purple-200/70 max-w-xs mx-auto">
              No jargon. No middlemen. Just the right cover for what matters most.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
