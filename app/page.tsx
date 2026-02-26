'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useJourneyStore } from '../lib/store';
import LanguageSelector from '../components/LanguageSelector';
import GlobalHero from '../components/global/GlobalHero';
import AckoLogo from '../components/AckoLogo';
import PolicyActionScreen, { type PolicyStatusInfo } from '../components/global/PolicyActionScreen';
import { useUserProfileStore, type PolicyLob } from '../lib/userProfileStore';
import { LobConfig } from '../lib/core/types';
import {
  loadSnapshot,
  getDropOffDisplay,
  type ProductKey,
} from '../lib/journeyPersist';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const LOBS: LobConfig[] = [
  { id: 'car', label: 'Car Insurance', tagline: '', description: '', icon: 'car', active: true, route: '/motor?vehicle=car' },
  { id: 'bike', label: 'Bike/Scooter Insurance', tagline: '', description: '', icon: 'bike', active: true, route: '/motor?vehicle=bike' },
  { id: 'health', label: 'Health Insurance', tagline: '', description: '', icon: 'health', active: true, route: '/health' },
  { id: 'life', label: 'Life Insurance', tagline: '', description: '', icon: 'life', active: true, route: '/life' },
];

type LobId = 'car' | 'bike' | 'health' | 'life';

interface LobContent {
  tagline: string;
  headline: [string, string];
  highlight: string;
  cta: string;
  taglineColor: string;
  heroImage: string;
}

const LOB_CONTENT: Record<LobId, LobContent> = {
  car: {
    tagline: 'Your ACKO advantage',
    headline: ['Upgrade your drive', 'with the best deals.'],
    highlight: 'Save up to \u20B95,000',
    cta: 'Insure my car now',
    taglineColor: '#82E696',
    heroImage: `${BASE}/offerings/car-hero.png`,
  },
  bike: {
    tagline: 'Quick & hassle-free',
    headline: ['Protect your ride', 'in under 2 minutes.'],
    highlight: 'Instant policy',
    cta: 'Insure my bike now',
    taglineColor: '#82AAFA',
    heroImage: `${BASE}/offerings/bike-hero.png`,
  },
  health: {
    tagline: 'No confusion. No complicated terms',
    headline: ["Let\u2019s find the health plan", ' that fits your needs.'],
    highlight: 'Guided, step by step',
    cta: 'Get your health covered',
    taglineColor: '#d0bdf4',
    heroImage: `${BASE}/offerings/health-hero-illustration.png`,
  },
  life: {
    tagline: 'Simple & transparent',
    headline: ["Secure your family\u2019s", 'future, starting today.'],
    highlight: 'Plans from \u20B9490/mo',
    cta: 'Get life cover',
    taglineColor: '#A78BFA',
    heroImage: `${BASE}/offerings/life-hero.png`,
  },
};

const LOB_ITEMS = ['Car', 'Bike', 'Health', 'Life'] as const;
const LOB_ID_MAP: Record<string, LobId> = { Car: 'car', Bike: 'bike', Health: 'health', Life: 'life' };
const LOB_LABEL_MAP: Record<string, string> = {
  car: 'Car Insurance', bike: 'Bike Insurance',
  health: 'Health Insurance', life: 'Life Insurance',
};

const EASE_OUT_CUBIC = [0.215, 0.61, 0.355, 1] as const;

type Screen = 'language' | 'home' | 'policy_action';

const URGENCY_COLORS: Record<string, string> = {
  high: '#f87171',
  medium: '#fbbf24',
  low: '#34d399',
};

const URGENCY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

const LOB_TO_PRODUCT: Record<LobId, ProductKey> = {
  car: 'car', bike: 'bike', health: 'health', life: 'life',
};

const PRODUCT_TO_TAB: Record<ProductKey, string> = {
  car: 'Car', bike: 'Bike', health: 'Health', life: 'Life',
};

interface LobOverride {
  content: LobContent;
  route: string;
  urgency: 'high' | 'medium' | 'low';
  statusInfo?: PolicyStatusInfo | null;
}

