import React from 'react';
import styled from 'styled-components';
import { DeepReadonly } from '../../types/utility';
import { bodyFontSize, fontColor, headerFontSize } from '../styles/variable';

const Article = styled.article`
  display: flex;
  flex-direction: column;
  width: 35rem;
  border-radius: 10px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;
const Title = styled.div`
  font-size: ${headerFontSize.h1};
  text-align: center;
  margin-top: 8px;
`;
const Image = styled.img`
  border-radius: 10px 10px 0 0;
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
  imagePath: string;
};

export const CardComponent: React.FC<DeepReadonly<Props>> = ({
  title,
  path,
  excerpt,
  imagePath,
}) => {
  return (
    <Article>
      <Link href={path}>
        <Image src={imagePath} width="350px" height="200px" />
        <Title>{title}</Title>
        <Description>{excerpt}</Description>
      </Link>
    </Article>
  );
};
