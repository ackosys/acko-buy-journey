'use client';

import { motion } from 'framer-motion';

const BADGES = [
  { label: 'IRDAI Licensed', sublabel: 'Reg. No. 157' },
  { label: '1 Cr+', sublabel: 'Customers' },
  { label: '97%', sublabel: 'Claims settled' },
];

export default function TrustBadges() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.55 }}
      className="flex items-center justify-center gap-4 py-4 px-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15"
    >
      {BADGES.map((badge, i) => (
        <div key={badge.label} className="flex items-center gap-4">
          {i > 0 && <span className="w-px h-5 bg-white/20" />}
          <div className="text-center">
            <p className="text-xs font-semibold text-white leading-tight">{badge.label}</p>
            <p className="text-[10px] text-purple-200/70 leading-tight mt-0.5">{badge.sublabel}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
