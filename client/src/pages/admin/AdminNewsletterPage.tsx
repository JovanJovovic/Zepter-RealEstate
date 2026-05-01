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
import type { AdminMessage, NewsletterFiltersState, PaginatedNewsletterResponse } from '../../types/admin';

const defaultResponse: PaginatedNewsletterResponse = {
  items: [],
  pagination: { total: 0, page: 1, limit: 12, pages: 0 },
};

const AdminNewsletterPage = () => {
  const [filters, setFilters] = useState<NewsletterFiltersState>({ page: 1, limit: 12 });
  const [data, setData] = useState(defaultResponse);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AdminMessage | null>(null);

  const loadSubscribers = () => {
    setLoading(true);
    setMessage(null);

    getNewsletterSubscribers(filters)
      .then(setData)
      .catch((err) => {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Newsletter lista nije učitana.' });
        setData(defaultResponse);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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
      setMessage({ type: 'success', text: 'Newsletter prijava je deaktivirana.' });
      loadSubscribers();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Prijava nije deaktivirana.' });
    }
  };

  const remove = async (id: string, email: string) => {
    const confirmed = window.confirm(`Da li sigurno želiš da obrišeš newsletter prijavu za ${email}?`);
    if (!confirmed) return;

    try {
      await deleteNewsletterSubscriber(id);
      setMessage({ type: 'success', text: 'Newsletter prijava je obrisana.' });
      loadSubscribers();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Prijava nije obrisana.' });
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
          <span className="admin-kicker">Lead management</span>
          <h2>Newsletter subscribers</h2>
          <p>Review active and inactive subscriptions collected from the public website newsletter form.</p>
        </div>
      </section>

      <AdminNotice message={message} />

      <section className="admin-mini-stats">
        <div><strong>{data.pagination.total}</strong><span>Total subscribers</span></div>
        <div><strong>{stats.active}</strong><span>Active on page</span></div>
        <div><strong>{stats.inactive}</strong><span>Inactive on page</span></div>
      </section>

      <section className="admin-filters-bar admin-filters-bar--compact">
        <label>
          Search email
          <input value={filters.search || ''} onChange={(event) => updateFilter('search', event.target.value)} placeholder="name@example.com" />
        </label>
        <label>
          Status
          <select value={filters.status || ''} onChange={(event) => updateFilter('status', event.target.value)}>
            <option value="">All subscribers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <button onClick={() => setFilters({ page: 1, limit: 12 })}>Reset</button>
      </section>

      {loading && <LoadingState text="Loading newsletter subscribers..." />}

      {!loading && data.items.length === 0 && (
        <EmptyState title="No subscribers found" text="There are no newsletter subscribers matching the selected filters." />
      )}

      {!loading && data.items.length > 0 && (
        <section className="admin-table-card">
          <div className="admin-table admin-newsletter-table">
            <div className="admin-table__head">
              <span>Email</span>
              <span>Status</span>
              <span>Source</span>
              <span>Subscribed</span>
              <span>Actions</span>
            </div>

            {data.items.map((subscriber) => (
              <div className="admin-table__row" key={subscriber._id}>
                <strong>{subscriber.email}</strong>
                <AdminStatusBadge value={subscriber.isActive ? 'active' : 'inactive'} />
                <span>{subscriber.source || 'website'}</span>
                <span>{new Date(subscriber.subscribedAt || subscriber.createdAt).toLocaleDateString('en-GB')}</span>
                <div className="admin-row-actions">
                  {subscriber.isActive && <button onClick={() => unsubscribe(subscriber._id)}>Unsubscribe</button>}
                  <button className="admin-row-actions__danger" onClick={() => remove(subscriber._id, subscriber.email)}>Delete</button>
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

export default AdminNewsletterPage;
