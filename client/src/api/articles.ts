import type { ArticleType, PublicArticle, PublicArticlesResponse } from '../types/article';
import type { SupportedLanguage } from '../types/property';
import { API_URL } from '../utils/asset';

const request = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Content could not be loaded.');
  }

  return response.json();
};

export const getPublicArticles = (type: ArticleType, language: SupportedLanguage, limit = 24) => {
  const params = new URLSearchParams({ language, limit: String(limit) });
  return request<PublicArticlesResponse>(`${API_URL}/${type}?${params.toString()}`);
};

export const getPublicArticle = (type: ArticleType, slug: string, language: SupportedLanguage) => {
  const params = new URLSearchParams({ language });
  return request<PublicArticle>(`${API_URL}/${type}/${encodeURIComponent(slug)}?${params.toString()}`);
};
