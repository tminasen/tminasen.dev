import { ArticleMetaData } from '../types/article';
import { metaData } from '../constants/metaData';
import { dateFromDateString } from './date';

/**
 * 記事メタデータからRSSアイテムを組み立てる
 * @param article 記事メタデータ
 * @param baseUrl サイトのベースURL
 * @throws 記事の日付が不正な場合
 */
export function buildFeedItem(article: ArticleMetaData, baseUrl: string) {
  const date = dateFromDateString(article.date);
  if (date instanceof Error) {
    throw date;
  }
  const url = `${baseUrl}${article.path}`;
  return {
    title: article.title,
    id: url,
    link: url,
    description: article.description,
    author: [{ name: metaData.authorName, link: 'https://twitter.com/tminasen' }],
    date,
    image: `${baseUrl}${article.ogpImage}`,
  };
}
