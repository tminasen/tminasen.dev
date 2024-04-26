import React from 'react';
import { Maybe } from '../../../types/utility';
import styled from 'styled-components';
import media from 'styled-media-query';
import { metaData } from '../../constants/metaData';
import { color } from '../../styles/variable';

type Props = {
  title: Maybe<string>;
  path: Maybe<string>;
};

const XButtonWrapper = styled.div`
  display: inline-block;
  margin: 0 0 1rem 0.5rem;
  padding: 6px; /** アイコンサイズが40pxになるように調整 */
  background-color: ${color.bgBlack};
  border-radius: 50%;
`;
const PostButton = styled.a`
  display: block;
  height: 28px;
  width: 28px;
  position: relative;
  ${media.lessThan('small')`
    height: 18px;
    width: 18px;
  `}
`;
const Icon = styled.img`
  object-fit: contain;
  width: 100%;
  height: 100%;
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

export const XShareButton: React.FC<Props> = ({ title, path }) => {
  const [shareText, shareUrl] = useFormatShareData(title, path);
  return (
    <XButtonWrapper>
      <PostButton
        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
        title="Xに投稿する"
        target="_blank"
      >
        <picture>
          <source
            type="image/webp"
            srcSet={metaData.XIcon.replace(/\.png$/, '.webp')}
          />
          <source type="image/png" srcSet={metaData.XIcon} />
          <Icon src={metaData.XIcon} alt="Xに投稿する" />
        </picture>
      </PostButton>
    </XButtonWrapper>
  );
};
