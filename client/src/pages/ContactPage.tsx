import NewsletterBlock from '../components/NewsletterBlock';
import PageHero from '../components/PageHero';
import { publicImage } from '../utils/asset';

const ContactPage = () => {
  return (
    <main>
      <PageHero
        compact
        eyebrow="Contact"
        title="Real estate · Real deal"
        text="Reach Zepter Real Estate for portfolio information, commercial spaces and development opportunities."
        image={publicImage('what we do Zepter Real Estate.jpg')}
      />

      <section className="section contact-section">
        <div className="container contact-grid">
          <div className="contact-card contact-card--main">
            <span className="eyebrow">Get in touch</span>
            <h2>REAL ESTATE - REAL DEAL</h2>
            <p className="contact-hours">Mon - Fri / 09:00 - 17:00</p>

            <div className="contact-list">
              <a href="tel:+381698900003">+381 69 89 00 003</a>
              <a href="tel:+381112019170">+381 11 20 19 170</a>
              <a href="mailto:realestate@zepter.rs">realestate@zepter.rs</a>
            </div>

            <div className="address-box">
              <span>We are located at:</span>
              <strong>Bulevar Mihaila Pupina 117, 11070 Novi Beograd, Srbija</strong>
            </div>
          </div>

          <div className="map-card">
            <div className="map-card__header">
              <span className="eyebrow">Need directions?</span>
              <h2>Find us in Novi Beograd</h2>
            </div>
            <iframe
              title="Zepter Real Estate location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Bulevar%20Mihaila%20Pupina%20117%2C%2011070%20Novi%20Beograd%2C%20Srbija&output=embed"
            />
          </div>
        </div>
      </section>

      <NewsletterBlock />
    </main>
  );
};

export default ContactPage;
