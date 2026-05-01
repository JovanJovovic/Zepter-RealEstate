import { useEffect, useMemo, useState } from 'react';
import { getAdminProperties, getNewsletterSubscribers } from '../../api/admin';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import LoadingState from '../../components/LoadingState';
import { categoryLabels } from '../../data/propertyOptions';
import type { PaginatedNewsletterResponse, PaginatedPropertiesResponse } from '../../types/admin';
import { getMainImage } from '../../utils/asset';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

const defaultProperties: PaginatedPropertiesResponse = {
  items: [],
  pagination: { total: 0, page: 1, limit: 100, pages: 0 },
};

const defaultNewsletter: PaginatedNewsletterResponse = {
  items: [],
  pagination: { total: 0, page: 1, limit: 100, pages: 0 },
};

const AdminDashboardPage = ({ navigate }: AdminDashboardPageProps) => {
  const [properties, setProperties] = useState(defaultProperties);
  const [newsletter, setNewsletter] = useState(defaultNewsletter);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      getAdminProperties({ limit: 100 }),
      getNewsletterSubscribers({ limit: 100 }),
    ])
      .then(([propertiesResponse, newsletterResponse]) => {
        if (!mounted) return;
        setProperties(propertiesResponse);
        setNewsletter(newsletterResponse);
      })
      .catch(() => {
        if (!mounted) return;
        setProperties(defaultProperties);
        setNewsletter(defaultNewsletter);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const published = properties.items.filter((property) => property.status === 'published').length;
    const draft = properties.items.filter((property) => property.status === 'draft').length;
    const featured = properties.items.filter((property) => property.isFeatured).length;
    const activeSubscribers = newsletter.items.filter((subscriber) => subscriber.isActive).length;

    return { published, draft, featured, activeSubscribers };
  }, [properties.items, newsletter.items]);

  const recentProperties = properties.items.slice(0, 5);

  if (loading) {
    return <LoadingState text="Loading admin dashboard..." />;
  }

  return (
    <div className="admin-page admin-page--dashboard">
      <section className="admin-hero-panel">
        <div>
          <span className="admin-kicker">Overview</span>
          <h2>Real estate portfolio control center</h2>
          <p>Track published assets, prepare draft properties and keep Zepter Real Estate portfolio content ready for presentation.</p>
        </div>
        <button onClick={() => navigate('/admin/properties/new')}>Create property</button>
      </section>

      <section className="admin-stats-grid">
        <AdminStatCard label="Total properties" value={properties.pagination.total} text="All records in the admin collection." />
        <AdminStatCard label="Published" value={stats.published} text="Visible on the public website." />
        <AdminStatCard label="Drafts" value={stats.draft} text="Prepared but not currently public." />
        <AdminStatCard label="Newsletter" value={stats.activeSubscribers} text="Active subscribers in the database." />
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-panel--wide">
          <div className="admin-panel__head">
            <div>
              <span className="admin-kicker">Latest updates</span>
              <h3>Recently updated properties</h3>
            </div>
            <button onClick={() => navigate('/admin/properties')}>Manage all</button>
          </div>

          <div className="admin-recent-list">
            {recentProperties.map((property) => (
              <button key={property._id} className="admin-recent-item" onClick={() => navigate(`/admin/properties/${property._id}/edit`)}>
                <div className="admin-recent-item__image">
                  {getMainImage(property) ? <img src={getMainImage(property)} alt={property.title} /> : <span>ZRE</span>}
                </div>
                <div>
                  <strong>{property.title}</strong>
                  <small>{categoryLabels[property.category]} · {property.location.fullLocation}</small>
                </div>
                <AdminStatusBadge value={property.status} />
              </button>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <span className="admin-kicker">Portfolio quality</span>
          <h3>Publishing checklist</h3>
          <ul className="admin-checklist">
            <li>Main image selected for each published property</li>
            <li>Short description concise enough for cards</li>
            <li>Location and size labels aligned with public filters</li>
            <li>Floor plans attached where available</li>
          </ul>
        </article>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
