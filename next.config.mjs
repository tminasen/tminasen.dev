import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createMDX from '@next/mdx';

// @next/mdx の loader は各 MDX ファイルのディレクトリ基準でプラグインを解決するため、絶対パス文字列で指定する
const librariesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/libraries');
const rehypeHeadingIdsPath = path.join(librariesDir, 'rehypeHeadingIds.mjs');
const rehypeTocPath = path.join(librariesDir, 'rehypeToc.mjs');

/** @type {import('rehype-pretty-code').Options} */
const rehypePrettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark-dimmed',
  },
  keepBackground: true,
  defaultLang: 'plaintext',
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ['remark-frontmatter', 'remark-gfm'],
    rehypePlugins: [
      ['rehype-pretty-code', rehypePrettyCodeOptions],
      rehypeHeadingIdsPath,
      rehypeTocPath,
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  compiler: {
    styledComponents: false,
  },
};

export default withMDX(nextConfig);
