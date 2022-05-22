import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { color } from '../../styles/variable';
export type LinkColor = 'white' | 'black';

interface Props {
  url: string;
  color: LinkColor;
  children: React.ReactNode;
}

const StyledLink = styled.a<{ linkColor: LinkColor }>`
  color: ${({ linkColor }) => getLinkColor(linkColor)};
  text-decoration: none;
`;
const getLinkColor = (linkColor: LinkColor): string => {
  switch (linkColor) {
    case 'white':
      return color.textWhite;
    case 'black':
      return color.textBlack;
    default:
      const _invalidColor: never = linkColor;
      console.error(`${_invalidColor} is invalid.`);
      return linkColor;
  }
};

export const LinkComponent: React.FC<Props> = ({ url, color, children }) => {
  return (
    <Link href={url} passHref>
      <StyledLink linkColor={color}>{children}</StyledLink>
    </Link>
  );
};
