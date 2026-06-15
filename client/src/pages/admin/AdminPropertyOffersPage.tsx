import { useEffect, useMemo, useState } from 'react';
import {
  getPropertyOffers,
  updatePropertyOfferStatus,
} from '../../api/admin';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { getCopy } from '../../data/localization';
import { getPropertyTypeOptions } from '../../data/propertyOptions';
import type {
  AdminMessage,
  PaginatedPropertyOffersResponse,
  PropertyOffer,
  PropertyOfferFiltersState,
  PropertyOfferStatus,
} from '../../types/admin';
import type { SupportedLanguage } from '../../types/property';

interface AdminPropertyOffersPageProps {
  language: SupportedLanguage;
  navigate: (path: string) => void;
}

const defaultResponse: PaginatedPropertyOffersResponse = {
  items: [],
  pagination: { total: 0, page: 1, limit: 12, pages: 0 },
};

const formatArea = (value: number | null | undefined, language: SupportedLanguage, fallback: string) => {
  if (value === undefined || value === null) return fallback;
  return `${value.toLocaleString(language === 'sr' ? 'sr-RS' : 'en-US')} m²`;
};

const formatPrice = (offer: PropertyOffer, language: SupportedLanguage, fallback: string) => {
  if (offer.proposedPrice === undefined || offer.proposedPrice === null) return fallback;
  return `${offer.proposedPrice.toLocaleString(language === 'sr' ? 'sr-RS' : 'en-US')} ${offer.currency || 'EUR'}`;
};

const AdminPropertyOffersPage = ({ language, navigate }: AdminPropertyOffersPageProps) => {
  const [filters, setFilters] = useState<PropertyOfferFiltersState>({ page: 1, limit: 12 });
  const [data, setData] = useState(defaultResponse);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AdminMessage | null>(null);
  const copy = getCopy(language).admin;
  const offerCopy = copy.propertyOffers;
  const propertyTypeOptions = useMemo(() => getPropertyTypeOptions(language), [language]);
  const propertyTypeLabels = useMemo(
    () => Object.fromEntries(propertyTypeOptions.map((option) => [option.value, option.label])),
    [propertyTypeOptions]
  );
  const statusOptions: Array<{ value: '' | PropertyOfferStatus; label: string }> = [
    { value: '', label: offerCopy.allStatuses },
    { value: 'new', label: offerCopy.statusNew },
    { value: 'reviewed', label: offerCopy.statusReviewed },
    { value: 'contacted', label: offerCopy.statusContacted },
    { value: 'accepted', label: offerCopy.statusAccepted },
    { value: 'rejected', label: offerCopy.statusRejected },
  ];

  const loadOffers = () => {
    setLoading(true);
    setMessage(null);

    getPropertyOffers(filters)
      .then((response) => {
        setData(response);
      })
      .catch((error) => {
        setMessage({ type: 'error', text: error instanceof Error ? error.message : offerCopy.loadFailed });
        setData(defaultResponse);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, language]);

  const stats = useMemo(() => {
    return {
      new: data.items.filter((offer) => offer.status === 'new').length,
      contacted: data.items.filter((offer) => offer.status === 'contacted').length,
      accepted: data.items.filter((offer) => offer.status === 'accepted').length,
    };
  }, [data.items]);

  const updateFilter = (key: keyof PropertyOfferFiltersState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value || undefined, page: 1 }));
  };

  const changeStatus = async (id: string, status: PropertyOfferStatus) => {
    try {
      await updatePropertyOfferStatus(id, status);
      setMessage({ type: 'success', text: offerCopy.statusUpdated });
      loadOffers();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : offerCopy.statusFailed });
    }
  };

  const changePage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewDetailsLabel = language === 'sr' ? 'Detalji' : 'Details';

  const openOffer = (id: string) => {
    navigate(`/admin/property-offers/${encodeURIComponent(id)}`);
  };

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div>
          <span className="admin-kicker">{offerCopy.leadManagement}</span>
          <h2>{offerCopy.title}</h2>
          <p>{offerCopy.text}</p>
        </div>
      </section>

      <AdminNotice message={message} />

      <section className="admin-mini-stats">
        <div><strong>{data.pagination.total}</strong><span>{offerCopy.total}</span></div>
        <div><strong>{stats.new}</strong><span>{offerCopy.newOnPage}</span></div>
        <div><strong>{stats.contacted}</strong><span>{offerCopy.contactedOnPage}</span></div>
        <div><strong>{stats.accepted}</strong><span>{offerCopy.acceptedOnPage}</span></div>
      </section>

      <section className="admin-filters-bar admin-filters-bar--compact">
        <label>
          {offerCopy.search}
          <input
            value={filters.search || ''}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder={offerCopy.searchPlaceholder}
          />
        </label>
        <label>
          {copy.common.status}
          <select value={filters.status || ''} onChange={(event) => updateFilter('status', event.target.value)}>
            {statusOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => setFilters({ page: 1, limit: 12 })}>{copy.common.reset}</button>
      </section>

      {loading && <LoadingState text={offerCopy.loading} />}

      {!loading && data.items.length === 0 && (
        <EmptyState title={offerCopy.emptyTitle} text={offerCopy.emptyText} />
      )}

      {!loading && data.items.length > 0 && (
        <section className="admin-table-card">
          <div className="admin-table admin-property-offers-table">
            <div className="admin-table__head">
              <span>{offerCopy.submitter}</span>
              <span>{offerCopy.property}</span>
              <span>{offerCopy.price}</span>
              <span>{copy.common.status}</span>
              <span>{offerCopy.files}</span>
              <span>{offerCopy.submitted}</span>
              <span>{copy.common.actions}</span>
            </div>

            {data.items.map((offer) => (
              <div
                className="admin-table__row admin-table__row--clickable"
                key={offer._id}
                role="button"
                tabIndex={0}
                onClick={() => openOffer(offer._id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') openOffer(offer._id);
                }}
              >
                <button className="admin-offer-link" onClick={(event) => { event.stopPropagation(); openOffer(offer._id); }}>
                  <strong>{offer.firstName} {offer.lastName}</strong>
                  <span>{offer.email || offer.phone || copy.common.notSet}</span>
                </button>
                <div className="admin-offer-cell">
                  <strong>{propertyTypeLabels[offer.propertyType] || offer.propertyType}</strong>
                  <span>{[offer.city, offer.municipality].filter(Boolean).join(', ')}</span>
                  <small>{formatArea(offer.area, language, copy.common.notSet)}</small>
                </div>
                <span>{formatPrice(offer, language, copy.common.notSet)}</span>
                <div className="admin-status-select-wrap" onClick={(event) => event.stopPropagation()}>
                  <AdminStatusBadge value={offer.status} language={language} />
                  <select value={offer.status} onChange={(event) => changeStatus(offer._id, event.target.value as PropertyOfferStatus)}>
                    {statusOptions.slice(1).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <span>{offer.images.length + offer.floorPlans.length + offer.documents.length}</span>
                <span>{new Date(offer.createdAt).toLocaleDateString(language === 'sr' ? 'sr-RS' : 'en-GB')}</span>
                <button className="admin-row-detail-button" onClick={(event) => { event.stopPropagation(); openOffer(offer._id); }}>
                  {viewDetailsLabel}
                </button>
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

export default AdminPropertyOffersPage;
