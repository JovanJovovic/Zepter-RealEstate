import type {
  AdminPropertiesQuery,
  AdminPropertyPayload,
  CurrentAdminResponse,
  LoginResponse,
  NewsletterFiltersState,
  PaginatedNewsletterResponse,
  PaginatedPropertiesResponse,
  UploadFileResponse,
} from '../types/admin';
import type { Property } from '../types/property';
import { API_URL } from '../utils/asset';

const ADMIN_TOKEN_KEY = 'zre_admin_token';

const getStoredToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const storeAdminToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

const buildQuery = (params: Record<string, unknown> = {}) => {
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

const adminRequest = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);

  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Došlo je do greške pri komunikaciji sa serverom.');
  }

  return response.json();
};

export const loginAdmin = async (email: string, password: string) => {
  const response = await adminRequest<LoginResponse>(`${API_URL}/admin/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.token) storeAdminToken(response.token);

  return response;
};

export const logoutAdmin = async () => {
  try {
    await adminRequest<{ message: string }>(`${API_URL}/admin/auth/logout`, { method: 'POST' });
  } finally {
    clearAdminToken();
  }
};

export const getCurrentAdmin = () => {
  return adminRequest<CurrentAdminResponse>(`${API_URL}/admin/auth/me`);
};

export const getAdminProperties = (params: AdminPropertiesQuery = {}) => {
  return adminRequest<PaginatedPropertiesResponse>(`${API_URL}/admin/properties${buildQuery(params)}`);
};

export const getAdminPropertyById = (id: string) => {
  return adminRequest<Property>(`${API_URL}/admin/properties/${id}`);
};

export const createAdminProperty = (payload: AdminPropertyPayload) => {
  return adminRequest<Property>(`${API_URL}/admin/properties`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateAdminProperty = (id: string, payload: Partial<AdminPropertyPayload>) => {
  return adminRequest<Property>(`${API_URL}/admin/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteAdminProperty = (id: string) => {
  return adminRequest<{ message: string }>(`${API_URL}/admin/properties/${id}`, {
    method: 'DELETE',
  });
};

export const uploadAdminFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return adminRequest<UploadFileResponse>(`${API_URL}/admin/upload/single`, {
    method: 'POST',
    body: formData,
  });
};

export const getNewsletterSubscribers = (params: NewsletterFiltersState = {}) => {
  return adminRequest<PaginatedNewsletterResponse>(`${API_URL}/admin/newsletter${buildQuery(params)}`);
};

export const unsubscribeNewsletterSubscriber = (id: string) => {
  return adminRequest<{ message: string }>(`${API_URL}/admin/newsletter/${id}/unsubscribe`, {
    method: 'PATCH',
  });
};

export const deleteNewsletterSubscriber = (id: string) => {
  return adminRequest<{ message: string }>(`${API_URL}/admin/newsletter/${id}`, {
    method: 'DELETE',
  });
};
