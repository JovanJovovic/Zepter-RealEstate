import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { createPropertyOffer } from '../api/propertyOffers';
import PageHero from '../components/PageHero';
import { getCopy } from '../data/localization';
import { getPropertyTypeOptions } from '../data/propertyOptions';
import type { SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface OfferPropertyPageProps {
  language: SupportedLanguage;
}

type OfferFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyType: string;
  city: string;
  municipality: string;
  address: string;
  fullLocation: string;
  area: string;
  proposedPrice: string;
  currency: string;
  description: string;
};

const defaultForm: OfferFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  propertyType: '',
  city: '',
  municipality: '',
  address: '',
  fullLocation: '',
  area: '',
  proposedPrice: '',
  currency: 'EUR',
  description: '',
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);



const isValidPhone = (phone: string) => {
  const normalized = phone.replace(/[\s().-]/g, '');
  return /^\+?\d{6,20}$/.test(normalized);
};

const isPositiveNumber = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0;
};

const fileSummary = (files: File[], fallback: string) => {
  if (files.length === 0) return fallback;
  if (files.length === 1) return files[0].name;
  return `${files.slice(0, 2).map((file) => file.name).join(', ')}${files.length > 2 ? ` +${files.length - 2}` : ''}`;
};

const OfferPropertyPage = ({ language }: OfferPropertyPageProps) => {
  const copy = getCopy(language);
  const offerCopy = copy.propertyOffer;
  //const propertyTypeOptions = useMemo(() => getPropertyTypeOptions(language), [language]);
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState<File[]>([]);
  const [floorPlans, setFloorPlans] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const propertyTypeOptions = useMemo(() => getPropertyTypeOptions(language), [language]);


  const successModalTitle =
    language === 'sr' ? 'Uspešno ste poslali ponudu' : 'Your offer has been sent successfully';

  const successModalText =
    language === 'sr'
      ? 'Hvala Vam. Vaša ponuda je uspešno poslata našem timu. Naši zaposleni će pregledati dostavljene podatke i javiti Vam se u vezi sa daljim koracima.'
      : 'Thank you. Your property offer has been sent to our team. Our staff will review the submitted information and contact you regarding the next steps.';

  const handleSuccessOk = () => {
    setSuccess(false);
    window.location.href = '/';
  };


  const setField = <K extends keyof OfferFormState>(key: K, value: OfferFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({
      ...current,
      [key]: '',
      ...(key === 'email' || key === 'phone' ? { contact: '' } : {}),
      ...(key === 'address' || key === 'fullLocation' ? { location: '' } : {}),
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.firstName.trim()) nextErrors.firstName = offerCopy.firstNameRequired;
    if (!form.lastName.trim()) nextErrors.lastName = offerCopy.lastNameRequired;
    if (!form.email.trim() && !form.phone.trim()) nextErrors.contact = offerCopy.contactRequired;
    if (form.email.trim() && !isValidEmail(form.email.trim())) nextErrors.email = offerCopy.emailInvalid;
    if (form.phone.trim() && !isValidPhone(form.phone.trim())) nextErrors.phone = offerCopy.phoneInvalid;
    if (!form.propertyType) nextErrors.propertyType = offerCopy.propertyTypeRequired;
    if (!form.city.trim()) nextErrors.city = offerCopy.cityRequired;
    if (!form.address.trim() && !form.fullLocation.trim()) nextErrors.location = offerCopy.locationRequired;
    if (!form.area.trim()) nextErrors.area = offerCopy.areaRequired;
    if (form.area.trim() && !isPositiveNumber(form.area.trim())) nextErrors.area = offerCopy.positiveNumber;
    if (!form.proposedPrice.trim()) nextErrors.proposedPrice = offerCopy.priceRequired;
    if (form.proposedPrice.trim() && !isPositiveNumber(form.proposedPrice.trim())) nextErrors.proposedPrice = offerCopy.positiveNumber;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setSubmitting(true);

    try {
      await createPropertyOffer({
        ...form,
        images,
        floorPlans,
        documents,
      });
      setSuccess(true);
      setForm(defaultForm);
      setImages([]);
      setFloorPlans([]);
      setDocuments([]);
      setErrors({});
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : offerCopy.submitFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <PageHero
        compact
        eyebrow={offerCopy.eyebrow}
        title={offerCopy.title}
        text={offerCopy.text}
        image={publicImage('portfolio Zepter Real Estate.jpg')}
      />

      <section className="section property-offer-section">
        <div className="container property-offer-layout">
          <aside className="property-offer-note">
            <span className="eyebrow">{offerCopy.eyebrow}</span>
            <h2>{offerCopy.title}</h2>
            <p>{offerCopy.reviewNotice}</p>
          </aside>

          <form className="property-offer-form" onSubmit={submit}>
            {submitError && <div className="form-message form-message--error">{submitError}</div>}

            <section className="property-offer-card">
              <h3>{offerCopy.contactSection}</h3>
              <div className="property-offer-grid property-offer-grid--two">
                <label>
                  {offerCopy.firstName} *
                  <input value={form.firstName} onChange={(event) => setField('firstName', event.target.value)} />
                  {errors.firstName && <span>{errors.firstName}</span>}
                </label>
                <label>
                  {offerCopy.lastName} *
                  <input value={form.lastName} onChange={(event) => setField('lastName', event.target.value)} />
                  {errors.lastName && <span>{errors.lastName}</span>}
                </label>
                <label>
                  {offerCopy.email}
                  <input value={form.email} onChange={(event) => setField('email', event.target.value)} inputMode="email" />
                  {errors.email && <span>{errors.email}</span>}
                </label>
                <label>
                  {offerCopy.phone}
                  <input value={form.phone} onChange={(event) => setField('phone', event.target.value)} inputMode="tel" />
                  {errors.phone && <span>{errors.phone}</span>}
                </label>
              </div>
              {errors.contact && <p className="property-offer-error">{errors.contact}</p>}
            </section>

            <section className="property-offer-card">
              <h3>{offerCopy.propertySection}</h3>
              <div className="property-offer-grid property-offer-grid--two">
                <label>
                  {offerCopy.propertyType} *
                  <select value={form.propertyType} onChange={(event) => setField('propertyType', event.target.value)}>
                    <option value="">{offerCopy.selectPropertyType}</option>
                    {propertyTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.propertyType && <span>{errors.propertyType}</span>}
                </label>
                <label>
                  {offerCopy.city} *
                  <input value={form.city} onChange={(event) => setField('city', event.target.value)} />
                  {errors.city && <span>{errors.city}</span>}
                </label>
                <label>
                  {offerCopy.municipality}
                  <input value={form.municipality} onChange={(event) => setField('municipality', event.target.value)} />
                </label>
                <label>
                  {offerCopy.location} *
                  <input value={form.address} onChange={(event) => setField('address', event.target.value)} />
                  {errors.location && <span>{errors.location}</span>}
                </label>
                <label className="property-offer-grid__wide">
                  {offerCopy.fullLocation}
                  <input value={form.fullLocation} onChange={(event) => setField('fullLocation', event.target.value)} />
                </label>
              </div>
            </section>

            <section className="property-offer-card">
              <h3>{offerCopy.priceSection}</h3>
              <div className="property-offer-grid property-offer-grid--three">
                <label>
                  {offerCopy.area} *
                  <input value={form.area} onChange={(event) => setField('area', event.target.value)} inputMode="decimal" />
                  {errors.area && <span>{errors.area}</span>}
                </label>
                <label>
                  {offerCopy.proposedPrice} *
                  <input value={form.proposedPrice} onChange={(event) => setField('proposedPrice', event.target.value)} inputMode="decimal" />
                  {errors.proposedPrice && <span>{errors.proposedPrice}</span>}
                </label>
                <label>
                  {offerCopy.currency}
                  <select value={form.currency} onChange={(event) => setField('currency', event.target.value)}>
                    <option value="EUR">EUR</option>
                    <option value="RSD">RSD</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
                <label className="property-offer-grid__wide">
                  {offerCopy.description}
                  <textarea value={form.description} rows={5} onChange={(event) => setField('description', event.target.value)} />
                </label>
              </div>
            </section>

            <section className="property-offer-card">
              <h3>{offerCopy.filesSection}</h3>
              <p>{offerCopy.fileHelp}</p>
              <div className="property-offer-file-grid">
                <label>
                  {offerCopy.images}
                  <input type="file" multiple accept="image/*" onChange={(event) => setImages(Array.from(event.target.files || []))} />
                  <span>{fileSummary(images, offerCopy.additionalImages)}</span>
                </label> 
                <label>
                  {offerCopy.floorPlans}
                  <input type="file" multiple accept="image/*,.pdf,application/pdf" onChange={(event) => setFloorPlans(Array.from(event.target.files || []))} />
                  <span>{fileSummary(floorPlans, offerCopy.floorPlans)}</span>
                </label>
                <label>
                  {offerCopy.documents}
                  <input type="file" multiple accept="image/*,.pdf,application/pdf" onChange={(event) => setDocuments(Array.from(event.target.files || []))} />
                  <span>{fileSummary(documents, offerCopy.documents)}</span>
                </label>
              </div>
            </section>

            <button className="btn btn--primary btn--large property-offer-submit" type="submit" disabled={submitting}>
              {submitting ? offerCopy.sending : offerCopy.submit}
            </button>
          </form>
        </div>
      </section>
      {success && (
        <div className="property-offer-success-modal" role="dialog" aria-modal="true" aria-labelledby="property-offer-success-title">
          <div className="property-offer-success-modal__card">
            <img
              className="property-offer-success-modal__logo"
              src={publicImage('ZepterRealEstateLogo.png')}
              alt="Zepter Real Estate"
            />

            <h2 id="property-offer-success-title">{successModalTitle}</h2>

            <p>{successModalText}</p>

            <button type="button" className="property-offer-success-modal__button" onClick={handleSuccessOk}>
              OK
            </button>
          </div>
        </div>
      )}

    </main>
  );
};

export default OfferPropertyPage;
