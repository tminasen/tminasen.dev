import React from 'react';
import styled from 'styled-components';
import { DeepReadonly } from '../../types/utility';
import {
  bodyFontSize,
  contentsBackgroundColor,
  fontColor,
  headerFontSize,
} from '../styles/variable';
import media from 'styled-media-query';
import { Image } from './ImageComponent';
import { ThumbnailImage } from '../../types/article';

const Article = styled.article`
  display: flex;
  flex-direction: column;
  width: 38.4rem;
  border-radius: 10px;
  background-color: ${contentsBackgroundColor.white};
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  ${media.lessThan('small')`
    width: 32rem;
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
  image: ThumbnailImage;
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
        <Image
          imageSrc={image.url}
          alt={title}
          width={{ pc: image.size.pc.width, sp: image.size.sp.width }}
          height={{ pc: image.size.pc.height, sp: image.size.sp.height }}
        />
        <Title>{title}</Title>
        <Description>{excerpt}</Description>
      </Link>
    </Article>
  );
};
