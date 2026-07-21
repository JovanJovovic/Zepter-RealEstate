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
export type PropertyOfferStatus = 'new' | 'reviewed' | 'contacted' | 'accepted' | 'rejected';

export interface PropertyOfferFile {
  originalName: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface PropertyOffer {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  propertyType: string;
  city: string;
  municipality?: string | null;
  address?: string | null;
  fullLocation?: string | null;
  area?: number | null;
  proposedPrice?: number | null;
  currency: string;
  description?: string | null;
  images: PropertyOfferFile[];
  floorPlans: PropertyOfferFile[];
  documents: PropertyOfferFile[];
  status: PropertyOfferStatus;
  internalNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantInquiry {
  _id: string;
  question: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  inquiryType?: 'assistant-widget' | 'property-contact-form' | 'contact-page-form';
  sourcePage?: string | null;
  pageTitle?: string | null;
  propertyId?: string | null;
  propertyPublicId?: string | null;
  propertySlug?: string | null;
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

export interface PaginatedPropertyOffersResponse {
  items: PropertyOffer[];
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

export interface PropertyOfferFiltersState {
  search?: string;
  status?: '' | PropertyOfferStatus;
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
