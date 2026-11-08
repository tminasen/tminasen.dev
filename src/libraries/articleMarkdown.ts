import matter from 'gray-matter';
import { metaData } from '../constants/metaData';
import { toIsoDateString } from './date';

// MDX先頭のプリアンブル（import行・export const meta・export default行）
const PREAMBLE_PATTERNS: RegExp[] = [
  /^import [^\n]*(\n|$)/,
  /^export const meta = \{[\s\S]*?\n\};?[ \t]*(\n|$)/,
  /^export default [^\n]*(\n|$)/,
];

/**
 * 先頭のプリアンブルと空行のみを取り除く（本文は無変換）
 */
function stripPreamble(content: string): string {
  let rest = content.replace(/^\s+/, '');
  for (;;) {
    const pattern = PREAMBLE_PATTERNS.find(p => p.test(rest));
    if (!pattern) {
      return rest;
    }
    rest = rest.replace(pattern, '').replace(/^\s+/, '');
  }
}

/**
 * 記事MDX(frontmatter付き)をAI向けのMarkdownに変換する。
 * プリアンブルを除去し、タイトル・公開日・タグ・URL・要約のヘッダを付与する
 * @param source MDXファイルの全文
 * @throws frontmatterの日付が不正な場合
 */
export function convertMdxToMarkdown(source: string): string {
  const { data, content } = matter(source);
  const body = stripPreamble(content).trimEnd();
  const header = [
    `# ${data.title}`,
    '',
    `- 公開日: ${toIsoDateString(data.date)}`,
    `- タグ: ${(data.tag as string[]).join(', ')}`,
    `- URL: ${metaData.domain}${data.path}`,
    ...(data.description ? ['', `> ${data.description}`] : []),
  ];
  return `${header.join('\n')}\n\n${body}\n`;
}
