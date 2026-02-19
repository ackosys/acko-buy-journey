'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Option, LifeRider, LifeJourneyState } from '../../lib/life/types';
import { useLifeJourneyStore } from '../../lib/life/store';
import { calculateBasePremium } from '../../lib/life/scripts';

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
   Multi Select — Grid with multi-selection and confirm
   ═══════════════════════════════════════════════════════ */

export function LifeMultiSelect({ options, onSelect }: { options: Option[]; onSelect: (response: string) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (id === 'none') {
      setSelected(prev => prev.includes('none') ? [] : ['none']);
      return;
    }
    setSelected(prev => {
      const without = prev.filter(s => s !== 'none');
      return without.includes(id) ? without.filter(s => s !== id) : [...without, id];
    });
  };

  return (
    <div className="max-w-md">
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((opt, i) => {
          const isSelected = selected.includes(opt.id);
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => toggle(opt.id)}
              className={`
                flex items-center justify-center text-center px-4 py-3.5 rounded-xl border transition-all duration-150 active:scale-[0.97]
                ${isSelected
                  ? 'border-purple-400 bg-white/15'
                  : 'border-white/10 bg-white/6 hover:bg-white/12 hover:border-white/20'
                }
              `}
            >
              <span className="text-label-md text-white/90 font-medium">{opt.label}</span>
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
      <button
        onClick={() => selected.length > 0 && onSelect(selected.join(','))}
        disabled={selected.length === 0}
        className="mt-4 w-full py-3 bg-white text-[#1C0B47] rounded-xl text-label-lg font-semibold disabled:opacity-40 transition-all hover:bg-white/90 active:scale-[0.97]"
      >
        Continue
      </button>
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
   Coverage Card — Clean visual summary of recommended coverage
   ═══════════════════════════════════════════════════════ */

export function LifeCoverageCard({ coverageAmount, policyTerm, coversTillAge, breakdownItems, onContinue }: {
  coverageAmount: string;
  policyTerm: string;
  coversTillAge: number;
  breakdownItems?: { label: string; value: string }[];
  onContinue: () => void;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-sm mx-auto"
    >
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600/40 to-indigo-700/40 border border-white/10 backdrop-blur-sm">
        <div className="px-5 pt-5 pb-4">
          <p className="text-white/50 text-caption uppercase tracking-wider mb-1">Recommended Cover</p>
          <p className="text-3xl font-bold text-white">{coverageAmount}</p>
        </div>

        <div className="h-px bg-white/10" />

        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-caption uppercase tracking-wider mb-0.5">Policy Term</p>
            <p className="text-lg font-semibold text-white">{policyTerm}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-caption uppercase tracking-wider mb-0.5">Covers till age</p>
            <p className="text-lg font-semibold text-white">{coversTillAge}</p>
          </div>
        </div>

        {breakdownItems && breakdownItems.length > 0 && (
          <>
            <div className="h-px bg-white/10" />
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full px-5 py-3 flex items-center justify-between text-white/60 hover:text-white/80 transition-colors"
            >
              <span className="text-caption font-medium">Why this is recommended</span>
              <motion.svg
                animate={{ rotate: showBreakdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {showBreakdown && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 space-y-2">
                    {breakdownItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-caption text-white/50">{item.label}</span>
                        <span className="text-caption text-white/80 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <button
        onClick={onContinue}
        className="mt-4 w-full py-3 bg-white text-[#1C0B47] rounded-xl text-label-lg font-semibold transition-all hover:bg-white/90 active:scale-[0.97]"
      >
        Continue
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Premium Summary — Interactive quote with coverage & tenure sliders
   ═══════════════════════════════════════════════════════ */

export function LifePremiumSummary({ onContinue }: { onContinue: () => void }) {
  const state = useLifeJourneyStore.getState() as LifeJourneyState;
  const { age, recommendedCoverage, annualIncome } = state;

  const minCoverage = 2500000;
  // Max coverage: 40x income, capped at 100Cr, min 25L, intervals of 25L
  const incomeMax = Math.max(minCoverage, (annualIncome || 0) * 40);
  const maxCoverage = Math.min(1000000000, Math.floor(incomeMax / 2500000) * 2500000);
  const coverageStep = 2500000;

  const defaultCoverage = recommendedCoverage || 10000000;
  const defaultTerm = state.selectedTerm || (60 - age);

  const [coverage, setCoverage] = useState(() => Math.min(maxCoverage, Math.max(minCoverage, defaultCoverage)));
  const [term, setTerm] = useState(defaultTerm);

  const minTerm = 10;
  const maxTerm = Math.min(60 - age, 40);
  const [showFlexiDetails, setShowFlexiDetails] = useState(false);

  const premium = calculateBasePremium({ ...state, recommendedCoverage: coverage, selectedTerm: term });
  const monthly = Math.round(premium.totalPremium / 12);
  const daily = Math.round(premium.totalPremium / 365);

  const formatCoverage = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const getProgress = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const handleContinue = () => {
    useLifeJourneyStore.setState({
      selectedCoverage: coverage,
      selectedTerm: term,
      quote: {
        sumAssured: coverage,
        policyTerm: term,
        premiumFrequency: 'yearly' as const,
        basePremium: premium.basePremium,
        riders: [],
        totalPremium: premium.totalPremium,
        monthlyPremium: monthly,
        yearlyPremium: premium.totalPremium,
      },
    });
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">
        {/* Header with premium */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-5">
          <p className="text-white/60 text-caption uppercase tracking-wider">Annual Premium</p>
          <p className="text-white text-3xl font-bold mt-1">₹{premium.totalPremium.toLocaleString('en-IN')}<span className="text-lg font-normal text-white/60">/yr</span></p>
          <p className="text-white/50 text-caption mt-1">₹{monthly.toLocaleString('en-IN')}/mo &middot; ₹{daily}/day</p>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* Coverage slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-body-sm text-gray-500">Coverage</span>
              <span className="text-label-md font-bold text-gray-900">{formatCoverage(coverage)}</span>
            </div>
            <div className="relative h-6 flex items-center">
              <input
                type="range"
                min={minCoverage}
                max={maxCoverage}
                step={coverageStep}
                value={coverage}
                onChange={(e) => setCoverage(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #9333ea ${getProgress(coverage, minCoverage, maxCoverage)}%, #e5e7eb ${getProgress(coverage, minCoverage, maxCoverage)}%)`
                }}
                className="absolute w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">{formatCoverage(minCoverage)}</span>
              <span className="text-[10px] text-gray-400">{formatCoverage(maxCoverage)}</span>
            </div>
          </div>

          {/* Tenure slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-body-sm text-gray-500">Policy Term</span>
              <span className="text-label-md font-bold text-gray-900">{term} years <span className="font-normal text-gray-400">(till age {age + term})</span></span>
            </div>
            <div className="relative h-6 flex items-center">
              <input
                type="range"
                min={minTerm}
                max={maxTerm}
                step={1}
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #9333ea ${getProgress(term, minTerm, maxTerm)}%, #e5e7eb ${getProgress(term, minTerm, maxTerm)}%)`
                }}
                className="absolute w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">{minTerm} yrs</span>
              <span className="text-[10px] text-gray-400">{maxTerm} yrs</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-2">
          <div className="bg-purple-50 rounded-xl overflow-hidden border border-purple-100 transition-all duration-300">
            <button 
              onClick={() => setShowFlexiDetails(!showFlexiDetails)}
              className="w-full text-left p-3.5 flex gap-3"
            >
              <div className="mt-0.5 flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={LIFE_ICON_PATHS.flexi} />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-label-sm font-bold text-purple-900">ACKO Flexi Benefit included</p>
                  <svg 
                    className={`w-4 h-4 text-purple-500 transition-transform duration-200 ${showFlexiDetails ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-caption text-purple-700 mt-0.5 leading-snug">
                  You can increase or decrease your coverage anytime later.
                </p>
              </div>
            </button>
            
            <AnimatePresence>
              {showFlexiDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3.5 pb-3.5 pt-0"
                >
                  <div className="h-px bg-purple-200/50 mb-3" />
                  <p className="text-caption font-semibold text-purple-900 mb-2">Why Flexi matters:</p>
                  <ul className="space-y-1.5">
                    {[
                      'Your income grows over time',
                      'Your loans change',
                      'Your family size changes'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-caption text-purple-800">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <button
            onClick={handleContinue}
            className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-purple-600/30"
          >
            Continue with this plan
          </button>
        </div>
      </div>
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

/* ═══════════════════════════════════════════════════════
   Coverage Input — Direct-quote path: user picks coverage + term
   ═══════════════════════════════════════════════════════ */

export function LifeCoverageInput({ onContinue }: { onContinue: () => void }) {
  const state = useLifeJourneyStore.getState() as LifeJourneyState;
  const { age, annualIncome } = state;

  const minCoverage = 2500000; // 25L
  // Max coverage: 40x income, capped at 100Cr, min 25L, intervals of 25L
  const incomeMax = Math.max(minCoverage, (annualIncome || 0) * 40);
  const maxCoverage = Math.min(1000000000, Math.floor(incomeMax / 2500000) * 2500000);
  const coverageStep = 2500000;

  const minTerm = 10;
  const maxTerm = Math.min(60 - age, 40);

  const [coverage, setCoverage] = useState(() => Math.min(maxCoverage, Math.max(minCoverage, 10000000)));
  const [term, setTerm] = useState(Math.min(60 - age, 30));
  const [showFlexiDetails, setShowFlexiDetails] = useState(false);

  const formatCoverage = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const getProgress = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const handleContinue = () => {
    useLifeJourneyStore.setState({
      selectedCoverage: coverage,
      selectedTerm: term,
      recommendedCoverage: coverage,
    });
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-4">
          <p className="text-white/80 text-caption uppercase tracking-wider">Select your plan</p>
          <p className="text-white text-lg font-bold mt-1">Choose coverage & term</p>
        </div>

        <div className="px-5 py-5 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-body-sm text-gray-500">Coverage Amount</span>
              <span className="text-label-md font-bold text-gray-900">{formatCoverage(coverage)}</span>
            </div>
            <div className="relative h-6 flex items-center">
              <input
                type="range"
                min={minCoverage}
                max={maxCoverage}
                step={coverageStep}
                value={coverage}
                onChange={(e) => setCoverage(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #9333ea ${getProgress(coverage, minCoverage, maxCoverage)}%, #e5e7eb ${getProgress(coverage, minCoverage, maxCoverage)}%)`
                }}
                className="absolute w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">{formatCoverage(minCoverage)}</span>
              <span className="text-[10px] text-gray-400">{formatCoverage(maxCoverage)}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-body-sm text-gray-500">Policy Term</span>
              <span className="text-label-md font-bold text-gray-900">{term} years <span className="font-normal text-gray-400">(till age {age + term})</span></span>
            </div>
            <div className="relative h-6 flex items-center">
              <input
                type="range"
                min={minTerm}
                max={maxTerm}
                step={1}
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #9333ea ${getProgress(term, minTerm, maxTerm)}%, #e5e7eb ${getProgress(term, minTerm, maxTerm)}%)`
                }}
                className="absolute w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">{minTerm} yrs</span>
              <span className="text-[10px] text-gray-400">{maxTerm} yrs</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-2">
          <div className="bg-purple-50 rounded-xl overflow-hidden border border-purple-100 transition-all duration-300">
            <button 
              onClick={() => setShowFlexiDetails(!showFlexiDetails)}
              className="w-full text-left p-3.5 flex gap-3"
            >
              <div className="mt-0.5 flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={LIFE_ICON_PATHS.flexi} />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-label-sm font-bold text-purple-900">ACKO Flexi Benefit included</p>
                  <svg 
                    className={`w-4 h-4 text-purple-500 transition-transform duration-200 ${showFlexiDetails ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-caption text-purple-700 mt-0.5 leading-snug">
                  You can increase or decrease your coverage anytime later.
                </p>
              </div>
            </button>
            
            <AnimatePresence>
              {showFlexiDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3.5 pb-3.5 pt-0"
                >
                  <div className="h-px bg-purple-200/50 mb-3" />
                  <p className="text-caption font-semibold text-purple-900 mb-2">Why Flexi matters:</p>
                  <ul className="space-y-1.5">
                    {[
                      'Your income grows over time',
                      'Your loans change',
                      'Your family size changes'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-caption text-purple-800">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handleContinue}
            className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-purple-600/30"
          >
            Get my quote
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Payment Screen — Plan summary + Pay CTA
   ═══════════════════════════════════════════════════════ */

export function LifePaymentScreen({ onContinue }: { onContinue: () => void }) {
  const state = useLifeJourneyStore.getState() as LifeJourneyState;
  const [processing, setProcessing] = useState(false);

  const formatAmt = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const yearlyPremium = state.quote?.yearlyPremium || 0;
  const monthlyPremium = state.quote?.monthlyPremium || 0;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onContinue();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-5">
          <p className="text-white/60 text-caption uppercase tracking-wider">Your Coverage</p>
          <p className="text-white text-2xl font-bold mt-1">{formatAmt(state.selectedCoverage)}</p>
          <p className="text-white/50 text-caption mt-1">{state.selectedTerm} years &middot; till age {state.age + state.selectedTerm}</p>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-body-sm text-gray-500">Annual Premium</span>
            <span className="text-label-md font-bold text-gray-900">₹{yearlyPremium.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-body-sm text-gray-500">Monthly</span>
            <span className="text-label-md text-gray-700">₹{monthlyPremium.toLocaleString('en-IN')}/mo</span>
          </div>
          {state.selectedRiders.length > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-body-sm text-gray-500">Riders</span>
              <span className="text-body-sm text-gray-600">{state.selectedRiders.map(r => r.name).join(', ')}</span>
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-purple-600/30 disabled:opacity-70"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
                Processing...
              </span>
            ) : (
              `Pay ₹${yearlyPremium.toLocaleString('en-IN')}`
            )}
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            Secure payment &middot; 100% refund if not approved
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   e-KYC Screen — Full Aadhaar OTP verification flow
   Stages: start → aadhaar → sending → otp → verifying → success
   Edge cases: wrong OTP (max 3), OTP expiry, service down,
               Aadhaar not linked to mobile, alternative KYC paths
   ═══════════════════════════════════════════════════════ */

type EkycStage =
  | 'start'
  | 'aadhaar'
  | 'sending'
  | 'otp'
  | 'verifying'
  | 'success'
  | 'error_wrong_otp'
  | 'error_expired'
  | 'error_locked'
  | 'error_not_linked'
  | 'error_service_down'
  | 'alt_digilocker'
  | 'alt_video_kyc'
  | 'alt_upload';

const MAX_OTP_ATTEMPTS = 3;
const MAX_RESENDS = 2;
const OTP_TIMER_SECONDS = 60;
// In prototype mode, OTP "123456" succeeds. Any other 6-digit OTP simulates failure.
const DEMO_OTP = '123456';

function EkycOtpBoxes({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
}) {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  useEffect(() => {
    refs[0].current?.focus();
  }, []);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const arr = value.split('').concat(Array(6).fill('')).slice(0, 6);
    arr[i] = digit;
    const next = arr.join('');
    onChange(next);
    if (digit && i < 5) {
      refs[i + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    const focusIdx = Math.min(pasted.length, 5);
    refs[focusIdx].current?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`w-10 h-12 rounded-xl border text-center text-lg font-bold text-gray-900 focus:outline-none transition-colors
            ${hasError
              ? 'border-red-400 bg-red-50 text-red-700'
              : value[i]
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-200 bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30'
            }`}
        />
      ))}
    </div>
  );
}

function EkycTimer({
  seconds,
  onExpire,
}: {
  seconds: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const pct = (remaining / seconds) * 100;

  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="13" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle
            cx="16" cy="16" r="13" fill="none"
            stroke={remaining <= 10 ? '#ef4444' : '#9333ea'}
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 13}`}
            strokeDashoffset={`${2 * Math.PI * 13 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${remaining <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
          {remaining}
        </span>
      </div>
      <span className="text-caption text-gray-500">
        {remaining > 0 ? `OTP expires in ${remaining}s` : 'OTP expired'}
      </span>
    </div>
  );
}

export function LifeEkycScreen({ onContinue }: { onContinue: () => void }) {
  const [stage, setStage] = useState<EkycStage>('start');
  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarError, setAadhaarError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [resends, setResends] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);

  const maskedAadhaar = aadhaar.length >= 8
    ? `XXXX XXXX ${aadhaar.slice(8, 12)}`
    : '——';

  const formatAadhaar = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const validateAadhaar = (val: string): string => {
    const digits = val.replace(/\s/g, '');
    if (digits.length < 12) return 'Please enter a valid 12-digit Aadhaar number';
    if (/^0/.test(digits)) return 'Aadhaar number cannot start with 0';
    if (/^1/.test(digits)) return 'Aadhaar number cannot start with 1';
    return '';
  };

  const handleSendOtp = () => {
    const err = validateAadhaar(aadhaar);
    if (err) { setAadhaarError(err); return; }
    setAadhaarError('');
    setStage('sending');
    setTimeout(() => {
      setOtp('');
      setOtpError('');
      setOtpExpired(false);
      setTimerKey((k) => k + 1);
      setStage('otp');
    }, 1800);
  };

  const handleVerifyOtp = () => {
    if (otp.replace(/\s/g, '').length < 6) {
      setOtpError('Please enter the complete 6-digit OTP');
      return;
    }
    setStage('verifying');
    setTimeout(() => {
      if (otp === DEMO_OTP) {
        setStage('success');
        setTimeout(() => onContinue(), 1800);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_OTP_ATTEMPTS) {
          setStage('error_locked');
        } else {
          setOtp('');
          setOtpError(`Incorrect OTP. ${MAX_OTP_ATTEMPTS - newAttempts} attempt${MAX_OTP_ATTEMPTS - newAttempts > 1 ? 's' : ''} remaining.`);
          setStage('otp');
        }
      }
    }, 2000);
  };

  const handleResend = () => {
    if (resends >= MAX_RESENDS) {
      setStage('error_not_linked');
      return;
    }
    setResends((r) => r + 1);
    setOtp('');
    setOtpError('');
    setOtpExpired(false);
    setStage('sending');
    setTimeout(() => {
      setTimerKey((k) => k + 1);
      setStage('otp');
    }, 1500);
  };

  const handleOtpExpired = useCallback(() => {
    setOtpExpired(true);
  }, []);

  const altOptions = [
    {
      id: 'alt_digilocker',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
      ),
      label: 'Verify via DigiLocker',
      desc: 'Instant verification using your DigiLocker Aadhaar',
    },
    {
      id: 'alt_video_kyc',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
      label: 'Video KYC with an agent',
      desc: '5-min video call with our KYC team',
    },
    {
      id: 'alt_upload',
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      ),
      label: 'Upload documents',
      desc: 'PAN card + selfie — reviewed in 2 hours',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">

        {/* ── Header ── */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-label-md font-bold text-gray-900">e-KYC Verification</h3>
              <p className="text-caption text-gray-400 truncate">
                {stage === 'start' && 'Aadhaar-based identity verification'}
                {stage === 'aadhaar' && 'Step 1 of 2 — Enter Aadhaar'}
                {stage === 'sending' && 'Sending OTP…'}
                {stage === 'otp' && `Step 2 of 2 — Verify OTP${resends > 0 ? ` (resent ${resends}×)` : ''}`}
                {stage === 'verifying' && 'Verifying with UIDAI…'}
                {stage === 'success' && 'Identity verified ✓'}
                {(stage === 'error_wrong_otp' || stage === 'error_expired' || stage === 'error_locked' || stage === 'error_not_linked' || stage === 'error_service_down') && 'Verification issue'}
                {(stage === 'alt_digilocker' || stage === 'alt_video_kyc' || stage === 'alt_upload') && 'Alternative KYC'}
              </p>
            </div>

            {/* Step progress pills */}
            {(stage === 'aadhaar' || stage === 'otp' || stage === 'verifying') && (
              <div className="ml-auto flex gap-1 flex-shrink-0">
                {[1, 2].map((s) => {
                  const active = s === 1 ? stage === 'aadhaar' : stage === 'otp' || stage === 'verifying';
                  const done = s === 1 && (stage === 'otp' || stage === 'verifying');
                  return (
                    <div
                      key={s}
                      className={`h-1.5 w-6 rounded-full transition-colors ${done ? 'bg-emerald-400' : active ? 'bg-purple-600' : 'bg-gray-200'}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="px-5 py-5"
          >

            {/* START */}
            {stage === 'start' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  {[
                    { n: 1, text: 'Enter your 12-digit Aadhaar number' },
                    { n: 2, text: 'OTP sent to your Aadhaar-linked mobile' },
                    { n: 3, text: 'Verified instantly — takes under 2 minutes' },
                  ].map(({ n, text }) => (
                    <div key={n} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">{n}</div>
                      <span className="text-body-sm text-gray-700">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Your Aadhaar data is encrypted and transmitted securely to UIDAI. ACKO does not store your Aadhaar number.
                  </p>
                </div>

                <button
                  onClick={() => setStage('aadhaar')}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-purple-600/20"
                >
                  Start e-KYC
                </button>
              </div>
            )}

            {/* AADHAAR INPUT */}
            {stage === 'aadhaar' && (
              <div className="space-y-4">
                <div>
                  <label className="text-caption font-semibold text-gray-500 uppercase tracking-wide block mb-2">Aadhaar Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={aadhaar}
                    onChange={(e) => {
                      setAadhaar(formatAadhaar(e.target.value));
                      setAadhaarError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={14}
                    autoFocus
                    className={`w-full px-4 py-3.5 rounded-xl border text-lg font-semibold tracking-[0.25em] text-gray-900 focus:outline-none transition-colors
                      ${aadhaarError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30'}`}
                  />
                  <AnimatePresence>
                    {aadhaarError && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-caption mt-1.5 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {aadhaarError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className="text-[11px] text-gray-400 mt-2">Make sure your mobile number is linked to this Aadhaar</p>
                </div>

                <button
                  onClick={handleSendOtp}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform disabled:opacity-40"
                  disabled={aadhaar.replace(/\s/g, '').length < 12}
                >
                  Send OTP
                </button>

                <button onClick={() => setStage('start')} className="w-full text-center text-caption text-gray-400 hover:text-gray-600 transition-colors py-1">
                  ← Back
                </button>
              </div>
            )}

            {/* SENDING OTP */}
            {stage === 'sending' && (
              <div className="flex flex-col items-center py-6 gap-3">
                <svg className="w-8 h-8 text-purple-500 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                </svg>
                <p className="text-body-sm text-gray-600">Sending OTP to Aadhaar-linked mobile…</p>
                <p className="text-caption text-gray-400">Powered by UIDAI</p>
              </div>
            )}

            {/* OTP ENTRY */}
            {stage === 'otp' && (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-body-sm text-gray-700 mb-0.5">OTP sent to your mobile linked with</p>
                  <p className="text-label-md font-bold text-gray-900">{maskedAadhaar}</p>
                </div>

                <EkycOtpBoxes value={otp} onChange={setOtp} hasError={!!otpError} />

                <AnimatePresence>
                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
                    >
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      <p className="text-caption text-red-700">{otpError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!otpExpired ? (
                  <EkycTimer key={timerKey} seconds={OTP_TIMER_SECONDS} onExpire={handleOtpExpired} />
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
                    <p className="text-caption text-red-500 font-medium">OTP has expired</p>
                    <button
                      onClick={handleResend}
                      className="text-purple-600 text-body-sm font-semibold hover:text-purple-800 transition-colors"
                    >
                      {resends >= MAX_RESENDS ? 'Mobile not linked? Try alternatives' : `Resend OTP (${MAX_RESENDS - resends} left)`}
                    </button>
                  </motion.div>
                )}

                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.replace(/\s/g, '').length < 6 || otpExpired}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform disabled:opacity-40"
                >
                  Verify OTP
                </button>

                <div className="flex items-center justify-between text-caption">
                  {!otpExpired && (
                    <button
                      onClick={handleResend}
                      disabled={resends >= MAX_RESENDS}
                      className="text-purple-500 hover:text-purple-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {resends >= MAX_RESENDS ? `Max resends reached` : `Resend OTP`}
                    </button>
                  )}
                  <button
                    onClick={() => { setStage('aadhaar'); setOtp(''); setOtpError(''); }}
                    className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
                  >
                    Wrong Aadhaar?
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <p className="text-[11px] text-amber-700">Demo: Enter <span className="font-bold">123456</span> to simulate successful verification</p>
                </div>
              </div>
            )}

            {/* VERIFYING */}
            {stage === 'verifying' && (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 text-purple-200 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 22" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-label-md font-semibold text-gray-900">Verifying identity</p>
                  <p className="text-caption text-gray-400 mt-1">Contacting UIDAI servers…</p>
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {stage === 'success' && (
              <div className="flex flex-col items-center py-6 gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-200">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                  <p className="text-label-lg font-bold text-gray-900">Identity Verified</p>
                  <p className="text-caption text-gray-400 mt-1">e-KYC completed successfully</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <svg className="w-8 h-8 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                  <div>
                    <p className="text-label-sm font-bold text-emerald-800">Aadhaar KYC Complete</p>
                    <p className="text-caption text-emerald-600">Linked to {maskedAadhaar}</p>
                  </div>
                </motion.div>
                <p className="text-caption text-gray-400">Proceeding to next step…</p>
              </div>
            )}

            {/* ERROR: LOCKED (max attempts) */}
            {stage === 'error_locked' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-2 gap-3">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-label-md font-bold text-gray-900">OTP verification locked</p>
                    <p className="text-caption text-gray-500 mt-1">Too many incorrect attempts. Try an alternative method below.</p>
                  </div>
                </div>
                <p className="text-caption text-gray-500 font-semibold uppercase tracking-wide">Alternative KYC options</p>
                {altOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStage(opt.id as EkycStage)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">{opt.icon}</div>
                    <div>
                      <p className="text-label-sm font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-caption text-gray-400">{opt.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                ))}
                <button onClick={() => { setAttempts(0); setStage('aadhaar'); setOtp(''); setOtpError(''); }} className="w-full text-center text-caption text-gray-400 hover:text-gray-600 py-1">
                  Try a different Aadhaar number
                </button>
              </div>
            )}

            {/* ERROR: MOBILE NOT LINKED */}
            {stage === 'error_not_linked' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-2 gap-3">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-label-md font-bold text-gray-900">Mobile not linked to Aadhaar?</p>
                    <p className="text-caption text-gray-500 mt-1 leading-relaxed">
                      OTP can only be sent to the mobile registered with Aadhaar. Choose an alternative to complete KYC.
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <p className="text-caption text-blue-700 leading-relaxed">
                    <span className="font-semibold">Link your mobile with Aadhaar:</span> Visit your nearest Aadhaar Seva Kendra or update online at <span className="font-medium">uidai.gov.in</span>
                  </p>
                </div>
                <p className="text-caption text-gray-500 font-semibold uppercase tracking-wide">Complete KYC now via</p>
                {altOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStage(opt.id as EkycStage)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">{opt.icon}</div>
                    <div>
                      <p className="text-label-sm font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-caption text-gray-400">{opt.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                ))}
              </div>
            )}

            {/* ERROR: SERVICE DOWN */}
            {stage === 'error_service_down' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-2 gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-label-md font-bold text-gray-900">UIDAI service is unavailable</p>
                    <p className="text-caption text-gray-500 mt-1">The Aadhaar verification service is temporarily down. Please try again in a few minutes.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setOtp(''); setOtpError(''); setStage('aadhaar'); }}
                  className="w-full py-3 rounded-xl bg-purple-600 text-white text-label-md font-semibold active:scale-[0.97] transition-transform"
                >
                  Try again
                </button>
                <button
                  onClick={() => setStage('alt_upload')}
                  className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 text-label-md font-medium active:scale-[0.97] transition-transform"
                >
                  Use document upload instead
                </button>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                  <p className="text-caption text-gray-500">We'll notify you by SMS when the service is restored.</p>
                </div>
              </div>
            )}

            {/* ALTERNATIVE: DIGILOCKER */}
            {stage === 'alt_digilocker' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                  </svg>
                  <div>
                    <p className="text-label-sm font-bold text-blue-900">DigiLocker KYC</p>
                    <p className="text-caption text-blue-700 mt-0.5">You'll be redirected to DigiLocker to securely share your Aadhaar details. No OTP needed.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {['Log in to your DigiLocker account', 'Authorise ACKO to access your Aadhaar', 'Verified instantly — no documents to upload'].map((s, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                      <span className="text-body-sm text-gray-600">{s}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setStage('success'); setTimeout(() => onContinue(), 1800); }}
                  className="w-full py-3.5 rounded-xl bg-blue-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
                >
                  Open DigiLocker →
                </button>
                <button onClick={() => setStage('error_locked')} className="w-full text-center text-caption text-gray-400 hover:text-gray-600 py-1">← Back to options</button>
              </div>
            )}

            {/* ALTERNATIVE: VIDEO KYC */}
            {stage === 'alt_video_kyc' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5">
                  <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <div>
                    <p className="text-label-sm font-bold text-emerald-900">Video KYC</p>
                    <p className="text-caption text-emerald-700 mt-0.5">A 5-minute video call with our KYC agent. Keep your PAN card and Aadhaar card ready.</p>
                  </div>
                </div>
                <div className="space-y-2 text-body-sm text-gray-600">
                  {['Available Mon–Sat, 9 AM to 6 PM', 'Camera and microphone required', 'Keep original PAN and Aadhaar handy'].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" /></svg>
                      {s}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setStage('success'); setTimeout(() => onContinue(), 1800); }}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
                >
                  Schedule Video KYC
                </button>
                <button onClick={() => setStage('error_locked')} className="w-full text-center text-caption text-gray-400 hover:text-gray-600 py-1">← Back to options</button>
              </div>
            )}

            {/* ALTERNATIVE: DOCUMENT UPLOAD */}
            {stage === 'alt_upload' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3.5">
                  <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <div>
                    <p className="text-label-sm font-bold text-orange-900">Document Upload KYC</p>
                    <p className="text-caption text-orange-700 mt-0.5">Upload clear photos of your PAN card and a selfie. Our team reviews in 2 hours.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'PAN Card', desc: 'Front side, clear photo', icon: '🪪' },
                    { label: 'Selfie', desc: 'Face clearly visible, bright light', icon: '🤳' },
                  ].map((doc) => (
                    <div key={doc.label} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed border-gray-300 bg-gray-50">
                      <span className="text-xl">{doc.icon}</span>
                      <div className="flex-1">
                        <p className="text-label-sm font-semibold text-gray-800">{doc.label}</p>
                        <p className="text-caption text-gray-400">{doc.desc}</p>
                      </div>
                      <span className="text-caption text-purple-600 font-medium">Upload</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setStage('success'); setTimeout(() => onContinue(), 1800); }}
                  className="w-full py-3.5 rounded-xl bg-orange-500 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
                >
                  Upload & Submit
                </button>
                <button onClick={() => setStage('error_locked')} className="w-full text-center text-caption text-gray-400 hover:text-gray-600 py-1">← Back</button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Footer support bar ── */}
        {!['verifying', 'sending', 'success'].includes(stage) && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <button className="flex items-center gap-1.5 text-caption text-gray-400 hover:text-purple-600 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              KYC Help
            </button>
            <button className="flex items-center gap-1.5 text-caption text-gray-400 hover:text-purple-600 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              1800 266 5433
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Medical Screen — Tele-medical & health tests scheduling
   ═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   Medical Screen — Full VMER flow per p2i_flow.md
   Stages: intro → availability → slot_picker → scheduled →
           call_active → post_call_review → under_review →
           ppmc_intro → ppmc_address → ppmc_slot → ppmc_confirmed →
           docs_required → docs_submitted → complete
   Edge cases: slot_conflict, ppmc_offline, partial doc upload
   ═══════════════════════════════════════════════════════ */

type MedStage =
  | 'intro'
  | 'availability_now'
  | 'availability_none'
  | 'slot_picker'
  | 'slot_conflict'
  | 'scheduled'
  | 'call_active'
  | 'post_call_review'
  | 'review_submitting'
  | 'under_review'
  | 'ppmc_intro'
  | 'ppmc_address'
  | 'ppmc_address_new'
  | 'ppmc_slot'
  | 'ppmc_confirmed'
  | 'ppmc_offline'
  | 'docs_required'
  | 'docs_confirm'
  | 'docs_submitted'
  | 'complete';

interface SlotSelection { dateLabel: string; dateIndex: number; time: string; }
interface AddressEntry { id: string; label: string; address: string; }

const SLOT_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i);
  return {
    idx: i,
    day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    date: d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
    full: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
  };
});

const SLOT_TIMES = {
  Morning: ['9:00 AM', '10:00 AM', '11:00 AM'],
  Afternoon: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
  Evening: ['5:00 PM', '6:00 PM', '7:00 PM'],
};

// Simulate unavailable slots
const UNAVAILABLE: Record<number, string[]> = { 0: ['9:00 AM', '10:00 AM', '12:00 PM'], 1: ['9:00 AM', '1:00 PM'], 2: ['11:00 AM'] };

// Slot conflict trigger: picking 9 AM on day 2 or later simulates conflict
const isConflictSlot = (dayIdx: number, time: string) => dayIdx >= 2 && time === '9:00 AM';

const SAVED_ADDRESSES: AddressEntry[] = [
  { id: 'home', label: 'Home', address: 'Flat 4B, Prestige Lakeside Habitat, Whitefield, Bangalore 560066' },
  { id: 'work', label: 'Work', address: 'ACKO Tower, 3rd Floor, Koramangala 5th Block, Bangalore 560095' },
];

const MEDICAL_CONDITIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma / COPD', 'Cancer (any type)', 'Kidney Disease', 'Liver Disease', 'Thyroid Disorder', 'None of the above'];

const CONDITION_DOCS: Record<string, string[]> = {
  Diabetes: ['Latest HbA1c report (within 3 months)', 'Recent blood sugar report', 'Prescription/treatment summary'],
  Hypertension: ['Latest BP readings log or report', 'ECG report (within 6 months)', 'Prescription/treatment summary'],
  'Heart Disease': ['Latest ECG & 2D Echo report', 'Cardiologist consultation notes', 'Angiography/stent reports (if any)'],
  'Asthma / COPD': ['Spirometry/PFT report', 'Prescription/treatment summary'],
  'Cancer (any type)': ['Histopathology/biopsy report', 'Oncologist consultation notes', 'Latest treatment status letter'],
  'Kidney Disease': ['Latest kidney function test (KFT)', 'Urine analysis report', 'Nephrologist consultation notes'],
  'Liver Disease': ['Latest LFT report', 'USG Abdomen report', 'Hepatologist consultation notes'],
  'Thyroid Disorder': ['Latest TSH/T3/T4 report', 'Prescription/treatment summary'],
};

function MedSlotPicker({
  title,
  onSelect,
  onBack,
}: {
  title: string;
  onSelect: (slot: SlotSelection) => void;
  onBack?: () => void;
}) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4">
      <p className="text-body-sm font-semibold text-gray-700">{title}</p>

      {/* Day picker — horizontal scroll */}
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {SLOT_DAYS.map((d) => (
          <button
            key={d.idx}
            onClick={() => { setSelectedDay(d.idx); setSelectedTime(null); }}
            className={`flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-xl border transition-all min-w-[52px]
              ${selectedDay === d.idx ? 'border-purple-500 bg-purple-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'}`}
          >
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${selectedDay === d.idx ? 'text-purple-100' : 'text-gray-400'}`}>{d.day}</span>
            <span className="text-lg font-bold leading-tight">{d.date}</span>
            <span className={`text-[10px] ${selectedDay === d.idx ? 'text-purple-200' : 'text-gray-400'}`}>{d.month}</span>
          </button>
        ))}
      </div>

      {/* Time slots grouped by period */}
      <div className="space-y-3">
        {(Object.entries(SLOT_TIMES) as [string, string[]][]).map(([period, times]) => (
          <div key={period}>
            <p className="text-caption font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{period}</p>
            <div className="flex flex-wrap gap-2">
              {times.map((t) => {
                const unavailable = (UNAVAILABLE[selectedDay] || []).includes(t);
                const selected = selectedTime === t;
                return (
                  <button
                    key={t}
                    disabled={unavailable}
                    onClick={() => setSelectedTime(t)}
                    className={`px-3 py-2 rounded-xl border text-label-sm font-medium transition-all
                      ${unavailable ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : selected ? 'border-purple-500 bg-purple-600 text-white shadow-md shadow-purple-200'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'}`}
                  >
                    {t}
                    {unavailable && <span className="ml-1 text-[9px] text-gray-300">Full</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!selectedTime}
        onClick={() => {
          if (!selectedTime) return;
          onSelect({ dateLabel: SLOT_DAYS[selectedDay].full, dateIndex: selectedDay, time: selectedTime });
        }}
        className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold disabled:opacity-40 active:scale-[0.97] transition-transform"
      >
        Confirm Slot
      </button>
      {onBack && (
        <button onClick={onBack} className="w-full text-center text-caption text-gray-400 hover:text-gray-600 py-1">← Back</button>
      )}
    </div>
  );
}

function MedYesNo({ question, onAnswer }: { question: string; onAnswer: (yes: boolean) => void }) {
  const [val, setVal] = useState<boolean | null>(null);
  return (
    <div className="space-y-1.5">
      <p className="text-body-sm text-gray-800">{question}</p>
      <div className="flex gap-2">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            onClick={() => { setVal(opt); setTimeout(() => onAnswer(opt), 150); }}
            className={`flex-1 py-2.5 rounded-xl border text-label-sm font-semibold transition-all active:scale-[0.97]
              ${val === opt ? opt ? 'border-purple-500 bg-purple-600 text-white' : 'border-gray-400 bg-gray-700 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
          >
            {opt ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LifeMedicalScreen({ onContinue }: { onContinue: () => void }) {
  const [stage, setStage] = useState<MedStage>('intro');
  const [joinCountdown, setJoinCountdown] = useState(300); // 5 mins in seconds
  const [bookedSlot, setBookedSlot] = useState<SlotSelection | null>(null);
  const [ppBookedSlot, setPpBookedSlot] = useState<SlotSelection | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('home');
  const [newAddress, setNewAddress] = useState({ flat: '', area: '', pincode: '', city: '', state: '', saveAs: 'Other' });
  const [ppmc, setPpmc] = useState(false); // whether additional tests needed
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [confirmPartial, setConfirmPartial] = useState(false);
  const [bookingId] = useState(() => `ACKO-MED-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  const [ppBookingId] = useState(() => `ACKO-HOME-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

  // Health review form state
  const [tobacco, setTobacco] = useState<boolean | null>(null);
  const [alcohol, setAlcohol] = useState<boolean | null>(null);
  const [alcoholFreq, setAlcoholFreq] = useState('');
  const [alcoholUnits, setAlcoholUnits] = useState('');
  const [doctorAdvised, setDoctorAdvised] = useState<boolean | null>(null);
  const [doctorComment, setDoctorComment] = useState('');
  const [familyHistory, setFamilyHistory] = useState<boolean | null>(null);
  const [conditions, setConditions] = useState<string[]>([]);
  const [stdHiv, setStdHiv] = useState<boolean | null>(null);
  const [adventureSports, setAdventureSports] = useState<boolean | null>(null);
  const [adventureDetails, setAdventureDetails] = useState('');
  const [intlTravel, setIntlTravel] = useState<boolean | null>(null);
  const [intlDetails, setIntlDetails] = useState('');
  const [legalIssues, setLegalIssues] = useState<boolean | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [reviewSection, setReviewSection] = useState<'health' | 'lifestyle' | 'misc'>('health');

  // Countdown for "doctor available now"
  useEffect(() => {
    if (stage !== 'availability_now') return;
    const t = setInterval(() => setJoinCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [stage]);

  const fmtCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSlotSelect = (slot: SlotSelection, isForPpmc = false) => {
    if (!isForPpmc && isConflictSlot(slot.dateIndex, slot.time)) {
      setBookedSlot(slot);
      setStage('slot_conflict');
      return;
    }
    if (isForPpmc) { setPpBookedSlot(slot); setStage('ppmc_confirmed'); }
    else { setBookedSlot(slot); setStage('scheduled'); }
  };

  const isReviewComplete = () =>
    tobacco !== null && alcohol !== null && familyHistory !== null &&
    conditions.length > 0 && stdHiv !== null && adventureSports !== null &&
    intlTravel !== null && legalIssues !== null && reviewConfirmed;

  const flaggedConditions = conditions.filter(c => c !== 'None of the above' && CONDITION_DOCS[c]);
  const allDocsUploaded = flaggedConditions.length === 0 || flaggedConditions.every(c => uploadedDocs[c]);

  const HEADER_LABELS: Record<MedStage, { title: string; sub: string }> = {
    intro: { title: 'Medical Evaluation', sub: 'VMER — Video Medical Evaluation' },
    availability_now: { title: 'Doctor Available', sub: 'Join in ~5 minutes' },
    availability_none: { title: 'No Doctor Available', sub: 'Schedule for later' },
    slot_picker: { title: 'Schedule Your Call', sub: 'Pick a date & time' },
    slot_conflict: { title: 'Slot Taken', sub: 'Please pick another time' },
    scheduled: { title: 'Call Scheduled', sub: bookedSlot ? `${bookedSlot.dateLabel}, ${bookedSlot.time}` : '' },
    call_active: { title: 'Video Call', sub: 'In progress with doctor' },
    post_call_review: { title: 'Review Your Answers', sub: `${reviewSection === 'health' ? 'Health' : reviewSection === 'lifestyle' ? 'Lifestyle' : 'Miscellaneous'} information` },
    review_submitting: { title: 'Submitting', sub: 'Saving your responses…' },
    under_review: { title: 'Under Review', sub: 'Medical info submitted' },
    ppmc_intro: { title: 'Additional Tests', sub: 'Home health test required' },
    ppmc_address: { title: 'Test Location', sub: 'Choose address for home test' },
    ppmc_address_new: { title: 'New Address', sub: 'Where should we come?' },
    ppmc_slot: { title: 'Schedule Home Test', sub: 'Pick a date & time' },
    ppmc_confirmed: { title: 'Test Booked', sub: ppBookedSlot ? `${ppBookedSlot.dateLabel}, ${ppBookedSlot.time}` : '' },
    ppmc_offline: { title: 'We\'ll Reach Out', sub: 'Manual scheduling' },
    docs_required: { title: 'Upload Documents', sub: `${flaggedConditions.length} condition${flaggedConditions.length !== 1 ? 's' : ''} flagged` },
    docs_confirm: { title: 'Confirm Upload', sub: 'Double-check before submitting' },
    docs_submitted: { title: 'Documents Uploaded', sub: 'Under review' },
    complete: { title: 'Evaluation Complete', sub: 'All done!' },
  };

  const { title: hTitle, sub: hSub } = HEADER_LABELS[stage] || { title: 'Medical', sub: '' };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">

        {/* ── Header ── */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-label-md font-bold text-gray-900">{hTitle}</h3>
              <p className="text-caption text-gray-400 truncate">{hSub}</p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="px-5 py-5"
          >

            {/* INTRO */}
            {stage === 'intro' && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3.5 space-y-1">
                  <p className="text-label-sm font-bold text-purple-900">What is VMER?</p>
                  <p className="text-caption text-purple-700 leading-relaxed">
                    A 15–20 minute <span className="font-semibold">video call with a licensed doctor</span> to assess your health. Required for all term life policies.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: '📹', t: 'Video call with a doctor', d: '15–20 mins, camera & mic required' },
                    { icon: '🔇', t: 'Quiet location needed', d: 'Find a private space before joining' },
                    { icon: '📋', t: 'Topics covered', d: 'Health history, lifestyle, medications' },
                    { icon: '✅', t: 'Post-call review', d: 'You\'ll confirm the answers discussed' },
                  ].map(({ icon, t, d }) => (
                    <div key={t} className="flex gap-3 items-start">
                      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                      <div>
                        <p className="text-label-sm font-semibold text-gray-900">{t}</p>
                        <p className="text-caption text-gray-400">{d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStage('availability_now')}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
                >
                  Check Doctor Availability
                </button>
              </div>
            )}

            {/* DOCTOR AVAILABLE NOW */}
            {stage === 'availability_now' && (
              <div className="space-y-5">
                <div className="flex flex-col items-center py-3 gap-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <p className="text-label-lg font-bold text-gray-900">Dr. Meera Krishnan is available</p>
                  <p className="text-caption text-gray-500">MBBS, MD — Available now</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between">
                  <p className="text-body-sm text-emerald-800 font-medium">Call starts in</p>
                  <span className="text-2xl font-bold text-emerald-700 tabular-nums">{fmtCountdown(joinCountdown)}</span>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 space-y-1.5">
                  <p className="text-label-sm font-semibold text-amber-800">Before you join</p>
                  {['Ensure camera & microphone are working', 'Move to a quiet, private location', 'Keep your Aadhaar / PAN card nearby'].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      <span className="text-caption text-amber-700">{s}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStage('call_active')}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-emerald-600/20"
                >
                  Join Call Now
                </button>
                <button
                  onClick={() => setStage('slot_picker')}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-label-sm font-medium active:scale-[0.97] transition-transform"
                >
                  Schedule for later instead
                </button>
              </div>
            )}

            {/* DOCTOR NOT AVAILABLE */}
            {stage === 'availability_none' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-3 gap-2 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-label-md font-bold text-gray-900">No doctor available right now</p>
                  <p className="text-caption text-gray-500">Next available slot: <span className="font-semibold text-purple-600">Today, 4:00 PM</span></p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <p className="text-caption text-gray-500">You'll receive an SMS & WhatsApp link 1 hour before your scheduled slot.</p>
                </div>
                <button
                  onClick={() => setStage('slot_picker')}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
                >
                  Schedule a call
                </button>
              </div>
            )}

            {/* SLOT PICKER */}
            {stage === 'slot_picker' && (
              <MedSlotPicker
                title="Choose a date and time for your VMER call"
                onSelect={(s) => handleSlotSelect(s, false)}
                onBack={() => setStage('availability_now')}
              />
            )}

            {/* SLOT CONFLICT */}
            {stage === 'slot_conflict' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-3 gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-label-md font-bold text-gray-900">Slot just got booked</p>
                    <p className="text-caption text-gray-500 mt-1">
                      {bookedSlot?.time} on {bookedSlot?.dateLabel} was taken by another user while you were selecting. Please choose a different time.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStage('slot_picker')}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
                >
                  Pick another slot
                </button>
              </div>
            )}

            {/* SCHEDULED */}
            {stage === 'scheduled' && bookedSlot && (
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  className="flex flex-col items-center py-2 gap-2 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-label-lg font-bold text-gray-900">Call Scheduled!</p>
                    <p className="text-body-sm font-semibold text-purple-700 mt-0.5">{bookedSlot.dateLabel}</p>
                    <p className="text-caption text-gray-500">{bookedSlot.time}</p>
                  </div>
                </motion.div>

                <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 space-y-2">
                  <p className="text-label-sm font-bold text-purple-900">Pre-call checklist</p>
                  {['Camera & microphone working', 'Quiet, private location', 'Aadhaar / PAN card nearby', 'List of current medications (if any)', 'Comfortable clothing for brief physical check if asked'].map(s => (
                    <div key={s} className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      <span className="text-caption text-purple-700">{s}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <p className="text-caption text-gray-500">
                    You'll receive a <span className="font-semibold">WhatsApp & SMS reminder</span> 1 hour before the call with your join link.
                  </p>
                </div>

                <button
                  onClick={() => setStage('call_active')}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
                >
                  Join Call (Demo)
                </button>
                <button
                  onClick={() => setStage('slot_picker')}
                  className="w-full text-center text-caption text-gray-400 hover:text-gray-600 py-1"
                >
                  Reschedule
                </button>
              </div>
            )}

            {/* CALL ACTIVE */}
            {stage === 'call_active' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-4 gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-xl">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-label-md font-bold text-gray-900">Dr. Meera Krishnan</p>
                    <p className="text-caption text-emerald-600 font-medium">● Connected</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-1">
                  <p className="text-label-sm font-semibold text-gray-700">Topics during this call</p>
                  {['Current medications & supplements', 'Past surgeries or hospitalizations', 'Family medical history', 'Lifestyle: smoking, alcohol, exercise', 'Occupation & travel history'].map(s => (
                    <div key={s} className="flex items-center gap-2 text-caption text-gray-500">
                      <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStage('post_call_review')}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
                >
                  End Call & Review Answers
                </button>
              </div>
            )}

            {/* POST-CALL REVIEW */}
            {stage === 'post_call_review' && (
              <div className="space-y-5">
                {/* Section tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  {(['health', 'lifestyle', 'misc'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setReviewSection(s)}
                      className={`flex-1 py-1.5 rounded-lg text-caption font-semibold transition-all capitalize
                        ${reviewSection === s ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'}`}
                    >
                      {s === 'misc' ? 'Misc' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>

                {/* HEALTH SECTION */}
                {reviewSection === 'health' && (
                  <div className="space-y-5">
                    <MedYesNo question="Have you used tobacco or smoked in the last year?" onAnswer={setTobacco} />
                    <MedYesNo question="Do you consume alcohol?" onAnswer={setAlcohol} />
                    {alcohol === true && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pl-4 border-l-2 border-purple-100 space-y-3">
                        <div>
                          <label className="text-caption font-semibold text-gray-500 block mb-1.5">Frequency</label>
                          <div className="flex flex-wrap gap-2">
                            {['Daily', '4–6 times/week', '2–3 times/week', 'Occasionally'].map(f => (
                              <button key={f} onClick={() => setAlcoholFreq(f)}
                                className={`px-3 py-1.5 rounded-lg border text-caption font-medium transition-all ${alcoholFreq === f ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-caption font-semibold text-gray-500 block mb-1.5">Units per week</label>
                          <input
                            type="number" inputMode="numeric" value={alcoholUnits}
                            onChange={e => setAlcoholUnits(e.target.value)}
                            placeholder="e.g. 7"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-body-sm text-gray-900 focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <MedYesNo question="Has a doctor advised you to reduce or stop alcohol?" onAnswer={setDoctorAdvised} />
                        {doctorAdvised === true && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <textarea value={doctorComment} onChange={e => setDoctorComment(e.target.value)}
                              placeholder="Additional comments (optional)"
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-body-sm text-gray-600 focus:outline-none focus:border-purple-400 resize-none" rows={2} />
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                    <MedYesNo question="Have any family members passed away before age 60 due to a serious health condition?" onAnswer={setFamilyHistory} />
                    <div>
                      <p className="text-body-sm text-gray-800 mb-2">Have you ever received medical attention for any of the following?</p>
                      <div className="flex flex-wrap gap-2">
                        {MEDICAL_CONDITIONS.map(c => {
                          const sel = conditions.includes(c);
                          return (
                            <button key={c} onClick={() => {
                              if (c === 'None of the above') { setConditions(sel ? [] : ['None of the above']); return; }
                              setConditions(prev => sel ? prev.filter(x => x !== c) : [...prev.filter(x => x !== 'None of the above'), c]);
                            }}
                              className={`px-3 py-1.5 rounded-lg border text-caption font-medium transition-all ${sel ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <MedYesNo question="Do you or your spouse have any history of STD or HIV?" onAnswer={setStdHiv} />
                    <button onClick={() => setReviewSection('lifestyle')}
                      className="w-full py-3 rounded-xl bg-purple-600 text-white text-label-md font-semibold active:scale-[0.97] transition-transform">
                      Next: Lifestyle →
                    </button>
                  </div>
                )}

                {/* LIFESTYLE SECTION */}
                {reviewSection === 'lifestyle' && (
                  <div className="space-y-5">
                    <MedYesNo question="Have you participated in adventure sports in the last 5 years?" onAnswer={setAdventureSports} />
                    {adventureSports === true && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pl-4 border-l-2 border-purple-100">
                        <textarea value={adventureDetails} onChange={e => setAdventureDetails(e.target.value)}
                          placeholder="Activity, type, frequency — e.g. Skydiving, solo, twice a year"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-body-sm text-gray-600 focus:outline-none focus:border-purple-400 resize-none" rows={2} />
                      </motion.div>
                    )}
                    <MedYesNo question="Have you travelled internationally in the last 6 months, or planning to?" onAnswer={setIntlTravel} />
                    {intlTravel === true && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pl-4 border-l-2 border-purple-100">
                        <textarea value={intlDetails} onChange={e => setIntlDetails(e.target.value)}
                          placeholder="Countries, purpose, duration, accommodation type"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-body-sm text-gray-600 focus:outline-none focus:border-purple-400 resize-none" rows={2} />
                      </motion.div>
                    )}
                    <button onClick={() => setReviewSection('misc')}
                      className="w-full py-3 rounded-xl bg-purple-600 text-white text-label-md font-semibold active:scale-[0.97] transition-transform">
                      Next: Miscellaneous →
                    </button>
                    <button onClick={() => setReviewSection('health')} className="w-full text-center text-caption text-gray-400 hover:text-gray-600 py-1">← Back to Health</button>
                  </div>
                )}

                {/* MISC SECTION */}
                {reviewSection === 'misc' && (
                  <div className="space-y-5">
                    <MedYesNo question="Do you have any pending legal cases or criminal proceedings in India or abroad?" onAnswer={setLegalIssues} />

                    <div className="h-px bg-gray-100" />

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={reviewConfirmed} onChange={e => setReviewConfirmed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-purple-600 rounded flex-shrink-0" />
                      <span className="text-caption text-gray-600 leading-relaxed">
                        I confirm that all the information provided is <span className="font-semibold">true and accurate</span> to the best of my knowledge. I understand that incorrect disclosure may affect my policy.
                      </span>
                    </label>

                    <button
                      disabled={!isReviewComplete()}
                      onClick={() => {
                        setStage('review_submitting');
                        setTimeout(() => {
                          setPpmc(flaggedConditions.length > 0);
                          setStage('under_review');
                        }, 2000);
                      }}
                      className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold disabled:opacity-40 active:scale-[0.97] transition-transform"
                    >
                      Submit & Confirm
                    </button>
                    <button
                      className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-label-sm font-medium"
                      onClick={() => {/* Talk to us */ }}
                    >
                      Want to make changes? Talk to us
                    </button>
                    <button onClick={() => setReviewSection('lifestyle')} className="w-full text-center text-caption text-gray-400 hover:text-gray-600 py-1">← Back to Lifestyle</button>
                  </div>
                )}
              </div>
            )}

            {/* REVIEW SUBMITTING */}
            {stage === 'review_submitting' && (
              <div className="flex flex-col items-center py-8 gap-4">
                <svg className="w-10 h-10 text-purple-400 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 22" strokeLinecap="round" />
                </svg>
                <p className="text-body-sm text-gray-600">Saving your responses…</p>
              </div>
            )}

            {/* UNDER REVIEW */}
            {stage === 'under_review' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-2 gap-2 text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <p className="text-label-md font-bold text-gray-900">Responses submitted</p>
                  <p className="text-caption text-gray-500">Your medical information is under review</p>
                </div>

                {ppmc ? (
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <p className="text-label-sm font-bold text-amber-900">Additional tests required</p>
                      <p className="text-caption text-amber-700 mt-0.5">Based on your responses, we need a few health tests to complete your evaluation.</p>
                    </div>
                    <button onClick={() => setStage('ppmc_intro')}
                      className="w-full py-3.5 rounded-xl bg-amber-500 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform">
                      Schedule Home Tests →
                    </button>
                    {flaggedConditions.length > 0 && (
                      <button onClick={() => setStage('docs_required')}
                        className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 text-label-sm font-medium">
                        Upload condition documents ({flaggedConditions.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                      <p className="text-label-sm font-bold text-emerald-900">No additional tests needed</p>
                      <p className="text-caption text-emerald-700 mt-0.5">Your responses look good. Medical evaluation is complete!</p>
                    </div>
                    <button onClick={() => { setStage('complete'); setTimeout(() => onContinue(), 1800); }}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform">
                      Continue
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PPMC INTRO */}
            {stage === 'ppmc_intro' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5">
                  <p className="text-label-sm font-bold text-amber-900">Additional health tests required</p>
                  <p className="text-caption text-amber-700 mt-1 leading-relaxed">We need a few basic tests to better understand your health before issuing your policy. A technician will visit your home.</p>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: '📅', t: 'Schedule test', s: 'pending' as const },
                    { icon: '🏠', t: 'Sample collection at home', s: 'upcoming' as const },
                    { icon: '🔬', t: 'Reports under evaluation', s: 'upcoming' as const },
                    { icon: '✅', t: 'Tests complete', s: 'upcoming' as const },
                  ].map(({ icon, t, s }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${s === 'pending' ? 'bg-purple-100' : 'bg-gray-100'}`}>{icon}</div>
                      <span className={`text-body-sm font-medium ${s === 'pending' ? 'text-gray-900' : 'text-gray-400'}`}>{t}</span>
                      {s === 'pending' && <span className="ml-auto text-caption text-purple-600 font-semibold">Now</span>}
                    </div>
                  ))}
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-lg">⏰</span>
                  <p className="text-caption text-red-700 font-medium">Fasting for 12 hours is mandatory before the test</p>
                </div>
                <button onClick={() => setStage('ppmc_address')}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform">
                  Schedule Home Test
                </button>
                <button onClick={() => setStage('ppmc_offline')}
                  className="w-full py-2 text-center text-caption text-gray-400 hover:text-gray-600">
                  Can't schedule online? We'll call you
                </button>
              </div>
            )}

            {/* PPMC ADDRESS PICKER */}
            {stage === 'ppmc_address' && (
              <div className="space-y-4">
                <p className="text-body-sm font-semibold text-gray-700">Where should the technician come?</p>
                {SAVED_ADDRESSES.map(addr => (
                  <button key={addr.id} onClick={() => setSelectedAddress(addr.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all
                      ${selectedAddress === addr.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedAddress === addr.id ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      <span className="text-sm">{addr.id === 'home' ? '🏠' : '🏢'}</span>
                    </div>
                    <div>
                      <p className={`text-label-sm font-bold ${selectedAddress === addr.id ? 'text-purple-800' : 'text-gray-800'}`}>{addr.label}</p>
                      <p className="text-caption text-gray-500 leading-snug">{addr.address}</p>
                    </div>
                    {selectedAddress === addr.id && (
                      <svg className="w-5 h-5 text-purple-500 ml-auto flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    )}
                  </button>
                ))}
                <button onClick={() => setStage('ppmc_address_new')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed border-gray-300 text-left hover:border-purple-300 hover:bg-purple-50 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </div>
                  <span className="text-label-sm font-medium text-gray-600">Add new address</span>
                </button>
                <button onClick={() => setStage('ppmc_slot')} disabled={!selectedAddress}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold disabled:opacity-40 active:scale-[0.97] transition-transform">
                  Continue with this address
                </button>
              </div>
            )}

            {/* PPMC NEW ADDRESS */}
            {stage === 'ppmc_address_new' && (
              <div className="space-y-3">
                {[
                  { key: 'flat', label: 'Flat / House No.', placeholder: 'e.g. 4B' },
                  { key: 'area', label: 'Street / Area / Road', placeholder: 'e.g. MG Road, Koramangala' },
                  { key: 'pincode', label: 'Pincode', placeholder: '560001' },
                  { key: 'city', label: 'City', placeholder: 'Bangalore' },
                  { key: 'state', label: 'State', placeholder: 'Karnataka' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-caption font-semibold text-gray-500 block mb-1">{label}</label>
                    <input
                      value={newAddress[key as keyof typeof newAddress]}
                      onChange={e => setNewAddress(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-body-sm text-gray-900 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-caption font-semibold text-gray-500 block mb-1.5">Save as</label>
                  <div className="flex gap-2">
                    {['Home', 'Work', 'Other'].map(tag => (
                      <button key={tag} onClick={() => setNewAddress(p => ({ ...p, saveAs: tag }))}
                        className={`px-4 py-2 rounded-xl border text-label-sm font-medium transition-all ${newAddress.saveAs === tag ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedAddress('new'); setStage('ppmc_slot'); }}
                  disabled={!newAddress.flat || !newAddress.pincode || !newAddress.city}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold disabled:opacity-40 active:scale-[0.97] transition-transform mt-1"
                >
                  Save & Continue
                </button>
                <button onClick={() => setStage('ppmc_address')} className="w-full text-center text-caption text-gray-400 py-1">← Back</button>
              </div>
            )}

            {/* PPMC SLOT PICKER */}
            {stage === 'ppmc_slot' && (
              <MedSlotPicker
                title="When should the technician visit?"
                onSelect={(s) => handleSlotSelect(s, true)}
                onBack={() => setStage('ppmc_address')}
              />
            )}

            {/* PPMC CONFIRMED */}
            {stage === 'ppmc_confirmed' && ppBookedSlot && (
              <div className="space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  className="flex flex-col items-center py-2 gap-2 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-label-lg font-bold text-gray-900">Home Test Booked!</p>
                </motion.div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl divide-y divide-gray-100">
                  {[
                    { l: 'Booking ID', v: ppBookingId },
                    { l: 'Date', v: ppBookedSlot.dateLabel },
                    { l: 'Time', v: ppBookedSlot.time },
                    { l: 'Address', v: selectedAddress === 'home' ? SAVED_ADDRESSES[0].address : selectedAddress === 'work' ? SAVED_ADDRESSES[1].address : `${newAddress.flat}, ${newAddress.area}, ${newAddress.city}` },
                    { l: 'Technician', v: 'Assigned 2 hours before visit' },
                  ].map(({ l, v }) => (
                    <div key={l} className="px-4 py-2.5 flex justify-between gap-3">
                      <span className="text-caption text-gray-400 flex-shrink-0">{l}</span>
                      <span className="text-caption text-gray-800 font-medium text-right">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-base">⏰</span>
                  <p className="text-caption text-red-700 font-semibold">Fast for 12 hours before the test</p>
                </div>

                {flaggedConditions.length > 0 && (
                  <button onClick={() => setStage('docs_required')}
                    className="w-full py-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-label-sm font-semibold active:scale-[0.97] transition-transform">
                    Also upload condition documents ({flaggedConditions.length} required)
                  </button>
                )}

                <button onClick={() => { setStage('complete'); setTimeout(() => onContinue(), 1800); }}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform">
                  Done
                </button>
              </div>
            )}

            {/* PPMC OFFLINE FALLBACK */}
            {stage === 'ppmc_offline' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-3 gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-label-md font-bold text-gray-900">We'll reach out to you</p>
                    <p className="text-caption text-gray-500 mt-1 leading-relaxed">Our team will contact you within 24 hours to schedule your home test at a convenient time.</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-1">
                  <p className="text-caption text-gray-500">You'll be contacted on: <span className="font-semibold text-gray-800">your registered mobile</span></p>
                  <p className="text-caption text-gray-400">Or reach us at <span className="font-medium text-purple-600">1800 266 5433</span></p>
                </div>
                <button onClick={() => { setStage('complete'); setTimeout(() => onContinue(), 1800); }}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform">
                  Got it
                </button>
              </div>
            )}

            {/* DOCS REQUIRED */}
            {stage === 'docs_required' && (
              <div className="space-y-4">
                <p className="text-body-sm text-gray-700">Based on your health history, please upload the following documents for each condition.</p>
                {flaggedConditions.map(cond => (
                  <div key={cond} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-label-sm font-bold text-gray-800">{cond}</p>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {CONDITION_DOCS[cond]?.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-caption text-gray-600">
                          <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                          {doc}
                        </div>
                      ))}
                      <button onClick={() => setUploadedDocs(p => ({ ...p, [cond]: true }))}
                        className={`mt-2 w-full py-2.5 rounded-xl border text-label-sm font-semibold transition-all active:scale-[0.97]
                          ${uploadedDocs[cond] ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-dashed border-purple-300 text-purple-600 hover:bg-purple-50'}`}>
                        {uploadedDocs[cond] ? '✓ Uploaded' : 'Upload documents (PDF, PNG, JPEG, ZIP · Max 100MB)'}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border border-dashed border-gray-200 rounded-xl px-4 py-3 text-center">
                  <p className="text-caption text-gray-400 mb-1.5">Miscellaneous documents</p>
                  <button className="text-caption text-purple-500 font-medium">+ Add other documents</button>
                </div>

                <button onClick={() => setStage('docs_confirm')}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform">
                  Submit Documents
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-label-sm font-medium">
                    I don't have these
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-label-sm font-medium">
                    Talk to us
                  </button>
                </div>
              </div>
            )}

            {/* DOCS CONFIRM */}
            {stage === 'docs_confirm' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-2 gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                  <p className="text-label-md font-bold text-gray-900">Have you uploaded all required documents?</p>
                </div>

                {!allDocsUploaded && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <p className="text-caption text-amber-700">
                      Some documents are missing: <span className="font-semibold">{flaggedConditions.filter(c => !uploadedDocs[c]).join(', ')}</span>. Partial uploads are accepted — a health check may be scheduled later.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStage('docs_required')}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-label-sm font-semibold">
                    No, go back
                  </button>
                  <button onClick={() => { setStage('docs_submitted'); }}
                    className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-label-sm font-semibold active:scale-[0.97] transition-transform">
                    Yes, submit
                  </button>
                </div>
              </div>
            )}

            {/* DOCS SUBMITTED */}
            {stage === 'docs_submitted' && (
              <div className="space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  className="flex flex-col items-center py-2 gap-2 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-label-lg font-bold text-gray-900">Documents Uploaded</p>
                  <p className="text-caption text-gray-500">We'll review your documents in 24–48 hours and notify you</p>
                </motion.div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-1">
                  <p className="text-caption text-gray-500">Need help? Reach us at</p>
                  <p className="text-caption font-semibold text-purple-600">1800 266 5433 · support.life@acko.com</p>
                </div>
                <button onClick={() => { setStage('complete'); setTimeout(() => onContinue(), 1800); }}
                  className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform">
                  Done
                </button>
              </div>
            )}

            {/* COMPLETE */}
            {stage === 'complete' && (
              <div className="flex flex-col items-center py-6 gap-4">
                <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 15 }}>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-100">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                  <p className="text-label-lg font-bold text-gray-900">Medical Evaluation Complete</p>
                  <p className="text-caption text-gray-400 mt-1">Your application moves to underwriting review</p>
                </motion.div>
                <p className="text-caption text-gray-400">Proceeding…</p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Footer support bar ── */}
        {!['review_submitting', 'complete', 'call_active'].includes(stage) && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <button className="flex items-center gap-1.5 text-caption text-gray-400 hover:text-purple-600 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              FAQs
            </button>
            <button className="flex items-center gap-1.5 text-caption text-gray-400 hover:text-purple-600 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              1800 266 5433
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Underwriting Status — Timeline & review progress
   ═══════════════════════════════════════════════════════ */

export function LifeUnderwritingStatus({ onContinue }: { onContinue: () => void }) {
  const steps = [
    { title: 'Application received', status: 'done' as const },
    { title: 'Payment confirmed', status: 'done' as const },
    { title: 'e-KYC verified', status: 'done' as const },
    { title: 'Medical evaluation', status: 'active' as const },
    { title: 'Underwriting review', status: 'upcoming' as const },
    { title: 'Policy issuance', status: 'upcoming' as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-label-md font-bold text-gray-900">Application Status</h3>
          <p className="text-caption text-gray-400">Estimated completion: 3-5 business days</p>
        </div>

        <div className="px-5 py-4">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3 relative">
              <div className="flex flex-col items-center">
                {s.status === 'done' ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                ) : s.status === 'active' ? (
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                )}
                {i < steps.length - 1 && (
                  <div className={`w-px h-6 ${s.status === 'done' ? 'bg-emerald-200' : 'bg-gray-200'}`} />
                )}
              </div>
              <div className="pb-6 last:pb-0">
                <p className={`text-label-sm font-medium ${s.status === 'done' ? 'text-gray-900' : s.status === 'active' ? 'text-purple-700' : 'text-gray-400'}`}>
                  {s.title}
                </p>
                {s.status === 'active' && (
                  <p className="text-[11px] text-purple-500 mt-0.5">In progress</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-caption text-gray-500">
            If you&apos;re not approved, we refund 100% of your premium — no questions asked.
          </p>
        </div>

        <div className="px-5 pb-5 pt-3">
          <button
            onClick={onContinue}
            className="w-full py-3 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
          >
            Got it
          </button>
        </div>
      </div>
    </motion.div>
  );
}
