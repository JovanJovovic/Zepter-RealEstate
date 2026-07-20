import { getCopy } from '../data/localization';
import { getConditionOptions, getPropertyTypeOptions } from '../data/propertyOptions';
import type { Property, SupportedLanguage } from '../types/property';
import { getAvailableAreaLabel, getOccupancyPercentage, getTotalAreaLabel } from '../utils/propertyArea';
import { getPropertyListingType } from '../utils/propertyListingType';

interface PropertyFactsListProps {
  property: Property;
  language: SupportedLanguage;
  className?: string;
}

const getLabel = (value: string, options: Array<{ value: string; label: string }>) => {
  return options.find((option) => option.value === value)?.label || value;
};

const PropertyFactsList = ({ property, language, className = 'facts-list' }: PropertyFactsListProps) => {
  const copy = getCopy(language);
  const detailsCopy = copy.details;
  const conditionLabel = getLabel(property.condition, getConditionOptions(language));
  const typeLabel = property.types
    .map((type) => getLabel(type, getPropertyTypeOptions(language)))
    .join(' / ');
  const transactionLabel = getPropertyListingType(property) === 'sale' ? copy.card.sale : copy.card.rent;
  const floorsLabel = property.floorLabel || property.floors?.join(', ') || detailsCopy.onRequest;

  const facts = [
    { label: detailsCopy.totalArea, value: getTotalAreaLabel(property, detailsCopy.onRequest, language) },
    { label: detailsCopy.availableArea, value: getAvailableAreaLabel(property, detailsCopy.onRequest, language) },
    { label: detailsCopy.occupancy, value: `${getOccupancyPercentage(property)}%` },
    { label: detailsCopy.type, value: typeLabel || detailsCopy.onRequest },
    { label: detailsCopy.transactionType, value: transactionLabel },
    { label: detailsCopy.condition, value: conditionLabel || detailsCopy.onRequest },
    { label: detailsCopy.rooms, value: property.rooms || detailsCopy.onRequest },
    { label: detailsCopy.floors, value: floorsLabel },
  ];

  return (
    <dl className={className}>
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default PropertyFactsList;
