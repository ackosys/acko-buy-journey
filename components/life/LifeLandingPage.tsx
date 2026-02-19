'use client';

import { motion } from 'framer-motion';
import AckoLogo from '../AckoLogo';
import Link from 'next/link';

interface LifeLandingPageProps {
  onGetStarted: () => void;
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LifeLandingPage({ onGetStarted }: LifeLandingPageProps) {
  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #3a1d8e 30%, #6C4DE8 60%, #9b7bf7 100%)' }}>
      {/* Sticky top bar — transparent, blends with gradient */}
      <div className="sticky top-0 z-50" style={{ background: 'linear-gradient(to bottom, rgba(26, 10, 62, 0.9) 0%, rgba(58, 29, 142, 0.7) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <AckoLogo variant="white" className="h-5" />
          </Link>
          <span className="text-xs text-purple-200/60 font-medium">Life Insurance</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto">

        {/* HERO */}
        <div className="px-6 pt-10 pb-6 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-purple-200 text-[11px] font-medium px-3 py-1.5 rounded-full mb-5 border border-white/15">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.477 2 12h4a6 6 0 0 1 12 0h4c0-5.523-4.477-10-10-10Z" fill="currentColor" opacity="0.6" />
                <path d="M12 12v8c0 1.105-.895 2-2 2s-2-.895-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              100% Pure Term Insurance
            </div>

            <h1 className="text-[24px] font-bold text-white leading-[1.3] mb-3">
              You know life insurance<br />matters. What matters more<br />is choosing <span className="text-purple-200">the right one.</span>
            </h1>

            <p className="text-sm text-purple-200/70 mb-6 max-w-xs mx-auto leading-relaxed">
              No investment mixing. No hidden charges.<br />Just protection — simple and transparent.
            </p>
          </motion.div>
        </div>

        {/* Hero image */}
        <FadeIn className="px-6 pb-4">
          <div className="relative flex justify-center">
            <img
              src="/life-family-umbrella.png"
              alt="Family protected under umbrella"
              className="w-[85%] h-auto object-contain"
            />
          </div>
        </FadeIn>

        <div className="pb-4" />

        {/* SECTION 1 — Don't mix insurance + investment */}
        <FadeIn className="px-6 pb-8">
          <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-16 h-16 rounded-full border border-white/15 bg-white/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-xl text-white/30 font-light">&ne;</span>
              <div className="w-16 h-16 rounded-full border border-white/15 bg-white/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
            </div>
            <h2 className="text-[18px] font-bold text-white text-center leading-tight mb-2">
              It should not mix<br />insurance and investment
            </h2>
            <p className="text-sm text-purple-200/70 text-center leading-relaxed">
              When you mix both, you compromise on both —<br />lower coverage AND lower returns.
            </p>
          </div>
        </FadeIn>

        {/* SECTION 2 — Why term from ACKO */}
        <FadeIn className="px-6 pb-8">
          <p className="text-[11px] text-purple-200 font-semibold uppercase tracking-wider mb-2">Why term from ACKO?</p>
          <h2 className="text-[18px] font-bold text-white leading-tight mb-1.5">
            It only pays for protection.
          </h2>
          <p className="text-sm text-purple-200/70 leading-relaxed mb-5">
            So you pay less for a ₹1 Cr cover.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Term plan — highlighted */}
            <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <p className="text-[10px] font-semibold text-purple-200 uppercase tracking-wider mb-2">Term Plan</p>
              <p className="text-[22px] font-bold text-white leading-none">₹5K</p>
              <p className="text-[11px] text-purple-200/60 mt-0.5">/year for ₹1 Cr</p>
              <div className="mt-3 space-y-1.5">
                {['Pure protection', 'High cover', 'Low cost'].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-[11px] text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Mixed plans — muted */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Mixed Plans</p>
              <p className="text-[22px] font-bold text-white/40 leading-none">₹50K</p>
              <p className="text-[11px] text-white/25 mt-0.5">/year for ₹1 Cr</p>
              <div className="mt-3 space-y-1.5">
                {['Mixed purpose', 'Lower cover', 'Lock-in'].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-white/25 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-[11px] text-white/35">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* SECTION 3 — Cover should match your income */}
        <FadeIn className="px-6 pb-8">
          <h2 className="text-[18px] font-bold text-white leading-tight mb-1.5">
            Your cover should be<br />
            <span className="text-purple-200">like your income.</span> Anything<br />less isn&apos;t enough.
          </h2>
          <p className="text-sm text-purple-200/70 leading-relaxed mb-5">
            If you earn ₹10L/year, your family needs at least ₹1 Cr to maintain their lifestyle for 10 years.
          </p>

          <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-purple-200/60 uppercase tracking-wider">Annual Income</p>
                <p className="text-xl font-bold text-white">₹10L</p>
              </div>
              <svg className="w-5 h-5 text-purple-200/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <div className="text-right">
                <p className="text-[10px] text-purple-200/60 uppercase tracking-wider">Right Coverage</p>
                <p className="text-xl font-bold text-purple-200">₹1 Cr+</p>
              </div>
            </div>
            <p className="text-[11px] text-purple-200/50 leading-relaxed">
              We help calculate the right amount based on your income, loans, and goals.
            </p>
          </div>
        </FadeIn>

        {/* SECTION 4 — Flexible coverage */}
        <FadeIn className="px-6 pb-8">
          <h2 className="text-[18px] font-bold text-white leading-tight mb-1.5">
            A term plan should<br />also be <span className="text-purple-200">flexible.</span>
          </h2>
          <p className="text-sm text-purple-200/70 leading-relaxed mb-5">
            With ACKO, you can adjust cover every 5 years as your life changes.
          </p>

          <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
            <div className="relative pl-7">
              <div className="absolute left-2 top-1 bottom-1 w-px bg-white/20 rounded-full" />
              {[
                { year: 'Year 1', event: 'Just married', cover: '₹75L', dot: 'bg-purple-300' },
                { year: 'Year 5', event: 'First child', cover: '₹1.2 Cr', dot: 'bg-purple-200' },
                { year: 'Year 10', event: 'Home loan', cover: '₹1.8 Cr', dot: 'bg-white' },
                { year: 'Year 20', event: 'Kids settled', cover: '₹80L', dot: 'bg-purple-300' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative mb-4 last:mb-0"
                >
                  <div className={`absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full ${item.dot} border-2 border-[#5B3CC4]`} />
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] text-purple-200 font-semibold min-w-[48px]">{item.year}</span>
                    <span className="text-sm text-white/90">{item.event}</span>
                    <span className="text-[11px] text-purple-200/60 ml-auto">{item.cover}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* SECTION 5 — More than protection */}
        <FadeIn className="px-6 pb-8">
          <h2 className="text-[18px] font-bold text-white leading-tight mb-5">
            More than just protection...
          </h2>
          <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm space-y-0">
            {[
              {
                icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
                title: 'Create your will for FREE',
                desc: 'Ensure your assets reach the right people.',
              },
              {
                icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Tax savings under 80C',
                desc: 'Deduction up to ₹1.5L/year on premiums paid.',
              },
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-3 py-4 ${i === 0 ? 'border-b border-white/15' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white font-semibold">{item.title}</p>
                  <p className="text-sm text-purple-200/60 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* SECTION 6 — FAQ */}
        <FadeIn className="px-6 pb-8">
          <h2 className="text-[18px] font-bold text-white leading-tight mb-1.5 text-center">
            Have questions?
          </h2>
          <p className="text-sm text-purple-200/60 text-center mb-5">Get honest answers.</p>

          <div className="space-y-2.5">
            {[
              { q: 'If I survive the term, my money is wasted?', a: 'Insurance is like a seatbelt. You don\'t regret not crashing — you\'re grateful you were protected during your earning years.' },
              { q: 'Why not buy a plan that gives returns?', a: 'When you mix insurance + investment, part goes to mortality charges, part to commissions, part to fund management. You get lower cover AND lower returns. Separate them for better results.' },
              { q: 'What if my needs change over time?', a: 'ACKO Flexi lets you increase or decrease coverage every 5 years. You don\'t have to get it perfect today.' },
              { q: 'What happens after I pay?', a: 'Tele-medical call → possible health tests → income verification → underwriting review → approval. If not approved, 100% refund — no questions asked.' },
            ].map((item, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group bg-white/10 border border-white/15 rounded-xl overflow-hidden backdrop-blur-sm"
              >
                <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none">
                  <span className="text-sm font-medium text-white/90 pr-3">{item.q}</span>
                  <svg className="w-4 h-4 text-white/40 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-4 pb-3.5 -mt-1">
                  <p className="text-sm text-purple-200/60 leading-relaxed">{item.a}</p>
                </div>
              </motion.details>
            ))}
          </div>
        </FadeIn>

        {/* SECTION 7 — Trusted by millions */}
        <FadeIn className="px-6 pb-10">
          <h2 className="text-[18px] font-bold text-white text-center leading-tight mb-5">
            Trusted by millions.<br /><span className="text-purple-200">Awarded for it.</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1 mb-1">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <span className="text-xl font-bold text-white">4.4</span>
              </div>
              <p className="text-[11px] text-purple-200/50">Google Rating</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center backdrop-blur-sm">
              <p className="text-xl font-bold text-white mb-1">1.6 Cr+</p>
              <p className="text-[11px] text-purple-200/50">Happy Customers</p>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Fixed bottom CTA — seamless gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="h-8" style={{ background: 'linear-gradient(to bottom, transparent, rgba(108, 77, 232, 0.8))' }} />
        <div className="px-6 pb-6 pt-2 pointer-events-auto" style={{ background: 'rgba(108, 77, 232, 0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="max-w-lg mx-auto">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={onGetStarted}
              className="w-full py-4 bg-white text-[#3a1d8e] rounded-2xl text-base font-bold transition-all active:scale-[0.97] hover:bg-white/90"
            >
              Check quote
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
