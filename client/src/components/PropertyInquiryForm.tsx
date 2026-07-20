import { useState } from 'react';
import type { FormEvent } from 'react';
import { createAssistantInquiry } from '../api/assistant';
import { getCopy } from '../data/localization';
import type { Property, SupportedLanguage } from '../types/property';

interface PropertyInquiryFormProps {
  property: Property;
  language: SupportedLanguage;
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone: string) => {
  return /^\+?\d{6,20}$/.test(phone.replace(/[\s().-]/g, ''));
};

const PropertyInquiryForm = ({ property, language }: PropertyInquiryFormProps) => {
  const copy = getCopy(language).details;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const contactPhone = property.contactPhone || '+381 11 20 19 170';
  const contactEmail = property.contactEmail || 'realestate@zepter.rs';

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const normalizedMessage = message.trim();

    if (!normalizedName) {
      setError(copy.inquiryNameRequired);
      return;
    }

    if (!normalizedEmail && !normalizedPhone) {
      setError(copy.inquiryContactRequired);
      return;
    }

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      setError(copy.inquiryEmailInvalid);
      return;
    }

    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      setError(copy.inquiryPhoneInvalid);
      return;
    }

    if (!normalizedMessage) {
      setError(copy.inquiryMessageRequired);
      return;
    }

    setSubmitting(true);

    try {
      await createAssistantInquiry({
        question: normalizedMessage,
        name: normalizedName,
        email: normalizedEmail || undefined,
        phone: normalizedPhone || undefined,
        inquiryType: 'property-contact-form',
        sourcePage: window.location.href,
        pageTitle: `${property.title} | Zepter Real Estate`,
        propertyId: property._id,
        propertyPublicId: property.publicId,
        propertySlug: property.slug,
        propertyName: property.title,
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch {
      setError(copy.inquiryError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section property-inquiry-section">
      <div className="container property-inquiry-layout">
        <div className="property-inquiry-intro">
          <span className="eyebrow">{copy.inquiryEyebrow}</span>
          <h2>{copy.inquiryTitle}</h2>
          <p>{copy.inquiryText}</p>
          <div className="property-inquiry-context">
            <strong>{copy.contactForProperty}</strong>
            <a href={`tel:${contactPhone.replace(/[\s().-]/g, '')}`}>{contactPhone}</a>
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </div>
        </div>

        <div className="property-inquiry-card">
          {submitted ? (
            <div className="property-inquiry-success" role="status">
              <span aria-hidden="true">✓</span>
              <strong>{copy.inquirySuccess}</strong>
            </div>
          ) : (
            <form className="property-inquiry-form" onSubmit={submitInquiry} noValidate>
              <label className="property-inquiry-field property-inquiry-field--wide">
                {copy.inquiryName}
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  maxLength={160}
                />
              </label>
              <label className="property-inquiry-field">
                {copy.inquiryEmail}
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </label>
              <label className="property-inquiry-field">
                {copy.inquiryPhone}
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                />
              </label>
              <label className="property-inquiry-field property-inquiry-field--wide">
                {copy.inquiryMessage}
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={6}
                  maxLength={4000}
                />
              </label>

              {error && <p className="property-inquiry-error" role="alert">{error}</p>}

              <button className="btn btn--primary property-inquiry-submit" type="submit" disabled={submitting}>
                {submitting ? copy.inquirySending : copy.inquirySubmit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default PropertyInquiryForm;
