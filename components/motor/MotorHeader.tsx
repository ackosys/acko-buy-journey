'use client';

import { useMotorStore } from '../../lib/motor/store';
import { MotorJourneyState } from '../../lib/motor/types';
import { useThemeStore } from '../../lib/themeStore';
import { assetPath } from '../../lib/assetPath';
import AckoLogo from '../AckoLogo';
import ThemeToggle from '../global/ThemeToggle';
import Link from 'next/link';

const MODULE_ORDER = ['vehicle_type', 'registration', 'vehicle_fetch', 'manual_entry', 'pre_quote', 'quote', 'customization', 'review', 'payment'];

export default function MotorHeader() {
  const { currentModule, vehicleType, updateState } = useMotorStore();
  const { theme } = useThemeStore();
  const currentIndex = MODULE_ORDER.indexOf(currentModule);
  const progress = Math.round((Math.max(0, currentIndex) / (MODULE_ORDER.length - 1)) * 100);
  const isLight = theme === 'light';

  return (
    <header className="sticky top-0 z-30" style={{ background: 'var(--motor-bg)', borderBottom: '1px solid var(--motor-border)' }}>
      <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <AckoLogo variant={isLight ? 'color' : theme === 'dark' ? 'white' : 'full-white'} className="h-5" />
          {vehicleType && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
              style={{ background: 'var(--motor-surface-2)', color: '#C084FC', border: '1px solid var(--motor-border)' }}
            >
              {vehicleType === 'bike' ? 'Bike' : 'Car'}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          {/* AI Help */}
          <button
            onClick={() => updateState({ showAIChat: true } as Partial<MotorJourneyState>)}
            className="group relative w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 overflow-hidden"
            style={{ background: 'var(--motor-surface)', border: '1px solid var(--motor-border)' }}
            title="AI Assistant"
          >
            <img src={assetPath('/ai-assistant.png')} alt="AI" className="w-9 h-9 object-cover" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full" style={{ border: 'var(--motor-progress-border)' }} />
          </button>

          {/* Talk to Expert */}
          <button
            onClick={() => updateState({ showExpertPanel: true } as Partial<MotorJourneyState>)}
            className="group relative flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full transition-all active:scale-95"
            style={{ background: 'var(--motor-overlay-bg)', border: '1px solid var(--motor-border)' }}
            title="Talk to Expert"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <img src={assetPath('/motor-expert.png')} alt="Expert" className="w-7 h-7 object-cover" />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--motor-text)', opacity: 0.9 }}>Expert</span>
          </button>

          {/* Theme Toggle — cycles midnight → dark → light */}
          <ThemeToggle />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[2px]" style={{ background: 'var(--motor-border)' }}>
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: 'var(--motor-progress-gradient)',
            boxShadow: '0 0 8px rgba(168,85,247,0.5)',
          }}
        />
      </div>
    </header>
  );
}
