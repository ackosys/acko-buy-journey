'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  loadSnapshot,
  clearSnapshot,
  getDropOffDisplay,
  type ProductKey,
  type JourneySnapshot,
} from '../../lib/journeyPersist';

// ── Product theme config ──────────────────────────────────────────────────────
const PRODUCT_CONFIG: Record<ProductKey, {
  label: string;
  gradient: string;
  accentColor: string;
  illustration: React.ReactNode;
}> = {
  health: {
    label: 'Health',
    gradient: 'linear-gradient(135deg, #0a2a1e 0%, #0d4a30 50%, #1a6b45 100%)',
    accentColor: '#34d399',
    illustration: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <circle cx="40" cy="40" r="36" fill="rgba(52,211,153,0.12)" />
        <circle cx="40" cy="40" r="26" fill="rgba(52,211,153,0.15)" />
        <path d="M28 40h24M40 28v24" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
        <path d="M30 32c0-5.52 4.48-10 10-10s10 4.48 10 10c0 7-10 18-10 18S30 39 30 32z"
          fill="rgba(52,211,153,0.3)" stroke="#34d399" strokeWidth="1.5" />
      </svg>
    ),
  },
  car: {
    label: 'Car',
    gradient: 'linear-gradient(135deg, #0a1628 0%, #1a2d55 50%, #1e3a7a 100%)',
    accentColor: '#60a5fa',
    illustration: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <circle cx="40" cy="40" r="36" fill="rgba(96,165,250,0.1)" />
        <rect x="16" y="38" width="48" height="18" rx="4" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="1.5" />
        <path d="M20 38l6-12h28l6 12" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="26" cy="57" r="5" fill="rgba(96,165,250,0.3)" stroke="#60a5fa" strokeWidth="1.5" />
        <circle cx="54" cy="57" r="5" fill="rgba(96,165,250,0.3)" stroke="#60a5fa" strokeWidth="1.5" />
        <rect x="28" y="28" width="24" height="10" rx="2" fill="rgba(96,165,250,0.25)" />
      </svg>
    ),
  },
  bike: {
    label: 'Bike',
    gradient: 'linear-gradient(135deg, #1a1205 0%, #3d2a07 50%, #5c3d0a 100%)',
    accentColor: '#fb923c',
    illustration: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <circle cx="40" cy="40" r="36" fill="rgba(251,146,60,0.1)" />
        <circle cx="24" cy="50" r="10" fill="rgba(251,146,60,0.2)" stroke="#fb923c" strokeWidth="1.5" />
        <circle cx="56" cy="50" r="10" fill="rgba(251,146,60,0.2)" stroke="#fb923c" strokeWidth="1.5" />
        <path d="M24 50l12-18h8l12 18" stroke="#fb923c" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M44 32l8-6" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="50" r="4" fill="rgba(251,146,60,0.4)" />
        <circle cx="56" cy="50" r="4" fill="rgba(251,146,60,0.4)" />
      </svg>
    ),
  },
  life: {
    label: 'Life',
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #3a1060 50%, #5a1a8e 100%)',
    accentColor: '#c084fc',
    illustration: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <circle cx="40" cy="40" r="36" fill="rgba(192,132,252,0.1)" />
        <path d="M40 58s-20-12-20-26c0-8 6-14 14-14 3.5 0 6.8 1.3 9.2 3.4A13.9 13.9 0 0154 18c8 0 14 6 14 14C68 46 40 58 40 58z"
          fill="rgba(192,132,252,0.25)" stroke="#c084fc" strokeWidth="1.5" />
        <path d="M34 34l6 6 8-10" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

const URGENCY_COLORS: Record<string, string> = {
  high:   'bg-red-500/20 text-red-300 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  low:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Card ──────────────────────────────────────────────────────────────────────
interface CardProps {
  snap: JourneySnapshot;
  onDismiss: (product: ProductKey) => void;
  onClick: (route: string) => void;
}

function DropOffCard({ snap, onDismiss, onClick }: CardProps) {
  const display = getDropOffDisplay(snap);
  if (!display) return null;

  const config = PRODUCT_CONFIG[snap.product];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      className="relative flex-shrink-0 w-[300px] rounded-2xl overflow-hidden"
      style={{
        background: config.gradient,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
      }}
    >
      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(snap.product); }}
        className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Tap area */}
      <button onClick={() => onClick(display.route)} className="w-full text-left p-4 flex gap-3 items-start">
        {/* Left: text */}
        <div className="flex-1 flex flex-col gap-2.5 min-w-0">
          {/* Product + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: config.accentColor }}>
              {config.label}
            </span>
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${URGENCY_COLORS[display.urgency]}`}>
              {display.badge}
            </span>
          </div>

          {/* Title */}
          <p className="text-white font-semibold text-[14px] leading-[1.35] pr-5">
            {display.title}
          </p>

          {/* Subtitle */}
          {display.subtitle && (
            <p className="text-white/50 text-[11px] leading-relaxed">{display.subtitle}</p>
          )}

          {/* CTA + timestamp */}
          <div className="flex items-center gap-2 mt-1">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
              style={{ background: config.accentColor, color: '#0a0a0a' }}
            >
              {display.ctaLabel}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <span className="text-white/30 text-[10px]">{relativeTime(snap.savedAt)}</span>
          </div>
        </div>

        {/* Right: illustration */}
        <div className="flex-shrink-0 w-[72px] h-[72px] mt-1 opacity-90">
          {config.illustration}
        </div>
      </button>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const ALL_PRODUCTS: ProductKey[] = ['health', 'life', 'car', 'bike'];

export default function DropOffBanner() {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState<JourneySnapshot[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load real snapshots from localStorage
    const found: JourneySnapshot[] = [];
    for (const product of ALL_PRODUCTS) {
      const snap = loadSnapshot(product);
      if (snap && getDropOffDisplay(snap)) {
        found.push(snap);
      }
    }
    // Sort by most recent first
    found.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    setSnapshots(found);
  }, []);

  const handleDismiss = (product: ProductKey) => {
    clearSnapshot(product);
    setSnapshots(prev => prev.filter(s => s.product !== product));
  };

  const handleClick = (route: string) => {
    router.push(route);
  };

  if (snapshots.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        {/* Header */}
        <div className="px-6 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <p className="text-[12px] font-semibold text-white/80 tracking-wide uppercase">
              Continue where you left off
            </p>
          </div>
          <span className="text-[11px] text-white/40">{snapshots.length} pending</span>
        </div>

        {/* Horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex gap-3 px-6 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          <AnimatePresence>
            {snapshots.map(snap => (
              <div key={snap.product} style={{ scrollSnapAlign: 'start' }}>
                <DropOffCard
                  snap={snap}
                  onDismiss={handleDismiss}
                  onClick={handleClick}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>

        {/* Scroll dots */}
        {snapshots.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {snapshots.map((snap, i) => (
              <div
                key={snap.product}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === 0 ? '16px' : '6px',
                  background: i === 0 ? PRODUCT_CONFIG[snap.product].accentColor : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
