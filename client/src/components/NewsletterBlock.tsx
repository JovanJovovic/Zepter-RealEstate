import { FormEvent, useState } from 'react';
import { subscribeToNewsletter } from '../api/properties';

const NewsletterBlock = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await subscribeToNewsletter(email);
      setStatus('success');
      setMessage(response.message || 'Thank you for subscribing.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Newsletter subscription failed.');
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container newsletter-card">
        <div>
          <span className="eyebrow">Stay informed</span>
          <h2>Sign up for our newsletter</h2>
          <p>If you would like to receive our newsletter, leave your e-mail so we can inform you on the newest developments.</p>
        </div>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email">Enter your email</label>
          <div className="newsletter-input-row">
            <input
              id="newsletter-email"
              type="email"
              value={email}
              placeholder="your.email@example.com"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button className="btn btn--primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Subscribe'}
            </button>
          </div>
          {message && <p className={`form-message form-message--${status}`}>{message}</p>}
        </form>
      </div>
    </section>
  );
};

export default NewsletterBlock;
