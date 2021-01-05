import React from 'react';
import styled from 'styled-components';
import media from 'styled-media-query';
import { PageTemplate } from '../src/templates/PageTemplate';
import { getArticleMetaData } from '../src/libraries/articles';
import { ArticleMetaData } from '../types/article';
import { CardComponent } from '../src/components/CardComponent';

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: bold;
  ${media.lessThan('small')`
    font-size: 2rem;
  `}
`;
const ArticleCardList = styled.ul`
  font-size: 1.6rem;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  ${media.lessThan('small')`
    justify-content: center;
  `}
`;
const CardWrapper = styled.li`
  margin: 12px 20px 0 0;
  ${media.lessThan('small')`
    margin: 12px 0 0 0;
  `}
`;
const Article = styled.article``;

const createArticle = (articleData: ArticleMetaData[]) => {
  const linkItems = articleData.map(item => {
    return (
      <CardWrapper key={`${item.title}:${item.path}`}>
        <CardComponent
          title={item.title}
          path={item.path}
          image={item.thumbnailImage}
          excerpt={item.description}
        />
      </CardWrapper>
    );
  });
  return <ArticleCardList>{linkItems}</ArticleCardList>;
};

const IndexPage: React.FC<{ articleMetaData: ArticleMetaData[] }> = ({
  articleMetaData,
}) => {
  const articles = createArticle(articleMetaData);
  return (
    <PageTemplate title="水無瀬のプログラミング日記" metaData={articleMetaData}>
      <Article>
        <Title>記事一覧</Title>
        {articles}
      </Article>
    </PageTemplate>
  );
};

export default IndexPage;

export const getStaticProps = async (): Promise<{
  props: { articleMetaData: ArticleMetaData[] };
}> => {
  const data = await getArticleMetaData();
  return {
    props: {
      articleMetaData: data,
    },
  };
};
