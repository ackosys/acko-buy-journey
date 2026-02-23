'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '../../lib/themeStore';

const BADGES = [
  { label: 'IRDAI Licensed', sublabel: 'Reg. No. 157' },
  { label: '1 Cr+', sublabel: 'Customers' },
  { label: '97%', sublabel: 'Claims settled' },
  { label: '14,000+', sublabel: 'Cashless hospitals' },
  { label: '4.5★', sublabel: 'App rating' },
  { label: '24/7', sublabel: 'Support' },
];

export default function TrustBadges() {
  const theme = useThemeStore((s) => s.theme);
  const fadeColor = theme === 'light' ? '#FFFFFF' : '#6C4DE8';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 py-4">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${fadeColor}, transparent)` }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${fadeColor}, transparent)` }} />
      
      {/* Scrolling container */}
      <motion.div
        className="flex gap-8"
        animate={{
          x: [0, -1000],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        {/* First set of badges */}
        {BADGES.map((badge, i) => (
          <div key={`badge-1-${i}`} className="flex items-center gap-8 shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-center whitespace-nowrap">
                <p className="text-sm font-bold text-white leading-tight">{badge.label}</p>
                <p className="text-xs text-purple-200/70 leading-tight mt-0.5">{badge.sublabel}</p>
              </div>
            </div>
            {i < BADGES.length - 1 && <span className="w-px h-8" style={{ background: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)' }} />}
          </div>
        ))}
        
        {/* Duplicate set for seamless loop */}
        {BADGES.map((badge, i) => (
          <div key={`badge-2-${i}`} className="flex items-center gap-8 shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-center whitespace-nowrap">
                <p className="text-sm font-bold text-white leading-tight">{badge.label}</p>
                <p className="text-xs text-purple-200/70 leading-tight mt-0.5">{badge.sublabel}</p>
              </div>
            </div>
            {i < BADGES.length - 1 && <span className="w-px h-8" style={{ background: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)' }} />}
          </div>
        ))}
        
        {/* Third set for extra smoothness */}
        {BADGES.map((badge, i) => (
          <div key={`badge-3-${i}`} className="flex items-center gap-8 shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-center whitespace-nowrap">
                <p className="text-sm font-bold text-white leading-tight">{badge.label}</p>
                <p className="text-xs text-purple-200/70 leading-tight mt-0.5">{badge.sublabel}</p>
              </div>
            </div>
            {i < BADGES.length - 1 && <span className="w-px h-8" style={{ background: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)' }} />}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
