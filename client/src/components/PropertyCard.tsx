import type { Property } from '../types/property';
import { categoryLabels, conditionOptions, propertyTypeOptions } from '../data/propertyOptions';
import { getMainImage } from '../utils/asset';

interface PropertyCardProps {
  property: Property;
  navigate: (path: string) => void;
}

const getLabel = (value: string, options: Array<{ value: string; label: string }>) => {
  return options.find((option) => option.value === value)?.label || value;
};

const PropertyCard = ({ property, navigate }: PropertyCardProps) => {
  const mainImage = getMainImage(property);
  const typeLabel = property.types.map((type) => getLabel(type, propertyTypeOptions)).join(' / ');
  const conditionLabel = getLabel(property.condition, conditionOptions);

  return (
    <article className="property-card">
      <button className="property-card__media" onClick={() => navigate(`/properties/${property.publicId}`)}>
        {mainImage ? <img src={mainImage} alt={property.images?.[0]?.alt || property.title} /> : <div className="image-fallback">ZRE</div>}
        {property.isFeatured && <span className="property-badge">Featured</span>}
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
          {property.shortDescription || property.fullDescription || property.aboutProperty || 'Property details are available on request.'}
        </p>

        <div className="property-card__facts">
          <span>{property.sizeLabel || (property.sizeSqm ? `${property.sizeSqm.toLocaleString('en-US')} m²` : 'On request')}</span>
          <span>{conditionLabel}</span>
          {property.rooms && <span>{property.rooms} rooms</span>}
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
