'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUserProfileStore } from '../lib/userProfileStore';

const VALID_OTP = '0000';

// Phone → user state mapping (prototype simulation)
type PostLoginState = 'policies' | 'pwilo' | 'new_user';

function detectPostLoginState(phone: string): PostLoginState {
  if (phone === '9876543211') return 'pwilo';
  if (phone === '9876543212') return 'new_user';
  return 'policies'; // 9876543210 and all others
}

export type LoginIntent = 'insure_existing' | 'insure_new' | 'continue_quote' | 'insure_another';

interface LoginChatFlowProps {
  onSuccess: (intent?: LoginIntent) => void;
  onBack?: () => void;
  hideHeader?: boolean;
}

interface MockPolicy {
  id: string;
  make: string;
  model: string;
  regNumber: string;
  planType: string;
  validTill: string;
  imageUrl: string;
}

const MOCK_POLICIES: MockPolicy[] = [
  {
    id: '1',
    make: 'Tata',
    model: 'Harrier',
    regNumber: 'KA01 AB 1234',
    planType: 'Zero depreciation plan',
    validTill: '31 Aug 2026',
    imageUrl: '/car-images/harrier.png',
  },
  {
    id: '2',
    make: 'Tata',
    model: 'Nexon',
    regNumber: 'KA01 AB 3243',
    planType: 'Comprehensive plan',
    validTill: '31 Aug 2026',
    imageUrl: '/car-images/Nexon.png',
  },
];

const MOCK_PWILO = {
  make: 'Tata',
  model: 'Harrier',
  regNumber: 'KA01 AB 1234',
  imageUrl: '/car-images/harrier.png',
};

/* ── Bot bubble ── */
function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
      className="flex mb-4"
    >
      <div
        className="max-w-[85%] backdrop-blur-sm px-4 py-3 chat-bubble-bot text-body-md"
        style={{
          background: 'var(--motor-surface, var(--app-surface))',
          border: '1px solid var(--motor-border, var(--app-border))',
          color: 'var(--motor-text, var(--app-text))',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/* ── User bubble ── */
function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.215, 0.61, 0.355, 1] }}
      className="flex justify-end mb-4"
    >
      <div
        className="max-w-[85%] px-4 py-2.5 chat-bubble-user shadow-lg text-body-md font-medium"
        style={{
          background: 'var(--app-user-bubble-bg, var(--motor-user-bubble-bg, #FFFFFF))',
          color: 'var(--app-user-bubble-text, var(--motor-user-bubble-text, #1C0B47))',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex mb-4"
    >
      <div
        className="backdrop-blur-sm px-4 py-3 chat-bubble-bot flex items-center gap-1.5"
        style={{
          background: 'var(--motor-surface, var(--app-surface))',
          border: '1px solid var(--motor-border, var(--app-border))',
        }}
      >
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '200ms' }} />
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '400ms' }} />
      </div>
    </motion.div>
  );
}

/* ── 4-digit OTP input ── */
function OtpInput({ onComplete, error }: { onComplete: (val: string) => void; error: boolean }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const refs = [ref0, ref1, ref2, ref3];

  useEffect(() => { setTimeout(() => refs[0].current?.focus(), 100); }, []);

  const handleChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 3) refs[i + 1].current?.focus();
    if (next.every(x => x !== '')) onComplete(next.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <motion.div
      className="flex gap-2 justify-center mt-2"
      animate={error ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-[60px] h-[52px] text-center text-[20px] font-semibold rounded-xl outline-none transition-all"
          style={{
            background: 'var(--motor-surface, var(--app-surface))',
            border: error ? '2px solid #ef4444' : d ? '2px solid var(--motor-cta-bg, #6D28D9)' : '1.5px solid var(--motor-border-strong, var(--app-border-strong))',
            color: 'var(--motor-text, var(--app-text))',
          }}
        />
      ))}
    </motion.div>
  );
}

