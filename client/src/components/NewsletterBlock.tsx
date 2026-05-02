import { useState } from 'react';
import type { FormEvent } from 'react';
import { subscribeToNewsletter } from '../api/properties';
import { getCopy } from '../data/localization';
import type { SupportedLanguage } from '../types/property';

interface NewsletterBlockProps {
  language: SupportedLanguage;
}

const NewsletterBlock = ({ language }: NewsletterBlockProps) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const copy = getCopy(language);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await subscribeToNewsletter(email);
      setStatus('success');
      setMessage(response.message || copy.newsletter.success);
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : copy.newsletter.error);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container newsletter-card">
        <div>
          <span className="eyebrow">{copy.newsletter.eyebrow}</span>
          <h2>{copy.newsletter.title}</h2>
          <p>{copy.newsletter.text}</p>
        </div>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email">{copy.newsletter.label}</label>
          <div className="newsletter-input-row">
            <input
              id="newsletter-email"
              type="email"
              value={email}
              placeholder={copy.newsletter.placeholder}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button className="btn btn--primary" disabled={status === 'loading'}>
              {status === 'loading' ? copy.newsletter.sending : copy.newsletter.subscribe}
            </button>
          </div>
          {message && <p className={`form-message form-message--${status}`}>{message}</p>}
        </form>
      </div>
    </section>
  );
};

export default NewsletterBlock;
