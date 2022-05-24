import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { parseStringDate } from './date';

type OgpArticleMetaData = Record<
  'title' | 'date' | 'path' | 'description' | 'ogpImage',
  string
>;

export async function getArticleMetaData() {
  const mdPagePath: string = path.join(process.cwd(), 'src/md-pages');
  const articleDirectories: string[] = fs.readdirSync(mdPagePath);
  const result: Array<OgpArticleMetaData | undefined> = [];
  for (const articleDir of articleDirectories) {
    const articleDirPath = path.join(mdPagePath, articleDir);
    const files = fs.readdirSync(articleDirPath);
    const file: string | undefined = files.filter(file =>
      file.endsWith('.md'),
    )[0];
    if (file === undefined) {
      throw new Error(`file is required. articleDirPath: ${articleDirPath}`);
    }
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
    .filter((item): item is OgpArticleMetaData => item !== undefined)
    .sort(sortArticleDescDate);
}

function sortArticleDescDate(a: OgpArticleMetaData, b: OgpArticleMetaData) {
  return parseStringDate(b.date) - parseStringDate(a.date);
}

async function convertArticleMetaData(
  data: Record<string, any>,
  context: string,
): Promise<OgpArticleMetaData | undefined> {
  if (!data?.title || !data?.date || !data?.path || !data?.ogpImage) {
    return undefined;
  }
  const id = data.path.split('/')[2];
  const description = `${removeTags(context).substring(0, 130)}…`;
  return {
    title: data.title,
    date: data.date,
    ogpImage: data.ogpImage,
    path: id,
    description,
  };
}

/**
 * markdown文字列から以下のタグを取り除く
 * <ul>
 *  <li>見出し</li>
 *  <li>リンク</li>
 *  <li>リスト</li>
 * </ul>
 * @param markdownText markdown形式文字列
 * @returns markdownのタグを取り除いた文字列
 */
function removeTags(markdownText: string): string {
  return markdownText
    .replace(/^#{1,3} (.*)$/gm, '$1')
    .replace(/\[(.+)]\(.+\)/gm, '$1')
    .replace(/^\s+\[*-] (.+)$/gm, '$1');
}
