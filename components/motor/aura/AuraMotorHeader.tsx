'use client';

import { useMotorStore } from '../../../lib/motor/store';
import AckoLogo from '../../AckoLogo';

const MODULE_ORDER = ['vehicle_type', 'registration', 'vehicle_fetch', 'manual_entry', 'pre_quote', 'quote', 'customization', 'review', 'payment'];

export default function AuraMotorHeader() {
  const { currentModule, vehicleType } = useMotorStore();
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
          <button
            className="group relative w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ background: '#1E1E22', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <svg className="w-4.5 h-4.5 text-[#C084FC] group-hover:text-white transition-colors" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827m0 0v.75m0-3.75h.008v.008H12v-.008z" />
            </svg>
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
