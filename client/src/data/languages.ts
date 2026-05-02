import type { SupportedLanguage } from '../types/property';

export const defaultLanguage: SupportedLanguage = 'en';

export const languageOptions: Array<{ value: SupportedLanguage; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'sr', label: 'Serbian' },
  { value: 'ru', label: 'Russian' },
  { value: 'de', label: 'German' },
];

export const normalizeLanguage = (value: string | null): SupportedLanguage => {
  return languageOptions.some((option) => option.value === value) ? (value as SupportedLanguage) : defaultLanguage;
};
