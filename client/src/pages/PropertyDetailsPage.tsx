import { useEffect, useMemo, useState } from 'react';
import { getProperties, getPropertyByPublicId } from '../api/properties';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PropertyCard from '../components/PropertyCard';
import PropertyFactsList from '../components/PropertyFactsList';
import PropertyInformationTabs from '../components/PropertyInformationTabs';
import PropertyInquiryForm from '../components/PropertyInquiryForm';
import { getCopy } from '../data/localization';
import { getCategoryLabels } from '../data/propertyOptions';
import type { Property, SupportedLanguage } from '../types/property';
import { getMainImage, resolveMediaUrl } from '../utils/asset';
import { getAvailableAreaLabel, getOccupancyPercentage, getTotalAreaLabel } from '../utils/propertyArea';
import { getPropertyListingType } from '../utils/propertyListingType';

interface PropertyDetailsPageProps {
  publicId: string;
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const normalizeYoutubeUrl = (url?: string) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  return url;
};

const normalizeComparisonValue = (value?: string) => value?.trim().toLocaleLowerCase() || '';

const getSimilarProperties = (currentProperty: Property, candidates: Property[]) => {
  const currentTypes = new Set(currentProperty.types);
  const currentCity = normalizeComparisonValue(currentProperty.location.city);
  const currentCountry = normalizeComparisonValue(currentProperty.location.country);
  const currentMunicipality = normalizeComparisonValue(currentProperty.location.municipality);

  return candidates
    .filter((candidate) => candidate._id !== currentProperty._id && candidate.publicId !== currentProperty.publicId)
    .map((candidate) => {
      const sharedTypes = candidate.types.filter((type) => currentTypes.has(type)).length;
      const sameCity = currentCity && normalizeComparisonValue(candidate.location.city) === currentCity;
      const sameCountry = currentCountry && normalizeComparisonValue(candidate.location.country) === currentCountry;
      const sameMunicipality =
        currentMunicipality &&
        normalizeComparisonValue(candidate.location.municipality) === currentMunicipality;

      return {
        property: candidate,
        score:
          sharedTypes * 100 +
          (sameCity ? 20 : 0) +
          (sameCountry ? 10 : 0) +
          (sameMunicipality ? 5 : 0),
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.property.isFeatured !== right.property.isFeatured) {
        return Number(right.property.isFeatured) - Number(left.property.isFeatured);
      }
      return new Date(right.property.updatedAt).getTime() - new Date(left.property.updatedAt).getTime();
    })
    .slice(0, 3)
    .map((candidate) => candidate.property);
};

const PropertyDetailsPage = ({ publicId, navigate, language }: PropertyDetailsPageProps) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
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
        setSimilarProperties([]);

        getProperties({
          category: data.category,
          language,
          page: 1,
          limit: 100,
        })
          .then((response) => {
            if (mounted) setSimilarProperties(getSimilarProperties(data, response.items));
          })
          .catch(() => {
            if (mounted) setSimilarProperties([]);
          });
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
  const transactionType = getPropertyListingType(property);
  const transactionLabel = transactionType === 'sale' ? copy.card.sale : copy.card.rent;
  const videoUrl = normalizeYoutubeUrl(property.videoUrl);
  const totalAreaLabel = getTotalAreaLabel(property, copy.details.onRequest, language);
  const availableAreaLabel = getAvailableAreaLabel(property, copy.details.onRequest, language);
  const occupancyPercentage = getOccupancyPercentage(property);
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
                <span>{copy.details.totalArea}</span>
                <strong>{totalAreaLabel}</strong>
              </div>
              <div>
                <span>{copy.details.availableArea}</span>
                <strong>{availableAreaLabel}</strong>
              </div>
              <div>
                <span>{copy.details.occupancy}</span>
                <strong>{occupancyPercentage}%</strong>
              </div>
              <div>
                <span>{copy.details.transactionType}</span>
                <strong>{transactionLabel}</strong>
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
        <div className="container property-details-content">
          <div className="details-grid">
            <div className="details-main">
              <article className="details-card details-card--lead">
                <span className="eyebrow">{copy.details.aboutProperty}</span>
                <h2>{property.shortDescription || property.title}</h2>
                <p>{property.aboutProperty || property.fullDescription || property.shortDescription}</p>
              </article>
            </div>

            <aside className="details-sidebar">
              <div className="details-sidebar__card">
                <h2>{copy.details.facts}</h2>
                <PropertyFactsList property={property} language={language} />
              </div>
            </aside>
          </div>

          <PropertyInformationTabs property={property} language={language} />

          <div className="property-detail-support">
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
                <span className="eyebrow">{copy.details.map}</span>
                <h2>{property.location.fullLocation}</h2>
                {property.location.address && <p>{property.location.address}</p>}
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
        </div>
      </section>

      <PropertyInquiryForm property={property} language={language} />

      {similarProperties.length > 0 && (
        <section className="section similar-properties-section">
          <div className="container">
            <div className="similar-properties-heading">
              <span className="eyebrow">{copy.details.similarEyebrow}</span>
              <h2>{copy.details.similarTitle}</h2>
              <p>{copy.details.similarText}</p>
            </div>
            <div className="similar-properties-grid">
              {similarProperties.map((similarProperty) => (
                <PropertyCard
                  key={similarProperty._id}
                  property={similarProperty}
                  navigate={navigate}
                  language={language}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default PropertyDetailsPage;
