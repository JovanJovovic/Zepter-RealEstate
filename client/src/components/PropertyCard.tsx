import { getCopy } from '../data/localization';
import { getCategoryLabels, getConditionOptions, getPropertyTypeOptions } from '../data/propertyOptions';
import type { Property, SupportedLanguage } from '../types/property';
import { getMainImage } from '../utils/asset';
import { getAvailableArea, getAvailableAreaLabel, getTotalAreaLabel } from '../utils/propertyArea';
import { getPropertyListingType } from '../utils/propertyListingType';

interface PropertyCardProps {
  property: Property;
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const getLabel = (value: string, options: Array<{ value: string; label: string }>) => {
  return options.find((option) => option.value === value)?.label || value;
};

const PropertyCard = ({ property, navigate, language }: PropertyCardProps) => {
  const mainImage = getMainImage(property);
  const categoryLabels = getCategoryLabels(language);
  const conditionOptions = getConditionOptions(language);
  const propertyTypeOptions = getPropertyTypeOptions(language);
  const copy = getCopy(language);
  const typeLabel = property.types.map((type) => getLabel(type, propertyTypeOptions)).join(' / ');
  const conditionLabel = getLabel(property.condition, conditionOptions);
  const transactionType = getPropertyListingType(property);
  const transactionLabel = transactionType === 'sale' ? copy.card.sale : copy.card.rent;
  const totalAreaLabel = getTotalAreaLabel(property, copy.card.onRequest, language);
  const availableAreaLabel = getAvailableAreaLabel(property, copy.card.onRequest, language);
  const shouldShowAvailableArea =
    property.occupancyPercentage !== undefined &&
    property.occupancyPercentage > 0 &&
    getAvailableArea(property) !== property.sizeSqm;

  return (
    <article className="property-card">
      <button className="property-card__media" onClick={() => navigate(`/properties/${property.publicId}`)}>
        {mainImage ? <img src={mainImage} alt={property.images?.[0]?.alt || property.title} /> : <div className="image-fallback">ZRE</div>}
        <span className="property-badge">{transactionLabel}</span>
      </button>

      <div className="property-card__body">
        <div className="property-card__meta">
          <span>{categoryLabels[property.category]}</span>
          {typeLabel && <span>{typeLabel}</span>}
        </div>

        <button className="property-card__title" onClick={() => navigate(`/properties/${property.publicId}`)}>
          {property.title}
        </button>

        <p className="property-card__location">
          {property.location.fullLocation}
          {property.location.address ? ` · ${property.location.address}` : ''}
        </p>

        <p className="property-card__description">
          {property.shortDescription || property.fullDescription || property.aboutProperty || copy.card.fallbackDescription}
        </p>

        <div className="property-card__facts">
          <span>{copy.card.totalArea}: {totalAreaLabel}</span>
          {shouldShowAvailableArea && <span>{copy.card.availableArea}: {availableAreaLabel}</span>}
          <span>{conditionLabel}</span>
          {property.rooms && <span>{property.rooms} {copy.card.rooms}</span>}
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
