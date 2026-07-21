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
  const valueStats = ['380.000+', '2008', copy.about.regionName, 'Zepter'];

  return (
    <main className="about-page">
      <PageHero
        eyebrow={copy.about.eyebrow}
        title={copy.about.title}
        text={copy.about.text}
        image={publicImage('who we are Zepter-Real Estate.jpg')}
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

      <section className="values-band" aria-label={copy.about.valuesLabel}>
        <div className="container">
          <div className="about-values-heading">
            <span className="eyebrow">{copy.about.valuesEyebrow}</span>
            <h2>{copy.about.valuesTitle}</h2>
          </div>
          <div className="values-grid">
            {copy.about.valueCards.map((card, index) => (
              <article key={card.title}>
                <strong>{valueStats[index]}</strong>
                <span>{card.label}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
