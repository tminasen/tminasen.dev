import React from 'react';
import styled from 'styled-components';
import { DeepReadonly, ImageValue } from '../../types/utility';
import {
  bodyFontSize,
  contentsBackgroundColor,
  fontColor,
  headerFontSize,
  imageStyle,
} from '../styles/variable';
import { Image } from './ImageComponent';
import media from 'styled-media-query';

const Article = styled.article`
  display: flex;
  flex-direction: column;
  width: 35rem;
  border-radius: 10px;
  background-color: ${contentsBackgroundColor.white};
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  ${media.lessThan('small')`
    width: 30rem;
  `}
`;
const Title = styled.div`
  font-size: ${headerFontSize.h1};
  text-align: center;
  margin-top: 8px;
`;
const Description = styled.div`
  font-size: ${bodyFontSize.medium};
  margin-top: 8px;
  padding: 4px;
`;
const Link = styled.a`
  color: ${fontColor.black};
  text-decoration: none;
`;

type Props = {
  title: string;
  path: string;
  excerpt: string;
  image: ImageValue;
};

export const CardComponent: React.FC<DeepReadonly<Props>> = ({
  title,
  path,
  excerpt,
  image,
}) => {
  return (
    <Article>
      <Link href={path}>
        <Image image={image} imageStyle={imageStyle} />
        <Title>{title}</Title>
        <Description>{excerpt}</Description>
      </Link>
    </Article>
  );
};