/* ── Active policy card — matches Figma node 220-11026 ── */
function PolicyCard({
  policy,
  delay,
  onFileClaim,
  onDownload,
}: {
  policy: MockPolicy;
  delay: number;
  onFileClaim: () => void;
  onDownload: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
      className="relative overflow-hidden mb-3 shrink-0"
      style={{
        width: '100%',
        height: '172px',
        borderRadius: '24px',
        padding: '20px',
        background: 'var(--motor-surface, var(--app-surface))',
        boxShadow: '0 20px 20px -3px rgba(0,0,0,0.02), 0 6px 6px -2px rgba(0,0,0,0.02), 0 3.5px 3.5px -1.5px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)',
      }}
    >
      {/* Text */}
      <div className="flex flex-col gap-1" style={{ width: '204px' }}>
        <p className="text-[18px] font-semibold leading-[22px]" style={{ color: 'var(--motor-text, var(--app-text))' }}>
          {policy.make} {policy.model}
        </p>
        <p className="text-[12px] leading-[16px]" style={{ color: 'var(--motor-text-muted, var(--app-text-muted))' }}>{policy.regNumber}</p>
        <p className="text-[12px] leading-[16px]" style={{ color: 'var(--motor-text-muted, var(--app-text-muted))' }}>{policy.planType}</p>
        <p className="text-[12px] leading-[16px]" style={{ color: 'var(--motor-text-muted, var(--app-text-muted))' }}>Valid till {policy.validTill}</p>
      </div>

      {/* Car image — top right, overlapping */}
      <div className="absolute top-0 right-0 w-[105px] h-[105px] pointer-events-none">
        <Image src={policy.imageUrl} alt={`${policy.make} ${policy.model}`} width={105} height={105} className="object-contain w-full h-full" />
      </div>

      {/* Primary: File a claim */}
      <button
        onClick={onFileClaim}
        className="absolute text-[12px] font-medium leading-[16px] px-4 py-2 rounded-lg transition-all active:opacity-80"
        style={{ bottom: '20px', left: '20px', background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', boxShadow: 'var(--btn-primary-shadow)' }}
      >
        File a claim
      </button>

      {/* Secondary: Download policy */}
      <button
        onClick={onDownload}
        className="absolute text-[12px] font-medium leading-[16px] px-4 py-2 rounded-lg transition-all active:opacity-80"
        style={{ bottom: '20px', left: '126px', background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', color: 'var(--btn-secondary-text)', boxShadow: 'var(--btn-secondary-shadow)' }}
      >
        Download policy
      </button>
    </motion.div>
  );
}

/* ── PWILO (mid-quote) card ── */
function PwiloCard({ delay, onContinue }: { delay: number; onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
      className="rounded-2xl overflow-hidden mb-3"
      style={{
        background: 'var(--motor-surface, var(--app-surface))',
        border: '1px solid var(--motor-border, var(--app-border))',
      }}
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold leading-snug" style={{ color: 'var(--motor-text, var(--app-text))' }}>
            Continue insuring your<br />{MOCK_PWILO.make} {MOCK_PWILO.model}
          </p>
          <p className="text-[12px] mt-1" style={{ color: 'var(--motor-text-muted, var(--app-text-muted))' }}>
            {MOCK_PWILO.regNumber}
          </p>
        </div>
        <div className="shrink-0 w-[100px] h-[64px] flex items-center justify-center">
          <Image
            src={MOCK_PWILO.imageUrl}
            alt={`${MOCK_PWILO.make} ${MOCK_PWILO.model}`}
            width={100}
            height={64}
            className="object-contain w-full h-full"
          />
        </div>
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={onContinue}
          className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.97]"
          style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', boxShadow: 'var(--btn-primary-shadow)' }}
        >
          Continue at quote
        </button>
      </div>
    </motion.div>
  );
}

/* ── Vehicle type chips (new user) ── */
function VehicleTypeChip({
  label,
  sub,
  delay,
  onClick,
}: {
  label: string;
  sub: string;
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25, ease: 'easeOut' }}
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[0.98]"
      style={{
        background: 'var(--motor-surface, var(--app-surface))',
        border: '1.5px solid var(--motor-border, var(--app-border))',
      }}
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold" style={{ color: 'var(--motor-text, var(--app-text))' }}>
          {label}
        </span>
        <span className="text-[12px]" style={{ color: 'var(--motor-text-muted, var(--app-text-muted))' }}>
          {sub}
        </span>
      </span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--motor-text-muted, var(--app-text-muted))' }}>
        <path d="M6 3l5 5-5 5" />
      </svg>
    </motion.button>
  );
}

/* ── "Insure another car" section — bot bubble + CTA button ── */
function InsureAnotherSection({ delay, onClick }: { delay: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="mt-1 mb-2 flex flex-col gap-3"
    >
      <BotBubble>Or need insurance for another car?</BotBubble>
      <button
        onClick={onClick}
        className="w-full h-[52px] rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.97]"
        style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', boxShadow: 'var(--btn-primary-shadow)' }}
      >
        Insure another car
      </button>
    </motion.div>
  );
}

