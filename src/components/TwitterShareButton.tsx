import React from 'react';
import { Maybe } from '../../types/utility';
import styled from 'styled-components';
import { Image } from './ImageComponent';
import media from 'styled-media-query';
import { metaData } from '../constants/metaData';

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
  ${media.lessThan('small')`
    height: 3rem;
    width: 3rem;
  `}
`;

const useFormatShareData = (
  title: Maybe<string>,
  path: Maybe<string>,
): [string, string] => {
  const shareText = encodeURIComponent(`${title}\n#水無瀬のプログラミング日記`);
  const shareUrl = encodeURIComponent(
    new URL(path || '', metaData.domain).toString(),
  );
  return [shareText, shareUrl];
};

export const TwitterShareButton: React.FC<Props> = ({ title, path }) => {
  const [shareText, shareUrl] = useFormatShareData(title, path);
  return (
    <TweetButtonWrapper>
      <TweetButton
        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
        title="Twitterに投稿する"
      >
        {/* TODO: スマホは30*30 */}
        <Image
          imageSrc={metaData.twitterIcon}
          alt="twitterに投稿する"
          width={40}
          height={40}
        />
      </TweetButton>
    </TweetButtonWrapper>
  );
};
