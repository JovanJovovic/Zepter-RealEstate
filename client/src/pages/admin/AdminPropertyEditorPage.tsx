import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  createAdminProperty,
  getAdminPropertyById,
  updateAdminProperty,
  uploadAdminFile,
} from '../../api/admin';
import AdminNotice from '../../components/admin/AdminNotice';
import LoadingState from '../../components/LoadingState';
import { getCopy } from '../../data/localization';
import {
  getCategoryLabels,
  getConditionOptions,
  getPropertyTypeOptions,
  getSpecialRequirementOptions,
  roomOptions,
} from '../../data/propertyOptions';
import { languageOptions } from '../../data/languages';
import type { AdminMessage, AdminPropertyPayload } from '../../types/admin';
import type { FloorPlan, PropertyCategory, PropertyCondition, PropertyImage, PropertyStatus, PropertyTransactionType, PropertyTranslation, PropertyType, SupportedLanguage } from '../../types/property';
import { resolveMediaUrl } from '../../utils/asset';

interface AdminPropertyEditorPageProps {
  propertyId?: string;
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

type PropertyFormState = {
  title: string;
  slug: string;
  publicId: string;
  category: PropertyCategory;
  transactionType: PropertyTransactionType;
  status: PropertyStatus;
  isFeatured: boolean;
  types: PropertyType[];
  condition: PropertyCondition;
  rooms: string;
  sizeSqm: string;
  occupancyPercentage: string;
  sizeLabel: string;
  floorLabel: string;
  floorsText: string;
  city: string;
  municipality: string;
  fullLocation: string;
  address: string;
  latitude: string;
  longitude: string;
  shortDescription: string;
  fullDescription: string;
  aboutProperty: string;
  specialRequirements: string[];
  images: PropertyImage[];
  floorPlans: FloorPlan[];
  videoUrl: string;
  contactPhone: string;
  contactEmail: string;
  translations: TranslationFormState[];
};

type TranslationFormState = {
  language: SupportedLanguage;
  title: string;
  city: string;
  municipality: string;
  fullLocation: string;
  address: string;
  sizeLabel: string;
  floorLabel: string;
  floorsText: string;
  shortDescription: string;
  fullDescription: string;
  aboutProperty: string;
};

const defaultForm: PropertyFormState = {
  title: '',
  slug: '',
  publicId: '',
  category: 'commercial',
  transactionType: 'rent',
  status: 'draft',
  isFeatured: false,
  types: ['offices'],
  condition: 'not-specified',
  rooms: '',
  sizeSqm: '',
  occupancyPercentage: '0',
  sizeLabel: '',
  floorLabel: '',
  floorsText: '',
  city: 'Beograd',
  municipality: '',
  fullLocation: 'Beograd',
  address: '',
  latitude: '',
  longitude: '',
  shortDescription: '',
  fullDescription: '',
  aboutProperty: '',
  specialRequirements: [],
  images: [],
  floorPlans: [],
  videoUrl: '',
  contactPhone: '+381 11 20 19 170',
  contactEmail: 'realestate@zepter.rs',
  translations: [],
};

const defaultTranslation = (language: SupportedLanguage): TranslationFormState => ({
  language,
  title: '',
  city: '',
  municipality: '',
  fullLocation: '',
  address: '',
  sizeLabel: '',
  floorLabel: '',
  floorsText: '',
  shortDescription: '',
  fullDescription: '',
  aboutProperty: '',
});

const formTranslationFromProperty = (translation: PropertyTranslation): TranslationFormState => ({
  language: translation.language,
  title: translation.title || '',
  city: translation.location?.city || '',
  municipality: translation.location?.municipality || '',
  fullLocation: translation.location?.fullLocation || '',
  address: translation.location?.address || '',
  sizeLabel: translation.sizeLabel || '',
  floorLabel: translation.floorLabel || '',
  floorsText: translation.floors?.join(', ') || '',
  shortDescription: translation.shortDescription || '',
  fullDescription: translation.fullDescription || '',
  aboutProperty: translation.aboutProperty || '',
});

const formTranslationFromBaseProperty = (
  property: AdminPropertyPayload & { _id?: string; createdAt?: string; updatedAt?: string },
  language: SupportedLanguage
): TranslationFormState => ({
  language,
  title: property.title || '',
  city: property.location?.city || '',
  municipality: property.location?.municipality || '',
  fullLocation: property.location?.fullLocation || '',
  address: property.location?.address || '',
  sizeLabel: property.sizeLabel || '',
  floorLabel: property.floorLabel || '',
  floorsText: property.floors?.join(', ') || '',
  shortDescription: property.shortDescription || '',
  fullDescription: property.fullDescription || '',
  aboutProperty: property.aboutProperty || '',
});

const toStringNumber = (value?: number) => (value === undefined || value === null ? '' : String(value));

const formFromProperty = (property: AdminPropertyPayload & { _id?: string; createdAt?: string; updatedAt?: string }): PropertyFormState => {
  const translations = property.translations || [];
  const serbianTranslation = translations.find((translation) => translation.language === 'sr');
  const translationForms = translations
    .filter((translation) => translation.language !== 'sr')
    .map(formTranslationFromProperty);

  if (serbianTranslation && !translations.some((translation) => translation.language === 'en')) {
    translationForms.unshift(formTranslationFromBaseProperty(property, 'en'));
  }

  return {
    title: serbianTranslation?.title || property.title || '',
    slug: property.slug || '',
    publicId: property.publicId || '',
    category: property.category || 'commercial',
    transactionType: property.transactionType || 'rent',
    status: property.status || 'draft',
    isFeatured: Boolean(property.isFeatured),
    types: property.types || [],
    condition: property.condition || 'not-specified',
    rooms: property.rooms || '',
    sizeSqm: toStringNumber(property.sizeSqm),
    occupancyPercentage: toStringNumber(property.occupancyPercentage ?? 0),
    sizeLabel: serbianTranslation?.sizeLabel || property.sizeLabel || '',
    floorLabel: serbianTranslation?.floorLabel || property.floorLabel || '',
    floorsText: (serbianTranslation?.floors?.length ? serbianTranslation.floors : property.floors)?.join(', ') || '',
    city: serbianTranslation?.location?.city || property.location?.city || '',
    municipality: serbianTranslation?.location?.municipality || property.location?.municipality || '',
    fullLocation: serbianTranslation?.location?.fullLocation || property.location?.fullLocation || '',
    address: serbianTranslation?.location?.address || property.location?.address || '',
    latitude: toStringNumber(property.location?.latitude),
    longitude: toStringNumber(property.location?.longitude),
    shortDescription: serbianTranslation?.shortDescription || property.shortDescription || '',
    fullDescription: serbianTranslation?.fullDescription || property.fullDescription || '',
    aboutProperty: serbianTranslation?.aboutProperty || property.aboutProperty || '',
    specialRequirements: property.specialRequirements || [],
    images: property.images || [],
    floorPlans: property.floorPlans || [],
    videoUrl: property.videoUrl || '',
    contactPhone: property.contactPhone || '+381 11 20 19 170',
    contactEmail: property.contactEmail || 'realestate@zepter.rs',
    translations: translationForms,
  };
};

const numberOrUndefined = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const calculateAvailableAreaPreview = (sizeSqm: string, occupancyPercentage: string) => {
  const area = numberOrUndefined(sizeSqm);
  const occupancy = numberOrUndefined(occupancyPercentage) ?? 0;

  if (area === undefined || area < 0 || occupancy < 0 || occupancy > 100) {
    return undefined;
  }

  return Math.round(((area * (100 - occupancy)) / 100) * 100) / 100;
};

const formatAreaValue = (value: number, language: SupportedLanguage) => {
  return `${value.toLocaleString(language === 'sr' ? 'sr-RS' : 'en-US', {
    maximumFractionDigits: 2,
  })} m²`;
};

const toPayload = (form: PropertyFormState): AdminPropertyPayload => {
  const floors = form.floorsText
    .split(',')
    .map((floor) => floor.trim())
    .filter(Boolean);

  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    publicId: form.publicId.trim(),
    category: form.category,
    transactionType: form.transactionType,
    types: form.types,
    location: {
      city: form.city.trim() || undefined,
      municipality: form.municipality.trim() || undefined,
      fullLocation: form.fullLocation.trim(),
      address: form.address.trim() || undefined,
      latitude: numberOrUndefined(form.latitude),
      longitude: numberOrUndefined(form.longitude),
    },
    sizeSqm: numberOrUndefined(form.sizeSqm),
    occupancyPercentage: numberOrUndefined(form.occupancyPercentage) ?? 0,
    sizeLabel: form.sizeLabel.trim() || undefined,
    condition: form.condition,
    rooms: form.rooms.trim() || undefined,
    floorLabel: form.floorLabel.trim() || undefined,
    floors,
    shortDescription: form.shortDescription.trim() || undefined,
    fullDescription: form.fullDescription.trim() || undefined,
    aboutProperty: form.aboutProperty.trim() || undefined,
    specialRequirements: form.specialRequirements,
    images: form.images,
    floorPlans: form.floorPlans,
    videoUrl: form.videoUrl.trim() || undefined,
    contactPhone: form.contactPhone.trim() || undefined,
    contactEmail: form.contactEmail.trim() || undefined,
    isFeatured: form.isFeatured,
    status: form.status,
    translations: form.translations
      .filter((translation) => {
        if (translation.language === 'sr') return false;
        return [
          translation.title,
          translation.city,
          translation.municipality,
          translation.fullLocation,
          translation.address,
          translation.sizeLabel,
          translation.floorLabel,
          translation.floorsText,
          translation.shortDescription,
          translation.fullDescription,
          translation.aboutProperty,
        ].some((value) => value.trim());
      })
      .map((translation) => ({
        language: translation.language,
        title: translation.title.trim() || undefined,
        location: {
          city: translation.city.trim() || undefined,
          municipality: translation.municipality.trim() || undefined,
          fullLocation: translation.fullLocation.trim() || undefined,
          address: translation.address.trim() || undefined,
        },
        sizeLabel: translation.sizeLabel.trim() || undefined,
        floorLabel: translation.floorLabel.trim() || undefined,
        floors: translation.floorsText
          .split(',')
          .map((floor) => floor.trim())
          .filter(Boolean),
        shortDescription: translation.shortDescription.trim() || undefined,
        fullDescription: translation.fullDescription.trim() || undefined,
        aboutProperty: translation.aboutProperty.trim() || undefined,
      })),
  };
};

