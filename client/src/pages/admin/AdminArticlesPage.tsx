import { useEffect, useMemo, useState } from 'react';

import {
  deleteAdminArticle,
  getAdminArticles,
  updateAdminArticleStatus,
} from '../../api/admin';
import ArticleImage from '../../components/ArticleImage';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { getArticleCopy } from '../../data/articleCopy';
import type {
  AdminArticle,
  AdminArticleFilters,
  AdminArticlesResponse,
  ArticleStatus,
} from '../../types/article';
import type { AdminMessage } from '../../types/admin';
import type { SupportedLanguage } from '../../types/property';
import { formatArticleDate } from '../../utils/article';

interface AdminArticlesPageProps {
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const emptyResponse: AdminArticlesResponse = {
  items: [],
  pagination: { total: 0, page: 1, limit: 10, pages: 0 },
};

const AdminArticlesPage = ({ navigate, language }: AdminArticlesPageProps) => {
  const copy = getArticleCopy(language).admin;
  const [filters, setFilters] = useState<AdminArticleFilters>({ page: 1, limit: 10 });
  const [data, setData] = useState<AdminArticlesResponse>(emptyResponse);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AdminMessage | null>(null);
  const [preview, setPreview] = useState<AdminArticle | null>(null);

  const loadArticles = () => {
    setLoading(true);
    getAdminArticles(filters)
      .then(setData)
      .catch((error) => {
        setData(emptyResponse);
        setMessage({ type: 'error', text: error instanceof Error ? error.message : copy.loadFailed });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, language]);

  const stats = useMemo(() => ({
    blog: data.items.filter((item) => item.type === 'blog').length,
    news: data.items.filter((item) => item.type === 'news').length,
  }), [data.items]);

  const updateFilter = (key: keyof AdminArticleFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value || undefined, page: 1 }));
  };

  const changeStatus = async (article: AdminArticle, status: ArticleStatus) => {
    try {
      await updateAdminArticleStatus(article._id, status);
      setMessage({ type: 'success', text: copy.statusUpdated });
      loadArticles();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : copy.statusFailed });
    }
  };

  const removeArticle = async (article: AdminArticle) => {
    if (!window.confirm(`${copy.deleteConfirm} "${article.titleSr}"?`)) return;

    try {
      await deleteAdminArticle(article._id);
      setMessage({ type: 'success', text: copy.deleted });
      loadArticles();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : copy.deleteFailed });
    }
  };

  const localeDate = (date?: string) => date ? formatArticleDate(date, language) : '-';

  return (
    <div className="admin-page admin-articles-page">
      <section className="admin-page-heading">
        <div>
          <span className="admin-kicker">{copy.kicker}</span>
          <h2>{copy.title}</h2>
          <p>{copy.description}</p>
        </div>
        <button className="admin-heading-primary" onClick={() => navigate('/admin/articles/new')}>
          + {copy.newArticle}
        </button>
      </section>

      <AdminNotice message={message} />

      <section className="admin-mini-stats">
        <div><strong>{data.pagination.total}</strong><span>{copy.total}</span></div>
        <div><strong>{stats.blog}</strong><span>{copy.blogOnPage}</span></div>
        <div><strong>{stats.news}</strong><span>{copy.newsOnPage}</span></div>
      </section>

      <section className="admin-filters-bar admin-article-filters">
        <label>
          {copy.search}
          <input
            value={filters.search || ''}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder={copy.search}
          />
        </label>
        <label>
          {copy.type}
          <select value={filters.type || ''} onChange={(event) => updateFilter('type', event.target.value)}>
            <option value="">{copy.allTypes}</option>
            <option value="blog">Blog</option>
            <option value="news">{language === 'sr' ? 'Vesti' : 'News'}</option>
          </select>
        </label>
        <label>
          {copy.status}
          <select value={filters.status || ''} onChange={(event) => updateFilter('status', event.target.value)}>
            <option value="">{copy.allStatuses}</option>
            <option value="draft">{copy.draft}</option>
            <option value="published">{copy.publishedStatus}</option>
            <option value="archived">{copy.archived}</option>
          </select>
        </label>
        <button onClick={() => setFilters({ page: 1, limit: 10 })}>{copy.reset}</button>
      </section>

      {loading && <LoadingState text={copy.loadFailed.replace('nije moguće', 'se')} />}
      {!loading && data.items.length === 0 && <EmptyState title={copy.emptyTitle} text={copy.emptyText} />}

      {!loading && data.items.length > 0 && (
        <section className="admin-table-card">
          <div className="admin-table admin-articles-table">
            <div className="admin-table__head">
              <span>{copy.titleColumn}</span>
              <span>{copy.type}</span>
              <span>{copy.status}</span>
              <span>{copy.publishedAt}</span>
              <span>{copy.updatedAt}</span>
              <span>{copy.actions}</span>
            </div>

            {data.items.map((article) => (
              <div className="admin-table__row" key={article._id}>
                <button className="admin-article-title-cell" onClick={() => setPreview(article)}>
                  {article.coverImage ? (
                    <ArticleImage
                      source={article.coverImage}
                      alt=""
                      unavailableText={copy.imageUnavailable}
                      unavailableClassName="admin-article-thumb-unavailable"
                      loading="lazy"
                    />
                  ) : (
                    <span>{article.type === 'blog' ? 'B' : 'N'}</span>
                  )}
                  <div>
                    <strong>{article.titleSr}</strong>
                    <small>/{article.type}/{article.slug}</small>
                  </div>
                </button>
                <span className={`admin-article-type admin-article-type--${article.type}`}>
                  {article.type === 'blog' ? 'Blog' : language === 'sr' ? 'Vesti' : 'News'}
                </span>
                <div className="admin-article-status-control">
                  <AdminStatusBadge value={article.status} language={language} />
                  <select value={article.status} onChange={(event) => changeStatus(article, event.target.value as ArticleStatus)}>
                    <option value="draft">{copy.draft}</option>
                    <option value="published">{copy.publishedStatus}</option>
                    <option value="archived">{copy.archived}</option>
                  </select>
                </div>
                <span>{localeDate(article.publishedAt)}</span>
                <span>{localeDate(article.updatedAt)}</span>
                <div className="admin-row-actions admin-article-actions">
                  <button onClick={() => setPreview(article)}>{copy.preview}</button>
                  <button onClick={() => navigate(`/admin/articles/${article._id}/edit`)}>{copy.edit}</button>
                  <button className="admin-row-actions__danger" onClick={() => removeArticle(article)}>{copy.delete}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && data.pagination.pages > 1 && (
        <div className="admin-pagination">
          <button disabled={data.pagination.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: data.pagination.page - 1 }))}>{copy.previous}</button>
          <span>{copy.page} {data.pagination.page} {copy.of} {data.pagination.pages}</span>
          <button disabled={data.pagination.page >= data.pagination.pages} onClick={() => setFilters((current) => ({ ...current, page: data.pagination.page + 1 }))}>{copy.next}</button>
        </div>
      )}

      {preview && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setPreview(null)}>
          <section className="admin-article-preview-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span className="admin-kicker">{preview.type === 'blog' ? 'Blog' : language === 'sr' ? 'Vesti' : 'News'}</span>
                <h3>{language === 'sr' ? preview.titleSr : preview.titleEn || preview.titleSr}</h3>
              </div>
              <button onClick={() => setPreview(null)} aria-label={copy.close}>×</button>
            </header>
            {preview.coverImage && (
              <ArticleImage
                source={preview.coverImage}
                className="admin-article-preview-modal__cover"
                alt=""
                unavailableText={copy.imageUnavailable}
                unavailableClassName="admin-article-preview-modal__cover-unavailable"
              />
            )}
            <div className="admin-article-preview-modal__meta">
              <AdminStatusBadge value={preview.status} language={language} />
              <span>{localeDate(preview.publishedAt)}</span>
              {preview.author && <span>{preview.author}</span>}
            </div>
            <p className="admin-article-preview-modal__excerpt">{language === 'sr' ? preview.excerptSr : preview.excerptEn || preview.excerptSr}</p>
            <div className="admin-article-preview-modal__content">
              {language === 'sr' ? preview.contentSr : preview.contentEn || preview.contentSr}
            </div>
            <footer>
              <button onClick={() => setPreview(null)}>{copy.close}</button>
              <button className="admin-submit-button" onClick={() => navigate(`/admin/articles/${preview._id}/edit`)}>{copy.edit}</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminArticlesPage;
