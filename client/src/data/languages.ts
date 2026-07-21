import type { SupportedLanguage } from '../types/property';

export const publicDefaultLanguage: SupportedLanguage = 'en';
export const adminDefaultLanguage: SupportedLanguage = 'sr';
export const defaultLanguage = publicDefaultLanguage;

export const languageOptions: Array<{ value: SupportedLanguage; label: string }> = [
  { value: 'sr', label: 'Serbian' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Russian' },
  { value: 'de', label: 'German' },
];

export const normalizeLanguage = (value: string | null, fallback: SupportedLanguage = publicDefaultLanguage): SupportedLanguage => {
  return languageOptions.some((option) => option.value === value) ? (value as SupportedLanguage) : fallback;
};
