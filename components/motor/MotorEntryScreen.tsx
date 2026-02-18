'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AckoLogo from '../AckoLogo';
import { VehicleType } from '../../lib/motor/types';

interface MotorEntryScreenProps {
  onSelect: (vehicleType: VehicleType) => void;
}

export default function MotorEntryScreen({ onSelect }: MotorEntryScreenProps) {
  const [selected, setSelected] = useState<VehicleType | null>(null);

  const handleSelect = (type: VehicleType) => {
    setSelected(type);
    setTimeout(() => onSelect(type), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen gradient-purple flex flex-col px-6 pt-10 pb-8 relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[450px] h-[450px] rounded-full bg-purple-400/8 blur-3xl" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-12 relative z-10">
        <AckoLogo variant="white" className="h-8" />
        <span className="text-[10px] bg-white/10 text-purple-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-white/10">
          Motor Insurance
        </span>
      </div>

      <div className="max-w-lg mx-auto w-full relative z-10 flex-1 flex flex-col">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h1 className="text-[28px] font-bold text-white leading-tight mb-3">
            Insure your ride,{'\n'}
            <span className="text-purple-300">the ACKO way</span>
          </h1>
          <p className="text-[15px] text-purple-200/60 leading-relaxed">
            Zero paperwork. Instant policy. Claims settled in minutes, not months.
          </p>
        </motion.div>

        {/* Vehicle Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-[15px] font-medium text-white/60 mb-4">What would you like to insure?</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Car Card */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect('car')}
              className={`
                relative group rounded-2xl border p-6 text-center transition-all duration-300 overflow-hidden
                ${selected === 'car'
                  ? 'border-purple-400 bg-white/15 shadow-lg shadow-purple-900/30 scale-[1.02]'
                  : 'border-white/12 bg-white/6 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {selected === 'car' && (
                <motion.div
                  layoutId="vehicle-glow"
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/15 to-transparent"
                />
              )}
              <div className="relative z-10">
                {/* Car SVG */}
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${selected === 'car' ? 'bg-purple-500/30' : 'bg-white/8'}`}>
                  <svg className={`w-8 h-8 transition-colors ${selected === 'car' ? 'text-purple-300' : 'text-white/60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-1">Car</h3>
                <p className="text-[12px] text-white/40">Hatchback, Sedan, SUV</p>
              </div>
              {selected === 'car' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </motion.div>
              )}
            </motion.button>

            {/* Bike Card */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect('bike')}
              className={`
                relative group rounded-2xl border p-6 text-center transition-all duration-300 overflow-hidden
                ${selected === 'bike'
                  ? 'border-purple-400 bg-white/15 shadow-lg shadow-purple-900/30 scale-[1.02]'
                  : 'border-white/12 bg-white/6 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {selected === 'bike' && (
                <motion.div
                  layoutId="vehicle-glow"
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/15 to-transparent"
                />
              )}
              <div className="relative z-10">
                {/* Bike SVG */}
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${selected === 'bike' ? 'bg-purple-500/30' : 'bg-white/8'}`}>
                  <svg className={`w-8 h-8 transition-colors ${selected === 'bike' ? 'text-purple-300' : 'text-white/60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="5.5" cy="17" r="3" />
                    <circle cx="18.5" cy="17" r="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 6h2l3 8M5.5 17L10 9l3 3h4" />
                    <circle cx="16" cy="6" r="1" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-1">Bike</h3>
                <p className="text-[12px] text-white/40">Scooter, Motorcycle</p>
              </div>
              {selected === 'bike' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-auto"
        >
          <div className="flex items-center justify-center gap-6 py-4">
            <TrustBadge icon="shield" label="IRDAI Licensed" />
            <TrustBadge icon="clock" label="2-min Policy" />
            <TrustBadge icon="star" label="4.5★ Rated" />
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center justify-center gap-8 text-center">
            <div>
              <p className="text-[18px] font-bold text-white">1Cr+</p>
              <p className="text-[11px] text-white/40">Vehicles Insured</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-[18px] font-bold text-white">95%</p>
              <p className="text-[11px] text-white/40">Claims Settled</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-[18px] font-bold text-white">₹0</p>
              <p className="text-[11px] text-white/40">Paperwork</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function TrustBadge({ icon, label }: { icon: string; label: string }) {
  const iconPaths: Record<string, string> = {
    shield: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    star: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
  };
  return (
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4 text-purple-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[icon]} />
      </svg>
      <span className="text-[11px] text-white/40 font-medium">{label}</span>
    </div>
  );
}
