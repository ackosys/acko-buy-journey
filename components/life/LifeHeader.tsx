'use client';

import { useLifeJourneyStore } from '../../lib/life/store';
import { useThemeStore } from '../../lib/themeStore';
import AckoLogo from '../AckoLogo';
import ThemeToggle from '../global/ThemeToggle';
import { useT } from '../../lib/translations';
import { assetPath } from '../../lib/assetPath';
import type { LifeModule } from '../../lib/life/types';
import Link from 'next/link';

const LIFE_MODULE_ORDER: LifeModule[] = ['basic_info', 'lifestyle', 'quote', 'addons', 'review'];

export default function LifeHeader() {
  const t = useT();
  const { currentModule, updateState } = useLifeJourneyStore();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const currentIndex = LIFE_MODULE_ORDER.indexOf(currentModule);
  const progress = Math.round((currentIndex / (LIFE_MODULE_ORDER.length - 1)) * 100);

  return (
    <header className="sticky top-0 z-30" style={{ background: 'var(--app-header-bg)', borderBottom: '1px solid var(--app-border)' }}>
      <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <AckoLogo variant={isLight ? 'color' : 'white'} className="h-5" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateState({ showAIChat: true })}
            className="group relative w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
            title={t.header.aiHelp}
          >
            <svg className="w-4.5 h-4.5 transition-colors" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: isLight ? '#7C3AED' : '#D8B4FE' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full" style={{ border: `2px solid var(--app-header-bg)` }} />
          </button>

          <button
            onClick={() => updateState({ showExpertPanel: true })}
            className="group relative flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full transition-all active:scale-95"
            style={{ background: 'var(--app-overlay-bg)', border: '1px solid var(--app-border)' }}
            title={t.header.talkToExpert}
          >
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <img
                src={assetPath('/life-expert.png')}
                alt="Expert"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--app-text)', opacity: 0.9 }}>Expert</span>
          </button>

          <ThemeToggle />
        </div>
      </div>

      <div className="h-[2px]" style={{ background: 'var(--app-border)' }}>
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: 'var(--app-progress-gradient)',
            boxShadow: '0 0 8px rgba(168,85,247,0.5)',
          }}
        />
      </div>
    </header>
  );
}
