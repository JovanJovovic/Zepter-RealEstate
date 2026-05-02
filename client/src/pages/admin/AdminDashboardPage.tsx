import { useEffect, useMemo, useState } from 'react';
import { getAdminProperties, getNewsletterSubscribers } from '../../api/admin';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import LoadingState from '../../components/LoadingState';
import { getCopy } from '../../data/localization';
import { getCategoryLabels } from '../../data/propertyOptions';
import type { PaginatedNewsletterResponse, PaginatedPropertiesResponse } from '../../types/admin';
import type { SupportedLanguage } from '../../types/property';
import { getMainImage } from '../../utils/asset';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const defaultProperties: PaginatedPropertiesResponse = {
  items: [],
  pagination: { total: 0, page: 1, limit: 100, pages: 0 },
};

const defaultNewsletter: PaginatedNewsletterResponse = {
  items: [],
  pagination: { total: 0, page: 1, limit: 100, pages: 0 },
};

const AdminDashboardPage = ({ navigate, language }: AdminDashboardPageProps) => {
  const [properties, setProperties] = useState(defaultProperties);
  const [newsletter, setNewsletter] = useState(defaultNewsletter);
  const [loading, setLoading] = useState(true);
  const copy = getCopy(language).admin;
  const categoryLabels = getCategoryLabels(language);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      getAdminProperties({ limit: 100, language }),
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
  }, [language]);

  const stats = useMemo(() => {
    const published = properties.items.filter((property) => property.status === 'published').length;
    const draft = properties.items.filter((property) => property.status === 'draft').length;
    const featured = properties.items.filter((property) => property.isFeatured).length;
    const activeSubscribers = newsletter.items.filter((subscriber) => subscriber.isActive).length;

    return { published, draft, featured, activeSubscribers };
  }, [properties.items, newsletter.items]);

  const recentProperties = properties.items.slice(0, 5);

  if (loading) {
    return <LoadingState text={copy.dashboard.loading} />;
  }

  return (
    <div className="admin-page admin-page--dashboard">
      <section className="admin-hero-panel">
        <div>
          <span className="admin-kicker">{copy.dashboard.overview}</span>
          <h2>{copy.dashboard.title}</h2>
          <p>{copy.dashboard.text}</p>
        </div>
        <button onClick={() => navigate('/admin/properties/new')}>{copy.dashboard.createProperty}</button>
      </section>

      <section className="admin-stats-grid">
        <AdminStatCard label={copy.dashboard.totalProperties} value={properties.pagination.total} text={copy.dashboard.totalText} />
        <AdminStatCard label={copy.common.published} value={stats.published} text={copy.dashboard.publishedText} />
        <AdminStatCard label={copy.dashboard.drafts} value={stats.draft} text={copy.dashboard.draftsText} />
        <AdminStatCard label={copy.common.newsletter} value={stats.activeSubscribers} text={copy.dashboard.newsletterText} />
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-panel--wide">
          <div className="admin-panel__head">
            <div>
              <span className="admin-kicker">{copy.dashboard.latestUpdates}</span>
              <h3>{copy.dashboard.recentProperties}</h3>
            </div>
            <button onClick={() => navigate('/admin/properties')}>{copy.dashboard.manageAll}</button>
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
                <AdminStatusBadge value={property.status} language={language} />
              </button>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <span className="admin-kicker">{copy.dashboard.portfolioQuality}</span>
          <h3>{copy.dashboard.checklistTitle}</h3>
          <ul className="admin-checklist">
            {copy.dashboard.checklist.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
