import { describe, expect, it } from 'vitest';
import { metaData } from '../constants/metaData';
import {
  buildBlogPostingJsonLd,
  buildTagPageJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from './jsonLd';

const meta = {
  path: '/blog/abc',
  date: '2020/10/25',
  title: '記事A',
  tag: ['vue', 'ts'],
  ogpImage: '/images/a.png',
  thumbnailImage: '/t.png',
  description: '要約' as string | undefined,
};

const expectedPerson = {
  '@type': 'Person',
  name: 'tminasen',
  url: 'https://github.com/tminasen/',
};

describe('jsonLd.ts', () => {
  describe('metaData.description', () => {
    it('should match the updated blog description (T10)', () => {
      // Given / When
      const description = metaData.description;
      // Then
      expect(description).toBe(
        'tminasen（水無瀬）によるプログラミング・Web開発・AI活用の技術ブログ',
      );
    });
  });

  describe('buildBlogPostingJsonLd', () => {
    it('should build a BlogPosting object with publisher and dateModified equal to datePublished when updatedAt is omitted (T1)', () => {
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
        dateModified: '2020-10-25',
        author: expectedPerson,
        publisher: expectedPerson,
        keywords: 'vue,ts',
        description: '要約',
        image: 'https://tminasen.dev/images/a.png',
        url: 'https://tminasen.dev/blog/abc',
        mainEntityOfPage: 'https://tminasen.dev/blog/abc',
      });
    });

    it('should convert updatedAt to ISO date string for dateModified when updatedAt is specified (T2)', () => {
      // Given
      const input = { ...meta, updatedAt: '2021/03/05' };
      // When
      const result = buildBlogPostingJsonLd(input);
      // Then
      expect(result.datePublished).toBe('2020-10-25');
      expect(result.dateModified).toBe('2021-03-05');
    });

    it('should fallback dateModified to datePublished when updatedAt is explicitly undefined (T3)', () => {
      // Given
      const input = { ...meta, updatedAt: undefined };
      // When
      const result = buildBlogPostingJsonLd(input);
      // Then
      expect(result.dateModified).toBe('2020-10-25');
    });

    it('should throw Error when updatedAt is an invalid date string (T4)', () => {
      // Given
      const input = { ...meta, updatedAt: 'invalid-date' };
      // When / Then
      expect(() => buildBlogPostingJsonLd(input)).toThrow(Error);
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

  describe('buildWebSiteJsonLd', () => {
    it('should build a WebSite object for the top page (T5)', () => {
      // Given / When
      const result = buildWebSiteJsonLd();
      // Then
      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '水無瀬のプログラミング日記',
        description: 'tminasen（水無瀬）によるプログラミング・Web開発・AI活用の技術ブログ',
        url: 'https://tminasen.dev/',
        author: expectedPerson,
      });
    });
  });

  describe('buildTagPageJsonLd', () => {
    it('should build a CollectionPage object for an ASCII tag name (T6)', () => {
      // Given
      const tagName = 'React';
      // When
      const result = buildTagPageJsonLd(tagName);
      // Then
      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Reactの記事一覧',
        url: 'https://tminasen.dev/tags/React',
      });
    });

    it('should percent-encode the tag in url while keeping name unencoded for Japanese/special characters (T7)', () => {
      // Given
      const tagName = '生成AI';
      // When
      const result = buildTagPageJsonLd(tagName);
      // Then
      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '生成AIの記事一覧',
        url: 'https://tminasen.dev/tags/%E7%94%9F%E6%88%90AI',
      });
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

  describe('invariants (P1)', () => {
    it.each([
      { ...meta, date: '2020/01/01', updatedAt: undefined },
      { ...meta, date: '2020/10/25', updatedAt: '2021/03/05' },
      { ...meta, date: '2024/12/31', updatedAt: '2024/12/31' },
      { ...meta, date: '2025/06/15', updatedAt: undefined },
    ])(
      'should always produce ISO 8601 datePublished/dateModified and match when updatedAt is undefined for $date / $updatedAt',
      input => {
        // Given / When
        const result = buildBlogPostingJsonLd(input);
        // Then
        expect(/^\d{4}-\d{2}-\d{2}$/.test(result.datePublished)).toBe(true);
        expect(/^\d{4}-\d{2}-\d{2}$/.test(result.dateModified)).toBe(true);
        expect(
          input.updatedAt === undefined ? result.dateModified === result.datePublished : true,
        ).toBe(true);
      },
    );
  });

  describe('invariants (P2)', () => {
    it.each([
      ['BlogPosting', () => buildBlogPostingJsonLd(meta)],
      [
        'BlogPosting with updatedAt and script tag',
        () =>
          buildBlogPostingJsonLd({
            ...meta,
            title: '</script><script>alert(1)</script>',
            updatedAt: '2021/03/05',
          }),
      ],
      ['WebSite', () => buildWebSiteJsonLd()],
      ['CollectionPage (ASCII)', () => buildTagPageJsonLd('React')],
      ['CollectionPage (Japanese)', () => buildTagPageJsonLd('生成AI')],
      ['CollectionPage (XSS tag)', () => buildTagPageJsonLd('</script><script>alert(1)</script>')],
    ])('should serialize %s without "<" and round-trip with valid @context', (_label, builder) => {
      // Given
      const jsonLd = builder();
      // When
      const serialized = serializeJsonLd(jsonLd);
      // Then
      expect(serialized.includes('<')).toBe(false);
      expect(JSON.parse(serialized)['@context']).toBe('https://schema.org');
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