const AdminPropertyEditorPage = ({ propertyId, navigate, language }: AdminPropertyEditorPageProps) => {
  const isEditing = Boolean(propertyId);
  const [form, setForm] = useState<PropertyFormState>(defaultForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<AdminMessage | null>(null);
  const [activeTranslationLanguage, setActiveTranslationLanguage] = useState<SupportedLanguage>('en');
  const copy = getCopy(language).admin;
  const editorCopy = copy.editor;
  const categoryLabels = getCategoryLabels(language);
  const conditionOptions = getConditionOptions(language);
  const propertyTypeOptions = getPropertyTypeOptions(language);
  const specialRequirementOptions = getSpecialRequirementOptions(language);
  const localizedLanguageOptions =
    language === 'sr'
      ? [
          { value: 'sr' as const, label: 'Srpski' },
          { value: 'en' as const, label: 'Engleski' },
          { value: 'ru' as const, label: 'Ruski' },
          { value: 'de' as const, label: 'Nemački' },
        ]
      : languageOptions;

  useEffect(() => {
    if (!propertyId) {
      setForm(defaultForm);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setMessage(null);

    getAdminPropertyById(propertyId)
      .then((property) => {
        if (!mounted) return;
        setForm(formFromProperty(property));
      })
      .catch((err) => {
        if (!mounted) return;
        setMessage({ type: 'error', text: err instanceof Error ? err.message : editorCopy.loadFailed });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [editorCopy.loadFailed, propertyId]);

  const mainImage = useMemo(() => form.images.find((image) => image.isMain) || form.images[0], [form.images]);
  const availableAreaPreview = useMemo(
    () => calculateAvailableAreaPreview(form.sizeSqm, form.occupancyPercentage),
    [form.occupancyPercentage, form.sizeSqm]
  );

  const setField = <K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleType = (type: PropertyType) => {
    setForm((current) => {
      const exists = current.types.includes(type);
      return {
        ...current,
        types: exists ? current.types.filter((item) => item !== type) : [...current.types, type],
      };
    });
  };

  const toggleRequirement = (requirement: string) => {
    setForm((current) => {
      const exists = current.specialRequirements.includes(requirement);
      return {
        ...current,
        specialRequirements: exists
          ? current.specialRequirements.filter((item) => item !== requirement)
          : [...current.specialRequirements, requirement],
      };
    });
  };

  const activeTranslation = form.translations.find((translation) => translation.language === activeTranslationLanguage);

  const addTranslation = (language: SupportedLanguage) => {
    if (language === 'sr') return;

    setForm((current) => {
      if (current.translations.some((translation) => translation.language === language)) return current;
      return {
        ...current,
        translations: [...current.translations, defaultTranslation(language)],
      };
    });
  };

  const updateTranslation = <K extends keyof TranslationFormState>(
    language: SupportedLanguage,
    key: K,
    value: TranslationFormState[K]
  ) => {
    setForm((current) => ({
      ...current,
      translations: current.translations.map((translation) =>
        translation.language === language ? { ...translation, [key]: value } : translation
      ),
    }));
  };

  const removeTranslation = (language: SupportedLanguage) => {
    setForm((current) => ({
      ...current,
      translations: current.translations.filter((translation) => translation.language !== language),
    }));
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const response = await uploadAdminFile(file);
      setForm((current) => ({
        ...current,
        images: [
          ...current.images,
          {
            url: response.file.url,
            alt: current.title || response.file.originalName,
            isMain: current.images.length === 0,
            order: current.images.length + 1,
          },
        ],
      }));
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : editorCopy.imageFailed });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const uploadFloorPlan = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const response = await uploadAdminFile(file);
      setForm((current) => ({
        ...current,
        floorPlans: [
          ...current.floorPlans,
          {
            title: response.file.originalName.replace(/\.[^/.]+$/, ''),
            fileUrl: response.file.url,
            order: current.floorPlans.length + 1,
          },
        ],
      }));
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : editorCopy.floorPlanFailed });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const setMainImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => ({ ...image, isMain: imageIndex === index })),
    }));
  };

  const removeImage = (index: number) => {
    setForm((current) => {
      const nextImages = current.images.filter((_, imageIndex) => imageIndex !== index);
      const hasMain = nextImages.some((image) => image.isMain);
      return {
        ...current,
        images: nextImages.map((image, imageIndex) => ({
          ...image,
          order: imageIndex + 1,
          isMain: hasMain ? image.isMain : imageIndex === 0,
        })),
      };
    });
  };

  const updateImageAlt = (index: number, alt: string) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => imageIndex === index ? { ...image, alt } : image),
    }));
  };

  const removeFloorPlan = (index: number) => {
    setForm((current) => ({
      ...current,
      floorPlans: current.floorPlans.filter((_, planIndex) => planIndex !== index).map((plan, planIndex) => ({ ...plan, order: planIndex + 1 })),
    }));
  };

  const updateFloorPlanTitle = (index: number, title: string) => {
    setForm((current) => ({
      ...current,
      floorPlans: current.floorPlans.map((plan, planIndex) => planIndex === index ? { ...plan, title } : plan),
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!form.title.trim()) {
      setMessage({ type: 'error', text: editorCopy.titleRequired });
      return;
    }

    if (!form.fullLocation.trim()) {
      setMessage({ type: 'error', text: editorCopy.locationRequired });
      return;
    }

    const occupancyPercentage = numberOrUndefined(form.occupancyPercentage) ?? 0;

    if (occupancyPercentage < 0 || occupancyPercentage > 100) {
      setMessage({ type: 'error', text: editorCopy.occupancyInvalid });
      return;
    }

    setSaving(true);

    try {
      const payload = toPayload(form);
      const saved = isEditing && propertyId
        ? await updateAdminProperty(propertyId, payload)
        : await createAdminProperty(payload);

      setMessage({ type: 'success', text: isEditing ? editorCopy.updated : editorCopy.created });
      if (!isEditing) navigate(`/admin/properties/${saved._id}/edit`);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : editorCopy.saveFailed });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState text={editorCopy.loading} />;
  }

  return (
    <div className="admin-page admin-editor-page">
      <section className="admin-page-heading">
        <div>
          <span className="admin-kicker">{isEditing ? editorCopy.editProperty : editorCopy.createProperty}</span>
          <h2>{isEditing ? form.title || editorCopy.propertyEditor : editorCopy.newProperty}</h2>
          <p>{editorCopy.intro}</p>
        </div>
        <div className="admin-heading-actions">
          <button onClick={() => navigate('/admin/properties')}>{editorCopy.backToList}</button>
          {form.publicId && <button onClick={() => navigate(`/properties/${form.publicId}`)}>{editorCopy.viewPublicPage}</button>}
        </div>
      </section>

      <AdminNotice message={message} />

      <form className="admin-editor-grid" onSubmit={submit}>
        <div className="admin-editor-main">
          <section className="admin-form-card">
            <span className="admin-kicker">{editorCopy.basic}</span>
            <div className="admin-form-grid admin-form-grid--two">
              <label className="admin-field admin-field--wide">
                {editorCopy.title}
                <input value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Palata Zepter - KRALJA PETRA, BEOGRAD" />
              </label>
              <label className="admin-field">
                {editorCopy.slug}
                <input value={form.slug} onChange={(event) => setField('slug', event.target.value)} placeholder={editorCopy.slugPlaceholder} />
              </label>
              <label className="admin-field">
                {editorCopy.publicId}
                <input value={form.publicId} onChange={(event) => setField('publicId', event.target.value)} placeholder={editorCopy.publicIdPlaceholder} />
              </label>
              <label className="admin-field">
                {editorCopy.category}
                <select value={form.category} onChange={(event) => setField('category', event.target.value as PropertyCategory)}>
                  {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="admin-field">
                {editorCopy.transactionType}
                <select value={form.transactionType} onChange={(event) => setField('transactionType', event.target.value as PropertyTransactionType)}>
                  <option value="rent">{editorCopy.transactionRent}</option>
                  <option value="sale">{editorCopy.transactionSale}</option>
                </select>
              </label>
              <label className="admin-field">
                {editorCopy.status}
                <select value={form.status} onChange={(event) => setField('status', event.target.value as PropertyStatus)}>
                  <option value="draft">{copy.common.draft}</option>
                  <option value="published">{copy.common.published}</option>
                  <option value="archived">{copy.common.archived}</option>
                </select>
              </label>
              <label className="admin-switch-field">
                <input checked={form.isFeatured} onChange={(event) => setField('isFeatured', event.target.checked)} type="checkbox" />
                <span>{editorCopy.featuredPublic}</span>
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{editorCopy.propertyTypes}</span>
            <div className="admin-chip-grid">
              {propertyTypeOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={form.types.includes(option.value) ? 'admin-chip admin-chip--active' : 'admin-chip'}
                  onClick={() => toggleType(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{editorCopy.location}</span>
            <div className="admin-form-grid admin-form-grid--two">
              <label className="admin-field">
                {editorCopy.city}
                <input value={form.city} onChange={(event) => setField('city', event.target.value)} />
              </label>
              <label className="admin-field">
                {editorCopy.municipality}
                <input value={form.municipality} onChange={(event) => setField('municipality', event.target.value)} />
              </label>
              <label className="admin-field admin-field--wide">
                {editorCopy.fullLocation}
                <input value={form.fullLocation} onChange={(event) => setField('fullLocation', event.target.value)} placeholder="Beograd Stari Grad" />
              </label>
              <label className="admin-field admin-field--wide">
                {editorCopy.address}
                <input value={form.address} onChange={(event) => setField('address', event.target.value)} />
              </label>
              <label className="admin-field">
                {editorCopy.latitude}
                <input value={form.latitude} onChange={(event) => setField('latitude', event.target.value)} />
              </label>
              <label className="admin-field">
                {editorCopy.longitude}
                <input value={form.longitude} onChange={(event) => setField('longitude', event.target.value)} />
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{editorCopy.facts}</span>
            <div className="admin-form-grid admin-form-grid--three">
              <label className="admin-field">
                {editorCopy.sizeSqm}
                <input type="number" min="0" step="0.01" value={form.sizeSqm} onChange={(event) => setField('sizeSqm', event.target.value)} placeholder="3706" />
              </label>
              <label className="admin-field">
                {editorCopy.sizeLabel}
                <input value={form.sizeLabel} onChange={(event) => setField('sizeLabel', event.target.value)} placeholder="3,706 m2" />
              </label>
              <label className="admin-field">
                {editorCopy.occupancyPercentage}
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.occupancyPercentage}
                  onChange={(event) => setField('occupancyPercentage', event.target.value)}
                  placeholder="0"
                />
              </label>
              <div className="admin-field">
                {editorCopy.availableArea}
                <output className="admin-calculated-value">
                  {availableAreaPreview !== undefined ? formatAreaValue(availableAreaPreview, language) : copy.common.notSet}
                </output>
                <small className="admin-field-hint">{editorCopy.availableAreaHelp}</small>
              </div>
              <label className="admin-field">
                {editorCopy.condition}
                <select value={form.condition} onChange={(event) => setField('condition', event.target.value as PropertyCondition)}>
                  {conditionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="admin-field">
                {editorCopy.rooms}
                <select value={form.rooms} onChange={(event) => setField('rooms', event.target.value)}>
                  <option value="">{copy.common.notSpecified}</option>
                  {roomOptions.map((room) => <option key={room} value={room}>{room}</option>)}
                </select>
              </label>
              <label className="admin-field">
                {editorCopy.floorLabel}
                <input value={form.floorLabel} onChange={(event) => setField('floorLabel', event.target.value)} placeholder="ground floor - seventh Floor" />
              </label>
              <label className="admin-field">
                {editorCopy.floors}
                <input value={form.floorsText} onChange={(event) => setField('floorsText', event.target.value)} placeholder="7, 6, 5, 4, Pr" />
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{editorCopy.descriptions}</span>
            <div className="admin-form-grid">
              <label className="admin-field">
                {editorCopy.shortDescription}
                <textarea value={form.shortDescription} onChange={(event) => setField('shortDescription', event.target.value)} rows={3} />
              </label>
              <label className="admin-field">
                {editorCopy.fullDescription}
                <textarea value={form.fullDescription} onChange={(event) => setField('fullDescription', event.target.value)} rows={6} />
              </label>
              <label className="admin-field">
                {editorCopy.aboutProperty}
                <textarea value={form.aboutProperty} onChange={(event) => setField('aboutProperty', event.target.value)} rows={8} />
              </label>
              <label className="admin-field">
                {editorCopy.videoUrl}
                <input value={form.videoUrl} onChange={(event) => setField('videoUrl', event.target.value)} placeholder="https://www.youtube.com/embed/..." />
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{editorCopy.translations}</span>
            <div className="admin-form-grid admin-form-grid--two">
              <label className="admin-field">
                {editorCopy.translationLanguage}
                <select
                  value={activeTranslationLanguage}
                  onChange={(event) => setActiveTranslationLanguage(event.target.value as SupportedLanguage)}
                >
                  {localizedLanguageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}{option.value === 'sr' ? ` (${editorCopy.baseContent})` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <div className="admin-translation-actions">
                <button
                  type="button"
                  disabled={activeTranslationLanguage === 'sr' || Boolean(activeTranslation)}
                  onClick={() => addTranslation(activeTranslationLanguage)}
                >
                  {editorCopy.addTranslation}
                </button>
                {activeTranslation && (
                  <button type="button" onClick={() => removeTranslation(activeTranslation.language)}>
                    {editorCopy.removeTranslation}
                  </button>
                )}
              </div>
            </div>

            {activeTranslationLanguage === 'sr' && (
              <p className="admin-side-note">{editorCopy.englishHelp}</p>
            )}

            {activeTranslationLanguage !== 'sr' && !activeTranslation && (
              <p className="admin-side-note">{editorCopy.addHelp}</p>
            )}

            {activeTranslation && (
              <div className="admin-form-grid admin-form-grid--two">
                <label className="admin-field admin-field--wide">
                  {editorCopy.translatedTitle}
                  <input
                    value={activeTranslation.title}
                    onChange={(event) => updateTranslation(activeTranslation.language, 'title', event.target.value)}
                    placeholder={form.title || editorCopy.title}
                  />
                </label>
                <label className="admin-field">
                  {editorCopy.city}
                  <input value={activeTranslation.city} onChange={(event) => updateTranslation(activeTranslation.language, 'city', event.target.value)} />
                </label>
                <label className="admin-field">
                  {editorCopy.municipality}
                  <input value={activeTranslation.municipality} onChange={(event) => updateTranslation(activeTranslation.language, 'municipality', event.target.value)} />
                </label>
                <label className="admin-field admin-field--wide">
                  {editorCopy.fullLocation.replace(' *', '')}
                  <input
                    value={activeTranslation.fullLocation}
                    onChange={(event) => updateTranslation(activeTranslation.language, 'fullLocation', event.target.value)}
                    placeholder={form.fullLocation || 'Beograd Stari Grad'}
                  />
                </label>
                <label className="admin-field admin-field--wide">
                  {editorCopy.address}
                  <input value={activeTranslation.address} onChange={(event) => updateTranslation(activeTranslation.language, 'address', event.target.value)} />
                </label>
                <label className="admin-field">
                  {editorCopy.sizeLabel}
                  <input value={activeTranslation.sizeLabel} onChange={(event) => updateTranslation(activeTranslation.language, 'sizeLabel', event.target.value)} />
                </label>
                <label className="admin-field">
                  {editorCopy.floorLabel}
                  <input value={activeTranslation.floorLabel} onChange={(event) => updateTranslation(activeTranslation.language, 'floorLabel', event.target.value)} />
                </label>
                <label className="admin-field admin-field--wide">
                  {editorCopy.floors}
                  <input
                    value={activeTranslation.floorsText}
                    onChange={(event) => updateTranslation(activeTranslation.language, 'floorsText', event.target.value)}
                    placeholder={form.floorsText || '7, 6, 5, 4, Pr'}
                  />
                </label>
                <label className="admin-field admin-field--wide">
                  {editorCopy.shortDescription}
                  <textarea value={activeTranslation.shortDescription} onChange={(event) => updateTranslation(activeTranslation.language, 'shortDescription', event.target.value)} rows={3} />
                </label>
                <label className="admin-field admin-field--wide">
                  {editorCopy.fullDescription}
                  <textarea value={activeTranslation.fullDescription} onChange={(event) => updateTranslation(activeTranslation.language, 'fullDescription', event.target.value)} rows={6} />
                </label>
                <label className="admin-field admin-field--wide">
                  {editorCopy.aboutProperty}
                  <textarea value={activeTranslation.aboutProperty} onChange={(event) => updateTranslation(activeTranslation.language, 'aboutProperty', event.target.value)} rows={8} />
                </label>
              </div>
            )}
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{editorCopy.specialRequirements}</span>
            <div className="admin-chip-grid">
              {specialRequirementOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={form.specialRequirements.includes(option.value) ? 'admin-chip admin-chip--active' : 'admin-chip'}
                  onClick={() => toggleRequirement(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="admin-editor-side">
          <section className="admin-media-preview-card">
            <span className="admin-kicker">{editorCopy.mainImage}</span>
            <div className="admin-media-preview">
              {mainImage ? <img src={resolveMediaUrl(mainImage.url)} alt={mainImage.alt || form.title} /> : <span>ZRE</span>}
            </div>
          </section>

          <section className="admin-form-card admin-form-card--sticky-action">
            <span className="admin-kicker">{editorCopy.saveChanges}</span>
            <p className="admin-side-note">{editorCopy.draftNote}</p>
            <button className="admin-submit-button" disabled={saving || uploading} type="submit">
              {saving ? editorCopy.saving : isEditing ? editorCopy.saveProperty : editorCopy.createProperty}
            </button>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{editorCopy.images}</span>
            <label className="admin-upload-zone">
              <input type="file" accept="image/*" onChange={uploadImage} />
              <strong>{uploading ? editorCopy.uploading : editorCopy.uploadImage}</strong>
              <small>{editorCopy.imageTypes}</small>
            </label>

            <div className="admin-media-list">
              {form.images.map((image, index) => (
                <div className="admin-media-item" key={`${image.url}-${index}`}>
                  <img src={resolveMediaUrl(image.url)} alt={image.alt || form.title} />
                  <input value={image.alt || ''} onChange={(event) => updateImageAlt(index, event.target.value)} placeholder={editorCopy.altText} />
                  <div>
                    <button type="button" onClick={() => setMainImage(index)}>{image.isMain ? editorCopy.main : editorCopy.setMain}</button>
                    <button type="button" onClick={() => removeImage(index)}>{copy.common.remove}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{editorCopy.floorPlans}</span>
            <label className="admin-upload-zone">
              <input type="file" accept="application/pdf,image/*" onChange={uploadFloorPlan} />
              <strong>{uploading ? editorCopy.uploading : editorCopy.uploadFloorPlan}</strong>
              <small>{editorCopy.floorPlanTypes}</small>
            </label>

            <div className="admin-plan-list">
              {form.floorPlans.map((plan, index) => (
                <div className="admin-plan-item" key={`${plan.fileUrl}-${index}`}>
                  <input value={plan.title || ''} onChange={(event) => updateFloorPlanTitle(index, event.target.value)} placeholder={editorCopy.floorPlanTitle} />
                  <a href={resolveMediaUrl(plan.fileUrl)} target="_blank" rel="noreferrer">{copy.common.open}</a>
                  <button type="button" onClick={() => removeFloorPlan(index)}>{copy.common.remove}</button>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">{editorCopy.contact}</span>
            <label className="admin-field">
              {editorCopy.phone}
              <input value={form.contactPhone} onChange={(event) => setField('contactPhone', event.target.value)} />
            </label>
            <label className="admin-field">
              {editorCopy.email}
              <input value={form.contactEmail} onChange={(event) => setField('contactEmail', event.target.value)} />
            </label>
          </section>
        </aside>
      </form>
    </div>
  );
};

export default AdminPropertyEditorPage;
