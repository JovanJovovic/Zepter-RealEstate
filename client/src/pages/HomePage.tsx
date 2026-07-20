import { useEffect, useState } from 'react';
import { getFeaturedProperties } from '../api/properties';
import LoadingState from '../components/LoadingState';
import NewsletterBlock from '../components/NewsletterBlock';
import PropertyCard from '../components/PropertyCard';
import ServiceCard from '../components/ServiceCard';
import { getCopy } from '../data/localization';
import { getLocalizedServices, getServicesPageCopy } from '../data/services';
import type { Property, SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface HomePageProps {
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const homeImages = {
  hero: publicImage('what we do Zepter Real Estate.jpg'),
  about: publicImage('portfolio Zepter Real Estate.jpg'),
};

const HomePage = ({ navigate, language }: HomePageProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const copy = getCopy(language);
  const serviceCards = getLocalizedServices(language);
  const servicesCopy = getServicesPageCopy(language);

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
    <main className="home-page">
      <section className="home-hero home-hero--editorial">
        <img className="home-hero__image" src={homeImages.hero} alt={copy.home.heroImageAlt} />
        <div className="home-hero__overlay" />
        <div className="container home-hero__center reveal-on-load">
          <h1>{copy.home.heroTitle}</h1>
          <p>{copy.home.heroSubtitle}</p>
          <div className="hero-actions">
            <button className="btn btn--primary btn--large" onClick={() => navigate('/contact')}>
              {copy.home.heroPrimaryCta}
            </button>
            <button className="btn btn--light btn--large" onClick={() => navigate('/commercial')}>
              {copy.home.heroSecondaryCta}
            </button>
          </div>
        </div>
        <div className="home-hero__wave" aria-hidden="true" />
      </section>

      <section className="home-about-section" id="home-about">
        <div className="container home-about">
          <figure className="home-about__image">
            <img src={homeImages.about} alt={copy.home.aboutImageAlt} />
          </figure>
          <div className="home-about__content">
            <h2>{copy.home.aboutHeading}</h2>
            <p>{copy.home.aboutText}</p>
            <p>{copy.home.aboutTextSecond}</p>
            <button className="home-dark-button" onClick={() => navigate('/about')}>
              {copy.home.aboutCta}
            </button>
          </div>
        </div>
      </section>

      <section className="home-services-section" id="home-services">
        <div className="container home-section-heading">
          <h2>{copy.home.servicesHeading}</h2>
          <p>{copy.home.servicesIntro}</p>
        </div>

        <div className="container home-services-grid">
          {serviceCards.map((service) => (
            <ServiceCard
              key={service.slug}
              service={service}
              readMoreLabel={servicesCopy.readMore}
              navigate={navigate}
              compact
            />
          ))}
        </div>

        <div className="home-services-action">
          <button className="home-dark-button" onClick={() => navigate('/services')}>
            {servicesCopy.backToServices}
          </button>
        </div>
      </section>

      <section className="home-latest-section">
        <div className="container home-section-heading">
          <h2>{copy.home.latestHeading}</h2>
          <p>{copy.home.latestIntro}</p>
        </div>

        {loading ? (
          <LoadingState text={copy.home.loadingFeatured} />
        ) : properties.length > 0 ? (
          <div className="container property-grid home-latest-grid">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} navigate={navigate} language={language} />
            ))}
          </div>
        ) : (
          <p className="home-empty-state">{copy.home.noLatestProperties}</p>
        )}

        <div className="home-latest-action">
          <button className="home-dark-button" onClick={() => navigate('/commercial')}>
            {copy.home.latestCta}
          </button>
        </div>
      </section>

      <NewsletterBlock language={language} />
    </main>
  );
};

export default HomePage;
