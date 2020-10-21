import React, { useMemo } from 'react';
import { ImageValue, Maybe } from '../../types/utility';
import styled from 'styled-components';
import { Image } from './ImageComponent';
import { graphql, useStaticQuery } from 'gatsby';
import { LinkDataQuery } from '../../types/graphql-types';

type Props = {
  title: Maybe<string>;
  path: Maybe<string>;
};

const TweetButtonWrapper = styled.div`
  display: inline-block;
  margin: 0 0 1rem 0.5rem;
`;
const TweetButton = styled.a`
  display: block;
  height: 4rem;
  width: 4rem;
`;

const useFetchingLinkData = (): [Maybe<ImageValue>, Maybe<string>] => {
  const linkData: LinkDataQuery = useStaticQuery(graphql`
    query LinkData {
      site {
        siteMetadata {
          domain
        }
      }
      imageSharp(fixed: { originalName: { eq: "TwitterSocialIcon.png" } }) {
        fluid {
          aspectRatio
          src
          srcSet
          sizes
        }
      }
    }
  `);
  return [linkData?.imageSharp?.fluid, linkData?.site?.siteMetadata?.domain];
};
const useFormatShareData = (
  title: Maybe<string>,
  domain: string,
  path: Maybe<string>,
): [string, string] => {
  const shareText = useMemo(() => {
    const message = `${title}\n#水無瀬のプログラミング日記`;
    return encodeURIComponent(message);
  }, [title]);
  const shareUrl = useMemo(() => {
    const currentUrl = new URL(path || '', domain);
    return encodeURIComponent(currentUrl.toString());
  }, [domain, path]);
  return [shareText, shareUrl];
};

export const TwitterShareButton: React.FC<Props> = ({ title, path }) => {
  const [twitterIcon, domain]: [
    Maybe<ImageValue>,
    Maybe<string>,
  ] = useFetchingLinkData();
  if (twitterIcon == undefined || domain == undefined) {
    return null;
  }
  const [shareText, shareUrl] = useFormatShareData(title, domain, path);
  return (
    <TweetButtonWrapper>
      <TweetButton
        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
        title="Twitterに投稿する"
      >
        <Image image={twitterIcon} />
      </TweetButton>
    </TweetButtonWrapper>
  );
};
