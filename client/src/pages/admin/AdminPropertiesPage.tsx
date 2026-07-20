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
import { getCopy } from '../../data/localization';
import { getCategoryLabels, getConditionOptions } from '../../data/propertyOptions';
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

const AdminPropertiesPage = ({ navigate, language }: AdminPropertiesPageProps) => {
  const [filters, setFilters] = useState<AdminPropertiesQuery>({ page: 1, limit: 10, language });
  const [data, setData] = useState(defaultResponse);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AdminMessage | null>(null);
  const copy = getCopy(language).admin;
  const categoryLabels = getCategoryLabels(language);
  const conditionOptions = getConditionOptions(language);
  const statusOptions: Array<{ value: '' | PropertyStatus; label: string }> = [
    { value: '', label: copy.common.allStatuses },
    { value: 'published', label: copy.common.published },
    { value: 'draft', label: copy.common.draft },
    { value: 'archived', label: copy.common.archived },
  ];

  const loadProperties = () => {
    setLoading(true);
    setMessage(null);

    getAdminProperties({ ...filters, language })
      .then(setData)
      .catch((err) => {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : copy.properties.loadFailed });
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
      setMessage({ type: 'success', text: copy.properties.statusUpdated });
      loadProperties();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : copy.properties.statusFailed });
    }
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await updateAdminProperty(id, { isFeatured: !isFeatured });
      setMessage({ type: 'success', text: copy.properties.featuredUpdated });
      loadProperties();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : copy.properties.featuredFailed });
    }
  };

  const removeProperty = async (id: string, title: string) => {
    const confirmed = window.confirm(`${copy.properties.deleteConfirm} ${title}?`);
    if (!confirmed) return;

    try {
      await deleteAdminProperty(id);
      setMessage({ type: 'success', text: copy.properties.deleted });
      loadProperties();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : copy.properties.deleteFailed });
    }
  };

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div>
          <span className="admin-kicker">{copy.properties.contentManagement}</span>
          <h2>{copy.properties.title}</h2>
          <p>{copy.properties.text}</p>
        </div>
        <button className="admin-primary-action" onClick={() => navigate('/admin/properties/new')}>{copy.common.newProperty}</button>
      </section>

      <AdminNotice message={message} />

      <section className="admin-mini-stats">
        <div><strong>{data.pagination.total}</strong><span>{copy.properties.total}</span></div>
        <div><strong>{counts.published}</strong><span>{copy.properties.publishedOnPage}</span></div>
        <div><strong>{counts.draft}</strong><span>{copy.properties.draftsOnPage}</span></div>
        <div><strong>{counts.archived}</strong><span>{copy.properties.archivedOnPage}</span></div>
      </section>

      <section className="admin-filters-bar">
        <label>
          {copy.common.search}
          <input
            value={filters.search || ''}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder={copy.properties.searchPlaceholder}
          />
        </label>
        <label>
          {copy.common.status}
          <select value={filters.status || ''} onChange={(event) => updateFilter('status', event.target.value)}>
            {statusOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          {copy.common.category}
          <select value={filters.category || ''} onChange={(event) => updateFilter('category', event.target.value)}>
            <option value="">{copy.common.allCategories}</option>
            {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          {copy.common.condition}
          <select value={filters.condition || ''} onChange={(event) => updateFilter('condition', event.target.value)}>
            <option value="">{copy.common.allConditions}</option>
            {conditionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button onClick={() => setFilters({ page: 1, limit: 10, language })}>{copy.common.reset}</button>
      </section>

      {loading && <LoadingState text={copy.properties.loading} />}

      {!loading && data.items.length === 0 && (
        <EmptyState title={copy.properties.emptyTitle} text={copy.properties.emptyText} actionLabel={copy.properties.createProperty} onAction={() => navigate('/admin/properties/new')} />
      )}

      {!loading && data.items.length > 0 && (
        <section className="admin-table-card">
          <div className="admin-table admin-properties-table">
            <div className="admin-table__head">
              <span>{copy.properties.property}</span>
              <span>{copy.common.category}</span>
              <span>{copy.common.status}</span>
              <span>{copy.properties.featured}</span>
              <span>{copy.common.updated}</span>
              <span>{copy.common.actions}</span>
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
                <span className="admin-property-meta-cell">{categoryLabels[property.category]}</span>
                <div className="admin-status-select-wrap">
                  <AdminStatusBadge value={property.status} language={language} />
                  <select value={property.status} onChange={(event) => changeStatus(property._id, event.target.value as PropertyStatus)}>
                    <option value="draft">{copy.common.draft}</option>
                    <option value="published">{copy.common.published}</option>
                    <option value="archived">{copy.common.archived}</option>
                  </select>
                </div>
                <button className={property.isFeatured ? 'admin-feature-toggle admin-feature-toggle--on' : 'admin-feature-toggle'} onClick={() => toggleFeatured(property._id, property.isFeatured)}>
                  {property.isFeatured ? copy.common.featured : copy.common.standard}
                </button>
                <time className="admin-property-date" dateTime={property.updatedAt}>
                  {new Date(property.updatedAt).toLocaleDateString(language === 'sr' ? 'sr-RS' : 'en-GB')}
                </time>
                <div className="admin-row-actions">
                  <button onClick={() => navigate(`/properties/${property.publicId}`)}>{copy.common.view}</button>
                  <button onClick={() => navigate(`/admin/properties/${property._id}/edit`)}>{copy.common.edit}</button>
                  <button className="admin-row-actions__danger" onClick={() => removeProperty(property._id, property.title)}>{copy.common.delete}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && data.pagination.pages > 1 && (
        <div className="admin-pagination">
          <button disabled={data.pagination.page <= 1} onClick={() => changePage(data.pagination.page - 1)}>{copy.common.previous}</button>
          <span>{copy.common.page} {data.pagination.page} {copy.common.of} {data.pagination.pages}</span>
          <button disabled={data.pagination.page >= data.pagination.pages} onClick={() => changePage(data.pagination.page + 1)}>{copy.common.next}</button>
        </div>
      )}
    </div>
  );
};

export default AdminPropertiesPage;
