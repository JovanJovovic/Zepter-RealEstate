import { useEffect, useMemo, useState } from 'react';
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

const AdminAssistantInquiriesPage = ({ language }: AdminAssistantInquiriesPageProps) => {
  const [filters, setFilters] = useState<AssistantInquiryFiltersState>({ page: 1, limit: 12 });
  const [data, setData] = useState(defaultResponse);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AdminMessage | null>(null);
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
    setLoading(true);
    setMessage(null);

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
    setFilters((current) => ({ ...current, [key]: value || undefined, page: 1 }));
  };

  const changeStatus = async (id: string, status: AssistantInquiryStatus) => {
    try {
      await updateAssistantInquiryStatus(id, status);
      setMessage({ type: 'success', text: inquiryCopy.statusUpdated });
      loadInquiries();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : inquiryCopy.statusFailed });
    }
  };

  const changePage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <button onClick={() => setFilters({ page: 1, limit: 12 })}>{copy.common.reset}</button>
      </section>

      {loading && <LoadingState text={inquiryCopy.loading} />}

      {!loading && data.items.length === 0 && (
        <EmptyState title={inquiryCopy.emptyTitle} text={inquiryCopy.emptyText} />
      )}

      {!loading && data.items.length > 0 && (
        <section className="admin-table-card">
          <div className="admin-table admin-inquiries-table">
            <div className="admin-table__head">
              <span>{inquiryCopy.question}</span>
              <span>{inquiryCopy.contact}</span>
              <span>{inquiryCopy.context}</span>
              <span>{copy.common.status}</span>
              <span>{inquiryCopy.received}</span>
            </div>

            {data.items.map((inquiry) => (
              <div className="admin-table__row" key={inquiry._id}>
                <div className="admin-inquiry-question">
                  <strong>{inquiry.question}</strong>
                  {inquiry.sourcePage && (
                    <a href={inquiry.sourcePage} target="_blank" rel="noreferrer">
                      {inquiryCopy.openSource}
                    </a>
                  )}
                </div>
                <div className="admin-inquiry-contact">
                  {inquiry.email && <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>}
                  {inquiry.phone && <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>}
                </div>
                <div className="admin-inquiry-context">
                  <span>{inquiry.propertyName || inquiry.pageTitle || copy.common.notSet}</span>
                  {inquiry.propertyId && <small>{inquiry.propertyId}</small>}
                </div>
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
                <span>{new Date(inquiry.createdAt).toLocaleDateString(language === 'sr' ? 'sr-RS' : 'en-GB')}</span>
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

export default AdminAssistantInquiriesPage;
