import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { getAllProperties } from '../api/properties';
import EmptyState from '../components/EmptyState';
import ListingPropertyCard from '../components/ListingPropertyCard';
import LoadingState from '../components/LoadingState';
import PropertyFilters from '../components/PropertyFilters';
import type { PublicPropertyFiltersState } from '../components/PropertyFilters';
import { getCopy } from '../data/localization';
import type { Property, SupportedLanguage } from '../types/property';
import { getAvailableArea } from '../utils/propertyArea';
import {
  buildPropertyLocationOptions,
  getPropertyCountry,
  normalizeLocationFilterValue,
} from '../utils/propertyLocation';

const PropertiesMap = lazy(() => import('../components/PropertiesMap'));

interface PropertiesPageProps {
  navigate: (path: string) => void;
  mode?: 'commercial' | 'projects';
  language: SupportedLanguage;
}

const createInitialFilters = (): PublicPropertyFiltersState => ({
  country: '',
  city: '',
  types: [],
  minAvailableArea: '',
  maxAvailableArea: '',
});

const PropertiesPage = ({ navigate, mode = 'commercial', language }: PropertiesPageProps) => {
  const scopeKey = `${mode}-${language}`;
  const initialFilters = createInitialFilters();
  const [filterState, setFilterState] = useState({ scopeKey, filters: initialFilters });
  const [propertyState, setPropertyState] = useState<{
    scopeKey: string;
    properties: Property[];
    error: string;
    loading: boolean;
  }>({ scopeKey, properties: [], error: '', loading: true });
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const copy = getCopy(language);
  const filters = filterState.scopeKey === scopeKey ? filterState.filters : initialFilters;
  const currentPropertyState =
    propertyState.scopeKey === scopeKey
      ? propertyState
      : { scopeKey, properties: [], error: '', loading: true };
  const { properties, error, loading } = currentPropertyState;

  const applyFilters = (nextFilters: PublicPropertyFiltersState) => {
    setFilterState({ scopeKey, filters: nextFilters });
  };

  useEffect(() => {
    let mounted = true;

    getAllProperties({
      category: mode === 'projects' ? 'project-development' : 'commercial',
      language,
    })
      .then((items) => {
        if (mounted) {
          setPropertyState({ scopeKey, properties: items, error: '', loading: false });
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setPropertyState({
          scopeKey,
          properties: [],
          error: err instanceof Error ? err.message : copy.properties.notLoaded,
          loading: false,
        });
      });

    return () => {
      mounted = false;
    };
  }, [copy.properties.notLoaded, language, mode, scopeKey]);

  const locationOptions = useMemo(
    () => buildPropertyLocationOptions(properties, language),
    [language, properties]
  );

  const filteredProperties = useMemo(() => {
    const minimumArea = filters.minAvailableArea === '' ? 0 : Number(filters.minAvailableArea);
    const maximumArea = filters.maxAvailableArea === '' ? Number.POSITIVE_INFINITY : Number(filters.maxAvailableArea);
    const hasAreaRestriction = filters.minAvailableArea !== '' || filters.maxAvailableArea !== '';

    return properties.filter((property) => {
      const country = getPropertyCountry(property, language);
      const city = normalizeLocationFilterValue(property.location.city);
      const matchesCountry = !filters.country || country?.key === filters.country;
      const matchesCity = !filters.city || city === filters.city;
      const matchesType = filters.types.length === 0 || property.types.some((type) => filters.types.includes(type));
      const availableArea = getAvailableArea(property);
      const matchesArea =
        !hasAreaRestriction ||
        (typeof availableArea === 'number' && availableArea >= minimumArea && availableArea <= maximumArea);

      return matchesCountry && matchesCity && matchesType && matchesArea;
    });
  }, [filters, language, properties]);

  const visibleActivePropertyId =
    activePropertyId && filteredProperties.some((property) => property._id === activePropertyId)
      ? activePropertyId
      : null;

  const activateProperty = (propertyId: string, revealCard = false) => {
    setActivePropertyId(propertyId);

    if (revealCard) {
      window.requestAnimationFrame(() => {
        cardRefs.current.get(propertyId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  };

  const title = mode === 'projects' ? copy.properties.projectsTitle : copy.properties.commercialTitle;
  const text = mode === 'projects' ? copy.properties.projectsText : copy.properties.commercialText;

  return (
    <main className="properties-search-page">
      <section className="properties-search-shell">
        <div className="properties-search-heading">
          <div>
            <span className="eyebrow">{copy.properties.portfolioEyebrow}</span>
            <h1>{title}</h1>
          </div>
          <p>{text}</p>
        </div>

        <PropertyFilters
          key={`${scopeKey}-${JSON.stringify(filters)}`}
          initialFilters={filters}
          locationOptions={locationOptions}
          mode={mode}
          language={language}
          onApply={applyFilters}
          onReset={() => applyFilters(initialFilters)}
        />

        <div className="properties-search-workspace">
          <div className="properties-map-column">
            <Suspense fallback={<div className="properties-map properties-map--loading" />}>
              <PropertiesMap
                properties={filteredProperties}
                activePropertyId={visibleActivePropertyId}
                language={language}
                navigate={navigate}
                onActivate={activateProperty}
              />
            </Suspense>
          </div>

          <div className="properties-results-column">
            <div className="properties-results-toolbar">
              <div>
                <span className="eyebrow">{copy.properties.results}</span>
                <h2>{copy.properties.propertiesCount}: {filteredProperties.length}</h2>
              </div>
              <p>{copy.properties.mapListHint}</p>
            </div>

            {loading && <LoadingState text={copy.properties.loading} />}

            {!loading && error && <EmptyState title={copy.properties.unableTitle} text={error} />}

            {!loading && !error && filteredProperties.length === 0 && (
              <EmptyState
                title={mode === 'projects' ? copy.properties.noProjects : copy.properties.noProperties}
                text={mode === 'projects' ? copy.properties.noProjectsText : copy.properties.noPropertiesText}
                actionLabel={copy.properties.resetFilters}
                onAction={() => applyFilters(initialFilters)}
              />
            )}

            {!loading && !error && filteredProperties.length > 0 && (
              <div className="listing-property-grid">
                {filteredProperties.map((property) => (
                  <ListingPropertyCard
                    key={property._id}
                    property={property}
                    active={visibleActivePropertyId === property._id}
                    navigate={navigate}
                    language={language}
                    onActivate={activateProperty}
                    onDeactivate={() => setActivePropertyId(null)}
                    cardRef={(element) => {
                      if (element) cardRefs.current.set(property._id, element);
                      else cardRefs.current.delete(property._id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PropertiesPage;
