import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  getPropertyOfferById,
  updatePropertyOfferInternalNote,
  updatePropertyOfferStatus,
} from '../../api/admin';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import LoadingState from '../../components/LoadingState';
import { getCopy } from '../../data/localization';
import { getPropertyTypeOptions } from '../../data/propertyOptions';
import type {
  AdminMessage,
  PropertyOffer,
  PropertyOfferFile,
  PropertyOfferStatus,
} from '../../types/admin';
import type { SupportedLanguage } from '../../types/property';
import { resolveMediaUrl } from '../../utils/asset';

interface AdminPropertyOfferDetailsPageProps {
  offerId: string;
  language: SupportedLanguage;
  navigate: (path: string) => void;
}

const formatArea = (value: number | null | undefined, language: SupportedLanguage, fallback: string) => {
  if (value === undefined || value === null) return fallback;
  return `${value.toLocaleString(language === 'sr' ? 'sr-RS' : 'en-US')} m²`;
};

const formatPrice = (offer: PropertyOffer, language: SupportedLanguage, fallback: string) => {
  if (offer.proposedPrice === undefined || offer.proposedPrice === null) return fallback;
  return `${offer.proposedPrice.toLocaleString(language === 'sr' ? 'sr-RS' : 'en-US')} ${offer.currency || 'EUR'}`;
};

const formatFileSize = (size: number) => {
  if (!Number.isFinite(size)) return '';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const DetailField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="admin-offer-detail-field">
    <span>{label}</span>
    <strong>{children}</strong>
  </div>
);

const ImageGallery = ({
  files,
  emptyText,
  openLabel,
}: {
  files: PropertyOfferFile[];
  emptyText: string;
  openLabel: string;
}) => {
  if (!files.length) return <p className="admin-offer-empty-files">{emptyText}</p>;

  return (
    <div className="admin-offer-image-gallery">
      {files.map((file) => (
        <a
          className="admin-offer-image-card"
          href={resolveMediaUrl(file.url)}
          target="_blank"
          rel="noreferrer"
          key={`${file.filename}-${file.uploadedAt}`}
        >
          <img src={resolveMediaUrl(file.url)} alt={file.originalName} />
          <span>{file.originalName}</span>
          <small>{openLabel}</small>
        </a>
      ))}
    </div>
  );
};

const FileCards = ({
  files,
  emptyText,
  openLabel,
}: {
  files: PropertyOfferFile[];
  emptyText: string;
  openLabel: string;
}) => {
  if (!files.length) return <p className="admin-offer-empty-files">{emptyText}</p>;

  return (
    <div className="admin-offer-document-grid">
      {files.map((file) => (
        <a
          className="admin-offer-document-card"
          href={resolveMediaUrl(file.url)}
          target="_blank"
          rel="noreferrer"
          key={`${file.filename}-${file.uploadedAt}`}
        >
          <span className="admin-offer-document-card__icon">
            {file.mimeType.includes('pdf') ? 'PDF' : 'FILE'}
          </span>
          <span className="admin-offer-document-card__name">{file.originalName}</span>
          <small>{[file.mimeType, formatFileSize(file.size)].filter(Boolean).join(' · ')}</small>
          <strong>{openLabel}</strong>
        </a>
      ))}
    </div>
  );
};

