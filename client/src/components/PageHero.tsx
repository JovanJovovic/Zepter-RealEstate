interface PageHeroProps {
  eyebrow?: string;
  title: string;
  text?: string;
  image?: string;
  compact?: boolean;
}

const PageHero = ({ eyebrow, title, text, image, compact }: PageHeroProps) => {
  return (
    <section className={`page-hero ${compact ? 'page-hero--compact' : ''}`}>
      {image && <img className="page-hero__image" src={image} alt="" />}
      <div className="page-hero__overlay" />
      <div className="container page-hero__content reveal-on-load">
        {eyebrow && <span className="eyebrow eyebrow--light">{eyebrow}</span>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  );
};

export default PageHero;
