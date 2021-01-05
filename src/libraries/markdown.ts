import unified from 'unified';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import html from 'rehype-stringify';
const rehypePrism = require('@mapbox/rehype-prism');

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
export function removeTags(markdownText: string): string {
  return markdownText
    .replace(/^#{1,3} (.*)$/gm, '$1')
    .replace(/\[(.+)]\(.+\)/gm, '$1')
    .replace(/^\s+\[*-] (.+)$/gm, '$1');
}

/**
 * markdownテキストをhtmlに変換する
 * @param markdownText markdownテキスト
 * @returns html
 */
export async function markdown2Html(markdownText: string): Promise<string> {
  const processedContent = await unified()
    .use(remarkParse)
    .use(remark2rehype)
    .use(rehypePrism)
    .use(html)
    .process(markdownText);
  return processedContent.toString();
}
