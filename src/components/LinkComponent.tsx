import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { fontColor } from '../styles/variable';

export type LinkColor = 'white' | 'black';

interface Props {
  url: string;
  color: LinkColor;
}

const StyledLink = styled.a<{ color: LinkColor }>`
  color: ${({ color }) => getLinkColor(color)};
  text-decoration: none;
`;
const getLinkColor = (color: LinkColor): string => {
  switch (color) {
    case 'white':
      return fontColor.white;
    case 'black':
      return fontColor.black;
    default:
      const _invalidColor: never = color;
      console.error(`${_invalidColor} is invalid.`);
      return color;
  }
};

export const LinkComponent: React.FC<Props> = ({ url, color, children }) => {
  return (
    <Link href={url} passHref>
      <StyledLink color={color}>{children}</StyledLink>
    </Link>
  );
};
