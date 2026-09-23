import { describe, expect, it } from 'vitest';
import { getArticleChunkUrl, buildArticleChunks } from './articleChunk';
import { paginate } from './pagination';
import { ArticleMetaData } from '../types/article';

const buildArticles = (count: number): ArticleMetaData[] =>
  Array.from({ length: count }, (_, i) => ({
    title: `Article ${i + 1}`,
    path: `/art${i + 1}`,
    date: '2023-01-01',
    tag: ['tag1'],
    thumbnailImage: {
      url: '/img.jpg',
      size: { pc: { width: 100, height: 100 }, sp: { width: 50, height: 50 } },
    },
    ogpImage: '/ogp.jpg',
    description: 'desc',
  }));

describe('articleChunk.ts', () => {
  describe('getArticleChunkUrl', () => {
    it('should build url for page 2', () => {
      // Given
      // (なし)

      // When
      const result = getArticleChunkUrl(2);

      // Then
      expect(result).toBe('/articles/page-2.json');
    });

    it('should build url for two-digit page number', () => {
      // Given
      // (なし)

      // When
      const result = getArticleChunkUrl(10);

      // Then
      expect(result).toBe('/articles/page-10.json');
    });
  });

  describe('buildArticleChunks', () => {
    it('should build chunks for page 2 and 3 when 30 articles with perPage 12', () => {
      // Given
      const articles = buildArticles(30);
      const perPage = 12;

      // When
      const result = buildArticleChunks(articles, perPage);

      // Then
      expect(result).toHaveLength(2);
      expect(result[0].page).toBe(2);
      expect(result[1].page).toBe(3);
    });

    it('should keep each chunk articles in order', () => {
      // Given
      const articles = buildArticles(30);
      const perPage = 12;

      // When
      const result = buildArticleChunks(articles, perPage);

      // Then
      expect(result[0].articles).toEqual(articles.slice(12, 24));
      expect(result[1].articles).toEqual(articles.slice(24, 30));
    });

    it('should have url matching getArticleChunkUrl', () => {
      // Given
      const articles = buildArticles(30);
      const perPage = 12;

      // When
      const result = buildArticleChunks(articles, perPage);

      // Then
      expect(result[0].url).toBe(getArticleChunkUrl(2));
      expect(result[1].url).toBe(getArticleChunkUrl(3));
    });

    it('should return empty array when articles count is exact multiple of perPage', () => {
      // Given
      const articles = buildArticles(12);
      const perPage = 12;

      // When
      const result = buildArticleChunks(articles, perPage);

      // Then
      expect(result).toEqual([]);
    });

    it('should return empty array when articles is empty', () => {
      // Given
      const articles: ArticleMetaData[] = [];
      const perPage = 12;

      // When
      const result = buildArticleChunks(articles, perPage);

      // Then
      expect(result).toEqual([]);
    });

    it('should generate a chunk even when the last page has only 1 article', () => {
      // Given
      const articles = buildArticles(13);
      const perPage = 12;

      // When
      const result = buildArticleChunks(articles, perPage);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].page).toBe(2);
      expect(result[0].articles).toHaveLength(1);
    });
  });

  describe('invariants', () => {
    it('should reconstruct the original articles in order when concatenating initial page and chunks', () => {
      const testCases = [
        { count: 30, perPage: 12 },
        { count: 12, perPage: 12 },
        { count: 0, perPage: 12 },
        { count: 13, perPage: 12 },
        { count: 100, perPage: 10 },
        { count: 1, perPage: 12 },
      ];

      for (const { count, perPage } of testCases) {
        const articles = buildArticles(count);
        const chunks = buildArticleChunks(articles, perPage);
        const reconstructed = [
          ...paginate(articles, 1, perPage),
          ...chunks.flatMap(c => c.articles),
        ];
        expect(reconstructed).toEqual(articles);
      }
    });
  });
});
