import { useEffect, useState } from 'react';
import { getFeaturedProperties } from '../api/properties';
import NewsletterBlock from '../components/NewsletterBlock';
import PropertyCard from '../components/PropertyCard';
import LoadingState from '../components/LoadingState';
import type { Property } from '../types/property';
import { publicImage } from '../utils/asset';

interface HomePageProps {
  navigate: (path: string) => void;
}

const HomePage = ({ navigate }: HomePageProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getFeaturedProperties()
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
  }, []);

  return (
    <main>
      <section className="home-hero">
        <div className="home-hero__bg" />
        <div className="container home-hero__grid">
          <div className="home-hero__content reveal-on-load">
            <span className="eyebrow eyebrow--light">Welcome to Zepter Real Estate</span>
            <h1>Regional real estate portfolio with a premium business standard.</h1>
            <p>
              We strive to bring benefit to both parties through rewarding and efficient transactions, and to ensure future
              cooperation and long-term relationships with clients.
            </p>
            <div className="hero-actions">
              <button className="btn btn--primary btn--large" onClick={() => navigate('/commercial')}>
                Explore properties
              </button>
              <button className="btn btn--light btn--large" onClick={() => navigate('/about')}>
                About ZRE
              </button>
            </div>
          </div>

          <div className="hero-showcase reveal-on-load reveal-delay-1">
            <img src={publicImage('who we are Zepter-Real Estate.jpg')} alt="Zepter Real Estate portfolio" />
            <div className="hero-stat hero-stat--top">
              <strong>380.000+</strong>
              <span>sqm portfolio</span>
            </div>
            <div className="hero-stat hero-stat--bottom">
              <strong>Since 2008</strong>
              <span>ownership, management and development</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section intro-section">
        <div className="container split-intro">
          <div>
            <span className="eyebrow">Real estate · Real deal</span>
            <h2>One of the largest real estate portfolios in Serbia.</h2>
          </div>
          <p>
            Zepter Real Estate owns, manages and develops residential, retail, commercial, office, industrial and mixed-use
            properties. Our work is focused on activating property potential through rent, sale and long-term portfolio value.
          </p>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container section-heading-row">
          <div>
            <span className="eyebrow">Featured portfolio</span>
            <h2>Selected properties</h2>
          </div>
          <button className="btn btn--ghost" onClick={() => navigate('/commercial')}>
            View all properties
          </button>
        </div>

        <div className="container property-grid property-grid--featured">
          {loading ? (
            <LoadingState text="Loading featured properties..." />
          ) : (
            properties.map((property) => <PropertyCard key={property._id} property={property} navigate={navigate} />)
          )}
        </div>
      </section>

      <section className="section services-section">
        <div className="container services-grid">
          <div className="service-card service-card--large">
            <span className="eyebrow">What we do</span>
            <h2>We manage, develop and activate valuable real estate assets.</h2>
            <p>
              Our team provides professional, informative, loyal and dedicated service on the market, with a long-term view of
              client relationships and portfolio development.
            </p>
          </div>
          <div className="service-card">
            <h3>Commercial spaces</h3>
            <p>Offices, retail spaces, warehouses, industrial properties and mixed-use locations.</p>
          </div>
          <div className="service-card">
            <h3>Portfolio management</h3>
            <p>Assessment of property potential, activation through rent and sale, and long-term asset care.</p>
          </div>
          <div className="service-card">
            <h3>Client relationships</h3>
            <p>Efficient transactions, client satisfaction and reliable cooperation from start to finish.</p>
          </div>
        </div>
      </section>

      <NewsletterBlock />
    </main>
  );
};

export default HomePage;
