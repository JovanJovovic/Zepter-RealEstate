import { useEffect, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

import { articleImageUrl } from '../utils/article';

interface ArticleImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  source?: string | null;
  unavailableText: string;
  emptyText?: string;
  unavailableClassName?: string;
  linkToSource?: boolean;
  linkClassName?: string;
}

const ArticleImage = ({
  source,
  unavailableText,
  emptyText,
  unavailableClassName = '',
  linkToSource = false,
  linkClassName,
  ...imageProps
}: ArticleImageProps) => {
  const resolvedUrl = articleImageUrl(source);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolvedUrl]);

  if (!resolvedUrl || failed) {
    const stateClassName = ['article-image-unavailable', unavailableClassName]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={stateClassName} role="img" aria-label={failed ? unavailableText : emptyText || unavailableText}>
        <span>{failed ? unavailableText : emptyText || unavailableText}</span>
      </div>
    );
  }

  const image = (
    <img
      {...imageProps}
      src={resolvedUrl}
      onError={() => setFailed(true)}
    />
  );

  if (!linkToSource) return image;

  return (
    <a className={linkClassName} href={resolvedUrl} target="_blank" rel="noreferrer">
      {image}
    </a>
  );
};

export default ArticleImage;
