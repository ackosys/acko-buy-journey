'use client';

import { motion } from 'framer-motion';
import AckoLogo from './AckoLogo';
import { useT } from '../lib/translations';

interface LandingPageProps {
  onGetStarted: () => void;
  onChat: () => void;
  onCall: () => void;
  isExistingUser?: boolean;
}

/* ── Custom SVG Icons ── */
const ShieldIcon = () => (
  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HospitalIcon = () => (
  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const QuoteIcon = () => (
  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
  </svg>
);

const hospitals = [
  { name: 'AIIMS', logo: '/hospitals/aiims.png' },
  { name: 'Fortis', logo: '/hospitals/fortis.png' },
  { name: 'Manipal', logo: '/hospitals/manipal.png' },
  { name: 'Max healthcare', logo: '/hospitals/max.png' },
  { name: 'PGIMER', logo: '/hospitals/pgimer.png' },
  { name: 'Apollo', logo: '/hospitals/apollo.png' },
  { name: 'Lilavati', logo: '/hospitals/lilavati.png' },
  { name: 'NIMHANS', logo: '/hospitals/nimhans.png' },
];

const TESTIMONIALS = [
  {
    name: 'Vishal Kumar',
    source: 'Google Maps',
    time: '9 months ago',
    text: 'I am highly satisfied with Acko health insurance. I had claimed for reimbursement and in a day I got the payment in my account! That too without any deduction! I highly recommend their health insurance.',
    photo: 'https://i.pravatar.cc/80?img=11',
  },
  {
    name: 'Abhishek Sharma',
    source: 'Google Maps',
    time: '7 months ago',
    text: 'I am a Premium Health Insurance customer. Underwent a surgery at Kauvery on 17.12. The entire claim process and cashless settlement took less than 60 minutes. You guys have really cracked the system. Kudos!',
    photo: 'https://i.pravatar.cc/80?img=12',
  },
  {
    name: 'Rakesh Suvarna',
    source: 'Google Maps',
    time: '5 months ago',
    text: 'I have been using ACKO Platinum Unlimited Plan for the past 1.5 yrs. Have made 2 Claims, never had any issue. Claim Approved within 2 hours. Hassle free. No Room rent limit or any other deductible.',
    photo: 'https://i.pravatar.cc/80?img=14',
  },
];

const USP_ICONS = [
  'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21',
  'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
  'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
];

const CLAIM_STATS_ICONS = [
  'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
  'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
];

export default function LandingPage({ onGetStarted, onChat, onCall, isExistingUser }: LandingPageProps) {
  const t = useT();
  const USP_ITEMS = [
    { title: t.landing.uspTitle1, subtitle: t.landing.uspSub1, icon: USP_ICONS[0] },
    { title: t.landing.uspTitle3, subtitle: t.landing.uspSub3, icon: USP_ICONS[1] },
    { title: t.landing.uspTitle4, subtitle: t.landing.uspSub4, icon: USP_ICONS[2] },
    { title: 'No agents in between', subtitle: "You buy directly from us, so there's no hidden commission.", icon: USP_ICONS[3] },
  ];
  const CLAIM_STATS = [
    { stat: t.landing.claimStat2, text: t.landing.claimStat2Sub, icon: CLAIM_STATS_ICONS[0] },
    { stat: '9.5/10', text: 'Round-the-clock help, rated by customers', icon: CLAIM_STATS_ICONS[1] },
    { stat: t.landing.claimStat3, text: t.landing.claimStat3Sub, icon: CLAIM_STATS_ICONS[2] },
  ];
  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(180deg, #1C0B47 0%, #2A1463 40%, #1C0B47 100%)' }}>
      {/* Top bar with chat/call */}
      <div className="sticky top-0 z-20 border-b border-white/10" style={{ background: 'rgba(28, 11, 71, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <AckoLogo variant="white" className="h-6" />
          <div className="flex items-center gap-2">
            <button
              onClick={onChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-label-md text-white/80 hover:bg-white/10 rounded-lg transition-colors font-medium"
            >
              <ChatIcon />
              {t.landing.chat}
            </button>
            <button
              onClick={onCall}
              className="flex items-center gap-1.5 px-3 py-1.5 text-label-md text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors font-medium"
            >
              <PhoneIcon />
              {t.landing.talkToExpert}
            </button>
          </div>
        </div>
      </div>

      {/* ACKO customer discount banner */}
      {isExistingUser && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border-b border-amber-400/20">
          <div className="max-w-lg mx-auto px-5 py-3.5 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.25 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-amber-300 font-semibold">{t.landing.loyaltyBanner}</p>
              <p className="text-body-sm text-amber-300/70">{t.landing.loyaltyBannerSub}</p>
            </div>
            <div className="bg-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">-10%</div>
          </div>
        </motion.div>
      )}

      {/* Hero */}
      <div className="gradient-purple px-6 pt-12 pb-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-[-20%] right-[-15%] w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] rounded-full bg-purple-400/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          <div className="inline-block bg-white/15 text-white text-label-sm px-3 py-1.5 rounded-full mb-5">
            {t.landing.topRated}
          </div>

          <h1 className="text-heading-xl text-white mb-3 max-w-md mx-auto leading-tight">
            {t.landing.heroTitle}
          </h1>

          <p className="text-body-md text-purple-200 mb-4 max-w-sm mx-auto">
            {t.landing.heroSubtitle}
          </p>
        </motion.div>
      </div>

      {/* Visual hero image */}
      <div className="px-6 -mt-6 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ background: 'linear-gradient(180deg, #3B1A7E 0%, #2A1263 60%, #1C0B47 100%)' }}>
            <div className="flex justify-center pt-4">
              <img
                src="/indian-family.svg"
                alt="Indian family health"
                className="w-[85%] h-auto max-h-56 object-contain object-bottom"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C0B47]/80 via-transparent to-transparent flex items-end p-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[33, 57, 68].map(n => (
                    <img key={n} src={`https://i.pravatar.cc/40?img=${n}`} alt="" className="w-8 h-8 rounded-full border-2 border-white" />
                  ))}
                </div>
                <p className="text-white text-sm font-medium">{t.landing.familyTrust}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why ACKO — USP cards */}
      <div className="px-6 pt-8 pb-2">
        <div className="max-w-lg mx-auto">
          <div className="bg-white/6 border border-white/10 rounded-2xl p-5 space-y-0 backdrop-blur-sm">
            {USP_ITEMS.map((item, i) => (
              <div key={i} className={`flex items-start gap-3 py-4 ${i < USP_ITEMS.length - 1 ? 'border-b border-white/10' : ''}`}>
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-body-md text-white font-semibold">{item.title}</p>
                  <p className="text-body-sm text-white/50 mt-0.5">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claims stats */}
      <div className="px-6 py-8">
        <div className="max-w-lg mx-auto">
          <p className="text-body-sm text-white/50 mb-4">{t.landing.claimsHeading}</p>
          <div className="bg-white/6 border border-white/10 rounded-2xl p-5 space-y-0 backdrop-blur-sm">
            {CLAIM_STATS.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-3.5 ${i < CLAIM_STATS.length - 1 ? 'border-b border-white/10' : ''}`}>
                <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <p className="text-body-sm text-white/70">
                  <span className="text-purple-300 font-bold">{item.stat}</span>{' '}{item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Section — Brand Ambassador */}
      <div className="px-6 pb-8">
        <div className="max-w-lg mx-auto">
          <h2 className="text-heading-md text-white mb-1">{t.landing.seeHowItWorks}</h2>
          <p className="text-body-sm text-white/50 mb-4">{t.landing.walkthrough}</p>
          <div className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer group">
            <img
              src="/brand-ambassador.png"
              alt="ACKO Brand Ambassador"
              className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute top-3 right-3">
              <img src="https://acko-brand.ackoassets.com/brand/vector-svg/gradient/gradient-horizontal.svg" alt="ACKO" className="h-6" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">{t.landing.watchClaims}</span>
              <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded">1:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Testimonials */}
      <div className="px-6 pb-8">
        <div className="max-w-lg mx-auto">
          <h2 className="text-heading-md text-white mb-1">{t.landing.claimsExperience}</h2>
          <p className="text-body-sm text-white/50 mb-5">{t.landing.testimonialHeading}</p>

          <div className="space-y-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-white/6 border border-white/10 rounded-2xl p-5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/15">
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-label-md text-white font-semibold">{t.name}</p>
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4"/>
                        <circle cx="12" cy="9" r="2.5" fill="white"/>
                      </svg>
                      <span className="text-caption text-white/40">{t.source}</span>
                    </div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-body-sm text-white/70 leading-relaxed">{t.text}</p>
                <p className="text-caption text-white/40 mt-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {t.time}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Hospital partners — 3x3 grid matching Figma */}
      <div className="px-6 pb-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-heading-md text-white mb-1">{t.landing.hospitalPartners}</h2>
          <p className="text-body-sm text-white/50 mb-5">{t.landing.hospitalPartnersSub}</p>
          <div className="grid grid-cols-4 gap-3">
            {hospitals.slice(0, 7).map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-black/8 rounded-xl text-center min-h-[80px] relative overflow-hidden"
                style={{ boxShadow: 'inset 1px 1px 2px 0px white, inset -1px -1px 2px 0px rgba(0,0,0,0.04), 0px 2px 4px -1px rgba(0,0,0,0.02), 0px 6px 6px -2px rgba(0,0,0,0.02)' }}
              >
                <img
                  src={h.logo}
                  alt={h.name}
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xs text-gray-900 text-center leading-tight">{h.name}</span>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-center justify-center p-3 bg-white border border-black/8 rounded-xl text-center min-h-[80px] relative overflow-hidden"
              style={{ boxShadow: 'inset 1px 1px 2px 0px white, inset -1px -1px 2px 0px rgba(0,0,0,0.04), 0px 2px 4px -1px rgba(0,0,0,0.02), 0px 6px 6px -2px rgba(0,0,0,0.02)' }}
            >
              <span className="text-lg font-semibold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>{t.landing.cashlessCount}</span>
              <span className="text-[10px] text-gray-900 leading-tight text-center">{t.landing.cashlessHospitals}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom CTA — simplified */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 px-6 py-4 z-10" style={{ background: 'rgba(28, 11, 71, 0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={onGetStarted}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-label-lg font-semibold transition-colors active:scale-[0.97]"
          >
            {t.landing.getStarted}
          </button>
        </div>
      </div>
    </div>
  );
}
