import { useEffect, useState } from 'react';

import { getPublicArticles } from '../api/articles';
import ArticleCard from '../components/ArticleCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { getArticleCopy } from '../data/articleCopy';
import type { ArticleType, PublicArticle } from '../types/article';
import type { SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface ArticleListingPageProps {
  type: ArticleType;
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const ArticleListingPage = ({ type, navigate, language }: ArticleListingPageProps) => {
  const copy = getArticleCopy(language);
  const sectionCopy = copy[type];
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const heroImage = type === 'blog'
    ? publicImage('portfolio Zepter Real Estate.jpg')
    : publicImage('who we are Zepter-Real Estate.jpg');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getPublicArticles(type, language)
      .then((response) => {
        if (active) setArticles(response.items);
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : copy.loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [copy.loadError, language, type]);

  return (
    <main className={`articles-page articles-page--${type}`}>
      <section className="articles-hero">
        <img src={heroImage} alt="" />
        <div className="articles-hero__overlay" />
        <div className="articles-hero__content">
          <span>{sectionCopy.eyebrow}</span>
          <h1>{sectionCopy.title}</h1>
          <p>{sectionCopy.subtitle}</p>
        </div>
        <div className="articles-hero__curve" aria-hidden="true" />
      </section>

      <section className="articles-index section">
        <div className="container">
          <header className="articles-index__heading">
            <span className="eyebrow">{sectionCopy.eyebrow}</span>
            <h2>{sectionCopy.title}</h2>
            <p>{sectionCopy.subtitle}</p>
          </header>

          {loading && <LoadingState text={copy.loading} />}
          {!loading && error && <EmptyState title={copy.loadError} text={error} />}
          {!loading && !error && articles.length === 0 && <EmptyState title={sectionCopy.emptyTitle} text={sectionCopy.emptyText} />}

          {!loading && !error && articles.length > 0 && (
            <div className="articles-grid">
              {articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  type={type}
                  language={language}
                  onOpen={() => navigate(`/${type}/${article.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ArticleListingPage;
