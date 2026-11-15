import fs from 'node:fs';
import path from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ReactNode } from 'react';
import { ArticleLayout } from './ArticleLayout';

vi.mock('next/head', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="mock-head">{children}</div>
  ),
}));

vi.mock('next/script', () => ({
  default: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

const ADJ_BOTH = {
  prev: { path: '/blog/a', title: 'A' },
  next: { path: '/blog/c', title: 'C' },
};

const meta = {
  path: '/blog/abc',
  date: '2020/10/25',
  title: '記事A',
  tag: ['vue', 'ts'],
  ogpImage: '/images/a.png',
  thumbnailImage: '/t.png',
  description: '要約',
};

describe('ArticleLayout', () => {
  it('should render a JSON-LD script', () => {
    // Given / When
    const { container } = render(
      <ArticleLayout meta={meta}>本文</ArticleLayout>,
    );

    // Then
    const scripts = container.ownerDocument.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts.length).toBe(1);
    expect(JSON.parse(scripts[0].textContent ?? '').headline).toBe('記事A');
  });

  it('should render an alternate link to the Markdown version', () => {
    // Given / When
    render(<ArticleLayout meta={meta}>本文</ArticleLayout>);

    // Then
    const link = document.querySelector(
      'link[rel="alternate"][type="text/markdown"]',
    );
    expect(link?.getAttribute('href')).toBe(
      'https://tminasen.dev/blog/abc.md',
    );
  });

  it('should use the article description as meta description', () => {
    // Given / When
    render(<ArticleLayout meta={meta}>本文</ArticleLayout>);

    // Then
    const description = document.querySelector('meta[name="description"]');
    expect(description?.getAttribute('content')).toBe('要約');
  });

  it('記事ページの h1 は記事タイトルの1件のみ', () => {
    // Given
    // When
    render(<ArticleLayout meta={meta}>本文</ArticleLayout>);

    // Then
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('記事A');
  });

  it('タイトル（h1）と本文が同じカード要素に入る', () => {
    // Given
    // When
    render(<ArticleLayout meta={meta}>本文テキスト</ArticleLayout>);

    // Then
    const card = screen.getByRole('heading', { level: 1 }).parentElement!;
    expect(card.contains(screen.getByText('本文テキスト'))).toBe(true);
  });

  it('メタ行では日付がタグ一覧より前に並ぶ', () => {
    // Given
    // When
    const { container } = render(<ArticleLayout meta={meta}>本文</ArticleLayout>);

    // Then
    const time = container.querySelector('time[datetime="2020/10/25"]')!;
    const tagList = screen.getByRole('link', { name: 'vue' }).closest('ul')!;
    expect(time).not.toBeNull();
    expect(time.compareDocumentPosition(tagList) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('記事のタグがタグ別一覧へのリンクとして表示される', () => {
    // Given
    // When
    render(<ArticleLayout meta={meta}>本文</ArticleLayout>);

    // Then
    expect(screen.getByRole('link', { name: 'vue' })).toHaveAttribute('href', '/tags/vue');
    expect(screen.getByRole('link', { name: 'ts' })).toHaveAttribute('href', '/tags/ts');
  });

  describe('前後の記事ナビ', () => {
    it('前後の記事のリンクが表示される', () => {
      // Given
      // When
      render(
        <ArticleLayout meta={meta} adjacent={ADJ_BOTH}>
          本文
        </ArticleLayout>,
      );

      // Then
      const nav = screen.getByRole('navigation', { name: '前後の記事' });
      const links = within(nav).getAllByRole('link');
      const prev = links.find(l => l.getAttribute('href') === '/blog/a')!;
      const next = links.find(l => l.getAttribute('href') === '/blog/c')!;
      expect(prev.textContent).toContain('前の記事');
      expect(prev.textContent).toContain('A');
      expect(next.textContent).toContain('次の記事');
      expect(next.textContent).toContain('C');
    });

    it('前の記事が無いときは次の記事だけを出す', () => {
      // Given
      const adjacent = { prev: null, next: { path: '/blog/c', title: 'C' } };

      // When
      render(
        <ArticleLayout meta={meta} adjacent={adjacent}>
          本文
        </ArticleLayout>,
      );

      // Then
      const nav = screen.getByRole('navigation', { name: '前後の記事' });
      const links = within(nav).getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href', '/blog/c');
      expect(links.some(l => l.textContent?.includes('前の記事'))).toBe(false);
    });

    it('前後とも無い（adjacent 未指定）ならナビを出さない', () => {
      // Given
      // When
      render(<ArticleLayout meta={meta}>本文</ArticleLayout>);

      // Then
      expect(
        screen.queryByRole('navigation', { name: '前後の記事' }),
      ).toBeNull();
    });

    it('ナビは記事カードの中、本文の後ろにある', () => {
      // Given
      // When
      render(
        <ArticleLayout meta={meta} adjacent={ADJ_BOTH}>
          本文テキスト
        </ArticleLayout>,
      );

      // Then
      const card = screen.getByRole('heading', { level: 1 }).parentElement!;
      const nav = screen.getByRole('navigation', { name: '前後の記事' });
      const body = screen.getByText('本文テキスト');
      expect(card.contains(nav)).toBe(true);
      expect(
        body.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe('目次のスムーズスクロール', () => {
    it('記事内の目次リンクをクリックすると見出しへスムーズにスクロールする', () => {
      // Given
      const scrollIntoView = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoView as unknown as Element['scrollIntoView'];
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
      render(
        <ArticleLayout meta={meta}>
          <nav className="toc toc-sidebar" aria-label="目次">
            <a href="#intro">はじめに</a>
          </nav>
          <h2 id="intro">はじめに</h2>
        </ArticleLayout>,
      );

      // When
      screen.getByRole('link', { name: 'はじめに' }).click();

      // Then
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      vi.unstubAllGlobals();
    });
  });

  describe('article.css の長 URL 折り返しスタイル', () => {
    it('記事本文のリンク（.prose-article a:not(.toc a)）に長い URL を折り返す overflow-wrap: anywhere が定義されている', () => {
      // Given
      const articleCssPath = path.resolve(__dirname, '../styles/article.css');
      const cssContent = fs.readFileSync(articleCssPath, 'utf-8');

      // When
      const ruleMatch = cssContent.match(
        /\.prose-article a:not\(\.toc a\)\s*\{([^}]*)\}/,
      );

      // Then
      expect(ruleMatch).not.toBeNull();
      expect(ruleMatch![1]).toMatch(/overflow-wrap:\s*anywhere\s*;/);
    });

    it('記事本文の段落・リスト項目（.prose-article p, .prose-article li）にも長い URL テキストを折り返す overflow-wrap: anywhere が定義されている', () => {
      // Given
      const articleCssPath = path.resolve(__dirname, '../styles/article.css');
      const cssContent = fs.readFileSync(articleCssPath, 'utf-8');

      // When
      const ruleMatch = cssContent.match(
        /\.prose-article p,\s*\.prose-article li\s*\{([^}]*)\}/,
      );

      // Then
      expect(ruleMatch).not.toBeNull();
      expect(ruleMatch![1]).toMatch(/overflow-wrap:\s*anywhere\s*;/);
    });
  });
});
