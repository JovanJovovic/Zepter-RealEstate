import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { getCopy } from '../data/localization';
import { getPropertyTypeOptions } from '../data/propertyOptions';
import type { SupportedLanguage } from '../types/property';
import type { PropertyLocationOptions } from '../utils/propertyLocation';

export interface PublicPropertyFiltersState {
  country: string;
  city: string;
  types: string[];
  minAvailableArea: string;
  maxAvailableArea: string;
}

interface PropertyFiltersProps {
  initialFilters: PublicPropertyFiltersState;
  locationOptions: PropertyLocationOptions;
  onApply: (filters: PublicPropertyFiltersState) => void;
  onReset: () => void;
  mode?: 'commercial' | 'projects';
  language: SupportedLanguage;
}

const PUBLIC_PROPERTY_TYPES = ['retails', 'offices', 'warehouses', 'industrial', 'land', 'apartments'];

const PropertyFilters = ({
  initialFilters,
  locationOptions,
  onApply,
  onReset,
  mode = 'commercial',
  language,
}: PropertyFiltersProps) => {
  const [filters, setFilters] = useState<PublicPropertyFiltersState>(initialFilters);
  const copy = getCopy(language);
  const allPropertyTypeOptions = getPropertyTypeOptions(language);
  const propertyTypeOptions = PUBLIC_PROPERTY_TYPES.flatMap((value) => {
    const option = allPropertyTypeOptions.find((candidate) => candidate.value === value);
    return option ? [option] : [];
  });

  const cityOptions = useMemo(() => {
    if (!filters.country) return locationOptions.cities;
    return locationOptions.cities.filter((city) => city.countryKey === filters.country);
  }, [filters.country, locationOptions.cities]);

  const setValue = (key: keyof PublicPropertyFiltersState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const setCountry = (country: string) => {
    setFilters((current) => {
      const keepCity =
        !country ||
        locationOptions.cities.some((city) => city.key === current.city && city.countryKey === country);

      return {
        ...current,
        country,
        city: keepCity ? current.city : '',
      };
    });
  };

  const toggleType = (value: string) => {
    setFilters((current) => ({
      ...current,
      types: current.types.includes(value)
        ? current.types.filter((type) => type !== value)
        : [...current.types, value],
    }));
  };

  const setPositiveNumberValue = (key: 'minAvailableArea' | 'maxAvailableArea', value: string) => {
    if (value && !/^\d*\.?\d*$/.test(value)) return;
    setValue(key, value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply(filters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    onReset();
  };

  return (
    <div className="property-search-filters">
      <form onSubmit={handleSubmit}>
        <div className="property-search-filters__locations">
          <div className="property-search-field">
            <label htmlFor="property-country">{copy.filters.country}</label>
            <select
              id="property-country"
              value={filters.country}
              onChange={(event) => setCountry(event.target.value)}
            >
              <option value="">{copy.filters.allCountries}</option>
              {locationOptions.countries.map((country) => (
                <option key={country.key} value={country.key}>{country.label}</option>
              ))}
            </select>
          </div>

          <div className="property-search-field">
            <label htmlFor="property-city">{copy.filters.city}</label>
            <select
              id="property-city"
              value={filters.city}
              onChange={(event) => setValue('city', event.target.value)}
              disabled={cityOptions.length === 0}
            >
              <option value="">{copy.filters.allCities}</option>
              {cityOptions.map((city) => (
                <option key={`${city.countryKey}-${city.key}`} value={city.key}>{city.label}</option>
              ))}
            </select>
          </div>
        </div>

        {mode === 'commercial' && (
          <div className="property-search-filters__types">
            <span className="property-search-filters__label">{copy.filters.propertyType}</span>
            <div className="property-search-filter-chips">
              {propertyTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={filters.types.includes(option.value) ? 'property-filter-chip property-filter-chip--active' : 'property-filter-chip'}
                  aria-pressed={filters.types.includes(option.value)}
                  onClick={() => toggleType(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="property-search-filters__area">
          <span className="property-search-filters__label">{copy.filters.availableArea}</span>
          <div className="property-area-range">
            <label>
              <span>{copy.filters.from}</span>
              <span className="property-area-input">
                <input
                  aria-label={`${copy.filters.availableArea} ${copy.filters.from}`}
                  inputMode="decimal"
                  min="0"
                  type="number"
                  value={filters.minAvailableArea}
                  placeholder="0"
                  onChange={(event) => setPositiveNumberValue('minAvailableArea', event.target.value)}
                />
                <small>{copy.filters.sqm}</small>
              </span>
            </label>
            <label>
              <span>{copy.filters.to}</span>
              <span className="property-area-input">
                <input
                  aria-label={`${copy.filters.availableArea} ${copy.filters.to}`}
                  inputMode="decimal"
                  min="0"
                  type="number"
                  value={filters.maxAvailableArea}
                  placeholder="-"
                  onChange={(event) => setPositiveNumberValue('maxAvailableArea', event.target.value)}
                />
                <small>{copy.filters.sqm}</small>
              </span>
            </label>
          </div>
        </div>

        <div className="property-search-filters__actions">
          <button className="btn btn--primary" type="submit">{copy.filters.submit}</button>
          <button className="btn btn--ghost" type="button" onClick={resetFilters}>{copy.filters.reset}</button>
        </div>
      </form>
    </div>
  );
};

export default PropertyFilters;
