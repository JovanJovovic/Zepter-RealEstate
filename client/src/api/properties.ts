import type { PaginatedPropertiesResponse, Property, PropertyFiltersState } from '../types/property';
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

export const getFeaturedProperties = () => {
  return request<Property[]>(`${API_URL}/properties/featured`);
};

export const getPropertyByPublicId = (publicId: string) => {
  return request<Property>(`${API_URL}/properties/${publicId}`);
};

export const subscribeToNewsletter = (email: string, source = 'website') => {
  return request<{ message: string }>(`${API_URL}/newsletter/subscribe`, {
    method: 'POST',
    body: JSON.stringify({ email, source }),
  });
};
