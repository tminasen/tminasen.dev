import React from 'react';
import styled from 'styled-components';
import media from 'styled-media-query';

interface Props {
  html: string;
}

const MarkDownArticle = styled.div`
  background-color: #ffffff;
  font-size: 1.6rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  padding: 0.2rem 0.4rem;

  & > p,
  pre,
  ul,
  ol {
    margin: 1.2rem 0;
  }
  & p > strong {
    font-weight: bold;
  }

  /* タイトルの上下は文章部分よりも開ける */
  & > h1,
  h2,
  h3 {
    margin: 1.6rem 0;
  }

  /* 見出しのStyle */
  & h1 {
    font-size: 2.8rem;
    font-weight: bolder;
  }
  & h2 {
    font-size: 2.4rem;
    font-weight: bolder;
  }
  & h3 {
    font-size: 2rem;
    font-weight: bolder;
  }

  /* リンクにカーソル合わせたとき色を変える */
  & a:hover {
    color: #ed0077;
  }

  /* リストの先頭に点出す */
  & ul > li:before {
    content: '\\025b7';
    margin-right: 0.4rem;
  }
  & ul > li {
    margin-top: 0.4rem;
  }
  & li > p {
    display: inline-block;
  }

  /* 入れ子対応 */
  & li > ul > li:before {
    content: '\\025CB';
    margin-right: 0.4rem;
  }

  & li > ul {
    margin: 0.4rem 0 0 2rem;
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

  ${media.lessThan('small')`
    & {
        font-size: 1.4rem;
    }
    /* 要素ごとにスペースを開ける */
    & > p, pre, ul, ol {
        margin: 1.2rem 0;
    }
    /* タイトルの上下は文章部分よりも開ける */
    & > h1, h2, h3 {
        margin: 1.6rem 0;
    }

    /* 見出しのStyle */
    & h1 {
        font-size: 2.4rem !important;
        font-weight: bolder;
    }

    & h2 {
        font-size: 2rem;
        font-weight: bolder;
    }

    & h3 {
        font-size: 1.6rem;
        font-weight: bolder;
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
