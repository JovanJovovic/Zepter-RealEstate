import { getCopy } from '../data/localization';
import { getConditionOptions, getPropertyTypeOptions } from '../data/propertyOptions';
import type { Property, SupportedLanguage } from '../types/property';
import { getMainImage } from '../utils/asset';
import { getAvailableAreaLabel, getTotalAreaLabel } from '../utils/propertyArea';

interface ListingPropertyCardProps {
  property: Property;
  active: boolean;
  navigate: (path: string) => void;
  language: SupportedLanguage;
  onActivate: (propertyId: string) => void;
  onDeactivate: () => void;
  cardRef: (element: HTMLElement | null) => void;
}

const getLabel = (value: string, options: Array<{ value: string; label: string }>) => {
  return options.find((option) => option.value === value)?.label || value;
};

const ListingPropertyCard = ({
  property,
  active,
  navigate,
  language,
  onActivate,
  onDeactivate,
  cardRef,
}: ListingPropertyCardProps) => {
  const copy = getCopy(language);
  const mainImage = getMainImage(property);
  const propertyTypeOptions = getPropertyTypeOptions(language);
  const conditionOptions = getConditionOptions(language);
  const typeLabel = property.types.map((type) => getLabel(type, propertyTypeOptions)).join(' / ');
  const conditionLabel = getLabel(property.condition, conditionOptions);
  const availableAreaLabel = getAvailableAreaLabel(property, copy.card.onRequest, language);
  const totalAreaLabel = getTotalAreaLabel(property, copy.card.onRequest, language);
  const description =
    property.shortDescription || property.fullDescription || property.aboutProperty || copy.card.fallbackDescription;
  const location = [property.location.city, property.location.municipality].filter(Boolean).join(', ');
  const propertyPath = `/properties/${property.publicId}`;

  const openProperty = () => navigate(propertyPath);

  return (
    <article
      ref={cardRef}
      className={active ? 'listing-property-card listing-property-card--active' : 'listing-property-card'}
      role="link"
      tabIndex={0}
      onClick={openProperty}
      onFocus={() => onActivate(property._id)}
      onMouseEnter={() => onActivate(property._id)}
      onMouseLeave={onDeactivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openProperty();
        }
      }}
    >
      <div className="listing-property-card__media">
        {mainImage ? (
          <img src={mainImage} alt={property.images?.[0]?.alt || property.title} />
        ) : (
          <div className="image-fallback">ZRE</div>
        )}
        <span className="listing-property-card__badge">{conditionLabel}</span>
        {property.images.length > 0 && (
          <span className="listing-property-card__image-count">
            {property.images.length} {copy.card.images}
          </span>
        )}
      </div>

      <div className="listing-property-card__body">
        <p className="listing-property-card__type">{typeLabel}</p>
        <h2>{property.title}</h2>
        {location && <p className="listing-property-card__location">{location}</p>}
        <p className="listing-property-card__description">{description}</p>
        <div className="listing-property-card__facts">
          <span>
            <small>{copy.card.availableArea}</small>
            <strong>{availableAreaLabel}</strong>
          </span>
          <span>
            <small>{copy.card.totalArea}</small>
            <strong>{totalAreaLabel}</strong>
          </span>
        </div>
      </div>
    </article>
  );
};

export default ListingPropertyCard;
