import PageHero from '../components/PageHero';
import { getCopy } from '../data/localization';
import type { SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface AboutPageProps {
  language: SupportedLanguage;
}

const aboutImages = [
  publicImage('who we are Zepter-Real Estate.jpg'),
  publicImage('what we do Zepter Real Estate.jpg'),
  publicImage('portfolio Zepter Real Estate.jpg'),
];

const AboutPage = ({ language }: AboutPageProps) => {
  const copy = getCopy(language);

  return (
    <main>
      <PageHero
        eyebrow={copy.about.eyebrow}
        title={copy.about.title}
        text={copy.about.text}
        image={publicImage('portfolio Zepter Real Estate.jpg')}
      />

      <section className="section about-stack">
        <div className="container">
          {copy.about.blocks.map((block, index) => (
            <article className={`about-block ${index % 2 ? 'about-block--reverse' : ''}`} key={block.eyebrow}>
              <div className="about-block__image">
                <img src={aboutImages[index]} alt={block.title} />
              </div>
              <div className="about-block__content">
                <span className="eyebrow">{block.eyebrow}</span>
                <h2>{block.title}</h2>
                <p>{block.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section values-band">
        <div className="container values-grid">
          <div>
            <strong>380.000+</strong>
            <span>{copy.about.squareMeters}</span>
          </div>
          <div>
            <strong>2008</strong>
            <span>{copy.about.established}</span>
          </div>
          <div>
            <strong>{copy.about.regionName}</strong>
            <span>{copy.about.regionalPortfolio}</span>
          </div>
          <div>
            <strong>Zepter</strong>
            <span>{copy.about.groupStandard}</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
