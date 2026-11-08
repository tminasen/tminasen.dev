import { describe, expect, it } from 'vitest';
import { convertMdxToMarkdown } from './articleMarkdown';

const frontmatter = (description?: string) =>
  [
    '---',
    'path: "/blog/abc"',
    'date: "2020/10/25"',
    'title: "記事A"',
    'tag: ["vue", "ts"]',
    'ogpImage: "/images/a.png"',
    'thumbnailImage: "/t.png"',
    ...(description ? [`description: "${description}"`] : []),
    '---',
    '',
  ].join('\n');

const preamble =
  "import { ArticleLayout } from '../../components/ArticleLayout';\n\nexport const meta = {\n  path: \"/blog/abc\",\n  date: \"2020/10/25\",\n};\n\nexport default ({ children }) => <ArticleLayout meta={meta}>{children}</ArticleLayout>;\n\n";

const buildSource = (body: string, description?: string, pre = preamble) =>
  `${frontmatter(description)}\n${pre}${body}`;

describe('articleMarkdown.ts', () => {
  describe('convertMdxToMarkdown', () => {
    it('should strip the preamble and prepend the header', () => {
      // Given
      const source = buildSource('# はじめに\n本文A', '要約');
      // When
      const result = convertMdxToMarkdown(source);
      // Then
      expect(result).toBe(
        '# 記事A\n\n- 公開日: 2020-10-25\n- タグ: vue, ts\n- URL: https://tminasen.dev/blog/abc\n\n> 要約\n\n# はじめに\n本文A\n',
      );
    });

    it('should keep import lines inside code blocks', () => {
      // Given
      const source = buildSource(
        "# a\n\n```ts\nimport React from 'react';\n```\n",
      );
      // When
      const result = convertMdxToMarkdown(source);
      // Then
      expect(result).toContain("import React from 'react';");
    });

    it('should also strip imports without spaces in braces', () => {
      // Given
      const source = buildSource(
        '# a\n本文',
        undefined,
        "import {ArticleLayout} from '../../components/ArticleLayout';\n\n",
      );
      // When
      const result = convertMdxToMarkdown(source);
      // Then
      expect(result).not.toContain('ArticleLayout');
    });

    it('should keep JSX in the body as is', () => {
      // Given
      const source = buildSource('# a\n\n<Lightbox src="/a.png" />\n');
      // When
      const result = convertMdxToMarkdown(source);
      // Then
      expect(result).toContain('<Lightbox src="/a.png" />');
    });

    it('should not output a quote line when description is undefined', () => {
      // Given
      const source = buildSource('# はじめに\n本文A');
      // When
      const result = convertMdxToMarkdown(source);
      // Then
      expect(result.split('\n').some(line => line.startsWith('> '))).toBe(
        false,
      );
    });
  });

  describe('invariants (P4)', () => {
    it.each([
      '# はじめに\n本文A',
      "# a\n\n```ts\nimport x from 'y';\nexport default 1;\n```\n",
      '# a\n\n<Lightbox src="/a.png" />\n\n- list\n  - nested\n',
      '## 見出し\n\n  インデント付き  \n本文',
    ])('should end with the unmodified body for %j', body => {
      // Given
      const source = buildSource(body, '要約');
      // When
      const result = convertMdxToMarkdown(source);
      // Then
      expect(result.endsWith(`${body.trimEnd()}\n`)).toBe(true);
    });
  });
});
