import React from 'react';
import NextImage from 'next/image';
import styled from 'styled-components';
import media from 'styled-media-query';

interface Props {
  imageSrc: string;
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
  styledWidth: {
    pc: number;
    sp: number;
  };
  styledHeight: {
    pc: number;
    sp: number;
  };
}

const StyledImage = styled(NextImage)<ImageProps>`
  border-radius: 10px 10px 0 0;
  width: ${({ styledWidth: { pc } }) => pc}px;
  height: ${({ styledHeight: { pc } }) => pc}px;
  ${media.lessThan<ImageProps>('small')`
    width: ${({ styledWidth: { sp } }) => sp}px;
    height: ${({ styledHeight: { sp } }) => sp}px;
  `}
`;

export const Image: React.FC<Props> = ({ imageSrc, alt, width, height }) => {
  return (
    <StyledImage
      src={imageSrc}
      alt={alt}
      width={width.pc}
      height={height.pc}
      styledWidth={width}
      styledHeight={height}
    />
  );
};
