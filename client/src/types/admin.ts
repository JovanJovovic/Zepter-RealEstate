import type { PaginatedPropertiesResponse, Property, PropertyFiltersState } from './property';

export type AdminRole = 'super-admin' | 'admin' | 'editor';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface LoginResponse {
  admin: AdminUser;
  token: string;
}

export interface CurrentAdminResponse {
  admin: AdminUser;
}

export interface UploadFileResponse {
  file: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  };
}

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  isActive: boolean;
  source?: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssistantInquiryStatus = 'new' | 'in-progress' | 'answered' | 'archived';

export interface AssistantInquiry {
  _id: string;
  question: string;
  email?: string | null;
  phone?: string | null;
  sourcePage?: string | null;
  pageTitle?: string | null;
  propertyId?: string | null;
  propertyName?: string | null;
  status: AssistantInquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNewsletterResponse {
  items: NewsletterSubscriber[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PaginatedAssistantInquiriesResponse {
  items: AssistantInquiry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface NewsletterFiltersState {
  search?: string;
  status?: '' | 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface AssistantInquiryFiltersState {
  search?: string;
  status?: '' | AssistantInquiryStatus;
  page?: number;
  limit?: number;
}

export type AdminPropertyPayload = Omit<Property, '_id' | 'createdAt' | 'updatedAt'>;

export type AdminPropertiesQuery = PropertyFiltersState & {
  status?: '' | 'draft' | 'published' | 'archived';
};

export type AdminMessage = {
  type: 'success' | 'error';
  text: string;
};

export type { PaginatedPropertiesResponse };
