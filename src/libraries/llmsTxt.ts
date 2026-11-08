type LlmsTxtArticle = {
  path: string;
  title: string;
  description: string;
};

type LlmsTxtSite = {
  title: string;
  description: string;
  domain: string;
};

function escapeLinkText(text: string): string {
  return text.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

function toSingleLine(text: string): string {
  return text.replace(/\s*[\r\n]+\s*/g, ' ');
}

/**
 * llms.txt(llmstxt.org形式)の文字列を組み立てる。各記事はMarkdown版URLへリンクする
 * @param articles 記事（出力順は入力順）
 * @param site サイト情報
 */
export function buildLlmsTxt(
  articles: LlmsTxtArticle[],
  site: LlmsTxtSite,
): string {
  const lines = articles.map(
    article =>
      `- [${escapeLinkText(toSingleLine(article.title))}](${site.domain}${article.path}.md): ${toSingleLine(article.description)}`,
  );
  return [
    `# ${site.title}`,
    '',
    `> ${site.description}`,
    '',
    '## Articles',
    '',
    ...lines,
    '',
  ].join('\n');
}
