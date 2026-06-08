import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { PropertyFiltersState } from '../types/property';
import {
  getConditionOptions,
  getPublicSpecialRequirementOptions,
  getPropertyTypeOptions,
  roomOptions,
} from '../data/propertyOptions';
import type { SupportedLanguage } from '../types/property';
import { getCopy } from '../data/localization';

interface PropertyFiltersProps {
  initialFilters: PropertyFiltersState;
  locations: LocationFilterOption[];
  onApply: (filters: PropertyFiltersState) => void;
  onReset: () => void;
  mode?: 'commercial' | 'projects';
  language: SupportedLanguage;
}

export interface LocationFilterOption {
  key: string;
  label: string;
  city: string;
  municipality: string;
}

const PropertyFilters = ({ initialFilters, locations, onApply, onReset, mode = 'commercial', language }: PropertyFiltersProps) => {
  const [filters, setFilters] = useState<PropertyFiltersState>(initialFilters);
  const propertyTypeOptions = getPropertyTypeOptions(language);
  const conditionOptions = getConditionOptions(language);
  const specialRequirementOptions = getPublicSpecialRequirementOptions(language);
  const copy = getCopy(language);

  const locationOptions = useMemo(() => {
    return [...locations].sort((a, b) => a.label.localeCompare(b.label));
  }, [locations]);

  const selectedLocationKey =
    filters.city && filters.municipality
      ? `${filters.city.trim().toLowerCase()}|${filters.municipality.trim().toLowerCase()}`
      : '';

  const setValue = (key: keyof PropertyFiltersState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };

  const setLocation = (locationKey: string) => {
    const selectedLocation = locationOptions.find((option) => option.key === locationKey);

    setFilters((current) => ({
      ...current,
      city: selectedLocation?.city || undefined,
      municipality: selectedLocation?.municipality || undefined,
      location: undefined,
      page: 1,
    }));
  };

  const setPositiveNumberValue = (key: 'minAvailableArea' | 'maxAvailableArea', value: string) => {
    if (value && !/^\d*\.?\d*$/.test(value)) return;
    setValue(key, value);
  };

  const toggleRequirement = (value: string) => {
    setFilters((current) => {
      const currentValues = current.specialRequirement || [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return { ...current, specialRequirement: nextValues, page: 1 };
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply(filters);
  };

  return (
    <aside className="filters-panel">
      <form onSubmit={handleSubmit}>
        <div className="filters-panel__heading">
          <span className="eyebrow">{copy.filters.refine}</span>
          <h2>{mode === 'projects' ? copy.filters.projectFilters : copy.filters.commercialFilters}</h2>
        </div>

        <div className="field-group">
          <label htmlFor="search">{copy.filters.search}</label>
          <input
            id="search"
            type="text"
            value={filters.search || ''}
            placeholder={copy.filters.searchPlaceholder}
            onChange={(event) => setValue('search', event.target.value)}
          />
        </div>

        {mode === 'commercial' && (
          <div className="filter-chips">
            {propertyTypeOptions.slice(0, 6).map((option) => (
              <button
                key={option.value}
                type="button"
                className={filters.type === option.value ? 'filter-chip filter-chip--active' : 'filter-chip'}
                onClick={() => setValue('type', filters.type === option.value ? '' : option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <div className="field-grid">
          <div className="field-group">
            <label htmlFor="location">{copy.filters.location}</label>
            <select id="location" value={selectedLocationKey} onChange={(event) => setLocation(event.target.value)}>
              <option value="">{copy.filters.allLocations}</option>
              {locationOptions.map((location) => (
                <option key={location.key} value={location.key}>
                  {location.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>{copy.filters.availableArea}</label>
            <div className="area-range-fields">
              <label>
                <span>{copy.filters.from}</span>
                <div className="area-range-input">
                  <input
                    aria-label={`${copy.filters.availableArea} ${copy.filters.from}`}
                    inputMode="decimal"
                    min="0"
                    type="number"
                    value={filters.minAvailableArea || ''}
                    placeholder={copy.filters.from}
                    onChange={(event) => setPositiveNumberValue('minAvailableArea', event.target.value)}
                  />
                  <small>{copy.filters.sqm}</small>
                </div>
              </label>
              <label>
                <span>{copy.filters.to}</span>
                <div className="area-range-input">
                  <input
                    aria-label={`${copy.filters.availableArea} ${copy.filters.to}`}
                    inputMode="decimal"
                    min="0"
                    type="number"
                    value={filters.maxAvailableArea || ''}
                    placeholder={copy.filters.to}
                    onChange={(event) => setPositiveNumberValue('maxAvailableArea', event.target.value)}
                  />
                  <small>{copy.filters.sqm}</small>
                </div>
              </label>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="condition">{copy.filters.condition}</label>
            <select id="condition" value={filters.condition || ''} onChange={(event) => setValue('condition', event.target.value)}>
              <option value="">{copy.filters.anyCondition}</option>
              {conditionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="rooms">{copy.filters.rooms}</label>
            <select id="rooms" value={filters.rooms || ''} onChange={(event) => setValue('rooms', event.target.value)}>
              <option value="">{copy.filters.anyNumber}</option>
              {roomOptions.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="requirements-group">
          <label>{copy.filters.specialRequirements}</label>
          <div className="requirements-grid">
            {specialRequirementOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  filters.specialRequirement?.includes(option.value)
                    ? 'requirement-toggle requirement-toggle--active'
                    : 'requirement-toggle'
                }
                onClick={() => toggleRequirement(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn btn--primary" type="submit">
            {copy.filters.submit}
          </button>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => {
              setFilters(initialFilters);
              onReset();
            }}
          >
            {copy.filters.reset}
          </button>
        </div>
      </form>
    </aside>
  );
};

export default PropertyFilters;
