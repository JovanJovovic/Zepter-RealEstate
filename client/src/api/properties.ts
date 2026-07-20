import type { PaginatedPropertiesResponse, Property, PropertyFiltersState, SupportedLanguage } from '../types/property';
import { API_URL } from '../utils/asset';

const buildQuery = (params: PropertyFiltersState = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      if (value.length > 0) searchParams.set(key, value.join(','));
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Došlo je do greške pri komunikaciji sa serverom.');
  }

  return response.json();
};

export const getProperties = (params: PropertyFiltersState = {}) => {
  return request<PaginatedPropertiesResponse>(`${API_URL}/properties${buildQuery(params)}`);
};

export const getAllProperties = async (params: PropertyFiltersState = {}) => {
  const firstPage = await getProperties({ ...params, page: 1, limit: 100 });

  if (firstPage.pagination.pages <= 1) return firstPage.items;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.pagination.pages - 1 }, (_, index) =>
      getProperties({ ...params, page: index + 2, limit: 100 })
    )
  );

  return [firstPage, ...remainingPages].flatMap((response) => response.items);
};

export const getFeaturedProperties = (language?: SupportedLanguage) => {
  return request<Property[]>(`${API_URL}/properties/featured${buildQuery({ language })}`);
};

export const getPropertyByPublicId = (publicId: string, language?: SupportedLanguage) => {
  return request<Property>(`${API_URL}/properties/${publicId}${buildQuery({ language })}`);
};

export const subscribeToNewsletter = (email: string, source = 'website') => {
  return request<{ message: string }>(`${API_URL}/newsletter/subscribe`, {
    method: 'POST',
    body: JSON.stringify({ email, source }),
  });
};
