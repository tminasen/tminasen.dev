import React from 'react';
import { ImageValue, Maybe, Optional } from '../../types/utility';
import styled from 'styled-components';
import { graphql, useStaticQuery } from 'gatsby';
import { Image } from './ImageComponent';
import { GithubLinkDataQuery } from '../../types/graphql-types';
import media from 'styled-media-query';

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

const useFetchingLinkData = (): [Maybe<ImageValue>, Maybe<string>] => {
  const linkData: GithubLinkDataQuery = useStaticQuery(graphql`
    query GithubLinkData {
      site {
        siteMetadata {
          githubUrl
        }
      }
      imageSharp(fixed: { originalName: { eq: "GithubIcon.png" } }) {
        fluid {
          aspectRatio
          src
          srcSet
          sizes
        }
      }
    }
  `);
  return [linkData?.imageSharp?.fluid, linkData?.site?.siteMetadata?.githubUrl];
};
const useCreateGithubArticleLink = (
  url: Maybe<string>,
  path: Maybe<string>,
) => {
  // `/blog/article`の形式なので、3番目を使用
  const articlePath: Optional<string> = path?.split('/')[2];
  if (url == undefined || articlePath == undefined) {
    return undefined;
  }
  return new URL(
    `tminasen.dev/tree/master/src/md-pages/${articlePath}/article${articlePath}.md`,
    url,
  ).toString();
};

export const GithubArticleButton: React.FC<Props> = ({ path }) => {
  const [icon, url] = useFetchingLinkData();
  if (icon == undefined) {
    return null;
  }
  const buttonLink = useCreateGithubArticleLink(url, path);
  return (
    <GithubButtonWrapper>
      <GithubButton href={buttonLink} title="Githubリンク">
        <Image image={icon} />
      </GithubButton>
    </GithubButtonWrapper>
  );
};
