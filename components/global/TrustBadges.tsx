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
      className="flex items-center justify-center gap-3"
    >
      {BADGES.map((badge, i) => (
        <>
          {i > 0 && <span className="w-px h-4 bg-white/15" />}
          <div key={badge.label} className="text-center">
            <p className="text-xs font-semibold text-white/70 leading-tight">{badge.label}</p>
            <p className="text-[10px] text-white/35 leading-tight">{badge.sublabel}</p>
          </div>
        </>
      ))}
    </motion.div>
  );
}
