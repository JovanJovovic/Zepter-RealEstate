import type { Property, SupportedLanguage } from '../types/property';

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value);
};

export const formatAreaValue = (value: number, language: SupportedLanguage) => {
  return `${value.toLocaleString(language === 'sr' ? 'sr-RS' : 'en-US', {
    maximumFractionDigits: 2,
  })} m²`;
};

export const getOccupancyPercentage = (property: Property) => {
  return isFiniteNumber(property.occupancyPercentage) ? property.occupancyPercentage : 0;
};

export const getAvailableArea = (property: Property) => {
  if (isFiniteNumber(property.availableArea)) {
    return property.availableArea;
  }

  if (!isFiniteNumber(property.sizeSqm)) {
    return undefined;
  }

  const availableArea = (property.sizeSqm * (100 - getOccupancyPercentage(property))) / 100;

  return Math.round(availableArea * 100) / 100;
};

export const getTotalAreaLabel = (
  property: Property,
  fallback: string,
  language: SupportedLanguage
) => {
  return property.sizeLabel || (isFiniteNumber(property.sizeSqm) ? formatAreaValue(property.sizeSqm, language) : fallback);
};

export const getAvailableAreaLabel = (
  property: Property,
  fallback: string,
  language: SupportedLanguage
) => {
  const availableArea = getAvailableArea(property);

  return isFiniteNumber(availableArea) ? formatAreaValue(availableArea, language) : fallback;
};
