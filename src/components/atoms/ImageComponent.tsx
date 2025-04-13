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
}

export const Image: FC<Props> = ({
  imageSrc,
  isRounded,
  alt
}) => {
  return (
    <picture>
      <source type="image/webp" srcSet={imageSrc.replace(/\.png$/, '.webp')} />
      <img
        className={`${isRounded ? '' : 'rounded-t-lg'} w-(--image-sp-width) sm:w-(--image-pc-width)`}
        src={imageSrc}
        alt={alt}
      />
    </picture>
  );
};
