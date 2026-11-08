import { metaData } from '../constants/metaData';
import { toIsoDateString } from './date';

type BlogPostingSource = {
  path: string;
  date: string;
  title: string;
  tag: string[];
  ogpImage: string;
  thumbnailImage: string;
  description?: string;
};

/**
 * 記事メタデータからschema.orgのBlogPosting(JSON-LD)オブジェクトを組み立てる
 * @param meta 記事メタデータ
 */
export function buildBlogPostingJsonLd(meta: BlogPostingSource) {
  const url = `${metaData.domain}${meta.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    datePublished: toIsoDateString(meta.date),
    author: {
      '@type': 'Person',
      name: metaData.authorName,
      url: metaData.githubUrl,
    },
    ...(meta.tag.length > 0 ? { keywords: meta.tag.join(',') } : {}),
    ...(meta.description ? { description: meta.description } : {}),
    image: `${metaData.domain}${meta.ogpImage}`,
    url,
    mainEntityOfPage: url,
  };
}

/**
 * JSON-LDを<script>内に安全に埋め込めるよう、`<`をエスケープしてシリアライズする
 * @param value シリアライズ対象
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
