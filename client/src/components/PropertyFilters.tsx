import { FormEvent, useMemo, useState } from 'react';
import type { PropertyFiltersState } from '../types/property';
import {
  conditionOptions,
  propertyTypeOptions,
  roomOptions,
  sizeOptions,
  specialRequirementOptions,
} from '../data/propertyOptions';

interface PropertyFiltersProps {
  initialFilters: PropertyFiltersState;
  locations: string[];
  onApply: (filters: PropertyFiltersState) => void;
  onReset: () => void;
  mode?: 'commercial' | 'projects';
}

const PropertyFilters = ({ initialFilters, locations, onApply, onReset, mode = 'commercial' }: PropertyFiltersProps) => {
  const [filters, setFilters] = useState<PropertyFiltersState>(initialFilters);

  const locationOptions = useMemo(() => {
    const unique = Array.from(new Set(locations.filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [locations]);

  const setValue = (key: keyof PropertyFiltersState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
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

  const handleSizeChange = (value: string) => {
    const option = sizeOptions.find((item) => item.label === value);

    setFilters((current) => ({
      ...current,
      minSize: option?.min || '',
      maxSize: option?.max || '',
      page: 1,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply(filters);
  };

  const selectedSize = sizeOptions.find((item) => item.min === filters.minSize && item.max === filters.maxSize)?.label || '';

  return (
    <aside className="filters-panel">
      <form onSubmit={handleSubmit}>
        <div className="filters-panel__heading">
          <span className="eyebrow">Refine search</span>
          <h2>{mode === 'projects' ? 'Project filters' : 'Commercial filters'}</h2>
        </div>

        <div className="field-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            value={filters.search || ''}
            placeholder="Title, location, description..."
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
            <label htmlFor="location">Location</label>
            <select id="location" value={filters.location || ''} onChange={(event) => setValue('location', event.target.value)}>
              <option value="">All locations</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="size">Size</label>
            <select id="size" value={selectedSize} onChange={(event) => handleSizeChange(event.target.value)}>
              <option value="">Any size</option>
              {sizeOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="condition">Condition</label>
            <select id="condition" value={filters.condition || ''} onChange={(event) => setValue('condition', event.target.value)}>
              <option value="">Any condition</option>
              {conditionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="rooms">Rooms</label>
            <select id="rooms" value={filters.rooms || ''} onChange={(event) => setValue('rooms', event.target.value)}>
              <option value="">Any number</option>
              {roomOptions.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="requirements-group">
          <label>Special requirements</label>
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
            Submit
          </button>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => {
              setFilters(initialFilters);
              onReset();
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </aside>
  );
};

export default PropertyFilters;
