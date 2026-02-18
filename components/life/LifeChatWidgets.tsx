'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import type { Option, LifeRider, LifeJourneyState } from '../../lib/life/types';
import { useLifeJourneyStore } from '../../lib/life/store';

/* ═══════════════════════════════════════════════════════
   SVG Icon System — Life-specific icons
   ═══════════════════════════════════════════════════════ */

const LIFE_ICON_PATHS: Record<string, string> = {
  shield: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  heart: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
  user: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  currency: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  check: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  document: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  family: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  flexi: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75',
};

function LifeIcon({ icon, className = 'w-6 h-6' }: { icon: string; className?: string }) {
  const path = LIFE_ICON_PATHS[icon];
  if (!path) return <span className="text-2xl">{icon}</span>;
  return (
    <svg className={`${className} text-purple-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Selection Cards — Reusable grid/list selection
   ═══════════════════════════════════════════════════════ */

export function LifeSelectionCards({ options, onSelect }: { options: Option[]; onSelect: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const useGrid = options.length <= 4 && options.every(o => o.icon);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => onSelect(id), 250);
  };

  if (useGrid) {
    return (
      <div className="grid grid-cols-2 gap-3 max-w-md">
        {options.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => handleSelect(opt.id)}
            className={`
              relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-200 active:scale-[0.96] min-h-[120px] justify-center
              ${selected === opt.id
                ? 'border-purple-400 bg-white/15 shadow-lg shadow-purple-900/20'
                : 'border-white/10 bg-white/6 hover:bg-white/12 hover:border-white/20'
              }
            `}
          >
            {opt.icon && (
              <div className="mb-2">
                {typeof opt.icon === 'string' && LIFE_ICON_PATHS[opt.icon]
                  ? <LifeIcon icon={opt.icon} className="w-8 h-8" />
                  : <span className="text-3xl">{opt.icon}</span>}
              </div>
            )}
            <span className={`text-label-md font-medium ${selected === opt.id ? 'text-white' : 'text-white/90'}`}>
              {opt.label}
            </span>
            {opt.description && (
              <span className="text-caption text-white/50 mt-1">{opt.description}</span>
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2.5 max-w-md">
      {options.map((opt, i) => (
        <motion.button
          key={opt.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => handleSelect(opt.id)}
          className={`
            flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 active:scale-[0.97]
            ${selected === opt.id
              ? 'border-purple-400 bg-white/15 shadow-lg shadow-purple-900/20'
              : 'border-white/10 bg-white/6 hover:bg-white/12 hover:border-white/20'
            }
          `}
        >
          {opt.icon && (
            <div className="flex-shrink-0">
              {typeof opt.icon === 'string' && LIFE_ICON_PATHS[opt.icon]
                ? <LifeIcon icon={opt.icon} className="w-6 h-6" />
                : <span className="text-xl">{opt.icon}</span>}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className={`text-label-md font-medium block ${selected === opt.id ? 'text-white' : 'text-white/90'}`}>
              {opt.label}
            </span>
            {opt.description && (
              <span className="text-caption text-white/40 block mt-0.5">{opt.description}</span>
            )}
          </div>
          {selected === opt.id && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Number Input — For age, income, coverage amounts
   ═══════════════════════════════════════════════════════ */

export function LifeNumberInput({ 
  placeholder, 
  subText, 
  inputType,
  min, 
  max, 
  onSubmit 
}: { 
  placeholder: string; 
  subText?: string;
  inputType?: string;
  min?: number; 
  max?: number; 
  onSubmit: (val: string) => void 
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = () => {
    const num = parseFloat(value);
    if (!value.trim()) { setError('Please enter a value'); return; }
    if (min !== undefined && num < min) { setError(`Minimum value is ${min.toLocaleString('en-IN')}`); return; }
    if (max !== undefined && num > max) { setError(`Maximum value is ${max.toLocaleString('en-IN')}`); return; }
    setError('');
    onSubmit(value);
  };

  const formatDisplay = (v: string) => {
    const num = parseInt(v);
    if (isNaN(num)) return '';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-sm">
      <div className="relative">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 text-label-lg font-medium transition-colors"
        />
        {value && inputType !== 'tel' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-purple-300/70">
            {formatDisplay(value)}
          </div>
        )}
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-caption mt-1.5">
          {error}
        </motion.p>
      )}
      {subText && <p className="text-white/40 text-caption mt-1.5">{subText}</p>}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={handleSubmit}
        className="w-full mt-3 py-3 rounded-xl bg-white text-[#1C0B47] text-label-lg font-semibold active:scale-[0.97] transition-transform"
      >
        Continue
      </motion.button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Text Input — For name, phone, pincode
   ═══════════════════════════════════════════════════════ */

export function LifeTextInput({
  placeholder,
  inputType = 'text',
  maxLength,
  onSubmit,
}: {
  placeholder: string;
  inputType?: string;
  maxLength?: number;
  onSubmit: (val: string) => void;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = () => {
    if (!value.trim()) { setError('Please enter a value'); return; }
    if (inputType === 'tel' && value.length !== 10) { setError('Please enter a valid 10-digit number'); return; }
    setError('');
    onSubmit(value.trim());
  };

  return (
    <div className="max-w-sm">
      <input
        ref={inputRef}
        type={inputType}
        value={value}
        onChange={(e) => { setValue(e.target.value); setError(''); }}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 text-label-lg font-medium transition-colors"
        autoFocus
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-caption mt-1.5">
          {error}
        </motion.p>
      )}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={handleSubmit}
        className="w-full mt-3 py-3 rounded-xl bg-white text-[#1C0B47] text-label-lg font-semibold active:scale-[0.97] transition-transform"
      >
        Continue
      </motion.button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Date Picker — For date of birth
   ═══════════════════════════════════════════════════════ */

export function LifeDatePicker({
  placeholder = 'Select date of birth',
  onSubmit,
}: {
  placeholder?: string;
  onSubmit: (val: string) => void;
}) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => dayRef.current?.focus(), 300);
  }, []);

  const handleSubmit = () => {
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    if (!d || !m || !y) { setError('Please enter a complete date'); return; }
    if (d < 1 || d > 31) { setError('Invalid day'); return; }
    if (m < 1 || m > 12) { setError('Invalid month'); return; }
    if (y < 1940 || y > 2010) { setError('Year should be between 1940 and 2010'); return; }
    
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    setError('');
    onSubmit(dateStr);
  };

  return (
    <div className="max-w-sm">
      <p className="text-body-sm text-white/60 mb-3">{placeholder}</p>
      <div className="flex gap-2">
        <input
          ref={dayRef}
          type="number"
          inputMode="numeric"
          placeholder="DD"
          value={day}
          onChange={(e) => {
            setDay(e.target.value);
            if (e.target.value.length >= 2) monthRef.current?.focus();
          }}
          maxLength={2}
          className="flex-1 px-3 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 text-center text-label-lg font-medium transition-colors"
        />
        <input
          ref={monthRef}
          type="number"
          inputMode="numeric"
          placeholder="MM"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            if (e.target.value.length >= 2) yearRef.current?.focus();
          }}
          maxLength={2}
          className="flex-1 px-3 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 text-center text-label-lg font-medium transition-colors"
        />
        <input
          ref={yearRef}
          type="number"
          inputMode="numeric"
          placeholder="YYYY"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          maxLength={4}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-[1.5] px-3 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 text-center text-label-lg font-medium transition-colors"
        />
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-caption mt-1.5">
          {error}
        </motion.p>
      )}
      {day && month && year && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-purple-300/60 text-caption mt-1.5">
          {parseInt(day)}/{parseInt(month)}/{parseInt(year)}
        </motion.p>
      )}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={handleSubmit}
        className="w-full mt-3 py-3 rounded-xl bg-white text-[#1C0B47] text-label-lg font-semibold active:scale-[0.97] transition-transform"
      >
        Continue
      </motion.button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Rider Toggle — For add-on riders with premium impact
   ═══════════════════════════════════════════════════════ */

export function LifeRiderToggle({ 
  options, 
  onSelect 
}: { 
  options: Option[]; 
  onSelect: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => onSelect(id), 300);
  };

  return (
    <div className="max-w-md space-y-3">
      {options.map((opt, i) => (
        <motion.button
          key={opt.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => handleSelect(opt.id)}
          className={`
            w-full flex items-center gap-3 px-4 py-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.97]
            ${selected === opt.id
              ? opt.id === 'yes'
                ? 'border-purple-400 bg-purple-500/15 shadow-lg shadow-purple-900/20'
                : 'border-white/25 bg-white/10'
              : 'border-white/10 bg-white/6 hover:bg-white/10 hover:border-white/20'
            }
          `}
        >
          <div className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
            ${selected === opt.id
              ? opt.id === 'yes'
                ? 'border-purple-400 bg-purple-500'
                : 'border-white/40 bg-white/20'
              : 'border-white/30 bg-transparent'
            }
          `}>
            {selected === opt.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {opt.id === 'yes' ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </motion.div>
            )}
          </div>
          <span className={`text-label-md font-medium ${selected === opt.id ? 'text-white' : 'text-white/80'}`}>
            {opt.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Premium Summary — Full quote display with breakdown
   ═══════════════════════════════════════════════════════ */

export function LifePremiumSummary({ onContinue }: { onContinue: () => void }) {
  const store = useLifeJourneyStore();
  const state = useLifeJourneyStore.getState() as LifeJourneyState;
  const { quote, name, age, recommendedCoverage, selectedRiders, resolvedPersona, annualIncome } = state;

  const coverage = recommendedCoverage || 10000000;
  const yearlyPremium = quote?.yearlyPremium || 0;
  const monthlyPremium = quote?.monthlyPremium || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      {/* Quote Card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-caption">Your Coverage</p>
              <p className="text-white text-heading-lg font-bold">₹{(coverage / 10000000).toFixed(1)} Cr</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={LIFE_ICON_PATHS.shield} />
              </svg>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-body-sm text-gray-500">Policy Term</span>
            <span className="text-label-md font-medium text-gray-900">30 years</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-body-sm text-gray-500">Annual Premium</span>
            <span className="text-label-md font-bold text-gray-900">₹{yearlyPremium.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-body-sm text-gray-500">Monthly</span>
            <span className="text-label-md font-medium text-purple-600">₹{monthlyPremium.toLocaleString('en-IN')}/mo</span>
          </div>
          
          {selectedRiders.length > 0 && (
            <div className="pt-2">
              <p className="text-caption text-gray-400 uppercase tracking-wider mb-2">Add-on Riders</p>
              {selectedRiders.map((r) => (
                <div key={r.id} className="flex justify-between items-center py-1.5">
                  <span className="text-body-sm text-gray-600">{r.name}</span>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* Daily cost */}
          <div className="bg-purple-50 rounded-xl px-4 py-3 text-center">
            <p className="text-caption text-purple-500">That&apos;s just</p>
            <p className="text-heading-sm font-bold text-purple-700">₹{Math.round(yearlyPremium / 365)}/day</p>
            <p className="text-caption text-purple-400">for ₹{(coverage / 10000000).toFixed(1)} Cr protection</p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <button
            onClick={onContinue}
            className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-purple-600/30"
          >
            Continue with this plan
          </button>
        </div>
      </div>

      {/* Opportunity Cost — for Growth Seekers */}
      {resolvedPersona === 'growth_seeker' && annualIncome > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 bg-white/6 border border-white/10 rounded-2xl p-4"
        >
          <p className="text-label-sm font-semibold text-white/80 mb-3">Opportunity Cost Breakdown</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-body-sm text-white/60">Term Insurance Premium</span>
              <span className="text-body-sm text-white font-medium">₹{yearlyPremium.toLocaleString('en-IN')}/yr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-sm text-white/60">Available for Investment</span>
              <span className="text-body-sm text-green-400 font-medium">₹{(annualIncome - yearlyPremium).toLocaleString('en-IN')}/yr</span>
            </div>
            <div className="h-px bg-white/10 my-2" />
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-caption text-green-300">
                Separate protection from investment — you get ₹{(coverage / 10000000).toFixed(1)} Cr coverage
                AND ₹{((annualIncome - yearlyPremium) / 100000).toFixed(1)}L/yr to invest for growth.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Review Summary — Final plan review before payment
   ═══════════════════════════════════════════════════════ */

export function LifeReviewSummary({ onConfirm, onEdit }: { onConfirm: () => void; onEdit?: (stepId: string) => void }) {
  const state = useLifeJourneyStore.getState() as LifeJourneyState;
  const { name, age, gender, phone, pinCode, smokingStatus, annualIncome, occupation, recommendedCoverage, selectedRiders, quote } = state;

  const rows = [
    { label: 'Name', value: name, stepId: 'life_basic_name' },
    { label: 'Age', value: `${age} years`, stepId: 'life_basic_dob' },
    { label: 'Gender', value: gender === 'male' ? 'Male' : 'Female', stepId: 'life_basic_gender' },
    { label: 'Phone', value: phone, stepId: 'life_basic_phone' },
    { label: 'Pin Code', value: pinCode, stepId: 'life_basic_pincode' },
    { label: 'Smoker', value: smokingStatus === 'current' ? 'Yes' : 'No', stepId: 'life_basic_smoking' },
    { label: 'Annual Income', value: `₹${(annualIncome / 100000).toFixed(1)}L`, stepId: 'life_basic_income' },
    { label: 'Occupation', value: occupation, stepId: 'life_lifestyle_occupation' },
    { label: 'Coverage', value: `₹${((recommendedCoverage || 10000000) / 10000000).toFixed(1)} Cr`, stepId: 'life_quote_display' },
    { label: 'Riders', value: selectedRiders.length > 0 ? selectedRiders.map(r => r.name).join(', ') : 'None', stepId: 'life_addons_accidental_death' },
    { label: 'Premium', value: `₹${(quote?.yearlyPremium || 0).toLocaleString('en-IN')}/year`, stepId: 'life_quote_display' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-heading-sm font-bold text-gray-900">Plan Summary</h3>
          <p className="text-caption text-gray-400">Review your details before proceeding</p>
        </div>

        <div className="px-5 py-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-caption text-gray-400">{row.label}</p>
                <p className="text-body-sm text-gray-900 font-medium">{row.value}</p>
              </div>
              {onEdit && (
                <button
                  onClick={() => onEdit(row.stepId)}
                  className="text-purple-500 hover:text-purple-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-purple-600/30"
          >
            Proceed to Payment
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            By proceeding, you agree to ACKO&apos;s terms & conditions
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Post-Payment Timeline — Transparent process explanation
   ═══════════════════════════════════════════════════════ */

export function LifePostPaymentTimeline({ onContinue }: { onContinue: () => void }) {
  const steps = [
    { icon: '📞', title: 'Tele-Medical Call', desc: 'A quick call to understand your health better', time: 'Within 24 hrs' },
    { icon: '🏥', title: 'Medical Tests (if needed)', desc: 'Basic health tests for coverage above ₹1 Cr', time: '2-3 days' },
    { icon: '📄', title: 'Income Verification', desc: 'Submit income proof documents', time: 'Upload anytime' },
    { icon: '🔍', title: 'Underwriting Review', desc: 'Our team reviews everything', time: '2-3 business days' },
    { icon: '✅', title: 'Final Approval', desc: 'Your policy becomes active!', time: 'Same day as approval' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-heading-sm font-bold text-gray-900">What happens next?</h3>
          <p className="text-caption text-gray-400">Complete transparency — no surprises</p>
        </div>

        <div className="px-5 py-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="flex gap-3 mb-4 last:mb-0"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-lg flex-shrink-0">
                  {step.icon}
                </div>
                {i < steps.length - 1 && <div className="w-px h-full bg-purple-100 mt-1" />}
              </div>
              <div className="pb-4">
                <p className="text-label-md font-semibold text-gray-900">{step.title}</p>
                <p className="text-body-sm text-gray-500">{step.desc}</p>
                <p className="text-caption text-purple-500 mt-0.5">{step.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
          <p className="text-body-sm text-amber-700 leading-relaxed">
            <span className="font-semibold">Full disclosure helps you.</span> We&apos;d rather insure you correctly than reject later.
            If you&apos;re not approved, we refund 100% — no questions asked.
          </p>
        </div>

        <div className="px-5 pb-5 pt-3">
          <button
            onClick={onContinue}
            className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
          >
            Got it, continue
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Celebration — Journey complete animation
   ═══════════════════════════════════════════════════════ */

export function LifeCelebration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="text-center py-8 max-w-md mx-auto"
    >
      {/* Animated orb */}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-600/30"
      >
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={LIFE_ICON_PATHS.shield} />
        </svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-heading-lg font-bold text-white mb-2"
      >
        You&apos;re protected!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-body-md text-white/60 mb-6"
      >
        Your application is being processed. We&apos;ll keep you updated every step of the way.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/6 border border-white/10 rounded-2xl p-5 text-left"
      >
        <p className="text-label-sm font-semibold text-white/80 mb-3">What to expect:</p>
        <div className="space-y-2">
          {['Tele-medical call within 24 hours', 'Document upload link via SMS', 'Approval notification in 3-5 days'].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-body-sm text-white/70">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
