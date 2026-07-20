import type { LocalizedService } from '../data/services';

interface ServiceCardProps {
  service: LocalizedService;
  readMoreLabel: string;
  navigate: (path: string) => void;
  compact?: boolean;
}

const ServiceCard = ({ service, readMoreLabel, navigate, compact = false }: ServiceCardProps) => {
  return (
    <article className={`service-preview-card ${compact ? 'service-preview-card--compact' : ''}`}>
      <button type="button" onClick={() => navigate(service.path)} aria-label={`${readMoreLabel}: ${service.title}`}>
        <span className="service-preview-card__media">
          <img src={service.mainImage} alt={service.title} loading="lazy" />
        </span>
        <span className="service-preview-card__body">
          <span className="service-preview-card__accent" aria-hidden="true" />
          <h3>{service.title}</h3>
          <p>{compact ? service.subtitle : service.description}</p>
          <span className="service-preview-card__link">{readMoreLabel}</span>
        </span>
      </button>
    </article>
  );
};

export default ServiceCard;
