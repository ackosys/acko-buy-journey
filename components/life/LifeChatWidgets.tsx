'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
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
   Custom Dropdown — Styled selection for riders
   ═══════════════════════════════════════════════════════ */

function LifeCustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select sum assured'
}: {
  options: { label: string; value: number }[];
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200
          ${isOpen ? 'border-purple-500 ring-1 ring-purple-500/30 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}
        `}
      >
        <span className={`text-body-sm font-medium ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-3 text-body-sm font-medium transition-colors hover:bg-purple-50 flex items-center justify-between
                  ${value === opt.value ? 'text-purple-700 bg-purple-50/50' : 'text-gray-700'}
                `}
              >
                {opt.label}
                {value === opt.value && (
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {isOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Accidental Rider Widget — Death & Disability
   ═══════════════════════════════════════════════════════ */

export function LifeAccidentalRiderWidget({ onContinue }: { onContinue: () => void }) {
  const state = useLifeJourneyStore.getState() as LifeJourneyState;
  const { quote, selectedRiders } = state;
  const basePremium = quote?.basePremium || 0;
  
  // Accidental Rider Constraint: Max 30% of base premium
  const accidentalLimit = basePremium * 0.3;

  // Rider Rates (approx per 1L sum assured)
  const RATES = {
    accidental_death: 50,
    accidental_disability: 75,
  };

  const [accDeathSA, setAccDeathSA] = useState(0);
  const [accDisabilitySA, setAccDisabilitySA] = useState(0);

  // Initialize
  useEffect(() => {
    if (selectedRiders) {
      const ad = selectedRiders.find(r => r.id === 'accidental_death');
      if (ad) setAccDeathSA(ad.sumAssured || 0);
      
      const dis = selectedRiders.find(r => r.id === 'accidental_disability');
      if (dis) setAccDisabilitySA(dis.sumAssured || 0);
    }
  }, []);

  // Calculate premiums
  const accDeathPremium = (accDeathSA / 100000) * RATES.accidental_death;
  const accDisabilityPremium = (accDisabilitySA / 100000) * RATES.accidental_disability;
  const accTotalPremium = accDeathPremium + accDisabilityPremium;

  const isLimitBreached = accTotalPremium > accidentalLimit;

  // Generate filtered options
  const getOptions = (rate: number, currentPremium: number) => {
    const remainingLimit = accidentalLimit - (accTotalPremium - currentPremium);
    const maxSA = (remainingLimit / rate) * 100000;

    const allOpts = [
      { label: 'Select sum assured', value: 0 },
      { label: '₹5 Lakh', value: 500000 },
      { label: '₹10 Lakh', value: 1000000 },
      { label: '₹25 Lakh', value: 2500000 },
      { label: '₹50 Lakh', value: 5000000 },
      { label: '₹1 Crore', value: 10000000 },
    ];
    
    return allOpts.filter(o => o.value === 0 || o.value <= maxSA || o.value === (currentPremium / rate) * 100000);
  };

  const handleContinue = () => {
    const otherRiders = (state.selectedRiders || []).filter(r => r.id === 'critical_illness');
    const newRiders: LifeRider[] = [...otherRiders];

    if (accDeathSA > 0) {
      newRiders.push({
        id: 'accidental_death',
        name: 'Accidental Death Benefit',
        description: 'Extra payout for accidental death',
        sumAssured: accDeathSA,
        premium: accDeathPremium,
        premiumImpact: RATES.accidental_death,
        selected: true
      });
    }

    if (accDisabilitySA > 0) {
      newRiders.push({
        id: 'accidental_disability',
        name: 'Accidental Disability Cover',
        description: 'Coverage for permanent disability',
        sumAssured: accDisabilitySA,
        premium: accDisabilityPremium,
        premiumImpact: RATES.accidental_disability,
        selected: true
      });
    }

    const totalRiderPremium = newRiders.reduce((sum, r) => sum + (r.premium || 0), 0);
    const newTotalPremium = basePremium + totalRiderPremium;

    const currentQuote = state.quote;
    const updatedQuote = currentQuote ? {
      ...currentQuote,
      riders: newRiders,
      totalPremium: newTotalPremium,
      yearlyPremium: newTotalPremium,
      monthlyPremium: Math.round(newTotalPremium / 12),
    } : null;

    useLifeJourneyStore.setState({ 
      selectedRiders: newRiders,
      ...(updatedQuote && { quote: updatedQuote })
    });
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full"
    >
      <div className="space-y-4">
        {/* Accidental Death Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#F3F4F6"/>
                <path d="M12 2L12 22" stroke="#E5E7EB" strokeWidth="2"/>
                <path d="M12 5L14.5 10L9.5 14L12 19" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3C7 3 5 7 5 10C5 15 9 19 12 21C15 19 19 15 19 10C19 7 17 3 12 3Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-body-lg">Accidental death cover</h4>
              <div className="flex items-start gap-2 mt-1.5">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-body-sm text-gray-500 leading-snug">Pays selected sum assured in addition to base cover</p>
              </div>
            </div>
          </div>
          <LifeCustomDropdown 
            options={getOptions(RATES.accidental_death, accDeathPremium)}
            value={accDeathSA}
            onChange={setAccDeathSA}
          />
        </div>

        {/* Accidental Disability Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 20C9.55228 20 10 19.5523 10 19C10 18.4477 9.55228 18 9 18C8.44772 18 8 18.4477 8 19C8 19.5523 8.44772 20 9 20Z" fill="white"/>
                <path d="M15 20C15.5523 20 16 19.5523 16 19C16 18.4477 15.5523 18 15 18C14.4477 18 14 18.4477 14 19C14 19.5523 14.4477 20 15 20Z" fill="white"/>
                <path d="M17 19H19V17H16.2C16.4 16.2 16.5 15.4 16.5 14.5C16.5 12 14.5 10 12 10H10V7H12C12.6 7 13 6.6 13 6V4H11V6H9V4H7V6C7 6.6 7.4 7 8 7H9V10C6.2 10 4 12.2 4 15V19H7V15C7 13.3 8.3 12 10 12H12C13.7 12 15 13.3 15 15H12V17H15C15 17.7 14.7 18.4 14.3 19H13" fill="white"/>
                <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="white"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-body-lg">Accidental disability cover</h4>
              <div className="space-y-1.5 mt-1.5">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-body-sm text-gray-500 leading-snug">Get sum assured if permanently disabled due to accident</p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-body-sm text-gray-500 leading-snug">No premiums to pay for remaining policy term</p>
                </div>
              </div>
            </div>
          </div>
          <LifeCustomDropdown 
            options={getOptions(RATES.accidental_disability, accDisabilityPremium)}
            value={accDisabilitySA}
            onChange={setAccDisabilitySA}
          />
        </div>

        {/* Limit Bar */}
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-caption text-white/80">Additional covers limit</span>
              <div className="group relative">
                <svg className="w-3.5 h-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <span className={`text-caption font-semibold ${isLimitBreached ? 'text-red-300' : 'text-white'}`}>
              ₹{accTotalPremium.toLocaleString()}/yr
            </span>
          </div>
          
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${isLimitBreached ? 'bg-red-500' : 'bg-green-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((accTotalPremium / accidentalLimit) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
             <span className="text-[10px] text-white/40">₹0</span>
             <span className="text-[10px] text-white/40">Max: ₹{Math.round(accidentalLimit).toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={isLimitBreached}
          className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:grayscale"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Critical Illness Rider Widget
   ═══════════════════════════════════════════════════════ */

export function LifeCriticalIllnessWidget({ onContinue }: { onContinue: () => void }) {
  const state = useLifeJourneyStore.getState() as LifeJourneyState;
  const { quote, selectedRiders } = state;
  const basePremium = quote?.basePremium || 0;
  const baseSumAssured = quote?.sumAssured || 0;

  const RATE_CI = 100; // Rate per 1L

  const [ciSA, setCiSA] = useState(0);

  useEffect(() => {
    if (selectedRiders) {
      const ci = selectedRiders.find(r => r.id === 'critical_illness');
      if (ci) setCiSA(ci.sumAssured || 0);
    }
  }, []);

  const ciPremium = (ciSA / 100000) * RATE_CI;

  // Filter options: cannot exceed base sum assured
  const getOptions = () => {
    const allOpts = [
      { label: 'Select sum assured', value: 0 },
      { label: '₹5 Lakh', value: 500000 },
      { label: '₹10 Lakh', value: 1000000 },
      { label: '₹25 Lakh', value: 2500000 },
      { label: '₹50 Lakh', value: 5000000 },
      { label: '₹1 Crore', value: 10000000 },
    ];
    return allOpts.filter(o => o.value === 0 || o.value <= baseSumAssured);
  };

  const handleContinue = () => {
    // Preserve accidental riders
    const otherRiders = (state.selectedRiders || []).filter(r => r.id !== 'critical_illness');
    const newRiders = [...otherRiders];

    if (ciSA > 0) {
      newRiders.push({
        id: 'critical_illness',
        name: 'Critical Illness Benefit',
        description: 'Coverage for critical illnesses',
        sumAssured: ciSA,
        premium: ciPremium,
        premiumImpact: RATE_CI,
        selected: true
      });
    }

    // Recalculate total premium
    const totalRiderPremium = newRiders.reduce((sum, r) => sum + (r.premium || 0), 0);
    const newTotalPremium = basePremium + totalRiderPremium;

    const currentQuote = state.quote;
    const updatedQuote = currentQuote ? {
      ...currentQuote,
      riders: newRiders,
      totalPremium: newTotalPremium,
      yearlyPremium: newTotalPremium,
      monthlyPremium: Math.round(newTotalPremium / 12),
    } : null;

    useLifeJourneyStore.setState({ 
      selectedRiders: newRiders,
      ...(updatedQuote && { quote: updatedQuote })
    });
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full"
    >
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" fill="#FCE7F3"/>
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 10V16" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 13H15" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V4" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-body-lg">Critical illness cover</h4>
            <div className="flex items-start gap-2 mt-1.5">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-body-sm text-gray-500 leading-snug">Lump sum payout for 21 critical illnesses</p>
            </div>
          </div>
        </div>
        
        <LifeCustomDropdown 
          options={getOptions()}
          value={ciSA}
          onChange={setCiSA}
        />
      </div>

      <p className="text-center text-caption text-white/40 mb-4">
        Critical illness cover cannot exceed base sum assured.
      </p>

      <button
        onClick={handleContinue}
        className="w-full py-3.5 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform shadow-lg shadow-purple-600/30"
      >
        Continue
      </button>
    </motion.div>
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
    { label: 'Riders', value: selectedRiders.length > 0 ? selectedRiders.map(r => r.name).join(', ') : 'None', stepId: 'life_addons_intro' },
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
   e-KYC Screen — Aadhaar-based identity verification
   ═══════════════════════════════════════════════════════ */

export function LifeEkycScreen({ onContinue }: { onContinue: () => void }) {
  const [step, setStep] = useState<'start' | 'otp' | 'verifying' | 'done'>('start');
  const [otp, setOtp] = useState('');

  const handleStart = () => setStep('otp');

  const handleVerify = () => {
    if (otp.length < 4) return;
    setStep('verifying');
    setTimeout(() => {
      setStep('done');
      setTimeout(() => onContinue(), 1200);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-label-md font-bold text-gray-900">e-KYC Verification</h3>
              <p className="text-caption text-gray-400">Aadhaar-based OTP verification</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          {step === 'start' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {['Enter your Aadhaar number', 'Receive OTP on linked mobile', 'Verify — takes under 2 minutes'].map((text, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                    <span className="text-body-sm text-gray-600">{text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleStart}
                className="w-full py-3 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
              >
                Start e-KYC
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-body-sm text-gray-600">Enter the OTP sent to your Aadhaar-linked mobile number.</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-lg font-semibold tracking-[0.3em] text-gray-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30"
                autoFocus
              />
              <button
                onClick={handleVerify}
                disabled={otp.length < 4}
                className="w-full py-3 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform disabled:opacity-40"
              >
                Verify
              </button>
            </div>
          )}

          {step === 'verifying' && (
            <div className="flex flex-col items-center py-6">
              <svg className="w-8 h-8 text-purple-500 animate-spin mb-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
              <p className="text-body-sm text-gray-600">Verifying your identity...</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center py-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </motion.div>
              <p className="text-label-md font-semibold text-gray-900">Identity Verified</p>
              <p className="text-caption text-gray-400 mt-1">e-KYC completed successfully</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Medical Screen — Tele-medical & health tests scheduling
   ═══════════════════════════════════════════════════════ */

export function LifeMedicalScreen({ onContinue }: { onContinue: () => void }) {
  const [scheduled, setScheduled] = useState(false);

  const handleSchedule = () => {
    setScheduled(true);
    setTimeout(() => onContinue(), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div>
              <h3 className="text-label-md font-bold text-gray-900">Medical Evaluation</h3>
              <p className="text-caption text-gray-400">Quick health assessment</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          {!scheduled ? (
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { icon: '📞', title: 'Tele-medical call', desc: 'A 10-minute video call with a doctor' },
                  { icon: '🩺', title: 'Lab tests (if required)', desc: 'Based on your age and coverage amount' },
                  { icon: '📋', title: 'Income proof', desc: 'Salary slips, ITR, or bank statements' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-label-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-caption text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-purple-50 rounded-xl px-4 py-3">
                <p className="text-caption text-purple-700">
                  We&apos;ll call you within 24 hours to schedule a convenient time.
                </p>
              </div>

              <button
                onClick={handleSchedule}
                className="w-full py-3 rounded-xl bg-purple-600 text-white text-label-lg font-semibold active:scale-[0.97] transition-transform"
              >
                Schedule my evaluation
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </motion.div>
              <p className="text-label-md font-semibold text-gray-900">Evaluation Scheduled</p>
              <p className="text-caption text-gray-400 mt-1">We&apos;ll contact you within 24 hours</p>
            </div>
          )}
        </div>
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
