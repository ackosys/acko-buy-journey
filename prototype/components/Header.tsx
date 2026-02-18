'use client';

import { useJourneyStore } from '../lib/store';
import AckoLogo from './AckoLogo';
import { useT } from '../lib/translations';

const MODULE_ORDER = ['entry', 'intent', 'family', 'coverage', 'health', 'customization', 'recommendation', 'review', 'payment', 'health_eval', 'completion'];

export default function Header() {
  const t = useT();
  const { currentModule, updateState } = useJourneyStore();
  const currentIndex = MODULE_ORDER.indexOf(currentModule);
  const progress = Math.round((currentIndex / (MODULE_ORDER.length - 1)) * 100);

  return (
    <header className="sticky top-0 z-30 bg-[#1C0B47] border-b border-white/10">
      <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* ACKO Logo — white on dark */}
        <div className="flex items-center gap-2">
          <AckoLogo variant="white" className="h-5" />
        </div>

        {/* Circular action buttons */}
        <div className="flex items-center gap-2">
          {/* AI Help — sparkle icon in glass circle */}
          <button
            onClick={() => updateState({ showAIChat: true })}
            className="group relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-95"
            title={t.header.aiHelp}
          >
            <svg className="w-4.5 h-4.5 text-purple-300 group-hover:text-white transition-colors" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-[#1C0B47]" />
          </button>

          {/* Talk to Expert — headphone/person icon in glass circle */}
          <button
            onClick={() => updateState({ showExpertPanel: true })}
            className="group relative flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
            title={t.header.talkToExpert}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <img
                src="/brand-ambassador.png"
                alt={t.header.expert}
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <svg className="hidden w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span className="text-white/90 text-xs font-medium">{t.header.expert}</span>
          </button>
        </div>
      </div>

      {/* Progress — glowing purple on dark */}
      <div className="h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-300 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(139,92,246,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
