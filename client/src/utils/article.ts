import type { SupportedLanguage } from '../types/property';
import { mediaUrl } from './asset';

export const articleImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('/Zepter Real Estate images/')) return url;
  return mediaUrl(url);
};

export const formatArticleDate = (date: string | undefined, language: SupportedLanguage) => {
  if (!date) return '';
  return new Intl.DateTimeFormat(language === 'sr' ? 'sr-RS' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

export const toYouTubeEmbedUrl = (url?: string) => {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
};