const AdminPropertyOfferDetailsPage = ({ offerId, language, navigate }: AdminPropertyOfferDetailsPageProps) => {
  const [offer, setOffer] = useState<PropertyOffer | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AdminMessage | null>(null);
  const copy = getCopy(language).admin;
  const offerCopy = copy.propertyOffers;
  const labels = language === 'sr'
    ? {
        back: 'Nazad na ponude',
        firstName: 'Ime',
        lastName: 'Prezime',
        email: 'Email',
        phone: 'Telefon',
        propertyType: 'Tip nekretnine',
        city: 'Grad',
        municipality: 'Opština',
        address: 'Adresa',
        fullLocation: 'Puna lokacija',
        area: 'Površina',
        proposedPrice: 'Predložena cena',
        currency: 'Valuta',
        description: 'Opis',
        submittedAt: 'Poslato',
        updatedAt: 'Ažurirano',
      }
    : {
        back: 'Back to offers',
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        phone: 'Phone',
        propertyType: 'Property type',
        city: 'City',
        municipality: 'Municipality',
        address: 'Address',
        fullLocation: 'Full location',
        area: 'Area',
        proposedPrice: 'Proposed price',
        currency: 'Currency',
        description: 'Description',
        submittedAt: 'Submitted',
        updatedAt: 'Updated',
      };
  const statusOptions: Array<{ value: PropertyOfferStatus; label: string }> = [
    { value: 'new', label: offerCopy.statusNew },
    { value: 'reviewed', label: offerCopy.statusReviewed },
    { value: 'contacted', label: offerCopy.statusContacted },
    { value: 'accepted', label: offerCopy.statusAccepted },
    { value: 'rejected', label: offerCopy.statusRejected },
  ];
  const propertyTypeOptions = useMemo(() => getPropertyTypeOptions(language), [language]);
  const propertyTypeLabels = useMemo(
    () => Object.fromEntries(propertyTypeOptions.map((option) => [option.value, option.label])),
    [propertyTypeOptions]
  );

  useEffect(() => {
    setLoading(true);
    setMessage(null);

    getPropertyOfferById(offerId)
      .then((response) => {
        setOffer(response);
        setNoteDraft(response.internalNote || '');
      })
      .catch((error) => {
        setMessage({ type: 'error', text: error instanceof Error ? error.message : offerCopy.loadFailed });
        setOffer(null);
      })
      .finally(() => setLoading(false));
  }, [offerId, offerCopy.loadFailed]);

  const changeStatus = async (status: PropertyOfferStatus) => {
    if (!offer) return;

    try {
      await updatePropertyOfferStatus(offer._id, status);
      setOffer((current) => (current ? { ...current, status } : current));
      setMessage({ type: 'success', text: offerCopy.statusUpdated });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : offerCopy.statusFailed });
    }
  };

  const saveNote = async () => {
    if (!offer) return;

    try {
      await updatePropertyOfferInternalNote(offer._id, noteDraft);
      setOffer((current) => (current ? { ...current, internalNote: noteDraft } : current));
      setMessage({ type: 'success', text: offerCopy.noteUpdated });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : offerCopy.noteFailed });
    }
  };

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString(language === 'sr' ? 'sr-RS' : 'en-GB');
  };

  if (loading) {
    return (
      <div className="admin-page">
        <LoadingState text={offerCopy.loading} />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="admin-page">
        <AdminNotice message={message} />
        <button className="admin-secondary-action" onClick={() => navigate('/admin/property-offers')}>
          {labels.back}
        </button>
      </div>
    );
  }

  const fullName = `${offer.firstName} ${offer.lastName}`.trim();
  const selectedLocation = [offer.city, offer.municipality, offer.address || offer.fullLocation].filter(Boolean).join(', ');

  return (
    <div className="admin-page admin-offer-detail-page">
      <section className="admin-offer-detail-hero">
        <button className="admin-secondary-action" onClick={() => navigate('/admin/property-offers')}>
          {labels.back}
        </button>
        <div>
          <span className="admin-kicker">{offerCopy.details}</span>
          <h2>{offerCopy.details}</h2>
          <p>{fullName || copy.common.notSet}</p>
        </div>
        <div className="admin-offer-detail-hero__meta">
          <AdminStatusBadge value={offer.status} language={language} />
          <select value={offer.status} onChange={(event) => changeStatus(event.target.value as PropertyOfferStatus)}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span>{formatDateTime(offer.createdAt)}</span>
        </div>
      </section>

      <AdminNotice message={message} />

      <section className="admin-offer-detail-layout">
        <article className="admin-offer-detail-card">
          <h3>{offerCopy.contactInformation}</h3>
          <div className="admin-offer-detail-fields">
            <DetailField label={labels.firstName}>{offer.firstName || copy.common.notSet}</DetailField>
            <DetailField label={labels.lastName}>{offer.lastName || copy.common.notSet}</DetailField>
            <DetailField label={labels.email}>
              {offer.email ? <a href={`mailto:${offer.email}`}>{offer.email}</a> : copy.common.notSet}
            </DetailField>
            <DetailField label={labels.phone}>
              {offer.phone ? <a href={`tel:${offer.phone}`}>{offer.phone}</a> : copy.common.notSet}
            </DetailField>
          </div>
        </article>

        <article className="admin-offer-detail-card">
          <h3>{offerCopy.propertyInformation}</h3>
          <div className="admin-offer-detail-fields">
            <DetailField label={labels.propertyType}>{propertyTypeLabels[offer.propertyType] || offer.propertyType}</DetailField>
            <DetailField label={labels.city}>{offer.city || copy.common.notSet}</DetailField>
            <DetailField label={labels.municipality}>{offer.municipality || copy.common.notSet}</DetailField>
            <DetailField label={labels.address}>{offer.address || copy.common.notSet}</DetailField>
            <DetailField label={labels.fullLocation}>{offer.fullLocation || selectedLocation || copy.common.notSet}</DetailField>
            <DetailField label={labels.area}>{formatArea(offer.area, language, copy.common.notSet)}</DetailField>
          </div>
        </article>

        <article className="admin-offer-detail-card admin-offer-detail-card--wide">
          <h3>{offerCopy.priceAndDescription}</h3>
          <div className="admin-offer-detail-fields admin-offer-detail-fields--price">
            <DetailField label={labels.proposedPrice}>{formatPrice(offer, language, copy.common.notSet)}</DetailField>
            <DetailField label={labels.currency}>{offer.currency || copy.common.notSet}</DetailField>
            <DetailField label={labels.submittedAt}>{formatDateTime(offer.createdAt)}</DetailField>
            <DetailField label={labels.updatedAt}>{formatDateTime(offer.updatedAt)}</DetailField>
          </div>
          <div className="admin-offer-description">
            <span>{labels.description}</span>
            <p>{offer.description || copy.common.notSet}</p>
          </div>
        </article>

        <article className="admin-offer-detail-card admin-offer-detail-card--wide">
          <h3>{offerCopy.images}</h3>
          <ImageGallery files={offer.images} emptyText={offerCopy.noFiles} openLabel={offerCopy.openFile} />
        </article>

        <article className="admin-offer-detail-card">
          <h3>{offerCopy.floorPlans}</h3>
          <FileCards files={offer.floorPlans} emptyText={offerCopy.noFiles} openLabel={offerCopy.openFile} />
        </article>

        <article className="admin-offer-detail-card">
          <h3>{offerCopy.documents}</h3>
          <FileCards files={offer.documents} emptyText={offerCopy.noFiles} openLabel={offerCopy.openFile} />
        </article>

        <article className="admin-offer-detail-card admin-offer-detail-card--wide">
          <h3>{offerCopy.internalNote}</h3>
          <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={6} />
          <button className="admin-primary-action" onClick={saveNote}>{offerCopy.saveNote}</button>
        </article>
      </section>
    </div>
  );
};

export default AdminPropertyOfferDetailsPage;
