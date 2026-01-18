import { FC } from 'react';
import { DeepReadonly } from '../types/utility';
import { Image } from './atoms/ImageComponent';
import { ThumbnailImage } from '../types/article';

type Props = {
  title: string;
  path: string;
  excerpt: string;
  image: ThumbnailImage;
  date: string;
  tags: string[];
};

export const CardComponent: FC<DeepReadonly<Props>> = ({
  title,
  path,
  excerpt,
  image,
  date,
  tags,
}) => {
  const displayTags = tags.slice(0, 3);

  return (
    <article className="flex flex-col w-(--card-image-width) h-(--card-max-height) rounded-lg bg-(--color-bg-card) shadow-md">
      <a className="text-(--color-text-base) no-underline" href={path}>
        <Image
          imageSrc={image.url}
          isRounded={true}
          alt={title}
          width={{ pc: image.size.pc.width, sp: image.size.sp.width }}
          height={{ pc: image.size.pc.height, sp: image.size.sp.height }}
        />
        <div className="px-2">
          <h1 className="text-2xl font-bold text-center mt-2 max-h-(--card-title-height) leading-(--card-title-line-height) line-clamp-2 overflow-hidden">
            {title}
          </h1>
          <p className="text-sm mt-1 text-(--color-text-muted)">{date}</p>
          <div className="flex gap-2 text-xs text-(--color-text-muted) mt-1">
            {displayTags.map(tag => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
          <p className="text-base mt-3 line-clamp-4">{excerpt}</p>
        </div>
      </a>
    </article>
  );
};
