import PageHero from '../components/PageHero';
import ServiceCard from '../components/ServiceCard';
import { getLocalizedServices, getServicesPageCopy } from '../data/services';
import type { SupportedLanguage } from '../types/property';

interface ServicesPageProps {
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const ServicesPage = ({ navigate, language }: ServicesPageProps) => {
  const copy = getServicesPageCopy(language);
  const serviceItems = getLocalizedServices(language);

  return (
    <main className="services-page">
      <PageHero
        compact
        eyebrow={copy.eyebrow}
        title={copy.title}
        text={copy.heroText}
        image={serviceItems[2].mainImage}
      />

      <section className="services-overview-section">
        <div className="container services-overview-intro">
          <span className="services-section-kicker">{copy.introEyebrow}</span>
          <h2>{copy.introTitle}</h2>
          <p>{copy.introText}</p>
        </div>

        <div className="container services-overview-grid">
          {serviceItems.map((service) => (
            <ServiceCard
              key={service.slug}
              service={service}
              readMoreLabel={copy.readMore}
              navigate={navigate}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;
