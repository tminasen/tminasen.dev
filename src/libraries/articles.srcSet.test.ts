import { describe, it, expect, vi } from 'vitest';
import { getArticleMetaData } from './articles';

// 実記事には幅 336px 未満のサムネイルがないため、ファイル I/O 境界の
// getThumbnailSrcSet だけを差し替えて「srcSet なし」の状態を再現する
vi.mock('./image', async importOriginal => ({
  ...(await importOriginal<typeof import('./image')>()),
  getThumbnailSrcSet: () => undefined,
}));

describe('getArticleMetaData (srcSet なし)', () => {
  it('getThumbnailSrcSet が undefined を返すとき thumbnailImage に srcSet キーを含めない', async () => {
    // Given: すべての記事で getThumbnailSrcSet が undefined を返す（モック済み）
    // When
    const articles = await getArticleMetaData();
    // Then: undefined のキーは getStaticProps の JSON シリアライズで例外になるため、キー自体が存在しない
    expect(articles.length).toBeGreaterThan(0);
    for (const article of articles) {
      expect(Object.hasOwn(article.thumbnailImage, 'srcSet')).toBe(false);
    }
  });
});
