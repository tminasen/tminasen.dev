import { describe, expect, it } from 'vitest';
import { buildFeedItem } from './rssItem';
import { ArticleMetaData } from '../types/article';

const baseUrl = 'https://tminasen.dev';
const buildArticle = (date: string): ArticleMetaData => ({
  path: '/blog/abc',
  title: '記事A',
  date,
  tag: ['vue'],
  thumbnailImage: {
    url: '/t.png',
    size: { pc: { width: 1, height: 1 }, sp: { width: 1, height: 1 } },
  },
  ogpImage: '/images/a.png',
  description: '要約',
});

describe('rssItem.ts', () => {
  describe('buildFeedItem', () => {
    it('should build a feed item from ArticleMetaData', () => {
      // Given
      const article = buildArticle('2024/01/02');
      // When
      const result = buildFeedItem(article, baseUrl);
      // Then
      expect(result).toEqual({
        title: '記事A',
        id: 'https://tminasen.dev/blog/abc',
        link: 'https://tminasen.dev/blog/abc',
        description: '要約',
        date: new Date(2024, 0, 2, 9, 0, 0),
        image: 'https://tminasen.dev/images/a.png',
        author: [{ name: 'tminasen', link: 'https://twitter.com/tminasen' }],
      });
    });

    it('should throw when the date is invalid', () => {
      // Given
      const article = buildArticle('invalid');
      // When / Then
      expect(() => buildFeedItem(article, baseUrl)).toThrow(Error);
    });
  });
});
