import ServiceCard from '../components/ServiceCard';
import {
  getLocalizedService,
  getLocalizedServices,
  getServiceBySlug,
  getServicesPageCopy,
} from '../data/services';
import type { SupportedLanguage } from '../types/property';

interface ServiceDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const ServiceDetailPage = ({ slug, navigate, language }: ServiceDetailPageProps) => {
  const definition = getServiceBySlug(slug);
  const copy = getServicesPageCopy(language);

  if (!definition) {
    return (
      <main className="service-not-found-page">
        <section className="service-not-found">
          <div className="container">
            <span className="services-section-kicker">{copy.eyebrow}</span>
            <h1>{copy.notFoundTitle}</h1>
            <p>{copy.notFoundText}</p>
            <button className="service-primary-button" onClick={() => navigate('/services')}>
              {copy.backToServices}
            </button>
          </div>
        </section>
      </main>
    );
  }

  const service = getLocalizedService(definition, language);
  const moreServices = getLocalizedServices(language)
    .filter((item) => item.slug !== service.slug)
    .slice(0, 3);

  return (
    <main className="service-detail-page">
      <section className="service-detail-hero">
        <img className="service-detail-hero__image" src={service.mainImage} alt={service.title} />
        <div className="service-detail-hero__overlay" />
        <div className="container service-detail-hero__content reveal-on-load">
          <span>{copy.detailEyebrow}</span>
          <h1>{service.title}</h1>
          <p>{service.subtitle}</p>
        </div>
        <div className="service-detail-hero__curve" aria-hidden="true" />
      </section>

      <section className="service-activities-section">
        <div className="container service-detail-intro">
          <div>
            <span className="services-section-kicker">{copy.activitiesEyebrow}</span>
            <h2>{copy.activitiesTitle}</h2>
          </div>
          <p>{service.description}</p>
        </div>

        <div className="container service-activity-list">
          {service.features.map((feature, index) => (
            <article className="service-activity-row" key={feature.title}>
              <span className="service-activity-row__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="service-gallery-section">
        <div className="container service-section-heading">
          <span className="services-section-kicker">{copy.galleryEyebrow}</span>
          <h2>{copy.galleryTitle}</h2>
        </div>

        <div className="container service-gallery">
          <figure className="service-gallery__featured">
            <img src={service.galleryImages[0]} alt={`${service.title} 1`} loading="lazy" />
          </figure>
          <div className="service-gallery__grid">
            {service.galleryImages.slice(1).map((image, index) => (
              <figure key={image}>
                <img src={image} alt={`${service.title} ${index + 2}`} loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="more-services-section">
        <div className="container service-section-heading service-section-heading--center">
          <span className="services-section-kicker">Zepter Real Estate</span>
          <h2>{copy.moreServices}</h2>
        </div>
        <div className="container more-services-grid">
          {moreServices.map((item) => (
            <ServiceCard
              key={item.slug}
              service={item}
              readMoreLabel={copy.readMore}
              navigate={navigate}
              compact
            />
          ))}
        </div>
      </section>

      <section className="service-cta-section">
        <div className="container service-cta">
          <div>
            <span className="services-section-kicker">Zepter Real Estate</span>
            <h2>{copy.ctaTitle}</h2>
            <p>{copy.ctaText}</p>
          </div>
          <button className="service-primary-button" onClick={() => navigate('/contact')}>
            {copy.contact}
          </button>
        </div>
      </section>
    </main>
  );
};

export default ServiceDetailPage;
