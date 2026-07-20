import type { Property } from '../types/property';

export type PropertyListingType = 'rent' | 'sale' | 'available';

const RENT_VALUES = new Set([
  'rent',
  'rental',
  'lease',
  'leasing',
  'for-rent',
  'for-lease',
  'izdavanje',
  'zakup',
  'najam',
]);

const SALE_VALUES = new Set([
  'sale',
  'sell',
  'for-sale',
  'prodaja',
  'na-prodaju',
]);

const normalizeValue = (value?: string) => value?.trim().toLocaleLowerCase().replace(/[\s_]+/g, '-') || '';

const resolveExplicitListingType = (property: Property): PropertyListingType | null => {
  const values = [property.listingType, property.transactionType, property.offerType, property.purpose]
    .map(normalizeValue)
    .filter(Boolean);

  if (values.some((value) => RENT_VALUES.has(value))) return 'rent';
  if (values.some((value) => SALE_VALUES.has(value))) return 'sale';

  return null;
};

export const getPropertyListingType = (property: Property): PropertyListingType => {
  const explicitType = resolveExplicitListingType(property);
  if (explicitType) return explicitType;

  const listingText = [property.shortDescription, property.fullDescription, property.aboutProperty]
    .filter(Boolean)
    .join(' ');

  if (/\b(rent|rental|lease|leasing|zakup|zakupa|zakupce|izdavanje|izdaje|najam)\b/i.test(listingText)) {
    return 'rent';
  }

  if (/\b(for sale|available for sale|offered for sale|na prodaju|prodaja nekretnine|prodaje se)\b/i.test(listingText)) {
    return 'sale';
  }

  // The existing commercial portfolio is lease-led and predates a transaction field.
  if (property.category === 'commercial') return 'rent';

  return 'available';
};
