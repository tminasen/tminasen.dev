import { FC } from 'react';
import { DeepReadonly } from '../types/utility';
import { Image } from './atoms/ImageComponent';
import { ThumbnailImage } from '../types/article';
import { toIsoDateString } from '../libraries/date';

type Props = {
  title: string;
  path: string;
  excerpt: string;
  image: ThumbnailImage;
  date: string;
  tags: string[];
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'lazy' | 'eager';
};

export const CardComponent: FC<DeepReadonly<Props>> = ({
  title,
  path,
  excerpt,
  image,
  date,
  tags,
  fetchPriority,
  loading,
}) => {
  const displayTags = tags.slice(0, 3);

  return (
    <article className="flex flex-col w-(--card-image-width) overflow-hidden rounded-xl outline -outline-offset-1 outline-(--color-border) bg-(--color-bg-card) shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <a
        className="text-(--color-text-base) no-underline focus-visible:-outline-offset-2"
        href={path}
      >
        <Image
          imageSrc={image.url}
          isRounded={true}
          alt=""
          width={{ pc: image.size.pc.width, sp: image.size.sp.width }}
          height={{ pc: image.size.pc.height, sp: image.size.sp.height }}
          fetchPriority={fetchPriority}
          loading={loading}
          srcSet={image.srcSet}
        />
        <div className="flex flex-col gap-2 p-4">
          <time
            className="text-[13px] text-(--color-text-muted)"
            dateTime={toIsoDateString(date)}
          >
            {date}
          </time>
          <h2 className="text-lg font-bold text-left leading-[1.45] line-clamp-2">
            {title}
          </h2>
          <p className="text-sm leading-[1.7] text-(--color-text-muted) line-clamp-3">
            {excerpt}
          </p>
          <div className="flex flex-wrap gap-2 text-[13px] text-(--color-text-muted)">
            {displayTags.map(tag => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
      </a>
    </article>
  );
};
