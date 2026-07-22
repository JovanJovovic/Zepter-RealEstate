import type { ArticleType } from '../types/article';
import type { SupportedLanguage } from '../types/property';
import { mediaUrl, publicImage } from './asset';

const PUBLIC_IMAGE_FOLDER = 'Zepter Real Estate images';
const IMAGE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|svg|webp)$/i;

const normalizePublicImagePath = (value: string) => {
  const normalized = value.replace(/\\/g, '/').replace(/%20/g, ' ');
  const lowerNormalized = normalized.toLowerCase();
  const folderIndex = lowerNormalized.indexOf(`${PUBLIC_IMAGE_FOLDER.toLowerCase()}/`);

  if (folderIndex === -1) return '';

  const fileName = normalized
    .slice(folderIndex + PUBLIC_IMAGE_FOLDER.length + 1)
    .replace(/^\/+/, '');

  return fileName ? encodeURI(publicImage(fileName)) : '';
};

export const getArticleFallbackImage = (type?: ArticleType) => (
  type === 'news'
    ? encodeURI(publicImage('who we are Zepter-Real Estate.jpg'))
    : encodeURI(publicImage('portfolio Zepter Real Estate.jpg'))
);

export const articleImageUrl = (url?: string | null, fallback = '') => {
  const value = String(url || '').trim();
  if (!value) return fallback;

  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  const publicPath = normalizePublicImagePath(value);
  if (publicPath) return publicPath;

  const normalized = value.replace(/\\/g, '/');

  if (normalized.startsWith('/uploads/') || normalized.startsWith('uploads/')) {
    return mediaUrl(normalized.startsWith('/') ? normalized : `/${normalized}`);
  }

  if (IMAGE_EXTENSION_PATTERN.test(normalized) && !normalized.includes('/')) {
    return encodeURI(publicImage(normalized));
  }

  return normalized.startsWith('/') ? encodeURI(normalized) : fallback;
};

export const applyArticleImageFallback = (
  image: HTMLImageElement,
  fallback = getArticleFallbackImage()
) => {
  if (image.dataset.fallbackApplied === 'true') return;

  image.dataset.fallbackApplied = 'true';
  image.src = fallback;

  const parentLink = image.closest('a');
  if (parentLink instanceof HTMLAnchorElement) {
    parentLink.href = fallback;
  }
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
