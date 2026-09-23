import { JSX } from 'react';
import { ArticleMetaData } from '../types/article';
import { CardComponent } from './CardComponent';

// ファーストビューに入りうる先頭6枚（PC 1280px でカード幅336pxの3列×2行）までを eager 読み込みとし、
// それ以降は lazy にすることで、初回の画像リクエスト数を可視範囲に固定する。
// 追加読み込みで連結された記事も通し番号で判定されるため、2ページ目以降は常に lazy になる。
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

export const ArticleCardListComponent: React.FC<{
  articleMetaDataList: ArticleMetaData[];
}> = ({ articleMetaDataList }) => {
  return (
    <ul className="text-base grid justify-center [grid-template-columns:repeat(auto-fill,var(--card-image-width))] gap-[20px]">
      {articleMetaDataList.map((article, index) => (
        <ArticleCardItem
          articleData={article}
          key={article.path}
          fetchPriority={index === 0 ? 'high' : undefined}
          loading={index < EAGER_CARD_COUNT ? 'eager' : 'lazy'}
        />
      ))}
    </ul>
  );
};
