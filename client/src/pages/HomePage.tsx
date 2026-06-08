import { useEffect, useState } from 'react';
import { getFeaturedProperties } from '../api/properties';
import LoadingState from '../components/LoadingState';
import NewsletterBlock from '../components/NewsletterBlock';
import PropertyCard from '../components/PropertyCard';
import { getCopy } from '../data/localization';
import type { Property, SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface HomePageProps {
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const HERO_ROTATION_MS = 10000;

type HeroSlide = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  text: string;
  primaryStat: string;
  primaryText: string;
  secondaryStat: string;
  secondaryText: string;
};

const heroSlides: Record<'en' | 'sr', HeroSlide[]> = {
  en: [
    {
      image: publicImage('who we are Zepter-Real Estate.jpg'),
      alt: 'Zepter Real Estate business portfolio presentation',
      eyebrow: 'WELCOME TO ZEPTER REAL ESTATE',
      title: 'Regional real estate portfolio with a premium business standard.',
      text: 'We strive to create value for both sides through efficient and reliable transactions, and to build long-term cooperation with our clients.',
      primaryStat: '380,000+',
      primaryText: 'sqm portfolio',
      secondaryStat: 'Since 2008',
      secondaryText: 'ownership, management and development',
    },
    {
      image: publicImage('what we do Zepter Real Estate.jpg'),
      alt: 'Zepter Real Estate professional property management',
      eyebrow: 'WHAT WE DO',
      title: 'Professional management, development and presentation of Zepter properties.',
      text: 'We connect business needs with quality spaces, clear information and a reliable leasing or sales process.',
      primaryStat: 'Commercial spaces',
      primaryText: 'retail units, offices and business properties',
      secondaryStat: 'Clear process',
      secondaryText: 'viewing, contact and team support',
    },
    {
      image: publicImage('portfolio Zepter Real Estate.jpg'),
      alt: 'Zepter Real Estate selected premium locations',
      eyebrow: 'ZEPTER PORTFOLIO',
      title: 'Carefully selected properties in attractive business locations.',
      text: 'Our portfolio includes spaces for different uses, from office and commercial properties to retail units, land and other investment opportunities.',
      primaryStat: 'Multiple categories',
      primaryText: 'commercial and residential properties',
      secondaryStat: 'Premium locations',
      secondaryText: 'visibility, access and market potential',
    },
  ],
  sr: [
    {
      image: publicImage('who we are Zepter-Real Estate.jpg'),
      alt: 'Zepter Real Estate poslovni portfolio nekretnina',
      eyebrow: 'WELCOME TO ZEPTER REAL ESTATE',
      title: 'Regionalni portfolio nekretnina sa premium poslovnim standardom.',
      text: 'Težimo tome da kroz efikasne i pouzdane transakcije ostvarimo korist za obe strane i izgradimo dugoročnu saradnju sa klijentima.',
      primaryStat: '380.000+',
      primaryText: 'm² portfolija',
      secondaryStat: 'Od 2008.',
      secondaryText: 'vlasništvo, upravljanje i razvoj',
    },
    {
      image: publicImage('what we do Zepter Real Estate.jpg'),
      alt: 'Zepter Real Estate profesionalno upravljanje nekretninama',
      eyebrow: 'WHAT WE DO',
      title: 'Profesionalno upravljanje, razvoj i prezentacija Zepter nekretnina.',
      text: 'Povezujemo poslovne potrebe korisnika sa kvalitetnim prostorima, jasnim informacijama i pouzdanim procesom zakupa ili prodaje.',
      primaryStat: 'Komercijalni prostori',
      primaryText: 'lokali, kancelarije i poslovni objekti',
      secondaryStat: 'Jasan proces',
      secondaryText: 'pregled, kontakt i podrška tima',
    },
    {
      image: publicImage('portfolio Zepter Real Estate.jpg'),
      alt: 'Zepter Real Estate odabrane premium lokacije',
      eyebrow: 'ZEPTER PORTFOLIO',
      title: 'Pažljivo odabrane nekretnine na atraktivnim poslovnim lokacijama.',
      text: 'Naš portfolio obuhvata prostore različitih namena, od kancelarijskih i komercijalnih objekata do lokala, zemljišta i drugih investicionih prilika.',
      primaryStat: 'Više kategorija',
      primaryText: 'komercijalne i rezidencijalne nekretnine',
      secondaryStat: 'Premium lokacije',
      secondaryText: 'vidljivost, pristup i tržišni potencijal',
    },
  ],
};

const HomePage = ({ navigate, language }: HomePageProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const copy = getCopy(language);
  const slides = language === 'sr' ? heroSlides.sr : heroSlides.en;
  const activeSlide = slides[activeSlideIndex];

  useEffect(() => {
    if (isHeroPaused) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlideIndex((current) => (current + 1) % slides.length);
    }, HERO_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [activeSlideIndex, isHeroPaused, slides.length]);

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [language]);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    getFeaturedProperties(language)
      .then((data) => {
        if (mounted) setProperties(data);
      })
      .catch(() => {
        if (mounted) setProperties([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [language]);

  return (
    <main>
      <section className="home-hero" onMouseEnter={() => setIsHeroPaused(true)} onMouseLeave={() => setIsHeroPaused(false)}>
        <div className="home-hero__bg" />
        <div className="container home-hero__grid">
          <div className="home-hero__content reveal-on-load">
            <div className="home-hero__text-slider" aria-live="polite">
              {slides.map((slide, index) => (
                <div
                  className={`home-hero__text-slide ${index === activeSlideIndex ? 'home-hero__text-slide--active' : ''}`}
                  key={slide.title}
                  aria-hidden={index !== activeSlideIndex}
                >
                  <h1>{slide.title}</h1>
                  <p>{slide.text}</p>
                </div>
              ))}
            </div>
            <div className="hero-actions">
              <button className="btn btn--primary btn--large" onClick={() => navigate('/commercial')}>
                {copy.home.explore}
              </button>
              <button className="btn btn--light btn--large" onClick={() => navigate('/about')}>
                {copy.home.about}
              </button>
            </div>
            <div className="hero-slider-dots" aria-label="Hero slides">
              {slides.map((slide, index) => (
                <button
                  className={`hero-slider-dot ${index === activeSlideIndex ? 'hero-slider-dot--active' : ''}`}
                  key={slide.eyebrow}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
                  aria-current={index === activeSlideIndex}
                  onClick={() => setActiveSlideIndex(index)}
                />
              ))}
            </div>
          </div>

          <div className="hero-showcase reveal-on-load reveal-delay-1">
            {slides.map((slide, index) => (
              <img
                className={`hero-showcase__image ${index === activeSlideIndex ? 'hero-showcase__image--active' : ''}`}
                src={slide.image}
                alt={slide.alt}
                key={slide.image}
                aria-hidden={index !== activeSlideIndex}
              />
            ))}
            <div className="hero-stat hero-stat--top">
              <div className="hero-stat__content" key={`primary-${activeSlideIndex}`}>
                <strong>{activeSlide.primaryStat}</strong>
                <span>{activeSlide.primaryText}</span>
              </div>
            </div>
            <div className="hero-stat hero-stat--bottom">
              <div className="hero-stat__content" key={`secondary-${activeSlideIndex}`}>
                <strong>{activeSlide.secondaryStat}</strong>
                <span>{activeSlide.secondaryText}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section intro-section">
        <div className="container split-intro">
          <div>
            <span className="eyebrow">{copy.home.introEyebrow}</span>
            <h2>{copy.home.introTitle}</h2>
          </div>
          <p>{copy.home.introText}</p>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container section-heading-row">
          <div>
            <span className="eyebrow">{copy.home.featuredEyebrow}</span>
            <h2>{copy.home.featuredTitle}</h2>
          </div>
          <button className="btn btn--ghost" onClick={() => navigate('/commercial')}>
            {copy.home.viewAll}
          </button>
        </div>

        <div className="container property-grid property-grid--featured">
          {loading ? (
            <LoadingState text={copy.home.loadingFeatured} />
          ) : (
            properties.map((property) => <PropertyCard key={property._id} property={property} navigate={navigate} language={language} />)
          )}
        </div>
      </section>

      <section className="section services-section">
        <div className="container services-grid">
          <div className="service-card service-card--large">
            <span className="eyebrow">{copy.home.servicesEyebrow}</span>
            <h2>{copy.home.servicesTitle}</h2>
            <p>{copy.home.servicesText}</p>
          </div>
          <div className="service-card">
            <h3>{copy.home.commercialSpaces}</h3>
            <p>{copy.home.commercialSpacesText}</p>
          </div>
          <div className="service-card">
            <h3>{copy.home.portfolioManagement}</h3>
            <p>{copy.home.portfolioManagementText}</p>
          </div>
          <div className="service-card">
            <h3>{copy.home.clientRelationships}</h3>
            <p>{copy.home.clientRelationshipsText}</p>
          </div>
          <div className="service-card">
            <h3>{copy.home.investmentAdvisory}</h3>
            <p>{copy.home.investmentAdvisoryText}</p>
          </div>
        </div>
      </section>

      <NewsletterBlock language={language} />
    </main>
  );
};

export default HomePage;