/* ── Main component ── */
export default function LoginChatFlow({ onSuccess, onBack, hideHeader }: LoginChatFlowProps) {
  const router = useRouter();
  const { setProfile } = useUserProfileStore();

  const [step, setStep] = useState<'q1' | 'q2' | 'q3' | 'post_login'>('q1');
  const [showTyping, setShowTyping] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [nameEchoed, setNameEchoed] = useState(false);
  const [phoneEchoed, setPhoneEchoed] = useState(false);
  const [otpEchoed, setOtpEchoed] = useState(false);
  const [postLoginState, setPostLoginState] = useState<PostLoginState | null>(null);
  // Cascade: 0=none, 1=welcome msg, 2=context msg, 3=cards/chips, 4=insure-another section
  const [contentStep, setContentStep] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, [step, showTyping, nameEchoed, phoneEchoed, otpEchoed, contentStep]);

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    setNameEchoed(true);
    setShowTyping(true);
    setTimeout(() => { setShowTyping(false); setStep('q2'); }, 900);
  };

  const handlePhoneSubmit = () => {
    if (phone.replace(/\D/g, '').length < 10) return;
    setPhoneEchoed(true);
    setShowTyping(true);
    setTimeout(() => { setShowTyping(false); setStep('q3'); }, 900);
  };

  const handleOtp = (val: string) => {
    if (val === VALID_OTP) {
      setOtpError(false);
      const state = detectPostLoginState(phone);
      setProfile({ firstName: name.trim(), phone: `+91${phone}`, isLoggedIn: true });
      setOtpEchoed(true);
      setPostLoginState(state);
      setShowTyping(true);

      // welcome message
      setTimeout(() => {
        setShowTyping(false);
        setStep('post_login');
        setContentStep(1);
        // context message
        setTimeout(() => {
          setShowTyping(true);
          setTimeout(() => {
            setShowTyping(false);
            setContentStep(2);
            // cards / chips
            setTimeout(() => {
              setContentStep(3);
              // insure-another section (not for new_user — they use chips)
              if (state !== 'new_user') {
                setTimeout(() => setContentStep(4), 600);
              }
            }, 350);
          }, 750);
        }, 500);
      }, 900);
    } else {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 600);
    }
  };

  const nameCanSubmit = name.trim().length > 0;
  const phoneCanSubmit = phone.replace(/\D/g, '').length === 10;

  // Welcome message varies by state
  const welcomeMsg = postLoginState === 'new_user'
    ? `Welcome to ACKO, ${name}! Great to have you here.`
    : `Welcome back, ${name}!`;

  // Context message varies by state
  const contextMsg = postLoginState === 'policies'
    ? 'I found a few policies linked to your account. What would you like to do?'
    : postLoginState === 'pwilo'
    ? 'I found an insurance quote you started earlier.'
    : 'What are you looking to insure today?';

  return (
    <div className="flex flex-col h-full">
      {/* Header — only when standalone (not embedded in motor journey) */}
      {!hideHeader && (
        <div
          className="flex items-center justify-between px-4 h-[56px] shrink-0"
          style={{ borderBottom: '1px solid var(--motor-border, var(--app-border))', background: 'var(--motor-bg, var(--app-bg))' }}
        >
          <button
            onClick={onBack || (() => router.push('/'))}
            className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={{ color: 'var(--motor-text, var(--app-text))' }}
            aria-label="Back"
          >
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 1L1 9l8 8" />
            </svg>
          </button>
          <div className="w-9" />
        </div>
      )}

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-6 pb-24" style={{ background: 'var(--app-bg)' }}>

        {/* Q1 */}
        <BotBubble>Hello! What would you like us to call you?</BotBubble>

        <AnimatePresence>
          {nameEchoed && <UserBubble>{name}</UserBubble>}
        </AnimatePresence>

        {/* Q2 */}
        <AnimatePresence>
          {(step === 'q2' || step === 'q3' || step === 'post_login') && (
            <BotBubble>Glad to have you here, {name}! Can we get your phone number?</BotBubble>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phoneEchoed && <UserBubble>+91 {phone}</UserBubble>}
        </AnimatePresence>

        {/* Q3 */}
        <AnimatePresence>
          {(step === 'q3' || step === 'post_login') && (
            <BotBubble>Please type in the OTP sent to your phone number.</BotBubble>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step === 'q3' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 mb-4"
            >
              <OtpInput onComplete={handleOtp} error={otpError} />
              {otpError ? (
                <p className="text-[12px] text-center" style={{ color: '#ef4444' }}>
                  Incorrect OTP. Try <strong>0000</strong>.
                </p>
              ) : (
                <p className="text-[12px] text-center" style={{ color: 'var(--motor-text-muted, var(--app-text-muted))' }}>
                  Enter <strong>0000</strong> to verify
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP echo — plain text, no icon */}
        <AnimatePresence>
          {otpEchoed && <UserBubble>OTP Verified</UserBubble>}
        </AnimatePresence>

        {/* Welcome message */}
        <AnimatePresence>
          {contentStep >= 1 && <BotBubble>{welcomeMsg}</BotBubble>}
        </AnimatePresence>

        {/* Context message */}
        <AnimatePresence>
          {contentStep >= 2 && <BotBubble>{contextMsg}</BotBubble>}
        </AnimatePresence>

        {/* Cards / chips depending on state */}
        <AnimatePresence>
          {contentStep >= 3 && postLoginState === 'policies' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {MOCK_POLICIES.map((policy, i) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  delay={i * 0.12}
                  onFileClaim={() => onSuccess('insure_another')}
                  onDownload={() => onSuccess('insure_another')}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {contentStep >= 3 && postLoginState === 'pwilo' && (
            <PwiloCard delay={0} onContinue={() => onSuccess('continue_quote')} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {contentStep >= 3 && postLoginState === 'new_user' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3 mb-4"
            >
              <VehicleTypeChip
                label="I have an existing car"
                sub="Renew or get a new policy"
                delay={0.05}
                onClick={() => onSuccess('insure_existing')}
              />
              <VehicleTypeChip
                label="Brand new car"
                sub="Just bought or about to buy"
                delay={0.15}
                onClick={() => onSuccess('insure_new')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Or need insurance for another car?" — inline, only for policies + pwilo */}
        <AnimatePresence>
          {contentStep >= 4 && (postLoginState === 'policies' || postLoginState === 'pwilo') && (
            <InsureAnotherSection
              delay={0}
              onClick={() => onSuccess('insure_another')}
            />
          )}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {showTyping && <TypingIndicator />}
        </AnimatePresence>

        <div className="h-2" />
      </div>

      {/* Bottom input bar — only during login steps */}
      <AnimatePresence mode="wait">
        {step === 'q1' && !nameEchoed && (
          <motion.div
            key="input-name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="shrink-0 px-4 pb-8 pt-3 space-y-2"
            style={{ borderTop: '1px solid var(--motor-border, var(--app-border))' }}
          >
            <input
              autoFocus
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && nameCanSubmit && handleNameSubmit()}
              className="w-full h-[52px] rounded-2xl px-4 text-[15px] outline-none"
              style={{
                background: 'var(--motor-surface, var(--app-surface))',
                border: '1.5px solid var(--motor-border-strong, var(--app-border-strong))',
                color: 'var(--motor-text, var(--app-text))',
              }}
            />
            <button
              onClick={handleNameSubmit}
              className="w-full h-[52px] rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.97]"
              style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', boxShadow: 'var(--btn-primary-shadow)' }}
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 'q2' && !phoneEchoed && (
          <motion.div
            key="input-phone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="shrink-0 px-4 pb-8 pt-3 space-y-2"
            style={{ borderTop: '1px solid var(--motor-border, var(--app-border))' }}
          >
            <div
              className="w-full h-[52px] rounded-2xl flex items-center overflow-hidden"
              style={{
                border: '1.5px solid var(--motor-border-strong, var(--app-border-strong))',
                background: 'var(--motor-surface, var(--app-surface))',
              }}
            >
              <span className="pl-4 pr-2 text-[15px] font-medium shrink-0" style={{ color: 'var(--motor-text-muted, var(--app-text-muted))' }}>+91</span>
              <div className="w-px h-5 shrink-0" style={{ background: 'var(--motor-border-strong, var(--app-border-strong))' }} />
              <input
                autoFocus
                type="tel"
                inputMode="numeric"
                placeholder="Enter your phone number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={e => e.key === 'Enter' && phoneCanSubmit && handlePhoneSubmit()}
                className="flex-1 h-full px-3 text-[15px] outline-none bg-transparent"
                style={{ color: 'var(--motor-text, var(--app-text))' }}
              />
            </div>
            <button
              onClick={handlePhoneSubmit}
              className="w-full h-[52px] rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.97]"
              style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', boxShadow: 'var(--btn-primary-shadow)' }}
            >
              Continue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
