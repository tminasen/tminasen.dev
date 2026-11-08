import { describe, expect, it } from 'vitest';
import { buildBlogPostingJsonLd, serializeJsonLd } from './jsonLd';

const meta = {
  path: '/blog/abc',
  date: '2020/10/25',
  title: '記事A',
  tag: ['vue', 'ts'],
  ogpImage: '/images/a.png',
  thumbnailImage: '/t.png',
  description: '要約' as string | undefined,
};

describe('jsonLd.ts', () => {
  describe('buildBlogPostingJsonLd', () => {
    it('should build a BlogPosting object', () => {
      // Given
      const input = meta;
      // When
      const result = buildBlogPostingJsonLd(input);
      // Then
      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: '記事A',
        datePublished: '2020-10-25',
        author: {
          '@type': 'Person',
          name: 'tminasen',
          url: 'https://github.com/tminasen/',
        },
        keywords: 'vue,ts',
        description: '要約',
        image: 'https://tminasen.dev/images/a.png',
        url: 'https://tminasen.dev/blog/abc',
        mainEntityOfPage: 'https://tminasen.dev/blog/abc',
      });
    });

    it('should omit description when undefined', () => {
      // Given
      const input = { ...meta, description: undefined };
      // When
      const result = buildBlogPostingJsonLd(input);
      // Then
      expect(result).not.toHaveProperty('description');
    });

    it('should omit keywords when tag is empty', () => {
      // Given
      const input = { ...meta, tag: [] };
      // When
      const result = buildBlogPostingJsonLd(input);
      // Then
      expect(result).not.toHaveProperty('keywords');
    });
  });

  describe('serializeJsonLd', () => {
    it('should not close the script tag when the value contains </script>', () => {
      // Given
      const input = { headline: '</script><script>alert(1)</script>' };
      // When
      const result = serializeJsonLd(input);
      // Then
      expect(result).not.toContain('<');
      expect(result).toContain('\\u003c/script>');
    });
  });

  describe('invariants (P3)', () => {
    it.each([
      { headline: 'plain' },
      { headline: '</script><script>alert(1)</script>' },
      { headline: '<!-- a --> & "q" \u2028', nested: { list: ['<b>', 1, null] } },
      {},
    ])('should round trip and contain no "<" for %j', input => {
      // Given / When
      const serialized = serializeJsonLd(input);
      // Then
      expect(JSON.parse(serialized)).toEqual(input);
      expect(serialized).not.toContain('<');
    });
  });
});
