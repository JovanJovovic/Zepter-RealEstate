import { useEffect, useMemo, useState } from 'react';
import {
  deleteAdminProperty,
  getAdminProperties,
  updateAdminProperty,
} from '../../api/admin';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { categoryLabels, conditionOptions } from '../../data/propertyOptions';
import type { AdminMessage, AdminPropertiesQuery, PaginatedPropertiesResponse } from '../../types/admin';
import type { PropertyStatus, SupportedLanguage } from '../../types/property';
import { getMainImage } from '../../utils/asset';

interface AdminPropertiesPageProps {
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const defaultResponse: PaginatedPropertiesResponse = {
  items: [],
  pagination: { total: 0, page: 1, limit: 10, pages: 0 },
};

const statusOptions: Array<{ value: '' | PropertyStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const AdminPropertiesPage = ({ navigate, language }: AdminPropertiesPageProps) => {
  const [filters, setFilters] = useState<AdminPropertiesQuery>({ page: 1, limit: 10, language });
  const [data, setData] = useState(defaultResponse);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AdminMessage | null>(null);

  const loadProperties = () => {
    setLoading(true);
    setMessage(null);

    getAdminProperties({ ...filters, language })
      .then(setData)
      .catch((err) => {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Nekretnine nisu učitane.' });
        setData(defaultResponse);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, language]);

  const counts = useMemo(() => {
    return {
      published: data.items.filter((property) => property.status === 'published').length,
      draft: data.items.filter((property) => property.status === 'draft').length,
      archived: data.items.filter((property) => property.status === 'archived').length,
    };
  }, [data.items]);

  const updateFilter = (key: keyof AdminPropertiesQuery, value: string) => {
    setFilters((current) => ({ ...current, [key]: value || undefined, page: 1 }));
  };

  const changePage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeStatus = async (id: string, status: PropertyStatus) => {
    try {
      await updateAdminProperty(id, { status });
      setMessage({ type: 'success', text: 'Status nekretnine je ažuriran.' });
      loadProperties();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Status nije promenjen.' });
    }
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await updateAdminProperty(id, { isFeatured: !isFeatured });
      setMessage({ type: 'success', text: 'Featured oznaka je ažurirana.' });
      loadProperties();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Featured oznaka nije promenjena.' });
    }
  };

  const removeProperty = async (id: string, title: string) => {
    const confirmed = window.confirm(`Da li sigurno želiš da obrišeš nekretninu: ${title}?`);
    if (!confirmed) return;

    try {
      await deleteAdminProperty(id);
      setMessage({ type: 'success', text: 'Nekretnina je obrisana.' });
      loadProperties();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Nekretnina nije obrisana.' });
    }
  };

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div>
          <span className="admin-kicker">Content management</span>
          <h2>Properties</h2>
          <p>Search, publish, archive and maintain the complete Zepter Real Estate portfolio.</p>
        </div>
        <button className="admin-primary-action" onClick={() => navigate('/admin/properties/new')}>+ New property</button>
      </section>

      <AdminNotice message={message} />

      <section className="admin-mini-stats">
        <div><strong>{data.pagination.total}</strong><span>Total</span></div>
        <div><strong>{counts.published}</strong><span>Published on page</span></div>
        <div><strong>{counts.draft}</strong><span>Drafts on page</span></div>
        <div><strong>{counts.archived}</strong><span>Archived on page</span></div>
      </section>

      <section className="admin-filters-bar">
        <label>
          Search
          <input
            value={filters.search || ''}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Title, description or location"
          />
        </label>
        <label>
          Status
          <select value={filters.status || ''} onChange={(event) => updateFilter('status', event.target.value)}>
            {statusOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          Category
          <select value={filters.category || ''} onChange={(event) => updateFilter('category', event.target.value)}>
            <option value="">All categories</option>
            {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          Condition
          <select value={filters.condition || ''} onChange={(event) => updateFilter('condition', event.target.value)}>
            <option value="">All conditions</option>
            {conditionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button onClick={() => setFilters({ page: 1, limit: 10, language })}>Reset</button>
      </section>

      {loading && <LoadingState text="Loading properties..." />}

      {!loading && data.items.length === 0 && (
        <EmptyState title="No properties found" text="Try changing filters or create a new property record." actionLabel="Create property" onAction={() => navigate('/admin/properties/new')} />
      )}

      {!loading && data.items.length > 0 && (
        <section className="admin-table-card">
          <div className="admin-table admin-properties-table">
            <div className="admin-table__head">
              <span>Property</span>
              <span>Category</span>
              <span>Status</span>
              <span>Featured</span>
              <span>Updated</span>
              <span>Actions</span>
            </div>

            {data.items.map((property) => (
              <div className="admin-table__row" key={property._id}>
                <div className="admin-property-cell">
                  <div className="admin-property-cell__image">
                    {getMainImage(property) ? <img src={getMainImage(property)} alt={property.title} /> : <span>ZRE</span>}
                  </div>
                  <div>
                    <strong>{property.title}</strong>
                    <small>{property.publicId} · {property.location.fullLocation}</small>
                  </div>
                </div>
                <span>{categoryLabels[property.category]}</span>
                <div className="admin-status-select-wrap">
                  <AdminStatusBadge value={property.status} />
                  <select value={property.status} onChange={(event) => changeStatus(property._id, event.target.value as PropertyStatus)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <button className={property.isFeatured ? 'admin-feature-toggle admin-feature-toggle--on' : 'admin-feature-toggle'} onClick={() => toggleFeatured(property._id, property.isFeatured)}>
                  {property.isFeatured ? 'Featured' : 'Standard'}
                </button>
                <span>{new Date(property.updatedAt).toLocaleDateString('en-GB')}</span>
                <div className="admin-row-actions">
                  <button onClick={() => navigate(`/properties/${property.publicId}`)}>View</button>
                  <button onClick={() => navigate(`/admin/properties/${property._id}/edit`)}>Edit</button>
                  <button className="admin-row-actions__danger" onClick={() => removeProperty(property._id, property.title)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && data.pagination.pages > 1 && (
        <div className="admin-pagination">
          <button disabled={data.pagination.page <= 1} onClick={() => changePage(data.pagination.page - 1)}>Previous</button>
          <span>Page {data.pagination.page} of {data.pagination.pages}</span>
          <button disabled={data.pagination.page >= data.pagination.pages} onClick={() => changePage(data.pagination.page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminPropertiesPage;
