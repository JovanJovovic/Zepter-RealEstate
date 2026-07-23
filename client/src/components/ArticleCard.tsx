import { getArticleCopy } from '../data/articleCopy';
import type { ArticleType, PublicArticle } from '../types/article';
import type { SupportedLanguage } from '../types/property';
import { formatArticleDate } from '../utils/article';
import ArticleImage from './ArticleImage';

interface ArticleCardProps {
  article: PublicArticle;
  type: ArticleType;
  language: SupportedLanguage;
  onOpen: () => void;
}

const ArticleCard = ({ article, type, language, onOpen }: ArticleCardProps) => {
  const copy = getArticleCopy(language);

  return (
    <article className={`article-card article-card--${type}`}>
      <button onClick={onOpen} aria-label={`${copy.readMore}: ${article.title}`}>
        <div className="article-card__media">
          <ArticleImage
            source={article.coverImage}
            alt=""
            unavailableText={copy.imageUnavailable}
            emptyText={copy.noImage}
            loading="lazy"
          />
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
