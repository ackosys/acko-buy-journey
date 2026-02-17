'use client';

import { motion } from 'framer-motion';

const PROPS = [
  {
    icon: 'digital',
    title: '100% Digital',
    description: 'Buy, claim, and manage — all online. No paperwork, no agents.',
  },
  {
    icon: 'price',
    title: 'Honest Pricing',
    description: 'No middlemen. No hidden charges. What you see is what you pay.',
  },
  {
    icon: 'claim',
    title: 'Fast Claims',
    description: '95% of cashless claims approved within 1 hour. Zero runaround.',
  },
  {
    icon: 'support',
    title: 'Human Support',
    description: 'Talk to real experts anytime. Not bots, not scripts — real people.',
  },
];

function PropIcon({ icon }: { icon: string }) {
  const cls = "w-6 h-6";
  switch (icon) {
    case 'digital':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      );
    case 'price':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'claim':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case 'support':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ValueProps() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-lg font-semibold text-white mb-1">Why ACKO?</h2>
        <p className="text-sm text-white/50">Insurance that actually makes sense.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROPS.map((prop, i) => (
          <motion.div
            key={prop.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.08 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300 mb-3">
              <PropIcon icon={prop.icon} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{prop.title}</h3>
            <p className="text-xs text-white/50 leading-relaxed">{prop.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
