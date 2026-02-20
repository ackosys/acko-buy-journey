'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useMotorStore } from '../../lib/motor/store';
import { assetPath } from '../../lib/assetPath';
import { MotorModule, MotorJourneyState } from '../../lib/motor/types';

/* ═══════════════════════════════════════════════════════
   Motor Expert Panel — Dynamic questions based on journey position
   ═══════════════════════════════════════════════════════ */

interface MotorExpert {
  name: string;
  role: string;
  experience: string;
  helped: string;
  description: string;
  speciality: string[];
  initials: string;
  color: string;
  img: string;
}

const MOTOR_EXPERTS: MotorExpert[] = [
  {
    name: 'Vikram Desai',
    role: 'Motor Insurance Specialist',
    experience: '8+ years in motor claims',
    helped: '4,200+ customers helped',
    description: 'Expert in comprehensive plans, IDV optimization, and zero depreciation coverage. Specializes in helping first-time car buyers.',
    speciality: ['Comprehensive Plans', 'Zero Dep', 'New Car Insurance'],
    initials: 'VD',
    color: 'bg-purple-500',
    img: 'https://i.pravatar.cc/120?img=68',
  },
  {
    name: 'Meera Krishnan',
    role: 'Claims & Add-ons Advisor',
    experience: '6+ years in motor claims',
    helped: '3,100+ claims resolved',
    description: 'Specialist in motor claims processing, add-on selection, and helping customers maximize their coverage without overpaying.',
    speciality: ['Claims Process', 'Add-on Selection', 'Premium Optimization'],
    initials: 'MK',
    color: 'bg-blue-500',
    img: 'https://i.pravatar.cc/120?img=45',
  },
  {
    name: 'Arjun Nair',
    role: 'Vehicle Policy Consultant',
    experience: '10+ years in auto insurance',
    helped: '5,800+ policies reviewed',
    description: 'Deep expertise in NCB transfers, policy renewals, and switching between insurers. Helps customers make informed plan decisions.',
    speciality: ['NCB & Renewals', 'Policy Switching', 'IDV Calculation'],
    initials: 'AN',
    color: 'bg-teal-500',
    img: 'https://i.pravatar.cc/120?img=53',
  },
];

function getConcernsForMotorModule(module: MotorModule | string): string[] {
  switch (module) {
    case 'entry':
    case 'vehicle_type':
      return [
        'I\'m not sure which type of insurance I need',
        'What\'s the difference between car and bike insurance?',
        'Do I really need insurance beyond third-party?',
        'How does ACKO compare to other insurers?',
      ];
    case 'registration':
    case 'vehicle_fetch':
      return [
        'I don\'t have my registration number handy',
        'My vehicle details seem incorrect — what should I do?',
        'I just bought a brand new car, what do I need?',
        'Can I insure a vehicle registered in someone else\'s name?',
      ];
    case 'manual_entry':
      return [
        'My car model isn\'t listed — what do I do?',
        'Does the variant/fuel type affect my premium?',
        'What if I have an aftermarket CNG kit installed?',
        'How do I find my car\'s exact variant?',
      ];
    case 'pre_quote':
      return [
        'What is NCB and how does it affect my premium?',
        'My previous policy expired — do I lose my NCB?',
        'How do I transfer NCB from another insurer?',
        'Why does my policy status matter?',
      ];
    case 'quote':
      return [
        'What is IDV and how is it calculated?',
        'Difference between Comprehensive, Zero Dep, and Third Party?',
        'Why is Zero Dep more expensive than Comprehensive?',
        'Can I change my plan later?',
      ];
    case 'addons':
      return [
        'Is Zero Depreciation worth the extra cost?',
        'What does Engine Protection actually cover?',
        'Do I need Roadside Assistance if I have it from the manufacturer?',
        'Which add-ons are essential vs. nice-to-have?',
      ];
    case 'owner_details':
      return [
        'Where do I find my engine and chassis number?',
        'Why do you need my GST details?',
        'What if I\'ve taken a loan on my car?',
        'Can someone else be the nominee?',
      ];
    case 'review':
    case 'payment':
      return [
        'Is this payment secure?',
        'Can I pay in monthly installments?',
        'When does my coverage start after payment?',
        'What\'s your refund/cancellation policy?',
      ];
    case 'completion':
      return [
        'How do I download my policy document?',
        'When will I receive my policy certificate?',
        'How do I add this to my Digilocker?',
        'What should I do next?',
      ];
    case 'dashboard':
      return [
        'How do I raise a claim?',
        'Where can I find my policy documents?',
        'Can I modify my add-ons mid-term?',
        'How do I renew my policy?',
      ];
    case 'claims':
      return [
        'What documents do I need to file a claim?',
        'How long does claim settlement take?',
        'Can I get my car repaired at any garage?',
        'What if the other driver was at fault?',
      ];
    case 'edit_policy':
      return [
        'Can I add Zero Dep after buying the policy?',
        'Will adding add-ons increase my premium proportionally?',
        'How do I update my nominee details?',
        'Can I change my IDV mid-term?',
      ];
    default:
      return [
        'Help me understand my motor insurance options',
        'What does comprehensive coverage include?',
        'How do I file a claim with ACKO?',
        'I have a specific question about my policy',
      ];
  }
}

