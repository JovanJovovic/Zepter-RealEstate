import PageHero from '../components/PageHero';
import { publicImage } from '../utils/asset';

const aboutBlocks = [
  {
    eyebrow: 'Who we are',
    title: 'The company with one of the largest real estate portfolios in Serbia.',
    text: 'We create long-term relationships with our clients by providing best possible solutions for their needs. Zepter Real Estate is part of Zepter Group in Serbia.',
    image: publicImage('who we are Zepter-Real Estate.jpg'),
  },
  {
    eyebrow: 'What we do',
    title: 'Ownership, management and development of high-value real estate assets.',
    text: 'Established in 2008, Zepter Real Estate owns, manages and develops one of the largest residential, retail, commercial, office, industrial and mixed-use portfolios in Serbia. The company continues to acquire and develop quality properties based on realistic values.',
    image: publicImage('what we do Zepter Real Estate.jpg'),
  },
  {
    eyebrow: 'Portfolio',
    title: 'Retail, office, industrial, residential and warehousing premises across Serbia.',
    text: 'Our portfolio comprises over 380.000 square meters, located in Belgrade and other significant cities and towns in the country. Our management activities focus on assessment of property potential and activation through rent and sale.',
    image: publicImage('portfolio Zepter Real Estate.jpg'),
  },
];

const AboutPage = () => {
  return (
    <main>
      <PageHero
        eyebrow="About Zepter Real Estate"
        title="A comprehensive regional real estate company."
        text="We combine portfolio scale, professional service and a long-term approach to property value."
        image={publicImage('portfolio Zepter Real Estate.jpg')}
      />

      <section className="section about-stack">
        <div className="container">
          {aboutBlocks.map((block, index) => (
            <article className={`about-block ${index % 2 ? 'about-block--reverse' : ''}`} key={block.eyebrow}>
              <div className="about-block__image">
                <img src={block.image} alt={block.title} />
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
            <span>square meters</span>
          </div>
          <div>
            <strong>2008</strong>
            <span>established</span>
          </div>
          <div>
            <strong>Serbia</strong>
            <span>regional portfolio</span>
          </div>
          <div>
            <strong>Zepter</strong>
            <span>group standard</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
