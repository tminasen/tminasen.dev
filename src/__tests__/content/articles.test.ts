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

  it('should set the thumbnail srcSet from the actual image width', async () => {
    // Given
    const imageUrl =
      '/images/article/040a4af3-391e-4470-912e-4deca2cdcb2c/thumbnail.png';

    // When
    const articles = await getArticleMetaData();

    // Then
    const article = articles.find(a => a.thumbnailImage.url === imageUrl);
    expect(article?.thumbnailImage.srcSet).toBe(
      '/images/article/040a4af3-391e-4470-912e-4deca2cdcb2c/thumbnail-336w.webp 336w, /images/article/040a4af3-391e-4470-912e-4deca2cdcb2c/thumbnail-672w.webp 672w',
    );
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
    'should have the same updatedAt in frontmatter and export const meta (both undefined when omitted): %s (T9)',
    file => {
      // Given
      const source = readSource(file);

      // When
      const { data, content } = matter(source);
      const metaBlock = content.match(
        /export const meta = \{([\s\S]*?)\n\};/,
      )?.[1];
      const metaUpdatedAt = metaBlock?.match(
        /^\s*updatedAt:\s*"(.*)",\s*$/m,
      )?.[1];

      // Then
      expect(metaUpdatedAt).toBe(data.updatedAt);
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

  it.each(mdxFiles)(
    'should pass the adjacent articles to ArticleLayout via getStaticProps: %s',
    file => {
      // Given
      const source = readSource(file);

      // When
      const { content } = matter(source);

      // Then
      expect(content).toContain(
        "import { getAdjacentArticleProps } from '../../libraries/adjacentArticles';",
      );
      expect(content).toContain(
        'export const getStaticProps = () => getAdjacentArticleProps(meta.path);',
      );
      expect(content).toMatch(
        /^export default \(\{ ?children, adjacent ?\}\) => <ArticleLayout meta=\{meta\} adjacent=\{adjacent\}>\{children\}<\/ArticleLayout>;$/m,
      );
    },
  );
});
