'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '../../lib/themeStore';

const PROPS = [
  {
    icon: 'award',
    title: "India's #1*",
    description: 'India\'s #1* insurance app.',
  },
  {
    icon: 'digital',
    title: '100% Digital',
    description: 'Buy, claim, and manage — all online.',
  },
  {
    icon: 'claim',
    title: 'Fast Claims',
    description: '95% cashless claims approved in 1 hour.',
  },
];

function PropIcon({ icon }: { icon: string }) {
  const cls = "w-6 h-6";
  switch (icon) {
    case 'digital':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      );
    case 'price':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'claim':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case 'award':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 11h-1.5A3.375 3.375 0 007.5 14.25v4.5m6-6V6.75m0 0a2.25 2.25 0 10-4.5 0m4.5 0a2.25 2.25 0 11-4.5 0" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ValueProps() {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Why ACKO?</h2>
        <p className="text-sm text-purple-200/80">Insurance that actually makes sense.</p>
      </motion.div>

      {/* Stacked cards with left accent bar */}
      <div className="space-y-3">
        {PROPS.map((prop, i) => (
          <motion.div
            key={prop.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + i * 0.1, type: 'spring', stiffness: 120 }}
          >
            <div
              className="relative rounded-2xl backdrop-blur-sm overflow-hidden"
              style={{
                background: isLight ? 'var(--app-surface)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isLight ? 'var(--app-border)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
              }}
            >
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ background: isLight ? '#7C3AED' : 'rgba(255,255,255,0.2)' }}
              />
              
              {/* Content */}
              <div className="flex items-start justify-between gap-4 p-5 pl-6">
                {/* Text content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                    {prop.title}
                  </h3>
                  <p className="text-sm text-purple-200/60 leading-relaxed">
                    {prop.description}
                  </p>
                </div>
                
                {/* Icon on the right */}
                <div
                  className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: isLight ? 'var(--app-surface-2)' : 'rgba(255,255,255,0.06)',
                    color: isLight ? '#7C3AED' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  <PropIcon icon={prop.icon} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
