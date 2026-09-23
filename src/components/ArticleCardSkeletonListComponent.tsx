import { FC } from 'react';

type Props = {
  count: number;
};

/**
 * `CardComponent` と同一の寸法・角丸・影を持つスケルトンを1件表示する
 */
const ArticleCardSkeletonItem: FC = () => (
  <li>
    <div
      className="animate-pulse w-(--card-image-width) h-(--card-max-height) rounded-lg bg-(--color-bg-card) shadow-md"
      aria-hidden="true"
    />
  </li>
);

/**
 * 追加読み込み中であることを示すスケルトン一覧
 * 記事一覧とは別の `<ul>` として描画し、`role="status"` で読み込み中を通知する
 * @param count 表示するスケルトンの枚数
 */
export const ArticleCardSkeletonListComponent: FC<Props> = ({ count }) => {
  if (count <= 0) {
    return null;
  }

  return (
    <ul
      role="status"
      aria-label="記事を読み込み中"
      className="text-base grid justify-center [grid-template-columns:repeat(auto-fill,var(--card-image-width))] gap-[20px]"
    >
      {Array.from({ length: count }, (_, i) => (
        <ArticleCardSkeletonItem key={i} />
      ))}
    </ul>
  );
};
