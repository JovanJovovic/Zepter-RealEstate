import { useEffect, useMemo, useState } from 'react';

import { getPublicArticle, getPublicArticles } from '../api/articles';
import ArticleCard from '../components/ArticleCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { getArticleCopy } from '../data/articleCopy';
import type { ArticleType, PublicArticle } from '../types/article';
import type { SupportedLanguage } from '../types/property';
import { articleImageUrl, formatArticleDate, toYouTubeEmbedUrl } from '../utils/article';
import { publicImage } from '../utils/asset';

interface ArticleDetailPageProps {
  type: ArticleType;
  slug: string;
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const ArticleDetailPage = ({ type, slug, navigate, language }: ArticleDetailPageProps) => {
  const copy = getArticleCopy(language);
  const sectionCopy = copy[type];
  const [article, setArticle] = useState<PublicArticle | null>(null);
  const [related, setRelated] = useState<PublicArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      getPublicArticle(type, slug, language),
      getPublicArticles(type, language, 8),
    ])
      .then(([currentArticle, response]) => {
        if (!active) return;
        setArticle(currentArticle);
        setRelated(response.items.filter((item) => item.slug !== currentArticle.slug).slice(0, 3));
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : copy.notFound);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [copy.notFound, language, slug, type]);

  useEffect(() => {
    if (!article) return;
    const previousTitle = document.title;
    document.title = article.metaTitle || `${article.title} | Zepter Real Estate`;
    return () => { document.title = previousTitle; };
  }, [article]);

  const paragraphs = useMemo(() => article?.content.split(/\n\s*\n/).filter(Boolean) || [], [article]);
  const youtubeUrl = toYouTubeEmbedUrl(article?.videoUrl);
  const fallback = type === 'blog'
    ? publicImage('portfolio Zepter Real Estate.jpg')
    : publicImage('who we are Zepter-Real Estate.jpg');

  if (loading) return <main className="article-detail-page article-detail-page--loading"><LoadingState text={copy.loading} /></main>;
  if (error || !article) {
    return (
      <main className="article-detail-page article-detail-page--empty">
        <EmptyState title={copy.notFound} text={error || copy.loadError} />
        <button className="btn btn--primary" onClick={() => navigate(`/${type}`)}>{sectionCopy.back}</button>
      </main>
    );
  }

  return (
    <main className={`article-detail-page article-detail-page--${type}`}>
      <section className="article-detail-hero">
        <img src={articleImageUrl(article.coverImage) || fallback} alt="" />
        <div className="article-detail-hero__overlay" />
        <div className="article-detail-hero__content">
          <button onClick={() => navigate(`/${type}`)}>← {sectionCopy.back}</button>
          <div className="article-detail-hero__meta">
            {article.category && <span>{article.category}</span>}
            {article.publishedAt && <time>{formatArticleDate(article.publishedAt, language)}</time>}
          </div>
          <h1>{article.title}</h1>
          {article.excerpt && <p>{article.excerpt}</p>}
        </div>
        <div className="article-detail-hero__curve" aria-hidden="true" />
      </section>

      <article className="article-reading-layout section">
        <div className="article-reading-layout__body">
          <header className="article-reading-layout__byline">
            {article.author && <strong>{article.author}</strong>}
            {article.publishedAt && <span>{copy.published}: {formatArticleDate(article.publishedAt, language)}</span>}
          </header>

          <div className="article-rich-text">
            {paragraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>)}
          </div>

          {article.galleryImages.length > 0 && (
            <div className="article-detail-gallery">
              {article.galleryImages.map((image, index) => (
                <a href={articleImageUrl(image)} target="_blank" rel="noreferrer" key={`${image}-${index}`}>
                  <img src={articleImageUrl(image)} alt={`${article.title} ${index + 1}`} />
                </a>
              ))}
            </div>
          )}

          {youtubeUrl && (
            <div className="article-video">
              <iframe src={youtubeUrl} title={article.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )}

          {article.videoUrl && !youtubeUrl && (
            <a className="article-video-link" href={article.videoUrl} target="_blank" rel="noreferrer">{article.videoUrl}</a>
          )}

          <button className="article-back-link" onClick={() => navigate(`/${type}`)}>← {sectionCopy.back}</button>
        </div>
      </article>

      {related.length > 0 && (
        <section className="article-related section">
          <div className="container">
            <header className="article-related__heading">
              <span className="eyebrow">Zepter Real Estate</span>
              <h2>{sectionCopy.related}</h2>
            </header>
            <div className="articles-grid">
              {related.map((item) => (
                <ArticleCard
                  key={item._id}
                  article={item}
                  type={type}
                  language={language}
                  onOpen={() => navigate(`/${type}/${item.slug}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ArticleDetailPage;
