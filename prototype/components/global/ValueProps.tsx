'use client';

import { motion } from 'framer-motion';

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
  {
    icon: 'price',
    title: 'Honest Pricing',
    description: 'No middlemen. No hidden charges.',
  },
];

function PropIcon({ icon }: { icon: string }) {
  const cls = "w-5 h-5";
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
    case 'award':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 11h-1.5A3.375 3.375 0 007.5 14.25v4.5m6-6V6.75m0 0a2.25 2.25 0 10-4.5 0m4.5 0a2.25 2.25 0 11-4.5 0" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ValueProps() {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-lg font-bold text-white mb-1">Why ACKO?</h2>
        <p className="text-sm text-purple-200/70">Insurance that actually makes sense.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {PROPS.map((prop, i) => (
          <motion.div
            key={prop.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.08 }}
            className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 hover:border-white/30 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white mb-3">
              <PropIcon icon={prop.icon} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{prop.title}</h3>
            <p className="text-xs text-purple-200/70 leading-relaxed">{prop.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
