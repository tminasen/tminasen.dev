import React from 'react';
import { Maybe, Optional } from '../../../types/utility';
import styled from 'styled-components';
import media from 'styled-media-query';
import { metaData } from '../../constants/metaData';

type Props = {
  path: Maybe<string>;
};

const GithubButtonWrapper = styled.div`
  display: inline-block;
  margin: 0 0 1rem 0.5rem;
`;
const GithubButton = styled.a`
  display: block;
  height: 40px;
  width: 40px;
  position: relative;

  ${media.lessThan('small')`
    height: 30px;
    width: 30px;
  `}
`;
const Icon = styled.img`
  object-fit: contain;
  width: 100%;
  height: 100%;
`;

const useCreateGithubArticleLink = (path: Maybe<string>) => {
  // `/blog/article`の形式なので、3番目を使用
  const articlePath: Optional<string> = path?.split('/')[2];
  if (articlePath == undefined) {
    return undefined;
  }
  return new URL(
    `tminasen.dev/tree/master/src/md-pages/${articlePath}/article${articlePath}.md`,
    metaData.githubUrl,
  ).toString();
};

export const GithubArticleButton: React.FC<Props> = ({ path }) => {
  const buttonLink = useCreateGithubArticleLink(path);
  if (!buttonLink) {
    return null;
  }
  return (
    <GithubButtonWrapper>
      <GithubButton href={buttonLink} title="Githubリンク" target="_blank">
        <picture>
          <source
            type="image/webp"
            srcSet={metaData.githubIcon.replace(/\.png$/, '.webp')}
          />
          <source type="image/png" srcSet={metaData.githubIcon} />
          <Icon src={metaData.githubIcon} alt="Githubリンク" />
        </picture>
      </GithubButton>
    </GithubButtonWrapper>
  );
};
