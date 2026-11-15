import { metaData } from '../constants/metaData';
import { toIsoDateString } from './date';

type BlogPostingSource = {
  path: string;
  date: string;
  updatedAt?: string;
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
  const datePublished = toIsoDateString(meta.date);
  const person = {
    '@type': 'Person',
    name: metaData.authorName,
    url: metaData.githubUrl,
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    datePublished,
    dateModified: meta.updatedAt ? toIsoDateString(meta.updatedAt) : datePublished,
    author: person,
    publisher: person,
    ...(meta.tag.length > 0 ? { keywords: meta.tag.join(',') } : {}),
    ...(meta.description ? { description: meta.description } : {}),
    image: `${metaData.domain}${meta.ogpImage}`,
    url,
    mainEntityOfPage: url,
  };
}

/**
 * トップページ用のschema.orgのWebSite(JSON-LD)オブジェクトを組み立てる
 */
export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: metaData.title,
    description: metaData.description,
    url: `${metaData.domain}/`,
    author: {
      '@type': 'Person',
      name: metaData.authorName,
      url: metaData.githubUrl,
    },
  };
}

/**
 * タグ個別ページ用のschema.orgのCollectionPage(JSON-LD)オブジェクトを組み立てる
 * @param tagName タグ名
 */
export function buildTagPageJsonLd(tagName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tagName}の記事一覧`,
    url: `${metaData.domain}/tags/${encodeURIComponent(tagName)}`,
  };
}

/**
 * JSON-LDを<script>内に安全に埋め込めるよう、`<`をエスケープしてシリアライズする
 * @param value シリアライズ対象
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
