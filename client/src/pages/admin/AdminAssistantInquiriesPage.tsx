import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  getAssistantInquiries,
  updateAssistantInquiryStatus,
} from '../../api/admin';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { getCopy } from '../../data/localization';
import type {
  AdminMessage,
  AssistantInquiry,
  AssistantInquiryFiltersState,
  AssistantInquiryStatus,
  PaginatedAssistantInquiriesResponse,
} from '../../types/admin';
import type { SupportedLanguage } from '../../types/property';

interface AdminAssistantInquiriesPageProps {
  language: SupportedLanguage;
}

const defaultResponse: PaginatedAssistantInquiriesResponse = {
  items: [],
  pagination: { total: 0, page: 1, limit: 12, pages: 0 },
};

const DetailField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="admin-detail-field">
    <span>{label}</span>
    <strong>{children}</strong>
  </div>
);

const AdminAssistantInquiriesPage = ({ language }: AdminAssistantInquiriesPageProps) => {
  const [filters, setFilters] = useState<AssistantInquiryFiltersState>({ page: 1, limit: 12 });
  const [data, setData] = useState(defaultResponse);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AdminMessage | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<AssistantInquiry | null>(null);
  const copy = getCopy(language).admin;
  const inquiryCopy = copy.assistantInquiries;
  const statusOptions: Array<{ value: '' | AssistantInquiryStatus; label: string }> = [
    { value: '', label: inquiryCopy.allStatuses },
    { value: 'new', label: inquiryCopy.statusNew },
    { value: 'in-progress', label: inquiryCopy.statusInProgress },
    { value: 'answered', label: inquiryCopy.statusAnswered },
    { value: 'archived', label: inquiryCopy.statusArchived },
  ];

  const loadInquiries = () => {
    getAssistantInquiries(filters)
      .then(setData)
      .catch((err) => {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : inquiryCopy.loadFailed });
        setData(defaultResponse);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, language]);

  const stats = useMemo(() => {
    return {
      new: data.items.filter((inquiry) => inquiry.status === 'new').length,
      open: data.items.filter((inquiry) => inquiry.status === 'new' || inquiry.status === 'in-progress').length,
      answered: data.items.filter((inquiry) => inquiry.status === 'answered').length,
    };
  }, [data.items]);

  const updateFilter = (key: keyof AssistantInquiryFiltersState, value: string) => {
    setLoading(true);
    setMessage(null);
    setFilters((current) => ({ ...current, [key]: value || undefined, page: 1 }));
  };

  const changeStatus = async (id: string, status: AssistantInquiryStatus) => {
    try {
      await updateAssistantInquiryStatus(id, status);
      setSelectedInquiry((current) => (current?._id === id ? { ...current, status } : current));
      setMessage({ type: 'success', text: inquiryCopy.statusUpdated });
      loadInquiries();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : inquiryCopy.statusFailed });
    }
  };

  const changePage = (page: number) => {
    setLoading(true);
    setMessage(null);
    setFilters((current) => ({ ...current, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setLoading(true);
    setMessage(null);
    setFilters({ page: 1, limit: 12 });
  };

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString(language === 'sr' ? 'sr-RS' : 'en-GB');
  };

  const detailLabels = language === 'sr'
    ? {
        details: 'Detalji upita',
        close: 'Zatvori',
        viewDetails: 'Detalji',
        fullQuestion: 'Puno pitanje',
        name: 'Ime i prezime',
        inquiryType: 'Izvor upita',
        assistantWidget: 'Plutajući asistent',
        propertyForm: 'Forma za nekretninu',
        contactPage: 'Kontakt strana',
        email: 'Email',
        phone: 'Telefon',
        sourcePage: 'Izvorna strana',
        pageTitle: 'Naslov strane',
        propertyContext: 'Kontekst nekretnine',
        propertyName: 'Naziv nekretnine',
        propertyId: 'ID nekretnine',
        propertyPublicId: 'Public ID nekretnine',
        propertySlug: 'Slug nekretnine',
        receivedAt: 'Primljeno',
        updatedAt: 'Ažurirano',
        inquiryId: 'ID upita',
      }
    : {
        details: 'Inquiry details',
        close: 'Close',
        viewDetails: 'Details',
        fullQuestion: 'Full question',
        name: 'Full name',
        inquiryType: 'Inquiry source',
        assistantWidget: 'Floating assistant',
        propertyForm: 'Property contact form',
        contactPage: 'Contact page',
        email: 'Email',
        phone: 'Phone',
        sourcePage: 'Source page',
        pageTitle: 'Page title',
        propertyContext: 'Property context',
        propertyName: 'Property name',
        propertyId: 'Property ID',
        propertyPublicId: 'Property public ID',
        propertySlug: 'Property slug',
        receivedAt: 'Received',
        updatedAt: 'Updated',
        inquiryId: 'Inquiry ID',
      };

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div>
          <span className="admin-kicker">{inquiryCopy.leadManagement}</span>
          <h2>{inquiryCopy.title}</h2>
          <p>{inquiryCopy.text}</p>
        </div>
      </section>

      <AdminNotice message={message} />

      <section className="admin-mini-stats">
        <div><strong>{data.pagination.total}</strong><span>{inquiryCopy.total}</span></div>
        <div><strong>{stats.new}</strong><span>{inquiryCopy.newOnPage}</span></div>
        <div><strong>{stats.open}</strong><span>{inquiryCopy.openOnPage}</span></div>
        <div><strong>{stats.answered}</strong><span>{inquiryCopy.answeredOnPage}</span></div>
      </section>

      <section className="admin-filters-bar admin-filters-bar--compact">
        <label>
          {inquiryCopy.search}
          <input
            value={filters.search || ''}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder={inquiryCopy.searchPlaceholder}
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
        <button onClick={resetFilters}>{copy.common.reset}</button>
      </section>

      {loading && <LoadingState text={inquiryCopy.loading} />}

      {!loading && data.items.length === 0 && (
        <EmptyState title={inquiryCopy.emptyTitle} text={inquiryCopy.emptyText} />
      )}

      {!loading && data.items.length > 0 && (
        <section className="admin-table-card admin-inquiries-card">
          <div className="admin-inquiries-list">
            <div className="admin-inquiries-list__head" aria-hidden="true">
              <span>{inquiryCopy.question}</span>
              <span>{inquiryCopy.contact}</span>
              <span>{inquiryCopy.context}</span>
              <span>{copy.common.status} / {inquiryCopy.received}</span>
            </div>

            {data.items.map((inquiry) => (
              <article className="admin-inquiry-row" key={inquiry._id}>
                <div className="admin-inquiry-question">
                  <span className="admin-inquiry-cell-label">{inquiryCopy.question}</span>
                  <button onClick={() => setSelectedInquiry(inquiry)}>
                    <strong>{inquiry.question}</strong>
                  </button>
                  {inquiry.sourcePage && (
                    <a href={inquiry.sourcePage} target="_blank" rel="noreferrer">
                      {inquiryCopy.openSource}
                    </a>
                  )}
                </div>
                <div className="admin-inquiry-contact">
                  <span className="admin-inquiry-cell-label">{inquiryCopy.contact}</span>
                  {inquiry.name && <strong>{inquiry.name}</strong>}
                  {inquiry.email && <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>}
                  {inquiry.phone && <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>}
                  {!inquiry.name && !inquiry.email && !inquiry.phone && (
                    <span className="admin-inquiry-empty">{copy.common.notSet}</span>
                  )}
                </div>
                <div className="admin-inquiry-context">
                  <span className="admin-inquiry-cell-label">{inquiryCopy.context}</span>
                  <strong>{inquiry.propertyName || inquiry.pageTitle || copy.common.notSet}</strong>
                  {(inquiry.propertyPublicId || inquiry.propertyId) && (
                    <small>{inquiry.propertyPublicId || inquiry.propertyId}</small>
                  )}
                </div>
                <div className="admin-inquiry-management">
                  <span className="admin-inquiry-cell-label">{copy.common.status}</span>
                  <div className="admin-status-select-wrap">
                    <AdminStatusBadge value={inquiry.status} language={language} />
                    <select value={inquiry.status} onChange={(event) => changeStatus(inquiry._id, event.target.value as AssistantInquiryStatus)}>
                      {statusOptions.slice(1).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-inquiry-received">
                    <span>{inquiryCopy.received}</span>
                    <time dateTime={inquiry.createdAt}>{formatDateTime(inquiry.createdAt)}</time>
                  </div>
                  <button className="admin-row-detail-button" onClick={() => setSelectedInquiry(inquiry)}>
                    {detailLabels.viewDetails}
                  </button>
                </div>
              </article>
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

      {selectedInquiry && (
        <div className="admin-detail-modal" role="dialog" aria-modal="true" aria-labelledby="admin-inquiry-detail-title">
          <button className="admin-detail-modal__backdrop" onClick={() => setSelectedInquiry(null)} aria-label={detailLabels.close} />
          <section className="admin-detail-modal__card admin-inquiry-detail">
            <div className="admin-detail-modal__header">
              <div>
                <span className="admin-kicker">{inquiryCopy.leadManagement}</span>
                <h3 id="admin-inquiry-detail-title">{detailLabels.details}</h3>
              </div>
              <button className="admin-row-detail-button" onClick={() => setSelectedInquiry(null)}>
                {detailLabels.close}
              </button>
            </div>

            <div className="admin-inquiry-detail__question">
              <span>{detailLabels.fullQuestion}</span>
              <p>{selectedInquiry.question}</p>
            </div>

            <div className="admin-detail-grid">
              <DetailField label={detailLabels.name}>{selectedInquiry.name || copy.common.notSet}</DetailField>
              <DetailField label={detailLabels.inquiryType}>
                {selectedInquiry.inquiryType === 'property-contact-form'
                  ? detailLabels.propertyForm
                  : selectedInquiry.inquiryType === 'contact-page-form'
                    ? detailLabels.contactPage
                    : detailLabels.assistantWidget}
              </DetailField>
              <DetailField label={detailLabels.email}>
                {selectedInquiry.email ? <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a> : copy.common.notSet}
              </DetailField>
              <DetailField label={detailLabels.phone}>
                {selectedInquiry.phone ? <a href={`tel:${selectedInquiry.phone}`}>{selectedInquiry.phone}</a> : copy.common.notSet}
              </DetailField>
              <div className="admin-detail-field">
                <span>{copy.common.status}</span>
                <div className="admin-status-select-wrap">
                  <AdminStatusBadge value={selectedInquiry.status} language={language} />
                  <select
                    value={selectedInquiry.status}
                    onChange={(event) => changeStatus(selectedInquiry._id, event.target.value as AssistantInquiryStatus)}
                  >
                    {statusOptions.slice(1).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DetailField label={detailLabels.sourcePage}>
                {selectedInquiry.sourcePage ? (
                  <a href={selectedInquiry.sourcePage} target="_blank" rel="noreferrer">
                    {selectedInquiry.sourcePage}
                  </a>
                ) : copy.common.notSet}
              </DetailField>
              <DetailField label={detailLabels.pageTitle}>{selectedInquiry.pageTitle || copy.common.notSet}</DetailField>
              <DetailField label={detailLabels.propertyName}>{selectedInquiry.propertyName || copy.common.notSet}</DetailField>
              <DetailField label={detailLabels.propertyId}>{selectedInquiry.propertyId || copy.common.notSet}</DetailField>
              <DetailField label={detailLabels.propertyPublicId}>{selectedInquiry.propertyPublicId || copy.common.notSet}</DetailField>
              <DetailField label={detailLabels.propertySlug}>{selectedInquiry.propertySlug || copy.common.notSet}</DetailField>
              <DetailField label={detailLabels.receivedAt}>{formatDateTime(selectedInquiry.createdAt)}</DetailField>
              <DetailField label={detailLabels.updatedAt}>{formatDateTime(selectedInquiry.updatedAt)}</DetailField>
              <DetailField label={detailLabels.inquiryId}>{selectedInquiry._id}</DetailField>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminAssistantInquiriesPage;
