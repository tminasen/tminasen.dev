import React from 'react';
import { Maybe, Optional } from '../../types/utility';
import styled from 'styled-components';
import { Image } from './ImageComponent';
import media from 'styled-media-query';
import { metaData } from '../constants/metaData';

type Props = {
  path: Maybe<string>;
};

const GithubButtonWrapper = styled.div`
  display: inline-block;
  margin: 0 0 1rem 0.5rem;
`;
const GithubButton = styled.a`
  display: block;
  height: 4rem;
  width: 4rem;
  ${media.lessThan('small')`
    height: 3rem;
    width: 3rem;
  `}
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
      <GithubButton href={buttonLink} title="Githubリンク">
        {/* TODO: スマホは30*30 */}
        <Image
          imageSrc={metaData.githubIcon}
          alt="Githubリンク"
          width={40}
          height={40}
        />
      </GithubButton>
    </GithubButtonWrapper>
  );
};
