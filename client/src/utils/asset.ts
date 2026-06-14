export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const publicImage = (fileName: string) => {
  return `/Zepter Real Estate images/${fileName}`;
};

export const mediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};

export const resolveMediaUrl = mediaUrl;

export const getMainImage = <T extends { images?: Array<{ url: string; isMain?: boolean }> }>(item: T) => {
  const image = item.images?.find((img) => img.isMain) || item.images?.[0];
  return mediaUrl(image?.url);
};
