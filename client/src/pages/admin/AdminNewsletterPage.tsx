import { useEffect, useMemo, useState } from 'react';
import {
  deleteNewsletterSubscriber,
  getNewsletterSubscribers,
  unsubscribeNewsletterSubscriber,
} from '../../api/admin';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { getCopy } from '../../data/localization';
import type { AdminMessage, NewsletterFiltersState, PaginatedNewsletterResponse } from '../../types/admin';
import type { SupportedLanguage } from '../../types/property';

interface AdminNewsletterPageProps {
  language: SupportedLanguage;
}

const defaultResponse: PaginatedNewsletterResponse = {
  items: [],
  pagination: { total: 0, page: 1, limit: 12, pages: 0 },
};

const AdminNewsletterPage = ({ language }: AdminNewsletterPageProps) => {
  const [filters, setFilters] = useState<NewsletterFiltersState>({ page: 1, limit: 12 });
  const [data, setData] = useState(defaultResponse);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AdminMessage | null>(null);
  const copy = getCopy(language).admin;

  const loadSubscribers = () => {
    setLoading(true);
    setMessage(null);

    getNewsletterSubscribers(filters)
      .then(setData)
      .catch((err) => {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : copy.newsletter.loadFailed });
        setData(defaultResponse);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, language]);

  const stats = useMemo(() => {
    return {
      active: data.items.filter((subscriber) => subscriber.isActive).length,
      inactive: data.items.filter((subscriber) => !subscriber.isActive).length,
    };
  }, [data.items]);

  const updateFilter = (key: keyof NewsletterFiltersState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value || undefined, page: 1 }));
  };

  const unsubscribe = async (id: string) => {
    try {
      await unsubscribeNewsletterSubscriber(id);
      setMessage({ type: 'success', text: copy.newsletter.deactivated });
      loadSubscribers();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : copy.newsletter.deactivateFailed });
    }
  };

  const remove = async (id: string, email: string) => {
    const confirmed = window.confirm(`${copy.newsletter.deleteConfirm} ${email}?`);
    if (!confirmed) return;

    try {
      await deleteNewsletterSubscriber(id);
      setMessage({ type: 'success', text: copy.newsletter.deleted });
      loadSubscribers();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : copy.newsletter.deleteFailed });
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
          <span className="admin-kicker">{copy.newsletter.leadManagement}</span>
          <h2>{copy.newsletter.title}</h2>
          <p>{copy.newsletter.text}</p>
        </div>
      </section>

      <AdminNotice message={message} />

      <section className="admin-mini-stats">
        <div><strong>{data.pagination.total}</strong><span>{copy.newsletter.totalSubscribers}</span></div>
        <div><strong>{stats.active}</strong><span>{copy.newsletter.activeOnPage}</span></div>
        <div><strong>{stats.inactive}</strong><span>{copy.newsletter.inactiveOnPage}</span></div>
      </section>

      <section className="admin-filters-bar admin-filters-bar--compact">
        <label>
          {copy.newsletter.searchEmail}
          <input value={filters.search || ''} onChange={(event) => updateFilter('search', event.target.value)} placeholder="name@example.com" />
        </label>
        <label>
          {copy.common.status}
          <select value={filters.status || ''} onChange={(event) => updateFilter('status', event.target.value)}>
            <option value="">{copy.newsletter.allSubscribers}</option>
            <option value="active">{copy.common.active}</option>
            <option value="inactive">{copy.common.inactive}</option>
          </select>
        </label>
        <button onClick={() => setFilters({ page: 1, limit: 12 })}>{copy.common.reset}</button>
      </section>

      {loading && <LoadingState text={copy.newsletter.loading} />}

      {!loading && data.items.length === 0 && (
        <EmptyState title={copy.newsletter.emptyTitle} text={copy.newsletter.emptyText} />
      )}

      {!loading && data.items.length > 0 && (
        <section className="admin-table-card">
          <div className="admin-table admin-newsletter-table">
            <div className="admin-table__head">
              <span>{copy.newsletter.email}</span>
              <span>{copy.common.status}</span>
              <span>{copy.newsletter.source}</span>
              <span>{copy.newsletter.subscribed}</span>
              <span>{copy.common.actions}</span>
            </div>

            {data.items.map((subscriber) => (
              <div className="admin-table__row" key={subscriber._id}>
                <strong>{subscriber.email}</strong>
                <AdminStatusBadge value={subscriber.isActive ? 'active' : 'inactive'} language={language} />
                <span>{subscriber.source || 'website'}</span>
                <span>{new Date(subscriber.subscribedAt || subscriber.createdAt).toLocaleDateString(language === 'sr' ? 'sr-RS' : 'en-GB')}</span>
                <div className="admin-row-actions">
                  {subscriber.isActive && <button onClick={() => unsubscribe(subscriber._id)}>{copy.newsletter.unsubscribe}</button>}
                  <button className="admin-row-actions__danger" onClick={() => remove(subscriber._id, subscriber.email)}>{copy.common.delete}</button>
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

export default AdminNewsletterPage;
