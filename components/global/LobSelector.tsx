'use client';

import { motion } from 'framer-motion';
import { LobConfig } from '../../lib/core/types';

interface LobSelectorProps {
  lobs: LobConfig[];
  onSelect: (lob: LobConfig) => void;
}

function LobIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className || 'w-7 h-7';
  switch (icon) {
    case 'health':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    case 'car':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      );
    case 'bike':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <circle cx="5.5" cy="17" r="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="18.5" cy="17" r="3" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 6h2l3 8M5.5 17L10 9l3 3h4" />
        </svg>
      );
    case 'life':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path d="M12 2C6.477 2 2 6.477 2 12h4a6 6 0 0 1 12 0h4c0-5.523-4.477-10-10-10Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 12v8c0 1.105-.895 2-2 2s-2-.895-2-2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

const BENEFIT_LABELS: Record<string, string> = {
  health: 'Protect your family\'s health',
  car: 'Cover your car',
  bike: 'Cover your bike',

  life: 'Secure your family\'s future',
};

export default function LobSelector({ lobs, onSelect }: LobSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {lobs.map((lob, i) => {
        const isLarge = lob.id === 'health';
        const isWide = lob.id === 'life';
        const cardSize = isLarge
          ? 'col-span-2 row-span-2'
          : isWide
            ? 'col-span-2 row-span-1'
            : 'col-span-1 row-span-1';

        return (
          <motion.button
            key={lob.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => lob.active && onSelect(lob)}
            disabled={!lob.active}
            className={`${cardSize} relative rounded-2xl overflow-hidden transition-all duration-200 group text-left ${
              lob.active
                ? 'bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 hover:border-white/30 cursor-pointer active:scale-[0.98]'
                : 'bg-white/5 border border-white/10 opacity-60 cursor-not-allowed'
            }`}
            style={{
              minHeight: isLarge ? '260px' : isWide ? '120px' : '140px',
            }}
          >
            {/* Content */}
            <div className={`h-full flex ${
              isWide ? 'flex-row items-center gap-4 p-4' : 'flex-col justify-between p-5'
            }`}>
              {/* Top / Left */}
              <div className={isWide ? 'flex-1' : ''}>
                {/* Icon */}
                <div className={`${
                  isLarge ? 'w-14 h-14 mb-4' : 'w-12 h-12 mb-3'
                } rounded-full bg-white/15 flex items-center justify-center text-white group-hover:bg-white/25 transition-colors`}>
                  <LobIcon icon={lob.icon} className={isLarge ? 'w-7 h-7' : 'w-6 h-6'} />
                </div>

                {/* Title */}
                <h3 className={`${
                  isLarge ? 'text-xl' : 'text-lg'
                } font-bold text-white leading-tight`}>
                  {lob.label}
                </h3>

                {/* Tagline */}
                <p className={`${
                  isLarge ? 'text-sm mt-1.5' : 'text-xs mt-1'
                } text-purple-200`}>
                  {BENEFIT_LABELS[lob.id] || lob.tagline}
                </p>
              </div>

              {/* Bottom / Right */}
              <div className={isWide ? 'shrink-0' : 'mt-auto pt-3'}>
                {lob.active && (
                  <p className={`${isLarge ? 'text-xs' : 'text-[11px]'} text-purple-200/70 mb-2`}>
                    {lob.description}
                  </p>
                )}
                {!lob.active && (
                  <span className="text-[11px] font-medium text-purple-200/80 bg-white/10 px-2.5 py-1 rounded-full inline-block">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>

            {/* Chevron */}
            {lob.active && (
              <div className="absolute top-5 right-4">
                <svg className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
