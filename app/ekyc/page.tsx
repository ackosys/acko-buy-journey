'use client';

import { useRouter } from 'next/navigation';
import EkycChatFlow from '../../components/ekyc/EkycChatFlow';

export default function EkycPage() {
  const router = useRouter();

  const handleComplete = () => {
    console.log('e-KYC completed!');
    // Navigate to next step or show success
    // router.push('/life'); // Navigate to next step if needed
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="shrink-0 bg-[#1C0B47]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-semibold text-base">e-KYC Verification</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 chat-bg-dark">
        <EkycChatFlow onComplete={handleComplete} />
      </div>
    </div>
  );
}
