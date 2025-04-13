import { FC } from 'react';
import { DeepReadonly } from '../../types/utility';
import { Image } from './atoms/ImageComponent';
import { ThumbnailImage } from '../../types/article';

type Props = {
  title: string;
  path: string;
  excerpt: string;
  image: ThumbnailImage;
};

export const CardComponent: FC<DeepReadonly<Props>> = ({
  title,
  path,
  excerpt,
  image,
}) => {
  return (
    <article className='flex flex-col w-(--card-image-width) max-h-(--card-max-height) rounded-lg bg-white shadow-md'>
      <a className='text-(--color-text-base) no-underline' href={path}>
        <Image
          imageSrc={image.url}
          isRounded={true}
          alt={title}
          width={{ pc: image.size.pc.width, sp: image.size.sp.width }}
          height={{ pc: image.size.pc.height, sp: image.size.sp.height }}
        />
        <h1 className='text-2xl text-center my-2'>{title}</h1>
        <p className='text-base px-2'>{excerpt}</p>
      </a>
    </article>
  );
};
