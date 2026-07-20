import { getArticleCopy } from '../data/articleCopy';
import type { ArticleType, PublicArticle } from '../types/article';
import type { SupportedLanguage } from '../types/property';
import { articleImageUrl, formatArticleDate } from '../utils/article';
import { publicImage } from '../utils/asset';

interface ArticleCardProps {
  article: PublicArticle;
  type: ArticleType;
  language: SupportedLanguage;
  onOpen: () => void;
}

const ArticleCard = ({ article, type, language, onOpen }: ArticleCardProps) => {
  const copy = getArticleCopy(language);
  const fallback = type === 'blog'
    ? publicImage('portfolio Zepter Real Estate.jpg')
    : publicImage('who we are Zepter-Real Estate.jpg');

  return (
    <article className={`article-card article-card--${type}`}>
      <button onClick={onOpen} aria-label={`${copy.readMore}: ${article.title}`}>
        <div className="article-card__media">
          <img src={articleImageUrl(article.coverImage) || fallback} alt="" />
          {article.featured && <span className="article-card__featured">ZRE</span>}
        </div>
        <div className="article-card__content">
          <div className="article-card__meta">
            {article.publishedAt && <time>{formatArticleDate(article.publishedAt, language)}</time>}
            {article.category && <span>{article.category}</span>}
          </div>
          <h2>{article.title}</h2>
          {article.excerpt && <p>{article.excerpt}</p>}
          <span className="article-card__link">{copy.readMore}<i aria-hidden="true">→</i></span>
        </div>
      </button>
    </article>
  );
};

export default ArticleCard;
