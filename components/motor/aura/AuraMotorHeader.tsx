'use client';

import { useMotorStore } from '../../../lib/motor/store';
import { MotorJourneyState } from '../../../lib/motor/types';
import AckoLogo from '../../AckoLogo';

const MODULE_ORDER = ['vehicle_type', 'registration', 'vehicle_fetch', 'manual_entry', 'pre_quote', 'quote', 'customization', 'review', 'payment'];

export default function AuraMotorHeader() {
  const { currentModule, vehicleType, updateState } = useMotorStore();
  const currentIndex = MODULE_ORDER.indexOf(currentModule);
  const progress = Math.round((Math.max(0, currentIndex) / (MODULE_ORDER.length - 1)) * 100);

  return (
    <header className="sticky top-0 z-30" style={{ background: '#121214', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-lg mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AckoLogo variant="white" className="h-5" />
          {vehicleType && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
              style={{ background: '#2D2D35', color: '#C084FC', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {vehicleType === 'bike' ? 'Bike' : 'Car'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* AI Help */}
          <button
            onClick={() => updateState({ showAIChat: true } as Partial<MotorJourneyState>)}
            className="group relative w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 overflow-hidden"
            style={{ background: '#1E1E22', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <img src="/ai-assistant.png" alt="AI" className="w-9 h-9 object-cover" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full" style={{ border: '2px solid #121214' }} />
          </button>

          {/* Talk to Expert */}
          <button
            onClick={() => updateState({ showExpertPanel: true } as Partial<MotorJourneyState>)}
            className="group relative flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <img src="/motor-expert.png" alt="Expert" className="w-7 h-7 object-cover" />
            </div>
            <span className="text-[#F8FAFC]/90 text-xs font-medium">Expert</span>
          </button>
        </div>
      </div>

      <div className="h-[2px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
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
