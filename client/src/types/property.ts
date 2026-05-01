export type PropertyCategory = 'commercial' | 'private' | 'project-development';

export type PropertyType =
  | 'houses'
  | 'retails'
  | 'offices'
  | 'warehouses'
  | 'industrial'
  | 'agricultural'
  | 'apartments'
  | 'land'
  | 'other';

export type PropertyCondition =
  | 'available'
  | 'ongoing-reconstruction'
  | 'major-refitting'
  | 'minor-refitting'
  | 'in-construction'
  | 'not-specified';

export type PropertyStatus = 'draft' | 'published' | 'archived';

export interface PropertyImage {
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  isMain?: boolean;
  order?: number;
}

export interface FloorPlan {
  title?: string;
  fileUrl: string;
  imageUrl?: string;
  order?: number;
}

export interface PropertyLocation {
  city?: string;
  municipality?: string;
  fullLocation: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface Property {
  _id: string;
  title: string;
  slug: string;
  publicId: string;
  category: PropertyCategory;
  types: PropertyType[];
  location: PropertyLocation;
  sizeSqm?: number;
  sizeLabel?: string;
  condition: PropertyCondition;
  rooms?: string;
  floorLabel?: string;
  floors?: string[];
  shortDescription?: string;
  fullDescription?: string;
  aboutProperty?: string;
  specialRequirements: string[];
  images: PropertyImage[];
  floorPlans: FloorPlan[];
  videoUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  isFeatured: boolean;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedPropertiesResponse {
  items: Property[];
  pagination: Pagination;
}

export interface PropertyFiltersState {
  category?: PropertyCategory;
  type?: string;
  location?: string;
  condition?: string;
  rooms?: string;
  minSize?: string;
  maxSize?: string;
  specialRequirement?: string[];
  search?: string;
  featured?: string;
  page?: number;
  limit?: number;
}
