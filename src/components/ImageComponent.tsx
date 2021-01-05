import React from 'react';

type Props = {
  imageSrc: string;
  alt: string;
  width: number;
  height: number;
};

export const Image: React.FC<Props> = ({ imageSrc, alt, width, height }) => (
  <img src={imageSrc} alt={alt} width={width} height={height} />
);
