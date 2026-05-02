import NewsletterBlock from '../components/NewsletterBlock';
import PageHero from '../components/PageHero';
import { getCopy } from '../data/localization';
import type { SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface ContactPageProps {
  language: SupportedLanguage;
}

const ContactPage = ({ language }: ContactPageProps) => {
  const copy = getCopy(language);

  return (
    <main>
      <PageHero
        compact
        eyebrow={copy.contact.eyebrow}
        title={copy.contact.title}
        text={copy.contact.text}
        image={publicImage('what we do Zepter Real Estate.jpg')}
      />

      <section className="section contact-section">
        <div className="container contact-grid">
          <div className="contact-card contact-card--main">
            <span className="eyebrow">{copy.contact.getInTouch}</span>
            <h2>REAL ESTATE - REAL DEAL</h2>
            <p className="contact-hours">{copy.contact.hours}</p>

            <div className="contact-list">
              <a href="tel:+381698900003">+381 69 89 00 003</a>
              <a href="tel:+381112019170">+381 11 20 19 170</a>
              <a href="mailto:realestate@zepter.rs">realestate@zepter.rs</a>
            </div>

            <div className="address-box">
              <span>{copy.contact.located}</span>
              <strong>Bulevar Mihaila Pupina 117, 11070 Novi Beograd, Srbija</strong>
            </div>
          </div>

          <div className="map-card">
            <div className="map-card__header">
              <span className="eyebrow">{copy.contact.directions}</span>
              <h2>{copy.contact.findUs}</h2>
            </div>
            <iframe
              title={copy.contact.mapTitle}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Bulevar%20Mihaila%20Pupina%20117%2C%2011070%20Novi%20Beograd%2C%20Srbija&output=embed"
            />
          </div>
        </div>
      </section>

      <NewsletterBlock language={language} />
    </main>
  );
};

export default ContactPage;
