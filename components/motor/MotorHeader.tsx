'use client';

import { useMotorStore } from '../../lib/motor/store';
import { MotorJourneyState } from '../../lib/motor/types';
import AckoLogo from '../AckoLogo';

const MODULE_ORDER = ['vehicle_type', 'registration', 'vehicle_fetch', 'manual_entry', 'pre_quote', 'quote', 'customization', 'review', 'payment'];

export default function MotorHeader() {
  const { currentModule, vehicleType, updateState } = useMotorStore();
  const currentIndex = MODULE_ORDER.indexOf(currentModule);
  const progress = Math.round((Math.max(0, currentIndex) / (MODULE_ORDER.length - 1)) * 100);

  return (
    <header className="sticky top-0 z-30 bg-[#1C0B47] border-b border-white/10">
      <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AckoLogo variant="white" className="h-5" />
          {vehicleType && (
            <span className="text-[10px] bg-white/10 text-purple-200 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-white/10">
              {vehicleType === 'bike' ? 'Bike' : 'Car'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* AI Help */}
          <button
            onClick={() => updateState({ showAIChat: true } as Partial<MotorJourneyState>)}
            className="group relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-95 overflow-hidden"
            title="AI Assistant"
          >
            <img src="/ai-assistant.png" alt="AI" className="w-9 h-9 object-cover" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-[#1C0B47]" />
          </button>

          {/* Talk to Expert */}
          <button
            onClick={() => updateState({ showExpertPanel: true } as Partial<MotorJourneyState>)}
            className="group relative flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
            title="Talk to Expert"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden shadow-lg shadow-purple-900/30">
              <img src="/motor-expert.png" alt="Expert" className="w-7 h-7 object-cover" />
            </div>
            <span className="text-white/90 text-xs font-medium">Expert</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-300 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(139,92,246,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
