import { FC } from 'react';

type Props = {
  count: number;
};

/**
 * `CardComponent` と同一の幅・角丸・枠（高さは可変のカードに対し固定）を持つスケルトンを1件表示する
 */
const ArticleCardSkeletonItem: FC = () => (
  <li>
    <div
      className="animate-pulse w-(--card-image-width) h-(--card-max-height) rounded-xl border border-solid border-(--color-border) bg-(--color-bg-card)"
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
      className="mx-auto max-w-[1048px] text-base grid justify-center [grid-template-columns:repeat(auto-fill,var(--card-image-width))] gap-x-[20px] gap-y-6"
    >
      {Array.from({ length: count }, (_, i) => (
        <ArticleCardSkeletonItem key={i} />
      ))}
    </ul>
  );
};
