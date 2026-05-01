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
import {
  categoryLabels,
  conditionOptions,
  propertyTypeOptions,
  roomOptions,
  specialRequirementOptions,
} from '../../data/propertyOptions';
import type { AdminMessage, AdminPropertyPayload } from '../../types/admin';
import type { FloorPlan, PropertyCategory, PropertyCondition, PropertyImage, PropertyStatus, PropertyType } from '../../types/property';
import { resolveMediaUrl } from '../../utils/asset';

interface AdminPropertyEditorPageProps {
  propertyId?: string;
  navigate: (path: string) => void;
}

type PropertyFormState = {
  title: string;
  slug: string;
  publicId: string;
  category: PropertyCategory;
  status: PropertyStatus;
  isFeatured: boolean;
  types: PropertyType[];
  condition: PropertyCondition;
  rooms: string;
  sizeSqm: string;
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
};

const defaultForm: PropertyFormState = {
  title: '',
  slug: '',
  publicId: '',
  category: 'commercial',
  status: 'draft',
  isFeatured: false,
  types: ['offices'],
  condition: 'not-specified',
  rooms: '',
  sizeSqm: '',
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
};

const toStringNumber = (value?: number) => (value === undefined || value === null ? '' : String(value));

const formFromProperty = (property: AdminPropertyPayload & { _id?: string; createdAt?: string; updatedAt?: string }): PropertyFormState => ({
  title: property.title || '',
  slug: property.slug || '',
  publicId: property.publicId || '',
  category: property.category || 'commercial',
  status: property.status || 'draft',
  isFeatured: Boolean(property.isFeatured),
  types: property.types || [],
  condition: property.condition || 'not-specified',
  rooms: property.rooms || '',
  sizeSqm: toStringNumber(property.sizeSqm),
  sizeLabel: property.sizeLabel || '',
  floorLabel: property.floorLabel || '',
  floorsText: property.floors?.join(', ') || '',
  city: property.location?.city || '',
  municipality: property.location?.municipality || '',
  fullLocation: property.location?.fullLocation || '',
  address: property.location?.address || '',
  latitude: toStringNumber(property.location?.latitude),
  longitude: toStringNumber(property.location?.longitude),
  shortDescription: property.shortDescription || '',
  fullDescription: property.fullDescription || '',
  aboutProperty: property.aboutProperty || '',
  specialRequirements: property.specialRequirements || [],
  images: property.images || [],
  floorPlans: property.floorPlans || [],
  videoUrl: property.videoUrl || '',
  contactPhone: property.contactPhone || '+381 11 20 19 170',
  contactEmail: property.contactEmail || 'realestate@zepter.rs',
});

const numberOrUndefined = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
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
  };
};

