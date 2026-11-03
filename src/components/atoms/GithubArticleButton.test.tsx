import fs from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GithubArticleButton } from './GithubArticleButton';
import { metaData } from '../../constants/metaData';

describe('GithubArticleButton & metaData', () => {
  it('should render article link with new GitHub account URL when valid article path is provided', () => {
    // Given: path: "/blog/20200520"
    const path = '/blog/20200520';

    // When: <GithubArticleButton path="/blog/20200520" /> をレンダリングする
    render(<GithubArticleButton path={path} />);

    // Then: metaData.githubUrl が "https://github.com/tminasen/" であり、role="link"（title="Githubリンク"）の href 属性が "https://github.com/tminasen/tminasen.dev/tree/master/src/pages/blog/20200520.mdx" となる
    expect(metaData.githubUrl).toBe('https://github.com/tminasen/');
    const link = screen.getByRole('link', { name: 'Githubリンク' });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/tminasen/tminasen.dev/tree/master/src/pages/blog/20200520.mdx',
    );
  });

  it('should not render link when path is undefined', () => {
    // Given: path: undefined
    const path = undefined;

    // When: <GithubArticleButton path={undefined} /> をレンダリングする
    const { container } = render(<GithubArticleButton path={path} />);

    // Then: container.firstChild が null となる（リンク要素が存在しない）
    expect(container.firstChild).toBeNull();
  });

  it('should not render link when path does not contain article segment', () => {
    // Given: path: "/blog"
    const path = '/blog';

    // When: <GithubArticleButton path="/blog" /> をレンダリングする
    const { container } = render(<GithubArticleButton path={path} />);

    // Then: container.firstChild が null となる（リンク要素が存在しない）
    expect(container.firstChild).toBeNull();
  });

  it('should have GitHub account updated to @tminasen without old account name when inspecting ogp-base.html', () => {
    // Given: scripts/generate-ogp/ogp-base.html のファイル内容
    const ogpBasePath = path.resolve(__dirname, '../../../scripts/generate-ogp/ogp-base.html');
    const content = fs.readFileSync(ogpBasePath, 'utf-8');

    // When: ファイルを読み込みアカウント表記を検証する
    const matches = content.match(/<p class="sns__account">@tminasen<\/p>/g) || [];

    // Then: <p class="sns__account">@tminasen</p> が2箇所（X用・GitHub用）存在し、Tetsuya-Minase を含まない
    expect(matches).toHaveLength(2);
    expect(content).not.toMatch(/Tetsuya-Minase/i);
  });

  it('should not contain legacy account names and should use new account name when scanning all blog articles', () => {
    // Given: src/pages/blog/ 配下の全 .mdx ファイル
    const blogDir = path.resolve(__dirname, '../../pages/blog');
    const mdxFiles = fs
      .readdirSync(blogDir)
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => path.join(blogDir, file));

    // When: 全ファイルの内容を走査する
    const occurrences: { file: string; match: string }[] = [];
    for (const file of mdxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(/Tetsuya\\?-Minase/gi);
      if (matches) {
        occurrences.push(...matches.map((m) => ({ file: path.basename(file), match: m })));
      }
    }

    // Then: 大文字小文字を問わず Tetsuya-Minase および Tetsuya\-Minase の出現件数が 0 件であり、976f8b32-937c-4cb8-b6f5-6d5e62228750.mdx に [tminasen/mcp\-server\-sample](https://github.com/tminasen/mcp-server-sample) が含まれる
    expect(occurrences).toEqual([]);
    const specificFile = path.join(blogDir, '976f8b32-937c-4cb8-b6f5-6d5e62228750.mdx');
    const specificContent = fs.readFileSync(specificFile, 'utf-8');
    expect(specificContent).toContain('[tminasen/mcp\\-server\\-sample](https://github.com/tminasen/mcp-server-sample)');
  });
});

