import { FC } from 'react';

interface Props {
  imageSrc: string;
  isRounded: boolean;
  alt: string;
  width: {
    pc: number;
    sp: number;
  };
  height: {
    pc: number;
    sp: number;
  };
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'lazy' | 'eager';
  srcSet?: string;
}

export const Image: FC<Props> = ({
  imageSrc,
  isRounded,
  alt,
  width,
  height,
  fetchPriority,
  loading,
  srcSet,
}) => {
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={srcSet ?? imageSrc.replace(/\.png$/, '.webp')}
        sizes={srcSet ? `${width.sp}px` : undefined}
      />
      <img
        className={`${isRounded ? 'rounded-t-lg' : ''} w-(--image-sp-width) sm:w-(--image-pc-width) aspect-video object-cover`}
        src={imageSrc}
        alt={alt}
        width={width.sp}
        height={height.sp}
        fetchPriority={fetchPriority}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
};
