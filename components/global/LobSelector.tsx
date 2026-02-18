'use client';

import { useState, useEffect, useRef } from 'react';
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

const LOB_GRADIENTS: Record<string, { from: string; via: string; to: string; accent: string }> = {
  health: {
    from: 'from-rose-500/30',
    via: 'via-pink-500/20',
    to: 'to-purple-500/10',
    accent: '#EF4444',
  },
  car: {
    from: 'from-blue-500/30',
    via: 'via-cyan-500/20',
    to: 'to-purple-500/10',
    accent: '#3B82F6',
  },
  bike: {
    from: 'from-indigo-500/30',
    via: 'via-blue-500/20',
    to: 'to-purple-500/10',
    accent: '#6366F1',
  },
  life: {
    from: 'from-violet-500/30',
    via: 'via-purple-500/20',
    to: 'to-pink-500/10',
    accent: '#8B5CF6',
  },
};

export default function LobSelector({ lobs, onSelect }: LobSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % lobs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [lobs.length]);

  // Scroll to active card
  useEffect(() => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.scrollWidth / lobs.length;
    scrollRef.current.scrollTo({
      left: activeIndex * cardWidth,
      behavior: 'smooth',
    });
  }, [activeIndex, lobs.length]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.scrollWidth / lobs.length;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {lobs.map((lob, i) => {
          const gradient = LOB_GRADIENTS[lob.id] || LOB_GRADIENTS.health;
          const isActive = i === activeIndex;
          
          return (
            <motion.button
              key={lob.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: isActive ? 1 : 0.95,
              }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => lob.active && onSelect(lob)}
              disabled={!lob.active}
              className={`relative min-w-[85%] snap-center rounded-3xl overflow-hidden border transition-all duration-300 ${
                lob.active
                  ? 'cursor-pointer active:scale-[0.98]'
                  : 'opacity-60 cursor-not-allowed'
              } ${isActive ? 'border-white/30 shadow-2xl shadow-purple-900/30' : 'border-white/10'}`}
              style={{
                height: '320px',
              }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to}`} />
              
              {/* Decorative Orb */}
              <div
                className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-40"
                style={{ background: gradient.accent }}
              />
              
              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-6">
                {/* Top Section */}
                <div>
                  {/* Icon */}
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                      lob.active
                        ? 'bg-white/20 backdrop-blur-sm text-white'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    <LobIcon icon={lob.icon} className="w-8 h-8" />
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    animate={{ y: isActive ? 0 : 5 }}
                    className={`text-2xl font-bold mb-2 ${lob.active ? 'text-white' : 'text-white/60'}`}
                  >
                    {lob.label}
                  </motion.h3>

                  {/* Tagline */}
                  <p className={`text-sm mb-3 ${lob.active ? 'text-white/70' : 'text-white/40'}`}>
                    {BENEFIT_LABELS[lob.id] || lob.tagline}
                  </p>
                </div>

                {/* Bottom Section */}
                <div>
                  {/* Description */}
                  {lob.active && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isActive ? 1 : 0.6, y: isActive ? 0 : 5 }}
                      className="text-xs text-white/80 mb-4 font-medium"
                    >
                      {lob.description}
                    </motion.p>
                  )}

                  {/* CTA Arrow */}
                  {lob.active && (
                    <motion.div
                      animate={{ x: isActive ? 0 : -5, opacity: isActive ? 1 : 0.5 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-sm font-semibold text-white">Explore</span>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.div>
                  )}

                  {!lob.active && (
                    <span className="text-xs font-medium text-purple-400/80 bg-purple-600/20 px-3 py-1 rounded-full inline-block">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>

              {/* Shine Effect */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {lobs.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-8 bg-purple-400' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
