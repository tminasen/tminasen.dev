import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { getArticleMetaData } from '../../libraries/articles';
import { convertMdxToMarkdown } from '../../libraries/articleMarkdown';

const blogDirectory = path.join(process.cwd(), 'src/pages/blog');
const mdxFiles = fs.readdirSync(blogDirectory).filter(f => f.endsWith('.mdx'));

const readSource = (file: string) =>
  fs.readFileSync(path.join(blogDirectory, file), 'utf8');

describe('src/pages/blog/*.mdx (実記事)', () => {
  it('should have 27 articles, each with a frontmatter-based description', async () => {
    // Given / When
    const articles = await getArticleMetaData();

    // Then
    expect(articles).toHaveLength(27);
    articles.forEach(article => {
      expect(article.description.trim()).not.toBe('');
      expect(article.description.length).toBeLessThanOrEqual(160);
      expect(article.description).not.toMatch(/[\r\n]/);
      expect(article.description).not.toContain('path: ');
      expect(article.description.endsWith('…')).toBe(false);
    });
  });

  it.each(mdxFiles)(
    'should have the same description in frontmatter and export const meta: %s',
    file => {
      // Given
      const source = readSource(file);

      // When
      const { data, content } = matter(source);
      const metaBlock = content.match(
        /export const meta = \{([\s\S]*?)\n\};/,
      )?.[1];
      const metaDescription = metaBlock?.match(
        /^\s*description:\s*"(.*)",\s*$/m,
      )?.[1];

      // Then
      expect(data.description).toBeTruthy();
      expect(metaDescription).toBe(data.description);
    },
  );

  it.each(mdxFiles)(
    'should convert to markdown without any preamble: %s',
    file => {
      // Given
      const source = readSource(file);
      const { data } = matter(source);

      // When
      const result = convertMdxToMarkdown(source);

      // Then
      expect(result).not.toContain('export const meta');
      // 本文中のコードブロックの export default は無変換で残す（P4）ため、
      // プリアンブルの export default ({ children }) => ... のみを対象にする
      expect(result).not.toMatch(/^export default \(\{ ?children/m);
      expect(result).not.toContain('ArticleLayout');
      expect(result.startsWith(`# ${data.title}\n`)).toBe(true);
    },
  );
});
