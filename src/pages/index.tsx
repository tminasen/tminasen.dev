import { JSX } from 'react';
import Head from 'next/head';
import { getArticleMetaData } from '../libraries/articles';
import { ArticleMetaData } from '../types/article';
import { ArticleCardListComponent } from '../components/ArticleCardListComponent';
import { ArticleCardSkeletonListComponent } from '../components/ArticleCardSkeletonListComponent';
import { PageTemplate } from '../templates/PageTemplate';
import { paginate, getTotalPages, ARTICLES_PER_PAGE } from '../libraries/pagination';
import { buildWebSiteJsonLd, serializeJsonLd } from '../libraries/jsonLd';
import { useInfiniteArticles } from '../hooks/useInfiniteArticles';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const IndexPage: React.FC<{
  articleMetaDataList: ArticleMetaData[];
  totalPages: number;
  totalArticles: number;
}> = ({ articleMetaDataList, totalPages, totalArticles }) => {
  const { articles, status, loadMore } = useInfiniteArticles({
    initialArticles: articleMetaDataList,
    totalPages,
  });
  const sentinelRef = useIntersectionObserver({
    onIntersect: loadMore,
    enabled: status !== 'done',
  });

  // 次に読み込む件数 = min(残件数, ARTICLES_PER_PAGE)
  // 端数ページ読み込み時にスケルトン枚数が実際の件数を超えてレイアウトシフトしないようにする
  const nextChunkSize = Math.min(
    totalArticles - articles.length,
    ARTICLES_PER_PAGE,
  );

  // PageTemplate の children は JSX.Element | JSX.Element[] のみを受け付けるため、
  // 条件付きで含める要素は配列に集約してから渡す
  const children: JSX.Element[] = [
    // 見出しの左端を先頭カードに揃えるため、カード一覧と同じ列定義・列の間隔（gap-x）のグリッドの先頭列に置く
    <div
      key="article-list-heading"
      className="mx-auto max-w-[1048px] mb-6 grid justify-center [grid-template-columns:repeat(auto-fill,var(--card-image-width))] gap-x-[20px]"
    >
      <h2 className="text-[28px] font-bold leading-[1.4] text-(--color-text-base)">
        記事一覧
      </h2>
    </div>,
    <ArticleCardListComponent
      key="article-list"
      articleMetaDataList={articles}
    />,
  ];
  if (status === 'loading') {
    children.push(
      <ArticleCardSkeletonListComponent key="skeleton" count={nextChunkSize} />,
    );
  }
  if (status !== 'done') {
    children.push(<div key="sentinel" ref={sentinelRef} aria-hidden="true" />);
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildWebSiteJsonLd()),
          }}
        />
      </Head>
      <PageTemplate isTopPage>{children}</PageTemplate>
    </>
  );
};

export default IndexPage;

export const getStaticProps = async (): Promise<{
  props: {
    title: string;
    path: string;
    ogType: string;
    articleMetaDataList: ArticleMetaData[];
    totalPages: number;
    totalArticles: number;
  };
}> => {
  const data = await getArticleMetaData();
  const totalPages = getTotalPages(data.length, ARTICLES_PER_PAGE);
  const paginatedData = paginate(data, 1, ARTICLES_PER_PAGE);

  return {
    props: {
      title: '記事一覧',
      path: '/',
      ogType: 'website',
      articleMetaDataList: paginatedData,
      totalPages,
      totalArticles: data.length,
    },
  };
};
