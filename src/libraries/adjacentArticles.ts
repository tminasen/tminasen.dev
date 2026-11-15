import { ArticleMetaData } from '../types/article';
import { getArticleMetaData } from './articles';

export type ArticleLink = { path: string; title: string };
export type AdjacentArticles = {
  prev: ArticleLink | null;
  next: ArticleLink | null;
};

const toLink = (article: ArticleMetaData | undefined): ArticleLink | null =>
  article ? { path: article.path, title: article.title } : null;

/**
 * 日付降順の記事一覧から、指定パスの前後の記事を求める。
 * 「前の記事」は1つ古い記事（一覧で1つ後ろ）、「次の記事」は1つ新しい記事（一覧で1つ前）
 */
export function getAdjacentArticles(
  articles: readonly ArticleMetaData[],
  path: string,
): AdjacentArticles {
  const index = articles.findIndex(article => article.path === path);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: toLink(articles[index + 1]),
    next: toLink(articles[index - 1]),
  };
}

/**
 * 記事MDXの getStaticProps から呼び、前後の記事を ArticleLayout に渡す props を返す
 */
export async function getAdjacentArticleProps(
  path: string,
): Promise<{ props: { adjacent: AdjacentArticles } }> {
  const articles = await getArticleMetaData();
  return { props: { adjacent: getAdjacentArticles(articles, path) } };
}
