import { describe, expect, it } from 'vitest';
import { buildSitemapXml } from './sitemap';

const baseUrl = 'https://tminasen.dev';
const articles = [
  { path: '/blog/b', date: '2024/02/01' },
  { path: '/blog/a', date: '2023/01/05' },
];

const countMatches = (text: string, pattern: RegExp) =>
  (text.match(pattern) ?? []).length;

describe('sitemap.ts', () => {
  describe('buildSitemapXml', () => {
    it('should include top, article and tag urls', () => {
      // Given
      const tags = ['vue'];
      // When
      const result = buildSitemapXml(articles, tags, baseUrl);
      // Then
      expect(result.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
        true,
      );
      expect(result).toContain(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      );
      expect(result).toContain(
        '<url><loc>https://tminasen.dev/</loc><lastmod>2024-02-01</lastmod></url>',
      );
      expect(result).toContain(
        '<url><loc>https://tminasen.dev/blog/b</loc><lastmod>2024-02-01</lastmod></url>',
      );
      expect(result).toContain(
        '<url><loc>https://tminasen.dev/blog/a</loc><lastmod>2023-01-05</lastmod></url>',
      );
      expect(result).toContain(
        '<url><loc>https://tminasen.dev/tags/vue</loc></url>',
      );
    });

    it('should output only the top url when articles and tags are empty', () => {
      // Given / When
      const result = buildSitemapXml([], [], baseUrl);
      // Then
      expect(countMatches(result, /<url>/g)).toBe(1);
      expect(result).toContain('<loc>https://tminasen.dev/</loc>');
      expect(result).not.toContain('<lastmod>');
    });

    it('should encode tags containing special characters', () => {
      // Given
      const tags = ['c#&c++'];
      // When
      const result = buildSitemapXml([], tags, baseUrl);
      // Then
      expect(result).toContain(
        '<loc>https://tminasen.dev/tags/c%23%26c%2B%2B</loc>',
      );
      expect(result).not.toContain('&');
    });
  });

  describe('invariants (P1)', () => {
    it.each([
      { articles: [], tags: [] },
      { articles, tags: [] },
      { articles: [], tags: ['vue', 'c#&c++', '日本語'] },
      { articles, tags: ['vue', 'ts', 'Angular'] },
    ])(
      'should have 1 + articles + tags urls, all starting with baseUrl for %j',
      ({ articles: a, tags: t }) => {
        // Given / When
        const result = buildSitemapXml(a, t, baseUrl);
        // Then
        expect(countMatches(result, /<url>/g)).toBe(1 + a.length + t.length);
        const locs = [...result.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
        expect(locs).toHaveLength(1 + a.length + t.length);
        locs.forEach(loc => expect(loc.startsWith(baseUrl)).toBe(true));
      },
    );
  });
});
