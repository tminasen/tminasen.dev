import React from 'react';
import styled from 'styled-components';
import media from 'styled-media-query';
import { color, fontSize } from '../styles/variable';

interface Props {
  html: string;
}

const MarkDownArticle = styled.div`
  background-color: ${color.bgWhite};
  margin-top: 32px;
  font-size: ${fontSize.px16};
  border-radius: 4px;
  padding: 8px 16px;

  /* ボールド指定 */
  & p > strong {
    font-weight: bold;
  }

  /* 本文はタイトルより下げる＋見出しにくっつくので余白調整 */
  & > p {
    margin: 4px 0 0 4px;
    line-height: 1.2;
  }

  /* 見出しのStyle */
  & h1 {
    font-size: ${fontSize.px24};
    font-weight: bolder;
    line-height: 1.5;
  }
  & h2 {
    font-size: ${fontSize.px20};
    font-weight: bolder;
    line-height: 1.5;
  }
  & h3 {
    font-size: ${fontSize.px16};
    font-weight: bolder;
    line-height: 1.5;
  }
  & h4 {
    font-size: ${fontSize.px16};
    line-height: 1.5;
  }

  /* リンクにカーソル合わせたとき色を変える */
  & a:hover {
    color: #ed0077;
  }

  /* 行頭記号分ずれるので調整 */
  & ul {
    padding-left: 16px;
  }

  & ul > li {
    margin-top: 0.4rem;
    position: relative;

    /* リストの先頭に点出す */
    &::before {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border-top: solid 5px transparent;
      border-left: solid 5px ${color.textBlack};
      border-bottom: solid 5px transparent;
      left: -8px;
      top: calc(${fontSize.px16} / 2 - 4px);
      margin-right: 4px;
    }
  }
  & li > p {
    display: inline-block;
  }

  & li > ul {
    margin: 4px 0 0 16px;
  }

  /* 入れ子対応 */
  & li > ul > li {
    position: relative;

    &::before {
      content: '';
      display: inline-block;
      position: absolute;
      width: 4px;
      height: 4px;
      border: solid 1px ${color.textBlack};
      border-radius: 50%;
      margin-right: 4px;
      top: calc(1.6rem / 2 - 2px);
      left: -8px;
    }
  }

  /* olの場合数字を出すようにする */
  & ol {
    counter-reset: item;
  }

  & ol > li:before {
    counter-increment: item;
    content: counter(item) '. ';
  }

  /* 画像はみ出すのでリサイズ */
  & img {
    display: block;
  }

  /* 引用時のスタイル */
  & blockquote {
    margin: 4px 0 0 4px;
    padding-left: 8px;
    position: relative;
    border-left: 2px solid ${color.borderGray};
    color: ${color.textQuote};
  }

  /* インラインコードブロック */
  & p > code {
    background-color: ${color.bgCodeBlock};
    color: ${color.textCodeBlock};
    padding: 2px 4px;
    border-radius: 4px;
  }

  ${media.lessThan('small')`
    margin-top: 20px;
    font-size: ${fontSize.px16};
    border-radius: 4px;
    padding: 8px 12px;
    
      /* 行頭記号分ずれるので調整 */
      & ul {
        padding-left: 12px;
      }
    
    /* 画像はみ出すのでリサイズ */
    & img {
      display: block;
      height: 100%;
      width: 80%;
    }

  `}
`;

export const MdTemplate: React.FC<Props> = ({ html }) => {
  return <MarkDownArticle dangerouslySetInnerHTML={{ __html: html }} />;
};
