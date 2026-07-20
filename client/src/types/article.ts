export type ArticleType = 'blog' | 'news';
export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface PublicArticle {
  _id: string;
  type: ArticleType;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  galleryImages: string[];
  category?: string;
  author?: string;
  publishedAt?: string;
  featured: boolean;
  videoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminArticle {
  _id: string;
  type: ArticleType;
  titleSr: string;
  titleEn: string;
  slug: string;
  excerptSr: string;
  excerptEn: string;
  contentSr: string;
  contentEn: string;
  coverImage?: string;
  galleryImages: string[];
  category?: string;
  author?: string;
  publishedAt?: string;
  status: ArticleStatus;
  featured: boolean;
  videoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export type ArticlePayload = Omit<AdminArticle, '_id' | 'createdAt' | 'updatedAt'>;

export interface ArticlePagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PublicArticlesResponse {
  items: PublicArticle[];
  pagination: ArticlePagination;
}

export interface AdminArticlesResponse {
  items: AdminArticle[];
  pagination: ArticlePagination;
}

export interface AdminArticleFilters {
  search?: string;
  type?: '' | ArticleType;
  status?: '' | ArticleStatus;
  page?: number;
  limit?: number;
}
