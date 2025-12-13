import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  ArticleMetaData,
  MarkdownMetaData,
  Tag,
  TagCount,
} from '../types/article';
import { parseStringDate } from './date';
import { getImageSize } from './image';

/**
 * markdown文字列から以下のタグを取り除く
 */
function removeTags(markdownText: string): string {
  return markdownText
    .replace(/^#{1,3} (.*)$/gm, '$1')
    .replace(/\[(.+)]\(.+\)/gm, '$1')
    .replace(/^\s+\[*-] (.+)$/gm, '$1');
}

/**
 * 記事の概要表示に必要なデータを更新日降順で取得する
 * @return @see {@link MarkdownMetaData}
 */
export async function getArticleMetaData(): Promise<ArticleMetaData[]> {
  const blogPagePath: string = path.join(process.cwd(), 'src/pages/blog');
  const files: string[] = fs.readdirSync(blogPagePath);
  const mdxFiles = files.filter(file => file.endsWith('.mdx'));

  const result: Array<ArticleMetaData | undefined> = [];
  for (const file of mdxFiles) {
    const fileDetail = fs.readFileSync(
      path.join(blogPagePath, file),
      'utf8',
    );
    const matterResult = matter(fileDetail, { excerpt: true });
    const metaData = convertArticleMetaData(
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
 * metaDataからタグと件数を取得する
 * @param articleMetaData
 */
export function getTagCount(articleMetaData: ArticleMetaData[]): TagCount {
  return articleMetaData
    .map(data => data.tag)
    .flat()
    .reduce((result: TagCount, tag, _, list) => {
      if (result[tag] == undefined) {
        result[tag] = list.filter(i => i === tag).length;
      }
      return result;
    }, {});
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

function convertArticleMetaData(
  data: Record<string, any>,
  context: string,
): ArticleMetaData | undefined {
  if (!isArticleMetaData(data)) {
    throw new Error('data is invalid.');
  }
  // MDXではimport/exportの行を除いてdescriptionを生成
  const contentWithoutImports = context
    .replace(/^import .+$/gm, '')
    .replace(/^export .+$/gm, '')
    .trim();
  return {
    path: data.path,
    date: data.date,
    title: data.title,
    tag: data.tag,
    thumbnailImage: {
      url: data.thumbnailImage,
      size: getImageSize(data.thumbnailImage, 'thumbnail'),
    },
    ogpImage: data.ogpImage,
    description: `${removeTags(contentWithoutImports).substring(0, 130)}…`,
  };
}

function isArticleMetaData(data: {
  [key: string]: any;
}): data is MarkdownMetaData {
  return (
    !!data?.path &&
    !!data?.date &&
    !!data?.title &&
    !!data?.tag &&
    !!data?.thumbnailImage &&
    !!data?.ogpImage
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
