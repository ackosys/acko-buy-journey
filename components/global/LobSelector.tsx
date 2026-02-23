'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '../../lib/themeStore';
import { LobConfig } from '../../lib/core/types';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface LobSelectorProps {
  lobs: LobConfig[];
  onSelect: (lob: LobConfig) => void;
}

const LOB_META: Record<string, {
  image: string;
  label: string;
  subtitle: string;
  badge: string | null;
  imageStyle?: React.CSSProperties;
}> = {
  car: {
    image: `${BASE}/offerings/car.png`,
    label: 'Car',
    subtitle: 'Get your policy instantly',
    badge: 'Zero commission',
    imageStyle: { objectPosition: 'center center' },
  },
  health: {
    image: `${BASE}/offerings/health.png`,
    label: 'Health',
    subtitle: '100% bill coverage',
    badge: 'Avail 0% GST',
    imageStyle: { objectPosition: 'center center' },
  },
  bike: {
    image: `${BASE}/offerings/bike.png`,
    label: 'Bike/scooter',
    subtitle: 'Insure in 1 min',
    badge: null,
    imageStyle: { objectPosition: 'center bottom' },
  },
  life: {
    image: `${BASE}/offerings/life.png`,
    label: 'Life',
    subtitle: 'Flexible coverage',
    badge: null,
    imageStyle: { objectPosition: 'center center' },
  },
  travel: {
    image: `${BASE}/offerings/travel.png`,
    label: 'Travel',
    subtitle: 'Coming soon',
    badge: null,
    imageStyle: { objectPosition: 'right center' },
  },
};

interface CardProps {
  lob: LobConfig;
  index: number;
  cardBg: string;
  cardShadow: string;
  badgeBg: string;
  badgeText: string;
  onSelect: (lob: LobConfig) => void;
  height?: number;
  isFullWidth?: boolean;
}

function LobCard({ lob, index, cardBg, cardShadow, badgeBg, badgeText, onSelect, height = 200, isFullWidth = false }: CardProps) {
  const meta = LOB_META[lob.id] || LOB_META.car;
  const isDisabled = !lob.active;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
      onClick={() => !isDisabled && onSelect(lob)}
      disabled={isDisabled}
      className={`relative overflow-hidden rounded-[20px] text-left w-full ${
        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
      } transition-transform duration-150`}
      style={{
        background: cardBg,
        boxShadow: cardShadow,
        height,
      }}
    >
      {/* Text content — top-left */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <h3
          className="text-[17px] font-bold leading-tight mb-1"
          style={{ color: 'var(--app-text)' }}
        >
          {meta.label}
        </h3>
        <p
          className="text-[13px] leading-snug mb-2.5"
          style={{ color: 'var(--app-text-muted)' }}
        >
          {meta.subtitle}
        </p>
        {meta.badge && (
          <span
            className="inline-block text-[12px] font-semibold px-3 py-1 rounded-full"
            style={{ background: badgeBg, color: badgeText }}
          >
            {meta.badge}
          </span>
        )}
        {isDisabled && (
          <span
            className="inline-block text-[12px] font-medium px-3 py-1 rounded-full"
            style={{ background: badgeBg, color: badgeText }}
          >
            Coming soon
          </span>
        )}
      </div>

      {/* Product image — bottom-right */}
      <div
        className="absolute overflow-hidden"
        style={
          isFullWidth
            ? { right: 0, bottom: 0, top: 0, width: '45%' }
            : { right: 0, bottom: 0, left: 0, height: '55%' }
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.image}
          alt={meta.label}
          draggable={false}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: isFullWidth ? '100%' : 'fit-content',
            height: '100%',
            objectFit: 'cover',
            ...(meta.imageStyle || {}),
          }}
        />
      </div>
    </motion.button>
  );
}

export default function LobSelector({ lobs, onSelect }: LobSelectorProps) {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const cardBg = isLight
    ? '#FFFFFF'
    : theme === 'dark'
    ? '#1E1E22'
    : 'rgba(255,255,255,0.07)';

  const cardShadow = isLight
    ? '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)'
    : theme === 'dark'
    ? '0 2px 8px rgba(0,0,0,0.4)'
    : '0 2px 12px rgba(0,0,0,0.25)';

  const badgeBg = isLight
    ? 'rgba(124,58,237,0.1)'
    : theme === 'dark'
    ? 'rgba(167,139,250,0.15)'
    : 'rgba(167,139,250,0.2)';

  const badgeText = isLight ? '#7C3AED' : '#C4B5FD';

  // Split lobs into rows
  const row1 = lobs.filter(l => l.id === 'car' || l.id === 'health');
  const row2 = lobs.filter(l => l.id === 'bike' || l.id === 'life');
  const row3 = lobs.filter(l => l.id === 'travel');

  const commonProps = { cardBg, cardShadow, badgeBg, badgeText, onSelect };

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Car + Health */}
      {row1.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {row1.map((lob, i) => (
            <LobCard key={lob.id} lob={lob} index={i} height={196} {...commonProps} />
          ))}
        </div>
      )}

      {/* Row 2: Bike + Life */}
      {row2.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {row2.map((lob, i) => (
            <LobCard key={lob.id} lob={lob} index={i + 2} height={196} {...commonProps} />
          ))}
        </div>
      )}

      {/* Row 3: Travel — full width, shorter */}
      {row3.map((lob, i) => (
        <LobCard
          key={lob.id}
          lob={lob}
          index={i + 4}
          height={120}
          isFullWidth
          {...commonProps}
        />
      ))}
    </div>
  );
}
