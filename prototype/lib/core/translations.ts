'use client';

import { Language } from './types';

/**
 * Generic translation engine.
 * LOBs register their own translation sets; the engine provides hooks and helpers.
 */

/** Get the BCP-47 locale tag for TTS / STT */
export function getLocaleTag(lang: Language): string {
  switch (lang) {
    case 'hi': return 'hi-IN';
    case 'hinglish': return 'hi-IN';
    case 'kn': return 'kn-IN';
    default: return 'en-IN';
  }
}

/** Get html lang attribute value */
export function getHtmlLang(lang: Language): string {
  switch (lang) {
    case 'hi': return 'hi';
    case 'hinglish': return 'hi';
    case 'kn': return 'kn';
    default: return 'en';
  }
}

/**
 * Factory: create useT and getT hooks for a given translation map.
 * Usage:
 *   const { useT, getT } = createTranslationHooks(translations, languageSelector, fallback);
 */
export function createTranslationHooks<T>(
  translationMap: Record<Language, T>,
  useLanguage: () => Language,
  fallback: T,
) {
  function useT(): T {
    const lang = useLanguage();
    return translationMap[lang] || fallback;
  }

  function getT(lang: Language): T {
    return translationMap[lang] || fallback;
  }

  return { useT, getT };
}
