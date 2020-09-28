import React from 'react';
import styled from 'styled-components';

const HatenaBookmarkWrapper = styled.div`
  display: inline-block;
  margin: 0 0 0 0.5rem;
`;
const HatenaImageWrapper = styled.img`
  border: none;
`;

export const HatenaBookmarkButton: React.FC = () => {
  return (
    <HatenaBookmarkWrapper>
      <a
        href="https://b.hatena.ne.jp/entry/"
        className="hatena-bookmark-button"
        data-hatena-bookmark-layout="basic-label-counter"
        data-hatena-bookmark-lang="ja"
        title="このエントリーをはてなブックマークに追加"
      >
        <HatenaImageWrapper
          src="https://b.st-hatena.com/images/v4/public/entry-button/button-only@2x.png"
          alt="このエントリーをはてなブックマークに追加"
          width="20"
          height="20"
        />
      </a>
    </HatenaBookmarkWrapper>
  );
};
