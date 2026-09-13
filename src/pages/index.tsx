import { JSX } from 'react';
import { PageTemplate } from '../templates/PageTemplate';
import { getArticleMetaData } from '../libraries/articles';
import { ArticleMetaData } from '../types/article';
import { CardComponent } from '../components/CardComponent';

const EAGER_CARD_COUNT = 6;

const ArticleCardItem: (param: {
  articleData: ArticleMetaData;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
}) => JSX.Element = ({ articleData, fetchPriority, loading }) => {
  return (
    <li>
      <CardComponent
        title={articleData.title}
        path={articleData.path}
        image={articleData.thumbnailImage}
        excerpt={articleData.description}
        date={articleData.date}
        tags={articleData.tag}
        fetchPriority={fetchPriority}
        loading={loading}
      />
    </li>
  );
};

const IndexPage: React.FC<{ articleMetaDataList: ArticleMetaData[] }> = ({
  articleMetaDataList,
}) => {
  return (
    <PageTemplate>
      <ul className='text-base grid justify-center [grid-template-columns:repeat(auto-fill,var(--card-image-width))] gap-[20px]'>
        {articleMetaDataList.map((article, index) => (
          <ArticleCardItem
            articleData={article}
            key={article.path}
            fetchPriority={index === 0 ? 'high' : undefined}
            loading={index < EAGER_CARD_COUNT ? 'eager' : 'lazy'}
          />
        ))}
      </ul>
    </PageTemplate>
  );
};

export default IndexPage;

export const getStaticProps = async (): Promise<{
  props: {
    title: string;
    path: string;
    ogType: string;
    articleMetaDataList: ArticleMetaData[];
  };
}> => {
  const data = await getArticleMetaData();
  return {
    props: {
      title: '記事一覧',
      path: '/',
      ogType: 'website',
      articleMetaDataList: data,
    },
  };
};
