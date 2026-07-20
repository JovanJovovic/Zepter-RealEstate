import { useState } from 'react';
import { getCopy } from '../data/localization';
import {
  getCategoryLabels,
  getConditionOptions,
  getPropertyTypeOptions,
} from '../data/propertyOptions';
import type { Property, SupportedLanguage } from '../types/property';
import { getAvailableAreaLabel, getOccupancyPercentage, getTotalAreaLabel } from '../utils/propertyArea';
import { getPropertyListingType } from '../utils/propertyListingType';
import PropertyFactsList from './PropertyFactsList';

interface PropertyInformationTabsProps {
  property: Property;
  language: SupportedLanguage;
}

type PropertyInformationTab = 'description' | 'address' | 'overview' | 'details' | 'characteristics';

interface InformationRow {
  label: string;
  value: string;
}

const getLabel = (value: string, options: Array<{ value: string; label: string }>) => {
  return options.find((option) => option.value === value)?.label || value;
};

const InformationGrid = ({ rows }: { rows: InformationRow[] }) => (
  <dl className="property-information-grid">
    {rows.map((row) => (
      <div key={row.label}>
        <dt>{row.label}</dt>
        <dd>{row.value}</dd>
      </div>
    ))}
  </dl>
);

const PropertyInformationTabs = ({ property, language }: PropertyInformationTabsProps) => {
  const [activeTab, setActiveTab] = useState<PropertyInformationTab>('description');
  const copy = getCopy(language);
  const detailsCopy = copy.details;
  const conditionOptions = getConditionOptions(language);
  const propertyTypeOptions = getPropertyTypeOptions(language);
  const categoryLabels = getCategoryLabels(language);
  const typeLabels = property.types.map((type) => getLabel(type, propertyTypeOptions));
  const transactionLabel = getPropertyListingType(property) === 'sale' ? copy.card.sale : copy.card.rent;
  const description = property.fullDescription || property.aboutProperty || property.shortDescription;
  const hasCoordinates =
    typeof property.location.latitude === 'number' &&
    typeof property.location.longitude === 'number';
  const isParkingAvailable = property.specialRequirements.includes('parking');

  const addressRows: InformationRow[] = [
    property.location.country ? { label: detailsCopy.country, value: property.location.country } : null,
    property.location.city ? { label: detailsCopy.city, value: property.location.city } : null,
    property.location.municipality
      ? { label: detailsCopy.municipality, value: property.location.municipality }
      : null,
    property.location.address ? { label: detailsCopy.address, value: property.location.address } : null,
    property.location.fullLocation
      ? { label: detailsCopy.fullLocation, value: property.location.fullLocation }
      : null,
    hasCoordinates
      ? {
          label: detailsCopy.coordinates,
          value: `${property.location.latitude!.toFixed(6)}, ${property.location.longitude!.toFixed(6)}`,
        }
      : null,
  ].filter((row): row is InformationRow => Boolean(row));

  const overviewRows: InformationRow[] = [
    { label: detailsCopy.totalArea, value: getTotalAreaLabel(property, detailsCopy.onRequest, language) },
    { label: detailsCopy.availableArea, value: getAvailableAreaLabel(property, detailsCopy.onRequest, language) },
    { label: detailsCopy.occupancy, value: `${getOccupancyPercentage(property)}%` },
    { label: detailsCopy.transactionType, value: transactionLabel },
    typeLabels.length ? { label: detailsCopy.propertyTypes, value: typeLabels.join(' / ') } : null,
    { label: detailsCopy.category, value: categoryLabels[property.category] },
  ].filter((row): row is InformationRow => Boolean(row));

  const detailRows: InformationRow[] = [
    property.floorLabel ? { label: detailsCopy.floorLabel, value: property.floorLabel } : null,
    property.floors?.length ? { label: detailsCopy.floors, value: property.floors.join(', ') } : null,
    property.rooms ? { label: detailsCopy.rooms, value: property.rooms } : null,
    property.condition
      ? { label: detailsCopy.condition, value: getLabel(property.condition, conditionOptions) }
      : null,
    property.sizeLabel ? { label: detailsCopy.size, value: property.sizeLabel } : null,
    isParkingAvailable ? { label: detailsCopy.parking, value: detailsCopy.yes } : null,
  ].filter((row): row is InformationRow => Boolean(row));

  const tabs: Array<{ key: PropertyInformationTab; label: string }> = [
    { key: 'description', label: detailsCopy.tabDescription },
    { key: 'address', label: detailsCopy.tabAddress },
    { key: 'overview', label: detailsCopy.tabOverview },
    { key: 'details', label: detailsCopy.tabDetails },
    { key: 'characteristics', label: detailsCopy.tabCharacteristics },
  ];

  return (
    <section className="property-information-panel" aria-label={detailsCopy.informationTitle}>
      <div className="property-information-tabs" role="tablist" aria-label={detailsCopy.informationTitle}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`property-tab-${tab.key}`}
            className={activeTab === tab.key ? 'property-information-tab property-information-tab--active' : 'property-information-tab'}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`property-panel-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`property-panel-${activeTab}`}
        className="property-information-content"
        role="tabpanel"
        aria-labelledby={`property-tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTab === 'description' && (
          description
            ? <p className="property-information-description">{description}</p>
            : <p className="property-information-empty">{detailsCopy.informationUnavailable}</p>
        )}
        {activeTab === 'address' && (
          addressRows.length
            ? <InformationGrid rows={addressRows} />
            : <p className="property-information-empty">{detailsCopy.informationUnavailable}</p>
        )}
        {activeTab === 'overview' && <InformationGrid rows={overviewRows} />}
        {activeTab === 'details' && (
          detailRows.length
            ? <InformationGrid rows={detailRows} />
            : <p className="property-information-empty">{detailsCopy.informationUnavailable}</p>
        )}
        {activeTab === 'characteristics' && (
          <PropertyFactsList
            property={property}
            language={language}
            className="property-information-grid property-characteristics-facts"
          />
        )}
      </div>
    </section>
  );
};

export default PropertyInformationTabs;
