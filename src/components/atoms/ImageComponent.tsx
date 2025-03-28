import React from 'react';
import styled from 'styled-components';
import media from 'styled-media-query';

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

interface ImageProps {
  isRounded: boolean;
  styledWidth: {
    pc: number;
    sp: number;
  };
  styledHeight: {
    pc: number;
    sp: number;
  };
}

const StyledImage = styled.img<ImageProps>`
  ${({ isRounded }) => (isRounded ? `border-radius: 10px 10px 0 0;` : '')}
  width: ${({ styledWidth: { pc } }) => pc}px;
  height: ${({ styledHeight: { pc } }) => pc}px;
  ${media.lessThan('small')`
    width: ${({ styledWidth: { sp } }: ImageProps) => sp}px;
    height: ${({ styledHeight: { sp } }: ImageProps) => sp}px;
  `}
`;

export const Image: React.FC<Props> = ({
  imageSrc,
  isRounded,
  alt,
  width,
  height,
}) => {
  return (
    <picture>
      <source type="image/webp" srcSet={imageSrc.replace(/\.png$/, '.webp')} />
      <StyledImage
        src={imageSrc}
        alt={alt}
        isRounded={isRounded}
        width={width.pc}
        height={height.pc}
        styledWidth={width}
        styledHeight={height}
      />
    </picture>
  );
};
