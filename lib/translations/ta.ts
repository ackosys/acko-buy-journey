/* ═══════════════════════════════════════════════════
   Tamil (தமிழ்) Translations
   ═══════════════════════════════════════════════════ */

import { en } from './en';
type T = typeof en;

export const ta: T = {
  ...en,

  langSelect: {
    ...en.langSelect,
    title: 'உங்கள் மொழியை தேர்ந்தெடுக்கவும்',
    subtitle: 'நீங்கள் எப்போது வேண்டுமானாலும் மாற்றலாம்',
  },

  common: {
    continue: 'தொடர்க',
    cancel: 'ரத்து செய்',
    confirm: 'உறுதிப்படுத்து',
    back: 'பின்னால்',
    skip: 'தவிர்',
    yes: 'ஆம்',
    no: 'இல்லை',
    done: 'முடிந்தது',
    edit: 'திருத்து',
    save: 'சேமி',
    tapToSkip: 'தவிர்க்க தட்டவும்',
    processing: 'செயல்படுகிறது...',
    securedBy: 'Razorpay மூலம் பாதுகாக்கப்பட்டது',
    monthly: 'மாதாந்திர',
    yearly: 'வருடாந்திர',
    perMonth: '/மாதம்',
    perYear: '/ஆண்டு',
    recommended: 'பரிந்துரைக்கப்பட்டது',
    or: 'அல்லது',
  },

  welcome: {
    line1: 'புதிய',
    line2: 'ACKO சுகாதார அனுபவத்திற்கு வரவேற்கிறோம்',
    subtitle: 'உங்கள் மனதை வியக்கவைக்க தயாராகுங்கள்!',
  },

  global: {
    welcomeBack: (name: string) => `மீண்டும் வரவேற்கிறோம், ${name}`,
    heroTitle: 'உங்கள் அனைத்து காப்பீடும்\nஒரே இடத்தில்',
    heroSubtitle: 'எந்த சொல்வழக்கும் இல்லை • தரகர்கள் இல்லை • சரியான கவரேஜ் மட்டும்.',
    heroTitleUser: 'இன்று நீங்கள் எதை\nபாதுகாக்க விரும்புகிறீர்கள்?',

    carLabel: 'கார்',
    carSubtitle: 'உடனடியாக பாலிசி பெறுங்கள்',
    carBadge: 'சீரோ கமிஷன்',
    healthLabel: 'சுகாதாரம்',
    healthSubtitle: '100% பில் கவரேஜ்',
    healthBadge: '0% GST சலுகை',
    bikeLabel: 'பைக்/ஸ்கூட்டர்',
    bikeSubtitle: '1 நிமிடத்தில் காப்பீடு',
    lifeLabel: 'ஜீவன்',
    lifeSubtitle: 'நெகிழ்வான கவரேஜ்',
    travelLabel: 'பயணம்',
    travelSubtitle: 'விரைவில் வருகிறது',
    comingSoon: 'விரைவில் வருகிறது',

    whyAcko: 'ACKO ஏன்?',
    whyAckoSub: 'உண்மையில் புரியும் காப்பீடு.',
    prop1Title: 'இந்தியாவின் #1*',
    prop1Desc: 'இந்தியாவின் #1* காப்பீட்டு ஆப்.',
    prop2Title: '100% டிஜிட்டல்',
    prop2Desc: 'வாங்கு, கோரு, நிர்வகி — அனைத்தும் ஆன்லைனில்.',
    prop3Title: 'வேகமான கோரல்',
    prop3Desc: '95% கேஷ்லெஸ் கோரல்கள் 1 மணி நேரத்தில் அனுமதிக்கப்படுகின்றன.',

    irdai: 'IRDAI உரிமம்',
    irdaiSub: 'Reg. No. 157',
    customers: '1 கோடி+',
    customersSub: 'வாடிக்கையாளர்கள்',
    claimsStat: '97%',
    claimsStatSub: 'கோரல்கள் தீர்க்கப்பட்டன',
    hospitals: '14,000+',
    hospitalsSub: 'கேஷ்லெஸ் மருத்துவமனைகள்',
    appRating: '4.5★',
    appRatingSub: 'ஆப் மதிப்பீடு',
    support: '24/7',
    supportSub: 'ஆதரவு',

    needHelp: 'தேர்வு செய்ய உதவி வேண்டுமா?',
    talkExpert: 'காப்பீட்டு நிபுணரிடம் பேசுங்கள்',
    poweredBy: 'ACKO ஆல் இயக்கப்படுகிறது • IRDAI உரிமம்',

    menuLanguage: 'மொழி',
    menuProfile: 'சுயவிவரம் மாற்று',
    menuClose: 'மூடு',
    menuGuest: 'விருந்தினர்',
    menuGuestSub: 'புதிய அமர்வு',
    menuUser1: 'ரஹுல் ஷ.',
    menuUser1Sub: 'ACKO இன் தற்போதைய வாடிக்கையாளர்',
    menuUser2: 'பிரியா ம.',
    menuUser2Sub: 'புதிய பயனர் · சுகாதாரம் ஆராய்கிறார்',
    menuUser3: 'அர்ஜுன் ந.',
    menuUser3Sub: 'தற்போதைய வாடிக்கையாளர் · பைக் + கார்',
  },
};
