import { useEffect, useMemo, useState } from 'react';
import { getProperties } from '../api/properties';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHero from '../components/PageHero';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters from '../components/PropertyFilters';
import type { LocationFilterOption } from '../components/PropertyFilters';
import { getCopy } from '../data/localization';
import type { PaginatedPropertiesResponse, Property, PropertyFiltersState, SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface PropertiesPageProps {
  navigate: (path: string) => void;
  mode?: 'commercial' | 'projects';
  language: SupportedLanguage;
}

const defaultResponse: PaginatedPropertiesResponse = {
  items: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 9,
    pages: 0,
  },
};

const normalizeLocationPart = (value?: string) => value?.trim().replace(/\s+/g, ' ') || '';

const getLocationKey = (city: string, municipality: string) => {
  return `${city.trim().toLowerCase()}|${municipality.trim().toLowerCase()}`;
};

const buildLocationOptions = (properties: Property[]): LocationFilterOption[] => {
  const options = new Map<string, LocationFilterOption>();

  properties.forEach((property) => {
    const city = normalizeLocationPart(property.location.city);
    const municipality = normalizeLocationPart(property.location.municipality);

    if (!city || !municipality) return;

    const key = getLocationKey(city, municipality);

    if (!options.has(key)) {
      options.set(key, {
        key,
        label: `${city}, ${municipality}`,
        city,
        municipality,
      });
    }
  });

  return Array.from(options.values()).sort((a, b) => a.label.localeCompare(b.label));
};

const PropertiesPage = ({ navigate, mode = 'commercial', language }: PropertiesPageProps) => {
  const initialFilters: PropertyFiltersState = useMemo(
    () => ({
      category: mode === 'projects' ? 'project-development' : 'commercial',
      language,
      page: 1,
      limit: 9,
    }),
    [mode, language]
  );

  const [filters, setFilters] = useState<PropertyFiltersState>(initialFilters);
  const [data, setData] = useState<PaginatedPropertiesResponse>(defaultResponse);
  const [allLocations, setAllLocations] = useState<LocationFilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const copy = getCopy(language);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    getProperties(filters)
      .then((response) => {
        if (!mounted) return;
        setData(response);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : copy.properties.notLoaded);
        setData(defaultResponse);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [filters]);

  useEffect(() => {
    getProperties({ category: mode === 'projects' ? 'project-development' : 'commercial', language, limit: 100 })
      .then((response) => {
        setAllLocations(buildLocationOptions(response.items));
      })
      .catch(() => setAllLocations([]));
  }, [mode, language]);

  const changePage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const title = mode === 'projects' ? copy.properties.projectsTitle : copy.properties.commercialTitle;
  const text =
    mode === 'projects'
      ? copy.properties.projectsText
      : copy.properties.commercialText;

  return (
    <main>
      <PageHero
        compact
        eyebrow={copy.properties.portfolioEyebrow}
        title={title}
        text={text}
        image={mode === 'projects' ? publicImage('what we do Zepter Real Estate.jpg') : publicImage('portfolio Zepter Real Estate.jpg')}
      />

      <section className="section properties-layout-section">
        <div className="container properties-layout">
          <PropertyFilters
            initialFilters={initialFilters}
            locations={allLocations}
            mode={mode}
            language={language}
            onApply={(nextFilters) => setFilters({ ...nextFilters, category: initialFilters.category, page: 1, limit: 9 })}
            onReset={() => setFilters(initialFilters)}
          />

          <div className="properties-content">
            <div className="properties-toolbar">
              <div>
                <span className="eyebrow">{copy.properties.results}</span>
                <h2>{copy.properties.propertiesCount}: {data.pagination.total}</h2>
              </div>
              <p>
                {copy.properties.page} {data.pagination.page || 1} {copy.properties.of} {Math.max(data.pagination.pages, 1)}
              </p>
            </div>

            {loading && <LoadingState text={copy.properties.loading} />}

            {!loading && error && <EmptyState title={copy.properties.unableTitle} text={error} />}

            {!loading && !error && data.items.length === 0 && (
              <EmptyState
                title={mode === 'projects' ? copy.properties.noProjects : copy.properties.noProperties}
                text={
                  mode === 'projects'
                    ? copy.properties.noProjectsText
                    : copy.properties.noPropertiesText
                }
                actionLabel={copy.properties.resetFilters}
                onAction={() => setFilters(initialFilters)}
              />
            )}

            {!loading && !error && data.items.length > 0 && (
              <div className="property-grid">
                {data.items.map((property) => (
                  <PropertyCard key={property._id} property={property} navigate={navigate} language={language} />
                ))}
              </div>
            )}

            {!loading && data.pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn--ghost"
                  disabled={data.pagination.page <= 1}
                  onClick={() => changePage(data.pagination.page - 1)}
                >
                  {copy.properties.previous}
                </button>
                <div className="pagination__numbers">
                  {Array.from({ length: data.pagination.pages }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        className={page === data.pagination.page ? 'pagination__number pagination__number--active' : 'pagination__number'}
                        onClick={() => changePage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="btn btn--ghost"
                  disabled={data.pagination.page >= data.pagination.pages}
                  onClick={() => changePage(data.pagination.page + 1)}
                >
                  {copy.properties.next}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PropertiesPage;
