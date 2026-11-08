#!/usr/bin/env tsx

import { $, path, fs } from 'zx';
import { getArticleMetaData, getTagCount } from '../../src/libraries/articles';
import { convertMdxToMarkdown } from '../../src/libraries/articleMarkdown';
import { buildSitemapXml } from '../../src/libraries/sitemap';
import { buildLlmsTxt } from '../../src/libraries/llmsTxt';
import { metaData } from '../../src/constants/metaData';

const getCurrentDirectory = await $`pwd`;
const currentDirectory = getCurrentDirectory.stdout.trim();
const PUBLIC_DIRECTORY = path.join(currentDirectory, 'public');
const BLOG_SOURCE_DIRECTORY = path.join(currentDirectory, 'src/pages/blog');
const MARKDOWN_DIRECTORY = path.join(PUBLIC_DIRECTORY, 'blog');

(async () => {
  const articles = await getArticleMetaData();
  const tags = Object.keys(getTagCount(articles));

  // sitemap.xml
  fs.writeFileSync(
    path.join(PUBLIC_DIRECTORY, 'sitemap.xml'),
    buildSitemapXml(articles, tags, metaData.domain),
    { encoding: 'utf-8' },
  );

  // llms.txt
  fs.writeFileSync(
    path.join(PUBLIC_DIRECTORY, 'llms.txt'),
    buildLlmsTxt(articles, {
      title: metaData.title,
      description: metaData.description,
      domain: metaData.domain,
    }),
    { encoding: 'utf-8' },
  );

  // 記事のMarkdown版（public/blog/{id}.md）
  await fs.emptyDir(MARKDOWN_DIRECTORY);
  const mdxFiles = fs
    .readdirSync(BLOG_SOURCE_DIRECTORY)
    .filter(file => file.endsWith('.mdx'));
  for (const file of mdxFiles) {
    const source = fs.readFileSync(path.join(BLOG_SOURCE_DIRECTORY, file), 'utf8');
    const id = file.replace(/\.mdx$/, '');
    fs.writeFileSync(
      path.join(MARKDOWN_DIRECTORY, `${id}.md`),
      convertMdxToMarkdown(source),
      { encoding: 'utf-8' },
    );
  }
})();
