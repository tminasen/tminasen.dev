import React, { useMemo } from 'react';
import { Maybe } from '../../types/utility';
import styled from 'styled-components';

type Props = {
  title: Maybe<string>;
};

const TweetButtonWrapper = styled.div`
  display: inline-block;
  margin: 0 0 0 0.5rem;
`;

export const TwitterShareButton: React.FC<Props> = ({ title }) => {
  const shareText = useMemo(() => {
    return `${title}\n#水無瀬のプログラミング日記\n`;
  }, [title]);
  return (
    <TweetButtonWrapper>
      <a
        href="https://twitter.com/share?ref_src=twsrc%5Etfw"
        className="twitter-share-button"
        data-show-count="false"
        data-text={shareText}
        data-lang="ja"
      >
        Tweet
      </a>
    </TweetButtonWrapper>
  );
};
