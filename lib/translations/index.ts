'use client';

import { useJourneyStore } from '../store';
import { Language } from '../types';
import { en } from './en';
import { hi } from './hi';
import { hinglish } from './hinglish';
import { kn } from './kn';
import { ta } from './ta';
import { ml } from './ml';

export type TranslationSet = typeof en;

const translations: Record<Language, TranslationSet> = { en, hi, hinglish, kn, ta, ml };

/** Hook: returns the current translation set based on store language */
export function useT(): TranslationSet {
  const lang = useJourneyStore(s => s.language);
  return translations[lang] || en;
}

/** Pure function: get translation set by language code */
export function getT(lang: Language): TranslationSet {
  return translations[lang] || en;
}

/** Get the BCP-47 locale tag for TTS / STT */
export function getLocaleTag(lang: Language): string {
  switch (lang) {
    case 'hi':       return 'hi-IN';
    case 'hinglish': return 'hi-IN';
    case 'kn':       return 'kn-IN';
    case 'ta':       return 'ta-IN';
    case 'ml':       return 'ml-IN';
    default:         return 'en-IN';
  }
}

/** Get html lang attribute value */
export function getHtmlLang(lang: Language): string {
  switch (lang) {
    case 'hi':       return 'hi';
    case 'hinglish': return 'hi';
    case 'kn':       return 'kn';
    case 'ta':       return 'ta';
    case 'ml':       return 'ml';
    default:         return 'en';
  }
}
