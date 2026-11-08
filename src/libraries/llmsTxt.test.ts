import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from './llmsTxt';

const site = {
  title: '水無瀬のプログラミング日記',
  description: 'プログラミング周りのメモ',
  domain: 'https://tminasen.dev',
};

const articleA = { path: '/blog/a', title: '記事A', description: '要約A' };
const articleB = { path: '/blog/b', title: '記事B', description: '要約B' };

describe('llmsTxt.ts', () => {
  describe('buildLlmsTxt', () => {
    it('should output the site overview and the article list', () => {
      // Given
      const articles = [
        { path: '/blog/abc', title: '記事A', description: '要約A' },
      ];
      // When
      const result = buildLlmsTxt(articles, site);
      // Then
      expect(
        result.startsWith(
          '# 水無瀬のプログラミング日記\n\n> プログラミング周りのメモ\n',
        ),
      ).toBe(true);
      expect(result).toContain('## Articles\n');
      expect(result).toContain(
        '- [記事A](https://tminasen.dev/blog/abc.md): 要約A',
      );
    });

    it('should keep the input order', () => {
      // Given
      const articles = [articleB, articleA];
      // When
      const result = buildLlmsTxt(articles, site);
      // Then
      expect(result.indexOf('/blog/b.md')).toBeLessThan(
        result.indexOf('/blog/a.md'),
      );
    });

    it('should output the heading even when there are no articles', () => {
      // Given / When
      const result = buildLlmsTxt([], site);
      // Then
      expect(result).toContain('## Articles');
      expect(result).not.toContain('- [');
    });

    it('should escape brackets in the title and replace newlines in the description', () => {
      // Given
      const articles = [
        { path: '/blog/abc', title: '[Vue] 入門', description: '1行目\n2行目' },
      ];
      // When
      const result = buildLlmsTxt(articles, site);
      // Then
      expect(result).toContain(
        '- [\\[Vue\\] 入門](https://tminasen.dev/blog/abc.md): 1行目 2行目',
      );
    });
  });

  describe('invariants (P2)', () => {
    it.each([
      [[]],
      [[articleA]],
      [[articleB, articleA]],
      [[{ ...articleA, description: '説明\n- [偽の行](x)' }, articleB]],
    ])('should list exactly one "- [" line per article for %j', articles => {
      // Given / When
      const result = buildLlmsTxt(articles, site);
      // Then
      const count = result.split('\n').filter(l => l.startsWith('- [')).length;
      expect(count).toBe(articles.length);
    });
  });
});
