import { useEffect, useMemo, useState } from 'react';
import { getPropertyByPublicId } from '../api/properties';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
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

const PropertyDetailsPage = ({ publicId, navigate, language }: PropertyDetailsPageProps) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError(err instanceof Error ? err.message : 'Property could not be loaded.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [publicId, language]);

  const orderedImages = useMemo(() => {
    return [...(property?.images || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [property]);

  if (loading) {
    return (
      <main className="details-page-shell">
        <LoadingState text="Loading property details..." />
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="details-page-shell">
        <EmptyState title="Property not found" text={error || 'The selected property is not available.'} actionLabel="Back to commercial" onAction={() => navigate('/commercial')} />
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

  return (
    <main>
      <section className="property-details-intro">
        <div className="property-details-intro__pattern" />
        <div className="container property-details-intro__grid">
          <div className="property-details-intro__content reveal-on-load">
            <button className="back-link back-link--dark" onClick={() => navigate('/commercial')}>
              ← Back to properties
            </button>
            <span className="eyebrow">{categoryLabels[property.category]}</span>
            <h1>{property.title}</h1>
            <p>
              {property.location.fullLocation}
              {property.location.address ? ` · ${property.location.address}` : ''}
            </p>
            <div className="details-quick-facts">
              <div>
                <span>Size</span>
                <strong>{property.sizeLabel || (property.sizeSqm ? `${property.sizeSqm.toLocaleString('en-US')} m²` : 'On request')}</strong>
              </div>
              <div>
                <span>Condition</span>
                <strong>{conditionLabel}</strong>
              </div>
              <div>
                <span>Type</span>
                <strong>{typeLabel || 'On request'}</strong>
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
                      aria-label={`Show image ${image.order || ''}`}
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
              <span className="eyebrow">About property</span>
              <h2>{property.shortDescription || property.title}</h2>
              <p>{property.aboutProperty || property.fullDescription || property.shortDescription}</p>
            </article>

            {property.fullDescription && property.fullDescription !== property.aboutProperty && (
              <article className="details-card">
                <span className="eyebrow">Description</span>
                <p>{property.fullDescription}</p>
              </article>
            )}

            {videoUrl && (
              <article className="details-card">
                <span className="eyebrow">Video presentation</span>
                <div className="video-frame">
                  <iframe src={videoUrl} title={`${property.title} video`} allowFullScreen />
                </div>
              </article>
            )}

            {property.floorPlans.length > 0 && (
              <article className="details-card">
                <span className="eyebrow">Floor plans</span>
                <div className="floor-plan-list">
                  {property.floorPlans.map((plan) => (
                    <a key={plan.fileUrl} href={resolveMediaUrl(plan.fileUrl)} target="_blank" rel="noreferrer">
                      <span>{plan.title || 'Floor plan'}</span>
                      <strong>Open PDF</strong>
                    </a>
                  ))}
                </div>
              </article>
            )}
          </div>

          <aside className="details-sidebar">
            <div className="details-sidebar__card">
              <h2>Property facts</h2>
              <dl className="facts-list">
                <div>
                  <dt>Size</dt>
                  <dd>{property.sizeLabel || (property.sizeSqm ? `${property.sizeSqm.toLocaleString('en-US')} m²` : 'On request')}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{typeLabel || 'On request'}</dd>
                </div>
                <div>
                  <dt>Condition</dt>
                  <dd>{conditionLabel}</dd>
                </div>
                {property.rooms && (
                  <div>
                    <dt>Rooms</dt>
                    <dd>{property.rooms}</dd>
                  </div>
                )}
                {property.floorLabel && (
                  <div>
                    <dt>Floors</dt>
                    <dd>{property.floorLabel}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="details-sidebar__card details-sidebar__card--blue">
              <h2>Contact</h2>
              <p>For more information about this property, contact Zepter Real Estate.</p>
              <a href={`tel:${property.contactPhone || '+381112019170'}`}>{property.contactPhone || '+381 11 20 19 170'}</a>
              <a href={`mailto:${property.contactEmail || 'realestate@zepter.rs'}`}>{property.contactEmail || 'realestate@zepter.rs'}</a>
            </div>

            {property.specialRequirements.length > 0 && (
              <div className="details-sidebar__card">
                <h2>Special requirements</h2>
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