function splitTitle(title: string): [string, string] {
  const words = title.split(' ');
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function computeSnapshots(): { overrides: Partial<Record<LobId, LobOverride>>; bestTab: string | null } {
  const result: Partial<Record<LobId, LobOverride>> = {};
  let bestTab: string | null = null;
  let bestRank = 0;
  let bestTime = 0;

  for (const lobId of Object.keys(LOB_TO_PRODUCT) as LobId[]) {
    const product = LOB_TO_PRODUCT[lobId];
    const snap = loadSnapshot(product);
    if (!snap) continue;
    const display = getDropOffDisplay(snap);
    if (!display) continue;

    const base = LOB_CONTENT[lobId];
    let statusInfo: PolicyStatusInfo | null = null;
    const stepId = snap.currentStepId;
    if (stepId === 'life_db.personal_submitted') {
      statusInfo = { badge: 'Update in progress', message: 'Personal info update · Processing in 2-3 days', urgency: 'low' };
    } else if (stepId === 'life_db.nominee_submitted') {
      statusInfo = { badge: 'Update in progress', message: 'Nominee update · Verification in 2-3 days', urgency: 'low' };
    } else if (stepId === 'life_db.coverage_submitted') {
      statusInfo = { badge: 'Under review', message: 'Coverage update · Review in 5-7 days', urgency: 'medium' };
    }
    result[lobId] = {
      content: {
        tagline: display.badge,
        headline: splitTitle(display.title),
        highlight: display.subtitle || '',
        cta: display.ctaLabel,
        taglineColor: URGENCY_COLORS[display.urgency] || '#d0bdf4',
        heroImage: base.heroImage,
      },
      route: display.route,
      urgency: display.urgency,
      statusInfo,
    };

    const rank = URGENCY_RANK[display.urgency] || 0;
    const time = new Date(snap.savedAt).getTime();
    if (rank > bestRank || (rank === bestRank && time > bestTime)) {
      bestRank = rank;
      bestTime = time;
      bestTab = PRODUCT_TO_TAB[product];
    }
  }

  return { overrides: result, bestTab };
}

function useLobSnapshots() {
  const [overrides, setOverrides] = useState<Partial<Record<LobId, LobOverride>>>(() => {
    if (typeof window === 'undefined') return {};
    return computeSnapshots().overrides;
  });
  const [initialTab, setInitialTab] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return computeSnapshots().bestTab;
  });

  const reload = useCallback(() => {
    const { overrides: newOv, bestTab } = computeSnapshots();
    setOverrides(newOv);
    if (bestTab) setInitialTab(bestTab);
  }, []);

  useEffect(() => {
    reload();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') reload();
    };
    const onFocus = () => reload();
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) reload();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [reload]);

  return { overrides, initialTab };
}

/* ── Purple glow behind logo ── */
function PurpleGlow() {
  return (
    <motion.div
      className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none"
    >
      <motion.div
        className="w-[180px] h-[108px] rounded-[32px]"
        style={{
          filter: 'blur(100px)',
          background: 'radial-gradient(circle, rgba(183,168,208,1) 0%, rgba(140,108,214,1) 40%, rgba(118,78,217,1) 65%, rgba(97,48,220,1) 100%)',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.1, ease: EASE_OUT_CUBIC }}
      />
    </motion.div>
  );
}

