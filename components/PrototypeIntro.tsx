'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import AckoLogo from './AckoLogo';

/* ═══════════════════════════════════════════════════════
   Prototype Intro — Two-screen onboarding that introduces
   what this journey is and how it's different
   ═══════════════════════════════════════════════════════ */

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: 'End-to-end conversational',
    desc: 'From buy to claim — one continuous conversation, not 500+ disjointed screens.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Personalised at every step',
    desc: 'New vs existing ACKO user? Different journeys. Every message, every recommendation adapts to your unique context — family, health, budget.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: 'AI-led health evaluation',
    desc: 'Voice call with Dr. Riya or chat-based telemed — your choice, your pace.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Policy analyser built-in',
    desc: 'Upload your existing policy. We analyse gaps and show you exactly what you\'re missing.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    title: 'Expert help at every step',
    desc: 'Contextual AI chat + real human experts, always one tap away.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644V14.652" />
      </svg>
    ),
    title: 'Re-proposal scenarios',
    desc: 'Waiting periods, extra premiums, member rejections — all handled gracefully.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
    title: 'Vernacular support',
    desc: 'English, Hindi, Hinglish, Kannada — the entire journey in your language.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    title: 'Edit + claim experience',
    desc: 'Post-policy dashboard with claims, documents, and policy edits — all integrated.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Dramatically reduces build effort',
    desc: 'Conversation-driven UI replaces hundreds of bespoke screens. Less design, less frontend, less voice call scripting — one flexible framework powers it all.',
  },
];

export default function PrototypeIntro({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0D0521 0%, #1C0B47 35%, #2A1463 65%, #1C0B47 100%)' }}
    >
      <AnimatePresence mode="wait">
        {/* ═══════ SLIDE 1: The Vision ═══════ */}
        {slide === 0 && (
          <motion.div
            key="slide-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="h-full flex flex-col"
          >
            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-purple-600/10 blur-[100px]" />
              <div className="absolute bottom-[20%] right-[5%] w-96 h-96 rounded-full bg-indigo-500/8 blur-[120px]" />
              <div className="absolute top-[60%] left-[50%] w-48 h-48 rounded-full bg-pink-500/6 blur-[80px]" />
            </div>

            <div className="flex-1 flex flex-col justify-center px-7 relative z-10 max-w-lg mx-auto w-full">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10"
              >
                <AckoLogo variant="white" className="h-7" />
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-5"
              >
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-medium text-purple-300 tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  A Revolutionised Health Insurance Flow
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-[32px] sm:text-[38px] font-bold text-white leading-[1.15] mb-5 tracking-tight"
              >
                Bringing back the{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200">
                  human conversation
                </span>{' '}
                to health insurance.
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="text-[15px] leading-relaxed text-white/55 mb-8 max-w-md"
              >
                Health insurance was always sold through conversations — agents who understood your family, your worries, your budget. We&apos;re bringing that back, powered by AI.
              </motion.p>

              {/* The problem */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-6"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/80 text-[13px] font-semibold mb-1">Today&apos;s reality</p>
                    <p className="text-white/40 text-[13px] leading-relaxed">
                      500+ screens. Every experience owned by a different team. Fragmented, impersonal, overwhelming. Users drop off because it feels like paperwork, not a conversation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/80 text-[13px] font-semibold mb-1">This prototype</p>
                    <p className="text-white/40 text-[13px] leading-relaxed">
                      One unified, conversational journey — from the first &ldquo;hello&rdquo; to your policy dashboard. Built from insights across <span className="text-white/60 font-medium">200+ user calls</span>.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Belief */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-2.5 mb-8"
              >
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-purple-400/40 to-transparent" />
                <p className="text-[12px] text-white/35 italic leading-relaxed">
                  &ldquo;Humans are moving to AI-first, personalised experiences. This is what insurance should feel like.&rdquo;
                </p>
              </motion.div>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="px-7 pb-10 relative z-10 max-w-lg mx-auto w-full"
            >
              <button
                onClick={() => setSlide(1)}
                className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-900/30 active:scale-[0.98]"
              >
                See what&apos;s different
              </button>
              <button
                onClick={onDone}
                className="w-full mt-3 py-2.5 text-[13px] text-white/30 hover:text-white/50 transition-colors"
              >
                Skip intro
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════ SLIDE 2: Feature Highlights ═══════ */}
        {slide === 1 && (
          <motion.div
            key="slide-1"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full flex flex-col"
          >
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[10%] right-[10%] w-64 h-64 rounded-full bg-purple-600/8 blur-[100px]" />
              <div className="absolute bottom-[15%] left-[5%] w-80 h-80 rounded-full bg-indigo-500/6 blur-[110px]" />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto relative z-10">
              <div className="px-7 pt-14 pb-6 max-w-lg mx-auto w-full">
                {/* Back + header */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => setSlide(0)}
                  className="flex items-center gap-1.5 text-[13px] text-purple-300/60 hover:text-purple-300 transition-colors mb-6"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </motion.button>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-2"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/15 text-[11px] font-medium text-purple-300 tracking-wide uppercase">
                    What&apos;s inside
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[26px] font-bold text-white leading-tight mb-2 tracking-tight"
                >
                  Everything in one flow
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-[13px] text-white/40 mb-7 leading-relaxed"
                >
                  New brand energy. Conversation-first till buy, smart navigation post that.
                </motion.p>

                {/* Feature cards */}
                <div className="space-y-2.5">
                  {FEATURES.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-400/10 flex items-center justify-center flex-shrink-0 text-purple-300">
                        {f.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-white/85 mb-0.5">{f.title}</p>
                        <p className="text-[12px] text-white/35 leading-relaxed">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/[0.05] border border-amber-400/10"
                >
                  <span className="text-amber-400 text-lg flex-shrink-0">*</span>
                  <p className="text-[11px] text-amber-300/50 leading-relaxed">
                    This is a functional prototype — not a production build. Designed to demonstrate the vision and flow.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-7 pb-10 pt-4 relative z-10 max-w-lg mx-auto w-full"
              style={{ background: 'linear-gradient(to top, #1C0B47 60%, transparent)' }}
            >
              <button
                onClick={onDone}
                className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-900/30 active:scale-[0.98]"
              >
                Experience the journey
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              slide === i ? 'w-6 bg-white/50' : 'w-1.5 bg-white/15 hover:bg-white/25'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
