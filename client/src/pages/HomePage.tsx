import { useEffect, useState } from 'react';
import { getFeaturedProperties } from '../api/properties';
import LoadingState from '../components/LoadingState';
import NewsletterBlock from '../components/NewsletterBlock';
import PropertyCard from '../components/PropertyCard';
import { getCopy } from '../data/localization';
import type { Property, SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface HomePageProps {
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const HomePage = ({ navigate, language }: HomePageProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const copy = getCopy(language);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    getFeaturedProperties(language)
      .then((data) => {
        if (mounted) setProperties(data);
      })
      .catch(() => {
        if (mounted) setProperties([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [language]);

  return (
    <main>
      <section className="home-hero">
        <div className="home-hero__bg" />
        <div className="container home-hero__grid">
          <div className="home-hero__content reveal-on-load">
            <span className="eyebrow eyebrow--light">{copy.home.eyebrow}</span>
            <h1>{copy.home.title}</h1>
            <p>{copy.home.text}</p>
            <div className="hero-actions">
              <button className="btn btn--primary btn--large" onClick={() => navigate('/commercial')}>
                {copy.home.explore}
              </button>
              <button className="btn btn--light btn--large" onClick={() => navigate('/about')}>
                {copy.home.about}
              </button>
            </div>
          </div>

          <div className="hero-showcase reveal-on-load reveal-delay-1">
            <img src={publicImage('who we are Zepter-Real Estate.jpg')} alt="Zepter Real Estate portfolio" />
            <div className="hero-stat hero-stat--top">
              <strong>380.000+</strong>
              <span>{copy.home.statPortfolio}</span>
            </div>
            <div className="hero-stat hero-stat--bottom">
              <strong>{copy.home.statSince}</strong>
              <span>{copy.home.statSinceText}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section intro-section">
        <div className="container split-intro">
          <div>
            <span className="eyebrow">{copy.home.introEyebrow}</span>
            <h2>{copy.home.introTitle}</h2>
          </div>
          <p>{copy.home.introText}</p>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container section-heading-row">
          <div>
            <span className="eyebrow">{copy.home.featuredEyebrow}</span>
            <h2>{copy.home.featuredTitle}</h2>
          </div>
          <button className="btn btn--ghost" onClick={() => navigate('/commercial')}>
            {copy.home.viewAll}
          </button>
        </div>

        <div className="container property-grid property-grid--featured">
          {loading ? (
            <LoadingState text={copy.home.loadingFeatured} />
          ) : (
            properties.map((property) => <PropertyCard key={property._id} property={property} navigate={navigate} language={language} />)
          )}
        </div>
      </section>

      <section className="section services-section">
        <div className="container services-grid">
          <div className="service-card service-card--large">
            <span className="eyebrow">{copy.home.servicesEyebrow}</span>
            <h2>{copy.home.servicesTitle}</h2>
            <p>{copy.home.servicesText}</p>
          </div>
          <div className="service-card">
            <h3>{copy.home.commercialSpaces}</h3>
            <p>{copy.home.commercialSpacesText}</p>
          </div>
          <div className="service-card">
            <h3>{copy.home.portfolioManagement}</h3>
            <p>{copy.home.portfolioManagementText}</p>
          </div>
          <div className="service-card">
            <h3>{copy.home.clientRelationships}</h3>
            <p>{copy.home.clientRelationshipsText}</p>
          </div>
        </div>
      </section>

      <NewsletterBlock language={language} />
    </main>
  );
};

export default HomePage;
