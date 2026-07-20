import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getCopy } from '../data/localization';
import type { Property, SupportedLanguage } from '../types/property';
import { getMainImage } from '../utils/asset';
import { getAvailableAreaLabel } from '../utils/propertyArea';

interface PropertiesMapProps {
  properties: Property[];
  activePropertyId: string | null;
  language: SupportedLanguage;
  navigate: (path: string) => void;
  onActivate: (propertyId: string, revealCard?: boolean) => void;
}

const DEFAULT_CENTER: [number, number] = [44.8125, 20.4612];

const hasValidCoordinates = (property: Property) => {
  const latitude = property.location.latitude;
  const longitude = property.location.longitude;

  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const MapViewport = ({ properties }: { properties: Property[] }) => {
  const map = useMap();

  useEffect(() => {
    const positions = properties
      .filter(hasValidCoordinates)
      .map((property) => [property.location.latitude!, property.location.longitude!] as [number, number]);

    if (positions.length === 0) {
      map.setView(DEFAULT_CENTER, 7, { animate: true });
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 14, { animate: true });
      return;
    }

    map.fitBounds(L.latLngBounds(positions), {
      animate: true,
      maxZoom: 14,
      padding: [48, 48],
    });
  }, [map, properties]);

  return null;
};

interface PropertyMarkerProps extends Omit<PropertiesMapProps, 'properties'> {
  property: Property;
}

const PropertyMarker = ({ property, activePropertyId, language, navigate, onActivate }: PropertyMarkerProps) => {
  const markerRef = useRef<L.CircleMarker | null>(null);
  const copy = getCopy(language);
  const active = activePropertyId === property._id;
  const mainImage = getMainImage(property);
  const location = [property.location.city, property.location.municipality].filter(Boolean).join(', ');

  useEffect(() => {
    if (active) markerRef.current?.openPopup();
    else markerRef.current?.closePopup();
  }, [active]);

  return (
    <CircleMarker
      ref={markerRef}
      center={[property.location.latitude!, property.location.longitude!]}
      radius={active ? 13 : 9}
      pathOptions={{
        color: active ? '#ffffff' : '#1f2d4d',
        weight: active ? 4 : 3,
        fillColor: active ? '#b8913f' : '#1f2d4d',
        fillOpacity: 1,
      }}
      eventHandlers={{
        mouseover: () => onActivate(property._id),
        click: () => onActivate(property._id, true),
      }}
    >
      <Popup className="property-map-popup" minWidth={235} maxWidth={260} closeButton>
        <button
          className="property-map-popup__button"
          type="button"
          onClick={() => navigate(`/properties/${property.publicId}`)}
        >
          {mainImage && <img src={mainImage} alt="" />}
          <span className="property-map-popup__content">
            <strong>{property.title}</strong>
            {location && <small>{location}</small>}
            <span>{copy.card.availableArea}: {getAvailableAreaLabel(property, copy.card.onRequest, language)}</span>
          </span>
        </button>
      </Popup>
    </CircleMarker>
  );
};

const PropertiesMap = (props: PropertiesMapProps) => {
  const copy = getCopy(props.language);
  const mappedProperties = props.properties.filter(hasValidCoordinates);

  return (
    <div className="properties-map" aria-label={copy.properties.mapTitle}>
      <MapContainer center={DEFAULT_CENTER} zoom={7} scrollWheelZoom className="properties-map__canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport properties={props.properties} />
        {mappedProperties.map((property) => (
          <PropertyMarker key={property._id} property={property} {...props} />
        ))}
      </MapContainer>

      {mappedProperties.length === 0 && (
        <div className="properties-map__empty">
          <strong>{copy.properties.noMapMarkers}</strong>
          <span>{copy.properties.noMapMarkersText}</span>
        </div>
      )}
    </div>
  );
};

export default PropertiesMap;
