'use client';

import { motion } from 'framer-motion';

interface LifePathSelectionProps {
  onSelectPath: (path: 'direct' | 'guided') => void;
}

export default function LifePathSelection({ onSelectPath }: LifePathSelectionProps) {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #2A1463 50%, #1C0B47 100%)' }}
    >
      {/* Logo/Icon at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/15">
          <svg 
            className="w-8 h-8 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5}
          >
            <path d="M12 2C6.477 2 2 6.477 2 12h4a6 6 0 0 1 12 0h4c0-5.523-4.477-10-10-10Z" fill="currentColor" opacity="0.3" stroke="none" />
            <path d="M12 2C6.477 2 2 6.477 2 12h4a6 6 0 0 1 12 0h4c0-5.523-4.477-10-10-10Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 12v8c0 1.105-.895 2-2 2s-2-.895-2-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-24 text-center"
      >
        <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl px-8 py-4">
          <h1 className="text-xl text-white font-medium">How would you like to proceed?</h1>
        </div>
      </motion.div>

      {/* Options */}
      <div className="w-full max-w-md space-y-4">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => onSelectPath('direct')}
          className="w-full text-left bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-2xl p-5 transition-all active:scale-[0.98] group"
        >
          <h3 className="text-white text-lg font-semibold mb-1.5">I know my coverage needs</h3>
          <p className="text-white/50 text-sm">Get a quick quote</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => onSelectPath('guided')}
          className="w-full text-left bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-2xl p-5 transition-all active:scale-[0.98] group"
        >
          <h3 className="text-white text-lg font-semibold mb-1.5">Help me decide</h3>
          <p className="text-white/50 text-sm">We'll calculate the right coverage for you</p>
        </motion.button>
      </div>
    </div>
  );
}