const AdminPropertyEditorPage = ({ propertyId, navigate }: AdminPropertyEditorPageProps) => {
  const isEditing = Boolean(propertyId);
  const [form, setForm] = useState<PropertyFormState>(defaultForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<AdminMessage | null>(null);

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
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Nekretnina nije učitana.' });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [propertyId]);

  const mainImage = useMemo(() => form.images.find((image) => image.isMain) || form.images[0], [form.images]);

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
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Slika nije uploadovana.' });
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
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Floor plan nije uploadovan.' });
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
      setMessage({ type: 'error', text: 'Naziv nekretnine je obavezan.' });
      return;
    }

    if (!form.fullLocation.trim()) {
      setMessage({ type: 'error', text: 'Full location je obavezna.' });
      return;
    }

    setSaving(true);

    try {
      const payload = toPayload(form);
      const saved = isEditing && propertyId
        ? await updateAdminProperty(propertyId, payload)
        : await createAdminProperty(payload);

      setMessage({ type: 'success', text: isEditing ? 'Nekretnina je uspešno ažurirana.' : 'Nekretnina je uspešno kreirana.' });
      if (!isEditing) navigate(`/admin/properties/${saved._id}/edit`);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Čuvanje nije uspelo.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState text="Loading property editor..." />;
  }

  return (
    <div className="admin-page admin-editor-page">
      <section className="admin-page-heading">
        <div>
          <span className="admin-kicker">{isEditing ? 'Edit property' : 'Create property'}</span>
          <h2>{isEditing ? form.title || 'Property editor' : 'New property'}</h2>
          <p>Maintain all public-facing content, technical facts, images and floor plans from one editor.</p>
        </div>
        <div className="admin-heading-actions">
          <button onClick={() => navigate('/admin/properties')}>Back to list</button>
          {form.publicId && <button onClick={() => navigate(`/properties/${form.publicId}`)}>View public page</button>}
        </div>
      </section>

      <AdminNotice message={message} />

      <form className="admin-editor-grid" onSubmit={submit}>
        <div className="admin-editor-main">
          <section className="admin-form-card">
            <span className="admin-kicker">Basic information</span>
            <div className="admin-form-grid admin-form-grid--two">
              <label className="admin-field admin-field--wide">
                Title *
                <input value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Palata Zepter - KRALJA PETRA, BEOGRAD" />
              </label>
              <label className="admin-field">
                Slug
                <input value={form.slug} onChange={(event) => setField('slug', event.target.value)} placeholder="Auto generated if empty" />
              </label>
              <label className="admin-field">
                Public ID
                <input value={form.publicId} onChange={(event) => setField('publicId', event.target.value)} placeholder="Auto generated if empty" />
              </label>
              <label className="admin-field">
                Category
                <select value={form.category} onChange={(event) => setField('category', event.target.value as PropertyCategory)}>
                  {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="admin-field">
                Status
                <select value={form.status} onChange={(event) => setField('status', event.target.value as PropertyStatus)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="admin-switch-field">
                <input checked={form.isFeatured} onChange={(event) => setField('isFeatured', event.target.checked)} type="checkbox" />
                <span>Featured on public pages</span>
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">Property types</span>
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
            <span className="admin-kicker">Location</span>
            <div className="admin-form-grid admin-form-grid--two">
              <label className="admin-field">
                City
                <input value={form.city} onChange={(event) => setField('city', event.target.value)} />
              </label>
              <label className="admin-field">
                Municipality
                <input value={form.municipality} onChange={(event) => setField('municipality', event.target.value)} />
              </label>
              <label className="admin-field admin-field--wide">
                Full location *
                <input value={form.fullLocation} onChange={(event) => setField('fullLocation', event.target.value)} placeholder="Beograd Stari Grad" />
              </label>
              <label className="admin-field admin-field--wide">
                Address
                <input value={form.address} onChange={(event) => setField('address', event.target.value)} />
              </label>
              <label className="admin-field">
                Latitude
                <input value={form.latitude} onChange={(event) => setField('latitude', event.target.value)} />
              </label>
              <label className="admin-field">
                Longitude
                <input value={form.longitude} onChange={(event) => setField('longitude', event.target.value)} />
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">Technical facts</span>
            <div className="admin-form-grid admin-form-grid--three">
              <label className="admin-field">
                Size sqm
                <input value={form.sizeSqm} onChange={(event) => setField('sizeSqm', event.target.value)} placeholder="3706" />
              </label>
              <label className="admin-field">
                Size label
                <input value={form.sizeLabel} onChange={(event) => setField('sizeLabel', event.target.value)} placeholder="3,706 m2" />
              </label>
              <label className="admin-field">
                Condition
                <select value={form.condition} onChange={(event) => setField('condition', event.target.value as PropertyCondition)}>
                  {conditionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="admin-field">
                Rooms
                <select value={form.rooms} onChange={(event) => setField('rooms', event.target.value)}>
                  <option value="">Not specified</option>
                  {roomOptions.map((room) => <option key={room} value={room}>{room}</option>)}
                </select>
              </label>
              <label className="admin-field">
                Floor label
                <input value={form.floorLabel} onChange={(event) => setField('floorLabel', event.target.value)} placeholder="ground floor - seventh Floor" />
              </label>
              <label className="admin-field">
                Floors
                <input value={form.floorsText} onChange={(event) => setField('floorsText', event.target.value)} placeholder="7, 6, 5, 4, Pr" />
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">Descriptions</span>
            <div className="admin-form-grid">
              <label className="admin-field">
                Short description
                <textarea value={form.shortDescription} onChange={(event) => setField('shortDescription', event.target.value)} rows={3} />
              </label>
              <label className="admin-field">
                Full description
                <textarea value={form.fullDescription} onChange={(event) => setField('fullDescription', event.target.value)} rows={6} />
              </label>
              <label className="admin-field">
                About property
                <textarea value={form.aboutProperty} onChange={(event) => setField('aboutProperty', event.target.value)} rows={8} />
              </label>
              <label className="admin-field">
                Video URL
                <input value={form.videoUrl} onChange={(event) => setField('videoUrl', event.target.value)} placeholder="https://www.youtube.com/embed/..." />
              </label>
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">Special requirements</span>
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
            <span className="admin-kicker">Main image</span>
            <div className="admin-media-preview">
              {mainImage ? <img src={resolveMediaUrl(mainImage.url)} alt={mainImage.alt || form.title} /> : <span>ZRE</span>}
            </div>
          </section>

          <section className="admin-form-card admin-form-card--sticky-action">
            <span className="admin-kicker">Save changes</span>
            <p className="admin-side-note">Drafts remain hidden. Published properties are visible on public pages immediately.</p>
            <button className="admin-submit-button" disabled={saving || uploading} type="submit">
              {saving ? 'Saving...' : isEditing ? 'Save property' : 'Create property'}
            </button>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">Images</span>
            <label className="admin-upload-zone">
              <input type="file" accept="image/*" onChange={uploadImage} />
              <strong>{uploading ? 'Uploading...' : 'Upload image'}</strong>
              <small>JPG, PNG or WEBP</small>
            </label>

            <div className="admin-media-list">
              {form.images.map((image, index) => (
                <div className="admin-media-item" key={`${image.url}-${index}`}>
                  <img src={resolveMediaUrl(image.url)} alt={image.alt || form.title} />
                  <input value={image.alt || ''} onChange={(event) => updateImageAlt(index, event.target.value)} placeholder="Alt text" />
                  <div>
                    <button type="button" onClick={() => setMainImage(index)}>{image.isMain ? 'Main' : 'Set main'}</button>
                    <button type="button" onClick={() => removeImage(index)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">Floor plans</span>
            <label className="admin-upload-zone">
              <input type="file" accept="application/pdf,image/*" onChange={uploadFloorPlan} />
              <strong>{uploading ? 'Uploading...' : 'Upload floor plan'}</strong>
              <small>PDF or image file</small>
            </label>

            <div className="admin-plan-list">
              {form.floorPlans.map((plan, index) => (
                <div className="admin-plan-item" key={`${plan.fileUrl}-${index}`}>
                  <input value={plan.title || ''} onChange={(event) => updateFloorPlanTitle(index, event.target.value)} placeholder="Floor plan title" />
                  <a href={resolveMediaUrl(plan.fileUrl)} target="_blank" rel="noreferrer">Open</a>
                  <button type="button" onClick={() => removeFloorPlan(index)}>Remove</button>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-form-card">
            <span className="admin-kicker">Contact</span>
            <label className="admin-field">
              Phone
              <input value={form.contactPhone} onChange={(event) => setField('contactPhone', event.target.value)} />
            </label>
            <label className="admin-field">
              Email
              <input value={form.contactEmail} onChange={(event) => setField('contactEmail', event.target.value)} />
            </label>
          </section>
        </aside>
      </form>
    </div>
  );
};

export default AdminPropertyEditorPage;
