import { useState } from 'react';
import type { FormEvent } from 'react';

import { createAssistantInquiry } from '../api/assistant';
import { getCopy } from '../data/localization';
import type { SupportedLanguage } from '../types/property';

interface ContactInquiryFormProps {
  language: SupportedLanguage;
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone: string) => {
  return /^\+?\d{6,20}$/.test(phone.replace(/[\s().-]/g, ''));
};

const ContactInquiryForm = ({ language }: ContactInquiryFormProps) => {
  const copy = getCopy(language).contact;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const normalizedMessage = message.trim();

    if (!normalizedName) {
      setError(copy.formNameRequired);
      return;
    }

    if (!normalizedEmail && !normalizedPhone) {
      setError(copy.formContactRequired);
      return;
    }

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      setError(copy.formEmailInvalid);
      return;
    }

    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      setError(copy.formPhoneInvalid);
      return;
    }

    if (!normalizedMessage) {
      setError(copy.formMessageRequired);
      return;
    }

    setSubmitting(true);

    try {
      await createAssistantInquiry({
        question: normalizedMessage,
        name: normalizedName,
        email: normalizedEmail || undefined,
        phone: normalizedPhone || undefined,
        inquiryType: 'contact-page-form',
        sourcePage: window.location.href,
        pageTitle: language === 'sr' ? 'Kontakt strana | Zepter Real Estate' : 'Contact page | Zepter Real Estate',
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch {
      setError(copy.formError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section contact-message-section">
      <div className="container contact-message-layout">
        <div className="contact-message-intro">
          <span className="eyebrow">{copy.formEyebrow}</span>
          <h2>{copy.formTitle}</h2>
          <p>{copy.formText}</p>
          <div className="contact-message-reminder">
            <span>{copy.formContactLabel}</span>
            <a href="tel:+381112019170">+381 11 20 19 170</a>
            <a href="mailto:realestate@zepter.rs">realestate@zepter.rs</a>
          </div>
        </div>

        <div className="contact-message-card">
          {submitted ? (
            <div className="contact-message-success" role="status">
              <span aria-hidden="true">&#10003;</span>
              <strong>{copy.formSuccess}</strong>
            </div>
          ) : (
            <form className="contact-message-form" onSubmit={submitMessage} noValidate>
              <label className="contact-message-field contact-message-field--wide">
                {copy.formName}
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  maxLength={160}
                  required
                />
              </label>
              <label className="contact-message-field">
                {copy.formEmail}
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </label>
              <label className="contact-message-field">
                {copy.formPhone}
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                />
              </label>
              <label className="contact-message-field contact-message-field--wide">
                {copy.formMessage}
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={6}
                  maxLength={4000}
                  required
                />
              </label>

              {error && <p className="contact-message-error" role="alert">{error}</p>}

              <button className="btn btn--primary contact-message-submit" type="submit" disabled={submitting}>
                {submitting ? copy.formSending : copy.formSubmit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactInquiryForm;
