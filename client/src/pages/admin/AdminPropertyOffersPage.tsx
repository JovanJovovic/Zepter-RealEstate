import { useEffect, useMemo, useState } from 'react';
import {
  getPropertyOfferById,
  getPropertyOffers,
  updatePropertyOfferInternalNote,
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
  PropertyOfferFile,
  PropertyOfferFiltersState,
  PropertyOfferStatus,
} from '../../types/admin';
import type { SupportedLanguage } from '../../types/property';
import { resolveMediaUrl } from '../../utils/asset';

interface AdminPropertyOffersPageProps {
  language: SupportedLanguage;
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

const FileLinks = ({
  files,
  emptyText,
  openLabel,
}: {
  files: PropertyOfferFile[];
  emptyText: string;
  openLabel: string;
}) => {
  if (!files.length) return <p className="admin-offer-empty-files">{emptyText}</p>;

  return (
    <div className="admin-offer-file-list">
      {files.map((file) => (
        <a href={resolveMediaUrl(file.url)} target="_blank" rel="noreferrer" key={`${file.filename}-${file.uploadedAt}`}>
          {file.mimeType.startsWith('image/') && <img src={resolveMediaUrl(file.url)} alt={file.originalName} />}
          <span>{file.originalName}</span>
          <small>{openLabel}</small>
        </a>
      ))}
    </div>
  );
};

const AdminPropertyOffersPage = ({ language }: AdminPropertyOffersPageProps) => {
  const [filters, setFilters] = useState<PropertyOfferFiltersState>({ page: 1, limit: 12 });
  const [data, setData] = useState(defaultResponse);
  const [selectedOffer, setSelectedOffer] = useState<PropertyOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
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
        if (selectedOffer && !response.items.some((item) => item._id === selectedOffer._id)) {
          setSelectedOffer(null);
        }
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

  const openOffer = async (id: string) => {
    setDetailLoading(true);
    setMessage(null);

    try {
      const offer = await getPropertyOfferById(id);
      setSelectedOffer(offer);
      setNoteDraft(offer.internalNote || '');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : offerCopy.loadFailed });
    } finally {
      setDetailLoading(false);
    }
  };

  const changeStatus = async (id: string, status: PropertyOfferStatus) => {
    try {
      await updatePropertyOfferStatus(id, status);
      setMessage({ type: 'success', text: offerCopy.statusUpdated });
      if (selectedOffer?._id === id) {
        setSelectedOffer((current) => (current ? { ...current, status } : current));
      }
      loadOffers();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : offerCopy.statusFailed });
    }
  };

  const saveNote = async () => {
    if (!selectedOffer) return;

    try {
      await updatePropertyOfferInternalNote(selectedOffer._id, noteDraft);
      setMessage({ type: 'success', text: offerCopy.noteUpdated });
      setSelectedOffer((current) => (current ? { ...current, internalNote: noteDraft } : current));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : offerCopy.noteFailed });
    }
  };

  const changePage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedLocation = selectedOffer
    ? [selectedOffer.city, selectedOffer.municipality, selectedOffer.address || selectedOffer.fullLocation].filter(Boolean).join(', ')
    : '';

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
            </div>

            {data.items.map((offer) => (
              <div className="admin-table__row" key={offer._id}>
                <button className="admin-offer-link" onClick={() => openOffer(offer._id)}>
                  <strong>{offer.firstName} {offer.lastName}</strong>
                  <span>{offer.email || offer.phone || copy.common.notSet}</span>
                </button>
                <div className="admin-offer-cell">
                  <strong>{propertyTypeLabels[offer.propertyType] || offer.propertyType}</strong>
                  <span>{[offer.city, offer.municipality].filter(Boolean).join(', ')}</span>
                  <small>{formatArea(offer.area, language, copy.common.notSet)}</small>
                </div>
                <span>{formatPrice(offer, language, copy.common.notSet)}</span>
                <div className="admin-status-select-wrap">
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

      {detailLoading && <LoadingState text={offerCopy.loading} />}

      {selectedOffer && !detailLoading && (
        <section className="admin-offer-detail">
          <div className="admin-offer-detail__header">
            <div>
              <span className="admin-kicker">{offerCopy.details}</span>
              <h3>{selectedOffer.firstName} {selectedOffer.lastName}</h3>
              <p>{selectedLocation || copy.common.notSet}</p>
            </div>
            <div className="admin-status-select-wrap">
              <AdminStatusBadge value={selectedOffer.status} language={language} />
              <select value={selectedOffer.status} onChange={(event) => changeStatus(selectedOffer._id, event.target.value as PropertyOfferStatus)}>
                {statusOptions.slice(1).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-offer-detail__grid">
            <section>
              <h4>{offerCopy.contactInformation}</h4>
              <a href={selectedOffer.email ? `mailto:${selectedOffer.email}` : undefined}>{selectedOffer.email || copy.common.notSet}</a>
              <a href={selectedOffer.phone ? `tel:${selectedOffer.phone}` : undefined}>{selectedOffer.phone || copy.common.notSet}</a>
            </section>
            <section>
              <h4>{offerCopy.propertyInformation}</h4>
              <p>{propertyTypeLabels[selectedOffer.propertyType] || selectedOffer.propertyType}</p>
              <p>{selectedLocation || copy.common.notSet}</p>
              <p>{formatArea(selectedOffer.area, language, copy.common.notSet)}</p>
            </section>
            <section className="admin-offer-detail__wide">
              <h4>{offerCopy.priceAndDescription}</h4>
              <strong>{formatPrice(selectedOffer, language, copy.common.notSet)}</strong>
              <p>{selectedOffer.description || copy.common.notSet}</p>
            </section>
            <section className="admin-offer-detail__wide">
              <h4>{offerCopy.images}</h4>
              <FileLinks files={selectedOffer.images} emptyText={offerCopy.noFiles} openLabel={offerCopy.openFile} />
            </section>
            <section>
              <h4>{offerCopy.floorPlans}</h4>
              <FileLinks files={selectedOffer.floorPlans} emptyText={offerCopy.noFiles} openLabel={offerCopy.openFile} />
            </section>
            <section>
              <h4>{offerCopy.documents}</h4>
              <FileLinks files={selectedOffer.documents} emptyText={offerCopy.noFiles} openLabel={offerCopy.openFile} />
            </section>
            <section className="admin-offer-detail__wide">
              <h4>{offerCopy.internalNote}</h4>
              <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={5} />
              <button className="admin-primary-action" onClick={saveNote}>{offerCopy.saveNote}</button>
            </section>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminPropertyOffersPage;
