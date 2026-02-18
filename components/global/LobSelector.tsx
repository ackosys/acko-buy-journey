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
    case 'motor':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      );
    case 'life':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    default:
      return null;
  }
}

const BENEFIT_LABELS: Record<string, string> = {
  health: 'Protect your family\'s health',
  motor: 'Cover your car & bike',
  life: 'Secure your family\'s future',
};

export default function LobSelector({ lobs, onSelect }: LobSelectorProps) {
  return (
    <div className="space-y-3">
      {lobs.map((lob, i) => (
        <motion.button
          key={lob.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 + i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => lob.active && onSelect(lob)}
          disabled={!lob.active}
          className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all duration-200 text-left group ${
            lob.active
              ? 'bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/25 cursor-pointer active:scale-[0.98]'
              : 'bg-white/5 border-white/8 opacity-60 cursor-not-allowed'
          }`}
        >
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            lob.active
              ? 'bg-gradient-to-br from-purple-500/30 to-purple-600/20 text-purple-300 group-hover:from-purple-500/40 group-hover:to-purple-600/30'
              : 'bg-white/5 text-white/30'
          }`}>
            <LobIcon icon={lob.icon} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`text-base font-semibold ${lob.active ? 'text-white' : 'text-white/40'}`}>
                {lob.label}
              </h3>
              {!lob.active && (
                <span className="text-[10px] font-medium text-purple-400/80 bg-purple-600/20 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
            <p className={`text-sm ${lob.active ? 'text-white/60' : 'text-white/30'}`}>
              {BENEFIT_LABELS[lob.id] || lob.tagline}
            </p>
            {lob.active && (
              <p className="text-xs text-purple-300/80 mt-1">{lob.description}</p>
            )}
          </div>

          {/* Arrow */}
          {lob.active && (
            <svg className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </motion.button>
      ))}
    </div>
  );
}
