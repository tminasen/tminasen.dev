import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import sizeOf from 'image-size';
import { describe, it, expect } from 'vitest';
import { getImageSize, getThumbnailSrcSet } from './image';

const REAL_LARGE =
  '/images/article/040a4af3-391e-4470-912e-4deca2cdcb2c/thumbnail.png';
const REAL_OGP = '/images/ogp.png';
const REAL_SMALL = '/images/article/20200626/ss20200626.png';

const blogDirectory = path.join(process.cwd(), 'src/pages/blog');
const thumbnailUrls = fs
  .readdirSync(blogDirectory)
  .filter(file => file.endsWith('.mdx'))
  .map(
    file =>
      matter(fs.readFileSync(path.join(blogDirectory, file), 'utf8')).data
        .thumbnailImage as string,
  );

describe('image', () => {
  describe('getImageSize (thumbnail)', () => {
    it('小数になる高さは四捨五入で切り上がる', () => {
      // Given
      const imagePath = REAL_LARGE;
      // When
      const result = getImageSize(imagePath, 'thumbnail');
      // Then
      expect(result).toEqual({
        pc: { width: 336, height: 188 },
        sp: { width: 336, height: 188 },
      });
    });

    it('小数になる高さは四捨五入で切り捨てられる', () => {
      // Given
      const imagePath = REAL_OGP;
      // When
      const result = getImageSize(imagePath, 'thumbnail');
      // Then
      expect(result).toEqual({
        pc: { width: 336, height: 176 },
        sp: { width: 336, height: 176 },
      });
    });

    it.each(thumbnailUrls)(
      '全記事のサムネイルで height が整数になる: %s',
      imagePath => {
        // Given / When
        const result = getImageSize(imagePath, 'thumbnail');
        // Then
        expect(Number.isInteger(result.pc.height)).toBe(true);
        expect(Number.isInteger(result.sp.height)).toBe(true);
      },
    );

    it.each(thumbnailUrls)(
      '全記事のサムネイルで整数化による縦横比のずれが 0.5px 以内になる: %s',
      imagePath => {
        // Given
        const { width: W, height: H } = sizeOf(
          path.join(process.cwd(), 'public/', imagePath),
        );
        // When
        const result = getImageSize(imagePath, 'thumbnail');
        // Then
        expect(
          Math.abs(result.sp.height - (H! * result.sp.width) / W!),
        ).toBeLessThanOrEqual(0.5);
      },
    );
  });

  describe('getThumbnailSrcSet', () => {
    it('実画像の幅から srcset を作る', () => {
      // Given
      const imagePath = REAL_LARGE;
      // When
      const result = getThumbnailSrcSet(imagePath);
      // Then
      expect(result).toBe(
        '/images/article/040a4af3-391e-4470-912e-4deca2cdcb2c/thumbnail-336w.webp 336w, /images/article/040a4af3-391e-4470-912e-4deca2cdcb2c/thumbnail-672w.webp 672w',
      );
    });

    it('幅 453 の実画像は 336w のみの srcset を返す', () => {
      // Given
      const imagePath = REAL_SMALL;
      // When
      const result = getThumbnailSrcSet(imagePath);
      // Then
      expect(result).toBe('/images/article/20200626/ss20200626-336w.webp 336w');
    });
  });
});
