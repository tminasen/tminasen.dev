import { describe, it, expect } from 'vitest';
import {
  buildThumbnailSrcSet,
  getThumbnailVariantPath,
  getThumbnailVariantWidths,
} from './thumbnailVariants';

describe('thumbnailVariants', () => {
  const THUMB = '/images/article/abc/thumbnail.png';

  describe('getThumbnailVariantPath', () => {
    it('縮小版のパスは同じディレクトリの -<幅>w.webp になる', () => {
      // Given
      const imagePath = THUMB;
      // When
      const result = getThumbnailVariantPath(imagePath, 336);
      // Then
      expect(result).toBe('/images/article/abc/thumbnail-336w.webp');
    });

    it('階層の浅い画像でも同じ規則になる', () => {
      // Given
      const imagePath = '/images/ogp.png';
      // When
      const result = getThumbnailVariantPath(imagePath, 672);
      // Then
      expect(result).toBe('/images/ogp-672w.webp');
    });
  });

  describe('getThumbnailVariantWidths', () => {
    it('十分大きい画像は 336 と 672 の両方を生成対象にする', () => {
      // Given
      const originalWidth = 2752;
      // When
      const result = getThumbnailVariantWidths(originalWidth);
      // Then
      expect(result).toEqual([336, 672]);
    });

    it('元の幅がちょうど 672 なら両方を生成対象にする', () => {
      // Given
      const originalWidth = 672;
      // When
      const result = getThumbnailVariantWidths(originalWidth);
      // Then
      expect(result).toEqual([336, 672]);
    });

    it('元の幅 671 は 672 を生成対象にしない', () => {
      // Given
      const originalWidth = 671;
      // When
      const result = getThumbnailVariantWidths(originalWidth);
      // Then
      expect(result).toEqual([336]);
    });

    it('元の幅がちょうど 336 なら 336 のみを生成対象にする', () => {
      // Given
      const originalWidth = 336;
      // When
      const result = getThumbnailVariantWidths(originalWidth);
      // Then
      expect(result).toEqual([336]);
    });

    it('元の幅 335 は何も生成対象にしない', () => {
      // Given
      const originalWidth = 335;
      // When
      const result = getThumbnailVariantWidths(originalWidth);
      // Then
      expect(result).toEqual([]);
    });
  });

  describe('buildThumbnailSrcSet', () => {
    it('2幅の srcset をカンマ区切りで返す', () => {
      // Given
      const originalWidth = 2752;
      // When
      const result = buildThumbnailSrcSet(THUMB, originalWidth);
      // Then
      expect(result).toBe(
        '/images/article/abc/thumbnail-336w.webp 336w, /images/article/abc/thumbnail-672w.webp 672w',
      );
    });

    it('672 未満の画像は 336w のみの srcset を返す', () => {
      // Given
      const originalWidth = 453;
      // When
      const result = buildThumbnailSrcSet(THUMB, originalWidth);
      // Then
      expect(result).toBe('/images/article/abc/thumbnail-336w.webp 336w');
    });

    it('336 未満の画像は srcset を返さない', () => {
      // Given
      const originalWidth = 335;
      // When
      const result = buildThumbnailSrcSet(THUMB, originalWidth);
      // Then
      expect(result).toBeUndefined();
    });
  });
});
