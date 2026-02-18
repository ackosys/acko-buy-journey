'use client';

import { useMotorStore } from '../../lib/motor/store';
import AckoLogo from '../AckoLogo';

const MODULE_ORDER = ['vehicle_type', 'registration', 'vehicle_fetch', 'manual_entry', 'pre_quote', 'quote', 'customization', 'review', 'payment'];

export default function MotorHeader() {
  const { currentModule, vehicleType } = useMotorStore();
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
          <button className="group relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-95">
            <svg className="w-4.5 h-4.5 text-purple-300 group-hover:text-white transition-colors" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827m0 0v.75m0-3.75h.008v.008H12v-.008z" />
            </svg>
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
