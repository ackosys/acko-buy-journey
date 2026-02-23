'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../lib/themeStore';
import AckoLogo from '../AckoLogo';
import Link from 'next/link';

interface GlobalHeroProps {
  userName?: string;
}

const THEME_ICONS: Record<string, React.ReactNode> = {
  light: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  dark: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  ),
  aura: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
    </svg>
  ),
};

export default function GlobalHero({ userName }: GlobalHeroProps) {
  const { theme, cycleTheme } = useThemeStore();
  const isLight = theme === 'light';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="px-5 pt-6 pb-5">
      {/* Top bar: Logo | theme switcher + hamburger */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex items-center justify-between mb-8"
      >
        <Link href="/">
          <AckoLogo
            variant={isLight ? 'color' : theme === 'dark' ? 'white' : 'full-white'}
            className="h-8"
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <button
            onClick={cycleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: 'var(--app-surface, rgba(255,255,255,0.1))',
              border: '1px solid var(--app-border, rgba(255,255,255,0.15))',
              color: 'var(--app-text-muted)',
            }}
            aria-label={`Switch theme (current: ${theme})`}
            title={`Theme: ${theme}`}
          >
            {THEME_ICONS[theme] ?? THEME_ICONS.light}
          </button>

          {/* Hamburger menu */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: 'var(--app-surface, rgba(255,255,255,0.1))',
              border: '1px solid var(--app-border, rgba(255,255,255,0.15))',
              color: 'var(--app-text)',
            }}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Hero headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        {userName ? (
          <>
            <p className="text-sm mb-2" style={{ color: 'var(--app-text-muted)' }}>
              Welcome back, {userName}
            </p>
            <h1
              className="text-[32px] font-black leading-[1.1] tracking-tight mb-3"
              style={{ color: 'var(--app-text)' }}
            >
              What would you like<br />to protect today?
            </h1>
          </>
        ) : (
          <>
            <h1
              className="text-[32px] font-black leading-[1.1] tracking-tight mb-2"
              style={{ color: 'var(--app-text)' }}
            >
              All your insurance one place
            </h1>
            <p
              className="text-[15px] leading-[1.5]"
              style={{ color: 'var(--app-text-muted)' }}
            >
              No Jargon • No Middlemen • Just the right cover for what matters the most.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
