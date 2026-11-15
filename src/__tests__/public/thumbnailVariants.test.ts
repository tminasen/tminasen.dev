import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';
import { describe, expect, it } from 'vitest';
import { getArticleMetaData } from '../../libraries/articles';

const publicDirectory = path.join(process.cwd(), 'public');

type Variant = { articlePath: string; variantPath: string; width: number };

const articles = await getArticleMetaData();
const variants: Variant[] = articles.flatMap(article =>
  (article.thumbnailImage.srcSet ?? '')
    .split(', ')
    .filter(candidate => candidate !== '')
    .map(candidate => {
      const [variantPath, descriptor] = candidate.split(' ');
      return {
        articlePath: article.path,
        variantPath,
        width: Number(descriptor.replace(/w$/, '')),
      };
    }),
);

describe('public 配下のサムネイル縮小版', () => {
  it.each(variants)(
    'srcset に載る縮小版が存在する: $variantPath ($articlePath)',
    ({ variantPath }) => {
      // Given
      const filePath = path.join(publicDirectory, variantPath);
      // When
      const exists = fs.existsSync(filePath);
      // Then
      expect(
        exists,
        `${variantPath} がありません。pnpm generate:thumbnails を実行してください`,
      ).toBe(true);
    },
  );

  it.each(variants)(
    '縮小版の実寸の幅が w 記述子と一致する: $variantPath ($articlePath)',
    ({ variantPath, width }) => {
      // Given
      const filePath = path.join(publicDirectory, variantPath);
      // When
      const actualWidth = sizeOf(filePath).width;
      // Then
      expect(actualWidth).toBe(width);
    },
  );
});
