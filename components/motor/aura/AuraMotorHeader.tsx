'use client';

import { useMotorStore } from '../../../lib/motor/store';
import { MotorJourneyState } from '../../../lib/motor/types';
import AckoLogo from '../../AckoLogo';
import Link from 'next/link';

const MODULE_ORDER = ['vehicle_type', 'registration', 'vehicle_fetch', 'manual_entry', 'pre_quote', 'quote', 'customization', 'review', 'payment'];

export default function AuraMotorHeader() {
  const { currentModule, vehicleType, updateState, theme } = useMotorStore();
  const currentIndex = MODULE_ORDER.indexOf(currentModule);
  const progress = Math.round((Math.max(0, currentIndex) / (MODULE_ORDER.length - 1)) * 100);
  const isLight = theme === 'light';

  return (
    <header className="sticky top-0 z-30" style={{ background: 'var(--aura-bg)', borderBottom: '1px solid var(--aura-border)' }}>
      <div className="max-w-lg mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <AckoLogo variant={isLight ? 'color' : 'white'} className="h-5" />
          {vehicleType && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
              style={{ background: 'var(--aura-surface-2)', color: '#C084FC', border: '1px solid var(--aura-border)' }}
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
            style={{ background: 'var(--aura-surface)', border: '1px solid var(--aura-border)' }}
          >
            <img src="/ai-assistant.png" alt="AI" className="w-9 h-9 object-cover" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full" style={{ border: 'var(--aura-progress-border)' }} />
          </button>

          {/* Talk to Expert */}
          <button
            onClick={() => updateState({ showExpertPanel: true } as Partial<MotorJourneyState>)}
            className="group relative flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full transition-all active:scale-95"
            style={{ background: 'var(--aura-overlay-bg)', border: '1px solid var(--aura-overlay-bg)' }}
          >
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <img src="/motor-expert.png" alt="Expert" className="w-7 h-7 object-cover" />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--aura-bot-text)', opacity: 0.9 }}>Expert</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => updateState({ theme: isLight ? 'dark' : 'light' } as Partial<MotorJourneyState>)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ background: 'var(--aura-surface)', border: '1px solid var(--aura-border)' }}
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {isLight ? (
              <svg className="w-4 h-4" style={{ color: '#7C47E1' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" style={{ color: '#C084FC' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="h-[2px]" style={{ background: 'var(--aura-border)' }}>
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #A855F7, #C084FC)',
            boxShadow: '0 0 8px rgba(168,85,247,0.5)',
          }}
        />
      </div>
    </header>
  );
}
