import React from 'react';
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

const Img = styled.img<ImageProps>`
  width: ${({ styledWidth: { pc } }) => pc}px;
  height: ${({ styledHeight: { pc } }) => pc}px;
  ${media.lessThan<ImageProps>('small')`
    width: ${({ styledWidth: { sp } }) => sp}px;
    height: ${({ styledHeight: { sp } }) => sp}px;
  `}
`;

export const Image: React.FC<Props> = ({ imageSrc, alt, width, height }) => (
  <Img
    src={imageSrc}
    alt={alt}
    width={width.pc}
    height={height.pc}
    styledWidth={width}
    styledHeight={height}
  />
);
