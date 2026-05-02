import { useEffect, useMemo, useState } from 'react';
import { getProperties } from '../api/properties';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHero from '../components/PageHero';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters from '../components/PropertyFilters';
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
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError(err instanceof Error ? err.message : 'Properties could not be loaded.');
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
        setAllLocations(response.items.map((item: Property) => item.location.fullLocation));
      })
      .catch(() => setAllLocations([]));
  }, [mode, language]);

  const changePage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const title = mode === 'projects' ? 'Projects in Development' : 'Commercial properties';
  const text =
    mode === 'projects'
      ? 'A dedicated space for future Zepter Real Estate development projects and portfolio growth.'
      : 'Browse offices, retail spaces, warehouses, industrial locations and selected commercial assets from the Zepter portfolio.';

  return (
    <main>
      <PageHero
        compact
        eyebrow="Zepter portfolio"
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
                <span className="eyebrow">Results</span>
                <h2>{data.pagination.total} properties</h2>
              </div>
              <p>
                Page {data.pagination.page || 1} of {Math.max(data.pagination.pages, 1)}
              </p>
            </div>

            {loading && <LoadingState text="Loading properties..." />}

            {!loading && error && <EmptyState title="Unable to load properties" text={error} />}

            {!loading && !error && data.items.length === 0 && (
              <EmptyState
                title={mode === 'projects' ? 'No projects currently published' : 'No properties found'}
                text={
                  mode === 'projects'
                    ? 'This page is ready for future project-development entries from the admin panel.'
                    : 'Try removing some filters or searching by a broader location.'
                }
                actionLabel="Reset filters"
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
                  Previous
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
                  Next
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
