/**
 * Life Insurance Translations — Index
 * Re-exports translations for all languages.
 */

import en from './en';

export { en };

// For now, use English for all languages (can add hi, hinglish, kn later)
export const lifeTranslations = {
  en,
  hi: en,
  hinglish: en,
  kn: en,
};

export function getLifeTranslation(lang: 'en' | 'hi' | 'hinglish' | 'kn' = 'en') {
  return lifeTranslations[lang];
}
