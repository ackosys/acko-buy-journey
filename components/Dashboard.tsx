'use client';

import { useJourneyStore } from '../lib/store';
import { getDashboardStep } from '../lib/dashboardScripts';
import ConversationalFlow from './ConversationalFlow';
import AckoLogo from './AckoLogo';
import { useT } from '../lib/translations';

/* ═══════════════════════════════════════════════════════
   Dashboard — Conversational Post-Policy Home
   Uses ConversationalFlow with dashboard scripts
   ═══════════════════════════════════════════════════════ */

export default function Dashboard({ onTalkToExpert }: { onTalkToExpert?: (context?: string) => void }) {
  const t = useT();
  const updateState = useJourneyStore(s => s.updateState);

  // Header for the conversational flow
  const header = (
    <div className="border-b border-white/10 px-5 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <AckoLogo variant="white" className="h-5" />
        <span className="text-label-sm text-white/60">{t.dashboard.title}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onTalkToExpert?.('dashboard')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title={t.dashboard.talkToExpert}>
          <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
        </button>
        <button onClick={() => updateState({ showAIChat: true })} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title={t.dashboard.aiHelp}>
          <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
        </button>
        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center ml-1 border border-white/15">
          <span className="text-sm font-bold text-white">{(useJourneyStore.getState().userName || 'U')[0].toUpperCase()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #1C0B47 0%, #2A1463 40%, #1C0B47 100%)' }}>
      <ConversationalFlow
        getStep={getDashboardStep}
        initialStepId="db.welcome"
        header={header}
      />
    </div>
  );
}
