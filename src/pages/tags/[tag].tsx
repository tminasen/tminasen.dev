import { JSX } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { PageTemplate } from '../../templates/PageTemplate';
import { getArticleMetaData } from '../../libraries/articles';
import { ArticleMetaData } from '../../types/article';
import { ArticleCardListComponent } from '../../components/ArticleCardListComponent';

interface Props {
  tagName: string;
  articleMetaDataList: ArticleMetaData[];
}

const tagPage: React.FC<Props> = ({ tagName, articleMetaDataList }) => {
  const filteredArticles = (articleMetaDataList ?? []).filter(data =>
    data.tag.includes(tagName),
  );

  const children: JSX.Element[] = [
    // 見出しの左端を先頭カードに揃えるため、カード一覧と同じ列定義・列の間隔（gap-x）のグリッドの先頭列に置く
    <div
      key="article-list-heading"
      className="mx-auto max-w-[1048px] mb-6 grid justify-center [grid-template-columns:repeat(auto-fill,var(--card-image-width))] gap-x-[20px]"
    >
      <h1 className="text-[28px] font-bold leading-[1.4] text-(--color-text-base)">
        {tagName}の記事一覧
      </h1>
    </div>,
  ];

  if (filteredArticles.length > 0) {
    children.push(
      <ArticleCardListComponent
        key="article-list"
        articleMetaDataList={filteredArticles}
      />,
    );
  }

  return <PageTemplate>{children}</PageTemplate>;
};
export default tagPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const metaData = await getArticleMetaData();
  const tagList: string[] = metaData
    .map(data => data.tag)
    .reduce((pre, cur) => [...pre, ...cur], []);
  const paths: string[] = Array.from(new Set(tagList)).map(
    tag => `/tags/${tag}`,
  );
  return { paths, fallback: false };
};
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tagName = params?.tag;
  if (tagName == null || Array.isArray(tagName)) {
    return { props: { tagName: '', articleMetaDataList: [] } };
  }
  const articleMetaDataList: ArticleMetaData[] = await getArticleMetaData();
  return {
    props: {
      tagName,
      articleMetaDataList,
      title: `${tagName}の記事一覧`,
      ogType: 'website',
      path: `/tags/${tagName}`,
    },
  };
};
