import createMDX from '@next/mdx';
import rehypePrism from '@mapbox/rehype-prism';
import remarkFrontmatter from 'remark-frontmatter';

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkFrontmatter],
    rehypePlugins: [rehypePrism],
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