export function MotorExpertPanel() {
  const state = useMotorStore() as MotorJourneyState;
  const { showExpertPanel, currentModule } = state;
  const updateState = useMotorStore((s) => s.updateState);

  const [selectedExpert, setSelectedExpert] = useState<MotorExpert | null>(null);
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const dynamicConcerns = useMemo(() => getConcernsForMotorModule(currentModule), [currentModule]);

  return (
    <AnimatePresence>
      {showExpertPanel && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => { updateState({ showExpertPanel: false } as Partial<MotorJourneyState>); setSelectedExpert(null); setShowBooking(false); }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col shadow-2xl"
            style={{ background: 'linear-gradient(180deg, #1C0B47 0%, #2A1463 50%, #1C0B47 100%)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700/50 to-purple-900/50 px-6 pt-14 pb-6">
              <button
                onClick={() => { updateState({ showExpertPanel: false } as Partial<MotorJourneyState>); setSelectedExpert(null); setShowBooking(false); }}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-white mb-1">Talk to an Expert</h2>
              <p className="text-sm text-purple-300">Get personalized guidance from our motor insurance specialists</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!selectedExpert && !showBooking && (
                <div className="p-6">
                  {/* Dynamic concerns */}
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wide mb-3">What&apos;s on your mind?</h3>
                  <div className="space-y-2 mb-8">
                    {dynamicConcerns.map((concern, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedConcern(concern); setShowBooking(true); }}
                        className="w-full text-left px-4 py-3 border border-white/15 bg-white/5 rounded-xl text-sm text-white/80 hover:border-purple-400/30 hover:bg-white/10 transition-all"
                      >
                        {concern}
                      </button>
                    ))}
                  </div>

                  {/* Expert profiles */}
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wide mb-3">Our Motor Experts</h3>
                  <div className="space-y-3">
                    {MOTOR_EXPERTS.map((expert, i) => (
                      <motion.div
                        key={expert.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="border border-white/10 bg-white/5 rounded-xl p-4 hover:border-purple-400/30 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => { setSelectedExpert(expert); setShowBooking(true); }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <img src={expert.img} alt={expert.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/15" />
                          <div>
                            <p className="text-sm text-white font-medium">{expert.name}</p>
                            <p className="text-xs text-white/50">{expert.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2 text-[11px] text-white/40">
                          <span>{expert.helped}</span>
                          <span className="w-1 h-1 bg-white/30 rounded-full" />
                          <span>{expert.experience}</span>
                        </div>
                        <p className="text-sm text-white/60">{expert.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {expert.speciality.map((s, j) => (
                            <span key={j} className="text-[11px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Promise */}
                  <div className="mt-8 space-y-3">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wide">We&apos;re with you every step</h3>
                    {[
                      { icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z', title: 'Need help choosing a plan?', desc: 'We\'ll find the right coverage for your vehicle and budget' },
                      { icon: 'M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4.5h11.2a2 2 0 011.9 1.5L21 11m-18 0h18v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z', title: 'Need to file a claim?', desc: 'We\'ll guide you through the entire process step by step' },
                      { icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z', title: 'Have a question?', desc: 'Our experts are available 24/7 to answer anything' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                        <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                        <div>
                          <p className="text-sm text-white font-medium">{item.title}</p>
                          <p className="text-[11px] text-white/50">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking flow */}
              {showBooking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <button
                    onClick={() => { setShowBooking(false); setSelectedExpert(null); }}
                    className="flex items-center gap-1 text-sm text-purple-300 mb-6"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to experts
                  </button>

                  {selectedExpert && (
                    <div className="flex items-center gap-3 mb-5 p-4 bg-purple-500/10 rounded-xl border border-purple-400/20">
                      <img src={selectedExpert.img} alt={selectedExpert.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/15" />
                      <div>
                        <p className="text-[15px] text-white font-medium">{selectedExpert.name}</p>
                        <p className="text-sm text-white/50">{selectedExpert.role}</p>
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-white mb-4">Schedule a callback</h3>
                  <p className="text-sm text-white/60 mb-6">
                    {selectedConcern ? `Your question: "${selectedConcern}"` : 'An expert will call you at your preferred time.'}
                  </p>

                  <div className="space-y-4">
                    <input
                      type="tel"
                      placeholder="Your phone number"
                      className="w-full px-4 py-3 border border-white/15 bg-white/5 rounded-xl text-[15px] text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {['In 15 min', 'In 1 hour', 'Tomorrow'].map((time, i) => (
                        <button
                          key={i}
                          className="px-3 py-2.5 border border-white/15 bg-white/5 rounded-xl text-xs font-medium text-white/80 hover:border-purple-400/30 hover:bg-white/10 transition-all text-center"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <button className="w-full py-3.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-500 transition-colors">
                      Request Callback
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   Motor AI Chat Panel — Dynamic starters based on journey position
   ═══════════════════════════════════════════════════════ */

function getAIStartersForMotorModule(module: MotorModule | string): string[] {
  switch (module) {
    case 'entry':
    case 'vehicle_type':
      return [
        'What does motor insurance cover?',
        'Is third-party insurance enough for my car?',
        'How is ACKO different from other insurers?',
        'What\'s the minimum insurance I need by law?',
      ];
    case 'registration':
    case 'vehicle_fetch':
      return [
        'Why do you need my registration number?',
        'What if my car details are fetched incorrectly?',
        'Can I insure a car not registered in my name?',
        'I just bought a new car — how does this work?',
      ];
    case 'manual_entry':
      return [
        'Does my car variant affect the premium?',
        'What if I have an aftermarket CNG kit?',
        'Is commercial vehicle insurance different?',
        'How is registration year used in pricing?',
      ];
    case 'pre_quote':
      return [
        'What is NCB and how does it save me money?',
        'Can I transfer NCB from my old insurer?',
        'What happens if my policy has expired?',
        'Does claiming reduce my NCB?',
      ];
    case 'quote':
      return [
        'What is IDV? Should I go for higher IDV?',
        'Comprehensive vs Zero Dep — which is better?',
        'Why is third-party cheaper than comprehensive?',
        'What does "5,400+ network garages" mean?',
      ];
    case 'addons':
      return [
        'Is zero depreciation worth the extra cost?',
        'What does engine protection actually cover?',
        'Do I need roadside assistance?',
        'Which add-ons are essential for a new car?',
      ];
    case 'owner_details':
      return [
        'Where can I find my engine/chassis number?',
        'Why is GST number needed?',
        'Does a car loan affect my insurance?',
        'What happens if I sell my car mid-policy?',
      ];
    case 'review':
    case 'payment':
      return [
        'Is this payment secure?',
        'When does my coverage become active?',
        'Can I cancel and get a refund?',
        'Can I pay in EMIs?',
      ];
    case 'completion':
      return [
        'How do I download my policy?',
        'When will I get my policy certificate?',
        'What should I keep in my car at all times?',
        'How do I add this to Digilocker?',
      ];
    case 'dashboard':
      return [
        'How do I raise a motor claim?',
        'Where can I find the nearest network garage?',
        'Can I add or remove add-ons now?',
        'How do I renew my policy?',
      ];
    case 'claims':
      return [
        'What documents do I need for a claim?',
        'How long does claim settlement take?',
        'Cashless vs reimbursement — what\'s the difference?',
        'What if the accident wasn\'t my fault?',
      ];
    case 'edit_policy':
      return [
        'Can I add Zero Dep mid-term?',
        'How does changing add-ons affect premium?',
        'Can I update my nominee details?',
        'Can I increase my IDV now?',
      ];
    default:
      return [
        'What does comprehensive motor insurance cover?',
        'How do I file a claim with ACKO?',
        'What\'s the difference between plan types?',
        'How is my premium calculated?',
      ];
  }
}

function getMotorAIResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('idv') || q.includes('insured declared value')) {
    return 'IDV (Insured Declared Value) is the maximum amount your insurer will pay if your car is stolen or totally damaged beyond repair.\n\n**How it\'s calculated:**\n• Manufacturer\'s listed selling price minus depreciation based on age\n• A 1-year-old car: ~20% depreciation\n• A 5-year-old car: ~50% depreciation\n\n**Should you go higher?**\n• Higher IDV = higher premium but better payout\n• Lower IDV = lower premium but less coverage\n• ACKO recommends the fair market value — not too high, not too low\n\n**Pro tip:** If your car is new or recently purchased, keep IDV close to the ex-showroom price. As the car ages, let it depreciate naturally.';
  }

  if (q.includes('comprehensive') || q.includes('zero dep') || q.includes('third party') || q.includes('plan') || q.includes('difference')) {
    return 'Here\'s the honest comparison:\n\n**Third Party (mandatory by law)**\n• Covers damage you cause to others (people, property, vehicles)\n• Does NOT cover your own car damage\n• Cheapest option\n• Best for: Old cars with low market value\n\n**Comprehensive (most popular)**\n• Everything in Third Party PLUS own damage coverage\n• Covers accidents, theft, fire, natural disasters, vandalism\n• Choice of network garages (5,400+) or all garages\n• Best for: Most car owners\n\n**Zero Depreciation (best protection)**\n• Everything in Comprehensive PLUS zero deduction on parts\n• No depreciation deducted during claims — get full part value\n• Best for: New cars (under 5 years), expensive cars\n\n**Quick rule:** New car → Zero Dep. Used car → Comprehensive. Very old car → Third Party.';
  }

  if (q.includes('ncb') || q.includes('no claim bonus') || q.includes('no-claim')) {
    return 'NCB (No Claim Bonus) is a reward for not making claims.\n\n**How it works:**\n• 1 year without claim: 20% discount on OD premium\n• 2 years: 25% discount\n• 3 years: 35% discount\n• 4 years: 45% discount\n• 5+ years: 50% discount (maximum)\n\n**Important facts:**\n• NCB belongs to YOU, not the car — it transfers when you sell/change cars\n• NCB can be transferred between insurers when switching\n• Making even one claim resets your NCB to 0%\n• If your policy lapses for more than 90 days, you lose your NCB\n\n**ACKO tip:** Consider paying for small repairs out of pocket to protect your NCB. A 50% NCB on a ₹15,000 OD premium saves you ₹7,500/year — that adds up.';
  }

  if (q.includes('zero dep') || q.includes('depreciation') || q.includes('worth')) {
    return 'Zero Depreciation is one of the most valuable add-ons. Here\'s why:\n\n**Without Zero Dep (standard claim):**\nParts like rubber, plastic, glass, fiber have 30-50% depreciation deducted.\nExample: ₹50,000 bumper replacement → insurer pays only ₹25,000-35,000 → you pay the rest.\n\n**With Zero Dep:**\nNo depreciation deducted on ANY part.\nSame ₹50,000 bumper → insurer pays the full ₹50,000.\n\n**When it\'s worth it:**\n✅ Car is less than 5 years old\n✅ Luxury or expensive car\n✅ You drive frequently\n✅ You live in a high-risk area (flooding, hail)\n\n**When you can skip it:**\n⚡ Car is very old (high depreciation anyway)\n⚡ You barely drive\n⚡ Budget is very tight\n\nOn average, Zero Dep saves ₹8,000-25,000 per claim.';
  }

  if (q.includes('engine protection') || q.includes('engine protect')) {
    return 'Engine Protection covers damage to your engine that standard policies don\'t.\n\n**What it covers:**\n• Water ingression (engine hydrolocking during floods)\n• Oil leakage damage\n• Damage due to starting the car in waterlogged conditions\n\n**Why standard policies reject these:**\nInsurers typically classify water damage as "consequential" damage — your fault for driving into water. Engine protection overrides this.\n\n**Who needs it:**\n✅ If you live in a city prone to flooding (Mumbai, Chennai, Bengaluru)\n✅ If your parking is in a basement or low-lying area\n✅ If you drive during monsoons\n\n**Cost:** Usually ₹500-1,500/year — a fraction of the ₹50,000-2,00,000 engine repair bill.\n\nThis is one of ACKO\'s most recommended add-ons for monsoon-prone areas.';
  }

  if (q.includes('claim') || q.includes('file') || q.includes('accident') || q.includes('process')) {
    return 'Here\'s how motor claims work at ACKO:\n\n**Cashless claim (at network garages):**\n1. Inform ACKO within 24 hours of the incident\n2. Drive to any of 5,400+ network garages\n3. The garage sends a repair estimate to ACKO\n4. We approve it (usually within 2-4 hours)\n5. Car gets repaired — garage settles directly with us\n6. You pick up the car — zero payment\n\n**Reimbursement claim (any garage):**\n1. Inform ACKO within 24 hours\n2. Get your car repaired at any garage\n3. Upload bills and photos via the ACKO app\n4. We verify and reimburse within 5-7 working days\n\n**For theft or total loss:**\n1. File an FIR immediately\n2. Inform ACKO within 24 hours\n3. We initiate investigation\n4. Settlement based on IDV within 15-30 days\n\n**Documents needed:** Policy copy, RC, DL, photos of damage, FIR (if applicable).';
  }

  if (q.includes('add-on') || q.includes('addon') || q.includes('essential')) {
    return 'Here\'s our honest add-on guide:\n\n**Must-have add-ons:**\n• Zero Depreciation — saves ₹8K-25K per claim on part costs\n• Engine Protection — essential if you live in a flood-prone city\n• Personal Accident Cover — mandatory by law for owner-driver\n\n**Nice-to-have:**\n• Roadside Assistance — 24/7 towing, battery jumpstart, flat tire help\n• Return to Invoice — get full invoice value (not depreciated IDV) if car is stolen/totaled\n• Key Replacement — covers lost/stolen key replacement\n\n**Can usually skip:**\n• NCB Protection — only useful if you claim frequently\n• Consumables Cover — minor savings, already covered in some plans\n\n**For new cars (under 3 years):** Zero Dep + Engine Protection + Return to Invoice\n**For used cars (3-7 years):** Zero Dep + Engine Protection\n**For older cars (7+):** Basic comprehensive is usually sufficient';
  }

  if (q.includes('secure') || q.includes('payment') || q.includes('safe')) {
    return 'Your payment with ACKO is completely secure:\n\n• PCI-DSS compliant payment gateway\n• 256-bit SSL encryption\n• RBI-regulated payment partners\n• We don\'t store your card details\n\nPayment options: UPI, credit/debit card, net banking, wallets.\n\nACKO is licensed by IRDAI (Reg. No. 157). We insure 9 crore+ customers and are backed by Amazon, Accel Partners, and Multiples PE.\n\nYour policy becomes active immediately after successful payment.';
  }

  if (q.includes('cancel') || q.includes('refund')) {
    return 'ACKO has a transparent cancellation policy:\n\n**Within 15 days (Free Look Period):**\n• Full refund minus stamp duty and pro-rated risk charges\n• No questions asked\n\n**After 15 days:**\n• Pro-rated refund for the unused policy period\n• Short-rate cancellation table applies\n\n**Important:** Third-party premium is non-refundable once coverage starts (IRDAI regulation). Only the own-damage portion can be refunded pro-rata.';
  }

  if (q.includes('network garage') || q.includes('5400') || q.includes('5,400') || q.includes('garage')) {
    return 'ACKO has a network of 5,400+ partner garages across India.\n\n**Advantages of network garages:**\n• Cashless repairs — no upfront payment\n• Quality-checked mechanics\n• Genuine spare parts guaranteed\n• Faster claim approval (2-4 hours)\n• 6-month warranty on repairs\n\n**Can I go to any garage?**\nYes! You can also go to a non-network garage. The process changes to reimbursement — you pay first, we reimburse within 5-7 working days.\n\n**How to find one nearby:**\nUse the ACKO app → "Find Garage" → enter your pincode → see all network garages sorted by distance.\n\n**Comprehensive plan gives you two options:**\n• Network garages only (lower premium)\n• All garages including non-network (slightly higher premium)';
  }

  return 'Great question! ACKO motor insurance covers your vehicle against accidents, theft, fire, natural disasters, and third-party liability. We offer Comprehensive, Zero Depreciation, and Third Party plans with 5,400+ cashless garages.\n\nThe right plan depends on your car\'s age, value, and how you use it. Would you like me to explain any specific aspect in detail?';
}

export function MotorAIChatPanel() {
  const state = useMotorStore() as MotorJourneyState;
  const { showAIChat, currentModule } = state;
  const updateState = useMotorStore((s) => s.updateState);

  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [input, setInput] = useState('');

  const starters = useMemo(() => getAIStartersForMotorModule(currentModule), [currentModule]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: getMotorAIResponse(text),
      }]);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {showAIChat && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => updateState({ showAIChat: false } as Partial<MotorJourneyState>)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col shadow-2xl"
            style={{ background: 'linear-gradient(180deg, #1C0B47 0%, #2A1463 50%, #1C0B47 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden">
                  <img src={assetPath('/ai-assistant.png')} alt="AI Assistant" className="w-9 h-9 object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                  <p className="text-[11px] text-white/50">Ask anything about motor insurance</p>
                </div>
              </div>
              <button onClick={() => updateState({ showAIChat: false } as Partial<MotorJourneyState>)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div>
                  <div className="flex gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-lg shadow-purple-900/20">
                      <img src={assetPath('/ai-assistant.png')} alt="AI" className="w-8 h-8 object-cover" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-white/90">Hey there! I&apos;m your ACKO motor insurance assistant. Ask me anything — plans, coverage, claims, add-ons, or pricing. I&apos;m here to help you make the best choice for your vehicle. 🚗</p>
                    </div>
                  </div>

                  <p className="text-sm text-white/50 mb-3 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                    Based on where you are in the journey
                  </p>
                  <div className="space-y-2">
                    {starters.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s)}
                        className="w-full text-left px-4 py-3 border border-white/15 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white/80 hover:text-white transition-all backdrop-blur-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-3'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-1 shadow-lg shadow-purple-900/20">
                      <img src={assetPath('/ai-assistant.png')} alt="AI" className="w-7 h-7 object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-white text-[#1C0B47] rounded-br-md shadow-lg shadow-purple-900/10'
                      : 'bg-white/10 backdrop-blur-sm text-white/90 rounded-bl-md border border-white/10'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Expert nudge */}
            <div className="px-6 pb-2">
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <img src={assetPath('/motor-expert.png')} alt="Expert" className="w-7 h-7 rounded-full object-cover" />
                <p className="text-[11px] text-white/50 flex-1">Need to talk to a real person?</p>
                <button onClick={() => { updateState({ showAIChat: false, showExpertPanel: true } as Partial<MotorJourneyState>); }} className="text-[11px] text-purple-300 font-semibold hover:text-white transition-colors">Connect</button>
              </div>
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-white/10" style={{ background: 'rgba(30, 15, 70, 0.85)', backdropFilter: 'blur(24px)' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                  placeholder="Ask about motor insurance..."
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none"
                />
                <button
                  onClick={() => handleSend(input)}
                  className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
