import type { Property, PropertyTransactionType } from '../types/property';

export const getPropertyListingType = (property: Property): PropertyTransactionType => {
  return property.transactionType === 'sale' ? 'sale' : 'rent';
};
