import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ArticleMetaData, Tag, TagCount } from '../../types/article';
import { markdown2Html, removeTags } from './markdown';
import { parseStringDate } from './data';

/**
 * 記事の概要表示に必要なデータを取得する
 * @return {@see ArticleMetaData}
 */
export async function getArticleMetaData(): Promise<ArticleMetaData[]> {
  const mdPagePath: string = path.join(process.cwd(), 'src/md-pages');
  const articleDirectories: string[] = fs.readdirSync(mdPagePath);
  const result: Array<ArticleMetaData | undefined> = [];
  for (const articleDir of articleDirectories) {
    const articleDirPath = path.join(mdPagePath, articleDir);
    const files = fs.readdirSync(articleDirPath);
    const file: string | undefined = files.filter(file =>
      file.endsWith('.md'),
    )[0];
    const fileDetail = fs.readFileSync(
      path.join(mdPagePath, articleDir, file),
      'utf8',
    );
    const matterResult = matter(fileDetail, { excerpt: true });
    const metaData = await convertArticleMetaData(
      matterResult.data,
      matterResult.content,
    );
    result.push(metaData);
  }
  return result
    .filter((item): item is ArticleMetaData => item !== undefined)
    .sort(sortArticleDescDate);
}

/**
 * 記事毎のタグ数から表示に必要なデータに整形する
 * @param tagCount 記事毎のタグ数
 * @returns {
 *   name: タグ名
 *   articleCount: 記事数
 *   url: タグ別URL
 * }
 */
export function convertTagList(tagCount: TagCount): Tag[] {
  return Object.entries(tagCount)
    .map(
      ([tag, count]): Tag => ({
        name: tag,
        articleCount: count,
        url: `/tags/${tag}`,
      }),
    )
    .sort(sortTagDescArticleCount);
}

async function convertArticleMetaData(
  data: {
    [key: string]: any;
  },
  context: string,
): Promise<ArticleMetaData | undefined> {
  if (!isArticleMetaData(data)) {
    throw new Error('data is invalid.');
  }
  const highlightHtml = await markdown2Html(context);

  return {
    path: data.path,
    date: data.date,
    title: data.title,
    tag: data.tag,
    thumbnailImage: data.thumbnailImage,
    html: highlightHtml,
    description: `${removeTags(context).substring(0, 130)}…`,
  };
}

function isArticleMetaData(data: {
  [key: string]: any;
}): data is ArticleMetaData {
  return (
    !!data?.path &&
    !!data?.date &&
    !!data?.title &&
    !!data?.tag &&
    !!data?.thumbnailImage
  );
}

/**
 * 記事を作成日の降順でソートする
 * @param a
 * @param b
 */
function sortArticleDescDate(a: ArticleMetaData, b: ArticleMetaData) {
  return parseStringDate(b.date) - parseStringDate(a.date);
}

/**
 * タグリストを記事数の降順でソートする
 * @param a
 * @param b
 */
function sortTagDescArticleCount(a: Tag, b: Tag) {
  return b.articleCount - a.articleCount;
}