/* ── LOB Tabs ── */
function LOBTabs({
  selected,
  onSelect,
  dots,
}: {
  selected: string;
  onSelect: (v: string) => void;
  dots?: Partial<Record<string, 'high' | 'medium' | 'low'>>;
}) {
  return (
    <motion.div
      className="flex gap-[12px] items-center justify-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: EASE_OUT_CUBIC }}
    >
      {LOB_ITEMS.map((item) => {
        const isSelected = item === selected;
        const dotUrgency = dots?.[item];
        return (
          <motion.button
            key={item}
            onClick={() => onSelect(item)}
            className="relative flex items-center justify-center px-[20px] py-[8px] rounded-[80px] cursor-pointer border-none outline-none"
            style={{
              background: isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
              fontWeight: isSelected ? 500 : 400,
              fontSize: '12px',
              lineHeight: '18px',
              color: isSelected ? '#ffffff' : '#a6a6a6',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {item}
            {dotUrgency && (
              <span
                className="absolute -top-0.5 -right-0.5 flex h-[7px] w-[7px]"
              >
                {dotUrgency === 'high' && (
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                    style={{ background: URGENCY_COLORS[dotUrgency] }}
                  />
                )}
                <span
                  className="relative inline-flex rounded-full h-[7px] w-[7px]"
                  style={{ background: URGENCY_COLORS[dotUrgency] }}
                />
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

/* ── Hero Image ── */
function HeroImage({ src }: { src: string }) {
  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: EASE_OUT_CUBIC }}
    >
      <motion.img
        alt=""
        src={src}
        draggable={false}
        style={{
          maxWidth: '90%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

/* ── Sub Heading (tagline + headline) ── */
function SubHeading({ tagline, headline, taglineColor }: { tagline: string; headline: [string, string]; taglineColor: string }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-[8px] w-full max-w-[343px] mx-auto text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.7, ease: EASE_OUT_CUBIC }}
    >
      <div
        style={{
          fontWeight: 500,
          fontSize: '10px',
          lineHeight: '14px',
          color: taglineColor,
        }}
      >
        {tagline}
      </div>
      <div
        style={{
          fontWeight: 500,
          fontSize: '22px',
          lineHeight: '34px',
          color: 'rgba(255,255,255,0.96)',
          letterSpacing: '-0.1px',
        }}
      >
        <div>{headline[0]}</div>
        <div>{headline[1]}</div>
      </div>
    </motion.div>
  );
}

/* ── Highlight Line ── */
function HighlightLine({ text }: { text: string }) {
  return (
    <motion.div
      className="w-full flex items-center justify-center relative"
      style={{
        height: '36px',
        background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.04) 50%, rgba(255,255,255,0))',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.9 }}
    >
      <motion.div
        style={{
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '20px',
          color: 'rgba(255,255,255,0.96)',
          textAlign: 'center',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        {text}
      </motion.div>
    </motion.div>
  );
}

/* ── CTA Button ── */
function CTAButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.div
      className="w-full flex justify-center"
      style={{ padding: '0 27.5px' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.1, ease: EASE_OUT_CUBIC }}
    >
      <motion.button
        onClick={onClick}
        className="flex gap-[12px] items-center justify-center w-full max-w-[320px] rounded-[16px] border-none outline-none cursor-pointer"
        style={{
          background: '#ffffff',
          padding: '16px 12px',
        }}
        whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(255,255,255,0.15)' }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2 }}
      >
        <span
          style={{
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#121212',
            textAlign: 'center',
          }}
        >
          {label}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1.33337 6.00004H10.6667M10.6667 6.00004L6.00004 1.33337M10.6667 6.00004L6.00004 10.6667"
            stroke="rgba(0,0,0,0.88)"
            strokeWidth="1.33"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>
    </motion.div>
  );
}

export default function GlobalHomepage() {
  const router = useRouter();
  const { setLanguage } = useJourneyStore();
  const [screen, setScreen] = useState<Screen>('language');
  const [hydrated, setHydrated] = useState(false);
  const [selectedLOB, setSelectedLOB] = useState('Health');
  const [selectedLob, setSelectedLob] = useState<LobConfig | null>(null);
  const swipeDir = useRef(0);
  const SWIPE_THRESHOLD = 50;
  const initialTabApplied = useRef(false);

  const { overrides, initialTab } = useLobSnapshots();

  useEffect(() => {
    setHydrated(true);
    if (localStorage.getItem('acko_lang_chosen')) setScreen('home');
  }, []);

  useEffect(() => {
    if (initialTab && !initialTabApplied.current) {
      initialTabApplied.current = true;
      setSelectedLOB(initialTab);
    }
  }, [initialTab]);

  const activeLobId = LOB_ID_MAP[selectedLOB] || 'health';
  const override = overrides[activeLobId];
  const content = override?.content ?? LOB_CONTENT[activeLobId];

  const tabDots = useMemo(() => {
    const dots: Partial<Record<string, 'high' | 'medium' | 'low'>> = {};
    for (const [lobId, ov] of Object.entries(overrides)) {
      const tab = PRODUCT_TO_TAB[lobId as ProductKey];
      if (tab && ov) dots[tab] = ov.urgency;
    }
    return dots;
  }, [overrides]);

  const currentIdx = LOB_ITEMS.indexOf(selectedLOB as typeof LOB_ITEMS[number]);

  const goToLOB = useCallback((direction: 1 | -1) => {
    const nextIdx = (currentIdx + direction + LOB_ITEMS.length) % LOB_ITEMS.length;
    swipeDir.current = direction;
    setSelectedLOB(LOB_ITEMS[nextIdx]);
  }, [currentIdx]);

  const handleSwipe = useCallback((_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 300) {
      if (offset.x < 0) goToLOB(1);
      else goToLOB(-1);
    }
  }, [goToLOB]);

  const handleTabSelect = useCallback((tab: string) => {
    const newIdx = LOB_ITEMS.indexOf(tab as typeof LOB_ITEMS[number]);
    swipeDir.current = newIdx > currentIdx ? 1 : -1;
    setSelectedLOB(tab);
  }, [currentIdx]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
  };

  const handleCTAClick = useCallback(() => {
    const lob = LOBS.find(l => l.id === activeLobId);
    if (!lob) return;
    const lobKey = lob.id as PolicyLob;
    const ps = useUserProfileStore.getState();

    if (override && override.urgency !== 'low') {
      router.push(override.route);
      return;
    }

    if (ps.isLoggedIn && ps.hasActivePolicyInLob(lobKey)) {
      setSelectedLob(lob);
      setScreen('policy_action');
      return;
    }

    if (override) {
      router.push(override.route);
      return;
    }

    router.push(lob.route);
  }, [activeLobId, router, override]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#121212' }}>
        <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {screen === 'language' && (
        <LanguageSelector key="lang" onSelect={() => {
          localStorage.setItem('acko_lang_chosen', 'true');
          setScreen('home');
        }} />
      )}

      {screen === 'home' && (
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full flex justify-center overflow-hidden"
          style={{ background: '#121212' }}
        >
          <div
            className="relative w-full flex flex-col items-center"
            style={{ maxWidth: '375px', height: '100%' }}
          >
            {/* Purple glow at the top */}
            <PurpleGlow />

            {/* GlobalHero — ACKO logo, theme switcher, hamburger menu, profile & language drawer */}
            <div className="w-full shrink-0 z-30">
              <GlobalHero hideHeadline />
            </div>

            {/* Title */}
            <div
              className="flex flex-col items-center w-full gap-[8px] shrink-0"
              style={{ paddingLeft: '16px', paddingRight: '16px' }}
            >

              <motion.div
                className="w-full text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_CUBIC }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '24px',
                    lineHeight: '32px',
                    color: 'rgba(255,255,255,0.88)',
                    letterSpacing: '-0.5px',
                  }}
                >
                  <div>All your insurance</div>
                  <div>in one place</div>
                </div>
              </motion.div>
            </div>

            {/* LOB Tabs */}
            <div className="shrink-0" style={{ marginTop: '24px' }}>
              <LOBTabs selected={selectedLOB} onSelect={handleTabSelect} dots={tabDots} />
            </div>

            {/* Swipeable content area */}
            <motion.div
              className="w-full flex-1 min-h-0 flex flex-col"
              style={{ marginTop: '32px', touchAction: 'pan-y' }}
              onPanEnd={handleSwipe}
            >
              <AnimatePresence mode="wait" custom={swipeDir.current}>
                <motion.div
                  key={selectedLOB}
                  custom={swipeDir.current}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: EASE_OUT_CUBIC }}
                  className="w-full flex-1 min-h-0 flex flex-col"
                >
                  {/* Hero image */}
                  <div className="w-full flex-1 min-h-0">
                    <HeroImage src={content.heroImage} />
                  </div>

                  {/* Sub heading */}
                  <div className="shrink-0 w-full" style={{ marginTop: '16px', padding: '0 16px' }}>
                    <SubHeading
                      tagline={content.tagline}
                      headline={content.headline}
                      taglineColor={content.taglineColor}
                    />
                  </div>

                  {/* Highlight line */}
                  <div className="w-full shrink-0" style={{ marginTop: '16px' }}>
                    <HighlightLine text={content.highlight} />
                  </div>

                  {/* CTA Button */}
                  <div className="w-full shrink-0" style={{ marginTop: '24px', paddingBottom: '40px' }}>
                    <CTAButton label={content.cta} onClick={handleCTAClick} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}

      {screen === 'policy_action' && selectedLob && (
        <PolicyActionScreen
          key="policy_action"
          lobId={selectedLob.id}
          lobLabel={LOB_LABEL_MAP[selectedLob.id] || selectedLob.label}
          statusInfo={overrides[selectedLob.id as LobId]?.statusInfo}
          onBuyNew={() => router.push(selectedLob.route)}
          onManagePolicy={() => {
            const routes: Record<string, string> = {
              health: '/health?screen=dashboard', car: '/motor?vehicle=car&screen=dashboard',
              bike: '/motor?vehicle=bike&screen=dashboard', life: '/life?screen=dashboard',
            };
            router.push(routes[selectedLob.id] || selectedLob.route);
          }}
          onBack={() => { setSelectedLob(null); setScreen('home'); }}
        />
      )}
    </AnimatePresence>
  );
}
