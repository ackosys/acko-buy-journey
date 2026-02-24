/* ═══════════════════════════════════════════════════
   Malayalam (മലയാളം) Translations
   ═══════════════════════════════════════════════════ */

import { en } from './en';
type T = typeof en;

export const ml: T = {
  ...en,

  langSelect: {
    ...en.langSelect,
    title: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക',
    subtitle: 'നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും മാറ്റാം',
  },

  common: {
    continue: 'തുടരുക',
    cancel: 'റദ്ദാക്കുക',
    confirm: 'സ്ഥിരീകരിക്കുക',
    back: 'തിരിച്ച്',
    skip: 'ഒഴിവാക്കുക',
    yes: 'അതെ',
    no: 'ഇല്ല',
    done: 'പൂർത്തിയായി',
    edit: 'തിരുത്തുക',
    save: 'സേവ് ചെയ്യുക',
    tapToSkip: 'ഒഴിവാക്കാൻ ടാപ്പ് ചെയ്യുക',
    processing: 'പ്രോസസ്സ് ചെയ്യുന്നു...',
    securedBy: 'Razorpay വഴി സുരക്ഷിതം',
    monthly: 'പ്രതിമാസം',
    yearly: 'വാർഷിക',
    perMonth: '/മാസം',
    perYear: '/വർഷം',
    recommended: 'ശുപാർശ ചെയ്തത്',
    or: 'അല്ലെങ്കിൽ',
  },

  welcome: {
    line1: 'പുതിയ',
    line2: 'ACKO ആരോഗ്യ അനുഭവത്തിലേക്ക് സ്വാഗതം',
    subtitle: 'അത്ഭുതപ്പെടാൻ തയ്യാറാകൂ!',
  },

  global: {
    welcomeBack: (name: string) => `തിരിച്ചു വരവേൽക്കുന്നു, ${name}`,
    heroTitle: 'നിങ്ങളുടെ എല്ലാ ഇൻഷുറൻസും\nഒരിടത്ത്',
    heroSubtitle: 'ഒരു ജാർഗണും ഇല്ല • ഇടനിലക്കാർ ഇല്ല • ശരിയായ കവറേജ് മാത്രം.',
    heroTitleUser: 'ഇന്ന് നിങ്ങൾ എന്ത്\nസംരക്ഷിക്കാൻ ആഗ്രഹിക്കുന്നു?',

    carLabel: 'കാർ',
    carSubtitle: 'ഉടൻ പോളിസി നേടുക',
    carBadge: 'സീരോ കമ്മീഷൻ',
    healthLabel: 'ആരോഗ്യം',
    healthSubtitle: '100% ബിൽ കവറേജ്',
    healthBadge: '0% GST ആനുകൂല്യം',
    bikeLabel: 'ബൈക്ക്/സ്കൂട്ടർ',
    bikeSubtitle: '1 മിനിറ്റിൽ ഇൻഷുർ ചെയ്യുക',
    lifeLabel: 'ജീവൻ',
    lifeSubtitle: 'ഫ്ലെക്സിബിൾ കവറേജ്',
    travelLabel: 'ട്രാവൽ',
    travelSubtitle: 'ഉടൻ വരുന്നു',
    comingSoon: 'ഉടൻ വരുന്നു',

    whyAcko: 'ACKO എന്തുകൊണ്ട്?',
    whyAckoSub: 'ശരിക്കും മനസ്സിലാകുന്ന ഇൻഷുറൻസ്.',
    prop1Title: 'ഇന്ത്യയിലെ #1*',
    prop1Desc: 'ഇന്ത്യയിലെ #1* ഇൻഷുറൻസ് ആപ്പ്.',
    prop2Title: '100% ഡിജിറ്റൽ',
    prop2Desc: 'വാങ്ങുക, ക്ലെയിം ചെയ്യുക, നിർവ്വഹിക്കുക — എല്ലാം ഓൺലൈനിൽ.',
    prop3Title: 'വേഗത്തിലുള്ള ക്ലെയിം',
    prop3Desc: '95% ക്യാഷ്‌ലെസ് ക്ലെയിമുകൾ 1 മണിക്കൂറിൽ അനുവദിക്കപ്പെടുന്നു.',

    irdai: 'IRDAI ലൈസൻസ്ഡ്',
    irdaiSub: 'Reg. No. 157',
    customers: '1 കോടി+',
    customersSub: 'ഉപഭോക്താക്കൾ',
    claimsStat: '97%',
    claimsStatSub: 'ക്ലെയിമുകൾ തീർത്തു',
    hospitals: '14,000+',
    hospitalsSub: 'ക്യാഷ്‌ലെസ് ആശുപത്രികൾ',
    appRating: '4.5★',
    appRatingSub: 'ആപ്പ് റേറ്റിംഗ്',
    support: '24/7',
    supportSub: 'പിന്തുണ',

    needHelp: 'തിരഞ്ഞെടുക്കാൻ സഹായം വേണോ?',
    talkExpert: 'ഒരു ഇൻഷുറൻസ് വിദഗ്ദ്ധനോട് സംസാരിക്കുക',
    poweredBy: 'ACKO പ്രവർത്തിപ്പിക്കുന്നു • IRDAI ലൈസൻസ്ഡ്',

    menuLanguage: 'ഭാഷ',
    menuProfile: 'പ്രൊഫൈൽ മാറ്റുക',
    menuClose: 'അടയ്ക്കുക',
    menuGuest: 'അതിഥി',
    menuGuestSub: 'പുതിയ സെഷൻ',
    menuUser1: 'രാഹുൽ ശ.',
    menuUser1Sub: 'ACKO യുടെ നിലവിലുള്ള ഉപഭോക്താവ്',
    menuUser2: 'പ്രിയ മ.',
    menuUser2Sub: 'പുതിയ ഉപയോക്താവ് · ആരോഗ്യം പര്യവേക്ഷണം',
    menuUser3: 'അർജുൻ ന.',
    menuUser3Sub: 'നിലവിലുള്ള ഉപഭോക്താവ് · ബൈക്ക് + കാർ',
  },
};
