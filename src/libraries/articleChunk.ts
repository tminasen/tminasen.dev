import { ArticleMetaData } from '../types/article';
import { paginate, getTotalPages } from './pagination';

export type ArticleChunk = {
  page: number;
  url: string;
  articles: ArticleMetaData[];
};

/**
 * ページ番号から記事チャンクJSONのURLを組み立てる
 * @param page ページ番号（2以上）
 * @returns チャンクJSONのURL（例: '/articles/page-2.json'）
 */
export const getArticleChunkUrl = (page: number): string =>
  `/articles/page-${page}.json`;

/**
 * 2ページ目以降の記事チャンクを組み立てる
 * 1ページ目は初期HTMLに含まれるため対象外とする
 * @param articles 全記事
 * @param perPage 1ページあたりの件数
 * @returns 2ページ目以降のチャンク一覧
 */
export const buildArticleChunks = (
  articles: ArticleMetaData[],
  perPage: number,
): ArticleChunk[] => {
  const totalPages = getTotalPages(articles.length, perPage);

  return Array.from({ length: totalPages - 1 }, (_, i) => {
    const page = i + 2;
    return {
      page,
      url: getArticleChunkUrl(page),
      articles: paginate(articles, page, perPage),
    };
  }).filter(chunk => chunk.articles.length > 0);
};
