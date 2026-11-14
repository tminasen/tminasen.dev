import { render, screen } from '@testing-library/react';
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
});
