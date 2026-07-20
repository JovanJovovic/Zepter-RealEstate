import type { Property, SupportedLanguage } from '../types/property';

export interface PropertyCountryOption {
  key: string;
  label: string;
}

export interface PropertyCityOption {
  key: string;
  label: string;
  countryKey: string;
}

export interface PropertyLocationOptions {
  countries: PropertyCountryOption[];
  cities: PropertyCityOption[];
}

const SERBIAN_CITY_NAMES = new Set([
  'beograd',
  'belgrade',
  'novi sad',
  'nis',
  'niš',
  'kragujevac',
  'subotica',
  'zrenjanin',
  'pancevo',
  'pančevo',
  'cacak',
  'čačak',
  'kraljevo',
  'smederevo',
  'valjevo',
  'uzice',
  'užice',
]);

const normalizeKey = (value?: string) => value?.trim().replace(/\s+/g, ' ').toLocaleLowerCase() || '';

const serbiaLabel = (language: SupportedLanguage) => (language === 'sr' ? 'Srbija' : 'Serbia');

const isSerbianCoordinate = (property: Property) => {
  const latitude = property.location.latitude;
  const longitude = property.location.longitude;

  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    latitude >= 41.8 &&
    latitude <= 46.2 &&
    longitude >= 18.7 &&
    longitude <= 23.1
  );
};

export const getPropertyCountry = (
  property: Property,
  language: SupportedLanguage
): PropertyCountryOption | null => {
  const explicitCountry = property.location.country?.trim();
  const locationText = `${property.location.fullLocation || ''} ${property.location.address || ''}`;
  const isSerbia =
    /\b(srbija|serbia)\b/i.test(explicitCountry || '') ||
    /\b(srbija|serbia)\b/i.test(locationText) ||
    SERBIAN_CITY_NAMES.has(normalizeKey(property.location.city)) ||
    isSerbianCoordinate(property);

  if (isSerbia) {
    return { key: 'serbia', label: serbiaLabel(language) };
  }

  if (!explicitCountry) return null;

  return {
    key: normalizeKey(explicitCountry),
    label: explicitCountry,
  };
};

export const buildPropertyLocationOptions = (
  properties: Property[],
  language: SupportedLanguage
): PropertyLocationOptions => {
  const countries = new Map<string, PropertyCountryOption>();
  const cities = new Map<string, PropertyCityOption>();

  properties.forEach((property) => {
    const country = getPropertyCountry(property, language);
    const city = property.location.city?.trim().replace(/\s+/g, ' ');

    if (!country) return;

    countries.set(country.key, country);

    if (city) {
      const cityKey = normalizeKey(city);
      cities.set(`${country.key}|${cityKey}`, {
        key: cityKey,
        label: city,
        countryKey: country.key,
      });
    }
  });

  return {
    countries: Array.from(countries.values()).sort((a, b) => a.label.localeCompare(b.label)),
    cities: Array.from(cities.values()).sort((a, b) => a.label.localeCompare(b.label)),
  };
};

export const normalizeLocationFilterValue = normalizeKey;
