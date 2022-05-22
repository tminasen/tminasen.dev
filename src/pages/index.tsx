import React from 'react';
import styled from 'styled-components';
import { PageTemplate } from '../templates/PageTemplate';
import { getArticleMetaData } from '../libraries/articles';
import { ArticleMetaData } from '../../types/article';
import { CardComponent } from '../components/CardComponent';
import { fontSize, size } from '../styles/variable';

const ArticleCardList = styled.ul`
  font-size: ${fontSize.px16};
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(auto-fill, ${size.cardImageWidth});
  grid-column-gap: 20px;
  grid-row-gap: 20px;
`;

const ArticleCardItem: (param: {
  articleData: ArticleMetaData;
}) => JSX.Element = ({ articleData }) => {
  return (
    <li>
      <CardComponent
        title={articleData.title}
        path={articleData.path}
        image={articleData.thumbnailImage}
        excerpt={articleData.description}
      />
    </li>
  );
};

const IndexPage: React.FC<{ articleMetaData: ArticleMetaData[] }> = ({
  articleMetaData,
}) => {
  return (
    <PageTemplate
      title={null}
      isEnableViewPort={true}
      isHiddenMenu={false}
      canonicalPath="/"
      ogType="website"
    >
      <ArticleCardList>
        {articleMetaData.map(article => (
          <ArticleCardItem articleData={article} key={article.path} />
        ))}
      </ArticleCardList>
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
