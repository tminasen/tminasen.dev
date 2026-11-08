import { toIsoDateString } from './date';

type SitemapArticle = {
  path: string;
  date: string;
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrlElement(loc: string, lastmod?: string): string {
  const lastmodElement = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
  return `<url><loc>${escapeXml(loc)}</loc>${lastmodElement}</url>`;
}

/**
 * sitemap.xmlの文字列を組み立てる
 * @param articles 記事（path, date）
 * @param tags タグ名一覧
 * @param baseUrl サイトのベースURL
 * @throws 記事の日付が不正な場合
 */
export function buildSitemapXml(
  articles: SitemapArticle[],
  tags: string[],
  baseUrl: string,
): string {
  const articleEntries = articles.map(article => ({
    path: article.path,
    lastmod: toIsoDateString(article.date),
  }));
  // ISO形式は文字列比較で日付順になる
  const latest = articleEntries
    .map(entry => entry.lastmod)
    .reduce<string | undefined>(
      (max, current) => (max === undefined || current > max ? current : max),
      undefined,
    );

  const urls = [
    buildUrlElement(`${baseUrl}/`, latest),
    ...articleEntries.map(entry =>
      buildUrlElement(`${baseUrl}${entry.path}`, entry.lastmod),
    ),
    ...tags.map(tag =>
      buildUrlElement(`${baseUrl}/tags/${encodeURIComponent(tag)}`),
    ),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
