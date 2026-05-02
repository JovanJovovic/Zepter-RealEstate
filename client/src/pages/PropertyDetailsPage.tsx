import { useEffect, useMemo, useState } from 'react';
import { getPropertyByPublicId } from '../api/properties';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { getCopy } from '../data/localization';
import { getCategoryLabels, getConditionOptions, getPropertyTypeOptions, getSpecialRequirementOptions } from '../data/propertyOptions';
import type { Property, SupportedLanguage } from '../types/property';
import { getMainImage, resolveMediaUrl } from '../utils/asset';

interface PropertyDetailsPageProps {
  publicId: string;
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const getLabel = (value: string, options: Array<{ value: string; label: string }>) => {
  return options.find((option) => option.value === value)?.label || value;
};

const normalizeYoutubeUrl = (url?: string) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  return url;
};

const formatSize = (property: Property, fallback: string) => {
  return property.sizeLabel || (property.sizeSqm ? `${property.sizeSqm.toLocaleString('en-US')} m²` : fallback);
};

const PropertyDetailsPage = ({ publicId, navigate, language }: PropertyDetailsPageProps) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const copy = getCopy(language);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    getPropertyByPublicId(publicId, language)
      .then((data) => {
        if (!mounted) return;
        setProperty(data);
        setActiveImage(getMainImage(data));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : copy.details.notLoaded);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [copy.details.notLoaded, publicId, language]);

  const orderedImages = useMemo(() => {
    return [...(property?.images || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [property]);

  if (loading) {
    return (
      <main className="details-page-shell">
        <LoadingState text={copy.details.loading} />
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="details-page-shell">
        <EmptyState
          title={copy.details.notFoundTitle}
          text={error || copy.details.notFoundText}
          actionLabel={copy.details.backToCommercial}
          onAction={() => navigate('/commercial')}
        />
      </main>
    );
  }

  const categoryLabels = getCategoryLabels(language);
  const conditionOptions = getConditionOptions(language);
  const propertyTypeOptions = getPropertyTypeOptions(language);
  const specialRequirementOptions = getSpecialRequirementOptions(language);
  const conditionLabel = getLabel(property.condition, conditionOptions);
  const typeLabel = property.types.map((type) => getLabel(type, propertyTypeOptions)).join(' / ');
  const videoUrl = normalizeYoutubeUrl(property.videoUrl);
  const sizeLabel = formatSize(property, copy.details.onRequest);
  const hasMapCoordinates =
    typeof property.location.latitude === 'number' &&
    typeof property.location.longitude === 'number';

  const mapQuery = hasMapCoordinates
    ? `${property.location.latitude},${property.location.longitude}`
    : property.location.address || property.location.fullLocation;

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  return (
    <main>
      <section className="property-details-intro">
        <div className="property-details-intro__pattern" />
        <div className="container property-details-intro__grid">
          <div className="property-details-intro__content reveal-on-load">
            <button className="back-link back-link--dark" onClick={() => navigate('/commercial')}>
              ← {copy.details.backToProperties}
            </button>
            <span className="eyebrow">{categoryLabels[property.category]}</span>
            <h1>{property.title}</h1>
            <p>
              {property.location.fullLocation}
              {property.location.address ? ` · ${property.location.address}` : ''}
            </p>
            <div className="details-quick-facts">
              <div>
                <span>{copy.details.size}</span>
                <strong>{sizeLabel}</strong>
              </div>
              <div>
                <span>{copy.details.condition}</span>
                <strong>{conditionLabel}</strong>
              </div>
              <div>
                <span>{copy.details.type}</span>
                <strong>{typeLabel || copy.details.onRequest}</strong>
              </div>
            </div>
          </div>

          <div className="property-gallery-card reveal-on-load reveal-delay-1">
            <div className="property-gallery-card__image">
              {activeImage ? <img src={activeImage} alt={property.title} /> : <div className="image-fallback">ZRE</div>}
            </div>

            {orderedImages.length > 1 && (
              <div className="property-gallery-card__thumbs">
                {orderedImages.map((image) => {
                  const fullImageUrl = resolveMediaUrl(image.url);
                  const imageUrl = resolveMediaUrl(image.thumbnailUrl || image.url);
                  return (
                    <button
                      key={`${image.url}-${image.order}`}
                      className={activeImage === fullImageUrl ? 'thumbnail thumbnail--active' : 'thumbnail'}
                      onClick={() => setActiveImage(fullImageUrl)}
                      aria-label={`${copy.details.showImage} ${image.order || ''}`}
                    >
                      <img src={imageUrl} alt={image.alt || property.title} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section property-details-section">
        <div className="container details-grid">
          <div className="details-main">
            <article className="details-card details-card--lead">
              <span className="eyebrow">{copy.details.aboutProperty}</span>
              <h2>{property.shortDescription || property.title}</h2>
              <p>{property.aboutProperty || property.fullDescription || property.shortDescription}</p>
            </article>

            {property.fullDescription && property.fullDescription !== property.aboutProperty && (
              <article className="details-card">
                <span className="eyebrow">{copy.details.description}</span>
                <p>{property.fullDescription}</p>
              </article>
            )}

            {videoUrl && (
              <article className="details-card">
                <span className="eyebrow">{copy.details.video}</span>
                <div className="video-frame">
                  <iframe src={videoUrl} title={`${property.title} video`} allowFullScreen />
                </div>
              </article>
            )}

            {property.floorPlans.length > 0 && (
              <article className="details-card">
                <span className="eyebrow">{copy.details.floorPlans}</span>
                <div className="floor-plan-list">
                  {property.floorPlans.map((plan) => (
                    <a key={plan.fileUrl} href={resolveMediaUrl(plan.fileUrl)} target="_blank" rel="noreferrer">
                      <span>{plan.title || copy.details.floorPlan}</span>
                      <strong>{copy.details.openPdf}</strong>
                    </a>
                  ))}
                </div>
              </article>
            )}
            {mapQuery && (
              <article className="details-card details-card--map">
                <span className="eyebrow">{copy.details.map || 'Location'}</span>
                <h2>{property.location.fullLocation}</h2>

                {property.location.address && (
                  <p>{property.location.address}</p>
                )}

                <div className="property-map-frame">
                  <iframe
                    title={`${property.title} map`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapSrc}
                  />
                </div>
              </article>
            )}


          </div>

          <aside className="details-sidebar">
            <div className="details-sidebar__card">
              <h2>{copy.details.facts}</h2>
              <dl className="facts-list">
                <div>
                  <dt>{copy.details.size}</dt>
                  <dd>{sizeLabel}</dd>
                </div>
                <div>
                  <dt>{copy.details.type}</dt>
                  <dd>{typeLabel || copy.details.onRequest}</dd>
                </div>
                <div>
                  <dt>{copy.details.condition}</dt>
                  <dd>{conditionLabel}</dd>
                </div>
                {property.rooms && (
                  <div>
                    <dt>{copy.details.rooms}</dt>
                    <dd>{property.rooms}</dd>
                  </div>
                )}
                {property.floorLabel && (
                  <div>
                    <dt>{copy.details.floors}</dt>
                    <dd>{property.floorLabel}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="details-sidebar__card details-sidebar__card--blue">
              <h2>{copy.details.contact}</h2>
              <p>{copy.details.contactText}</p>
              <a href={`tel:${property.contactPhone || '+381112019170'}`}>{property.contactPhone || '+381 11 20 19 170'}</a>
              <a href={`mailto:${property.contactEmail || 'realestate@zepter.rs'}`}>{property.contactEmail || 'realestate@zepter.rs'}</a>
            </div>

            {property.specialRequirements.length > 0 && (
              <div className="details-sidebar__card">
                <h2>{copy.details.specialRequirements}</h2>
                <div className="details-tags">
                  {property.specialRequirements.map((requirement) => (
                    <span key={requirement}>{getLabel(requirement, specialRequirementOptions)}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
};

export default PropertyDetailsPage;
