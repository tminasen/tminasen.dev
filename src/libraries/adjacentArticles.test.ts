import { describe, expect, it } from 'vitest';
import { ArticleMetaData } from '../types/article';
import {
  getAdjacentArticleProps,
  getAdjacentArticles,
} from './adjacentArticles';

const dummy = {
  tag: [],
  thumbnailImage: {
    url: '/t.png',
    size: {
      pc: { width: 1, height: 1 },
      sp: { width: 1, height: 1 },
    },
  },
  ogpImage: '/o.png',
  description: 'd',
};

const article = (path: string, title: string, date: string): ArticleMetaData => ({
  ...dummy,
  path,
  title,
  date,
});

// 日付降順（getArticleMetaData の並び）
const ARTICLES: ArticleMetaData[] = [
  article('/blog/c', 'C', '2026/04/14'),
  article('/blog/b', 'B', '2025/11/24'),
  article('/blog/a', 'A', '2025/04/14'),
];

describe('adjacentArticles.ts', () => {
  describe('getAdjacentArticles', () => {
    it('中間の記事は1つ古い記事が前、1つ新しい記事が次になる', () => {
      // Given
      // When
      const result = getAdjacentArticles(ARTICLES, '/blog/b');

      // Then
      expect(result).toEqual({
        prev: { path: '/blog/a', title: 'A' },
        next: { path: '/blog/c', title: 'C' },
      });
    });

    it('最古の記事は前の記事が無い', () => {
      // Given
      // When
      const result = getAdjacentArticles(ARTICLES, '/blog/a');

      // Then
      expect(result).toEqual({
        prev: null,
        next: { path: '/blog/b', title: 'B' },
      });
    });

    it('最新の記事は次の記事が無い', () => {
      // Given
      // When
      const result = getAdjacentArticles(ARTICLES, '/blog/c');

      // Then
      expect(result).toEqual({
        prev: { path: '/blog/b', title: 'B' },
        next: null,
      });
    });

    it('記事が1件だけなら前後とも無い', () => {
      // Given
      const single = [ARTICLES[0]];

      // When
      const result = getAdjacentArticles(single, '/blog/c');

      // Then
      expect(result).toEqual({ prev: null, next: null });
    });

    it('一覧に無いパスは前後とも無い', () => {
      // Given
      // When
      const result = getAdjacentArticles(ARTICLES, '/blog/x');

      // Then
      expect(result).toEqual({ prev: null, next: null });
    });
  });
  describe('invariants', () => {
    const LENGTHS = [1, 2, 3, 30];
    const buildArticles = (length: number) =>
      Array.from({ length }, (_, i) =>
        article(`/blog/p${i}`, `P${i}`, '2026/01/01'),
      );
    const cases = LENGTHS.flatMap(length =>
      buildArticles(length).map(a => ({ length, path: a.path })),
    );

    it.each(cases)(
      '前後関係が対称である (長さ $length, $path)',
      ({ length, path }) => {
        // Given
        const articles = buildArticles(length);

        // When
        const { prev, next } = getAdjacentArticles(articles, path);

        // Then
        if (prev) {
          expect(getAdjacentArticles(articles, prev.path).next?.path).toBe(path);
        }
        if (next) {
          expect(getAdjacentArticles(articles, next.path).prev?.path).toBe(path);
        }
      },
    );

    it.each(cases)(
      '自分自身や同じ記事を前後に出さない (長さ $length, $path)',
      ({ length, path }) => {
        // Given
        const articles = buildArticles(length);

        // When
        const { prev, next } = getAdjacentArticles(articles, path);

        // Then
        expect(prev?.path).not.toBe(path);
        expect(next?.path).not.toBe(path);
        if (prev !== null && next !== null) {
          expect(prev.path).not.toBe(next.path);
        }
      },
    );
  });

  describe('getAdjacentArticleProps', () => {
    it('実記事から前後の記事を求めて props で返す', async () => {
      // Given
      const path = '/blog/fu75tpjbgwwsgsjj4xre';

      // When
      const result = await getAdjacentArticleProps(path);

      // Then
      expect(result).toEqual({
        props: {
          adjacent: {
            prev: { path: '/blog/oaputhved38ajekgpcz9', title: 'Rust事始め' },
            next: {
              path: '/blog/n4jehn2qav1xhtawosqy',
              title: 'Vue3.0 + Vuex + tailwindcssを試してみる',
            },
          },
        },
      });
    });
  });
});
