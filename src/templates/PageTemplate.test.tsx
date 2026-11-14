import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { PageTemplate } from './PageTemplate';

const SITE_TITLE = '水無瀬のプログラミング日記';

describe('PageTemplate', () => {
  it('isTopPage 未指定では h1 を出力しない', () => {
    // Given
    const children = <p>本文</p>;
    // When
    render(<PageTemplate>{children}</PageTemplate>);
    // Then
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  it('isTopPage 指定でサイト名が h1', () => {
    // Given
    const children = <p>本文</p>;
    // When
    render(<PageTemplate isTopPage>{children}</PageTemplate>);
    // Then
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(SITE_TITLE);
  });

  it('スキップリンクがページ最初のリンク', () => {
    // Given
    const children = <p>本文</p>;
    // When
    render(<PageTemplate>{children}</PageTemplate>);
    // Then
    const first = screen.getAllByRole('link')[0];
    expect(first).toHaveAccessibleName('本文へスキップ');
    expect(first.getAttribute('href')).toBe('#main-content');
  });

  it('スキップリンクの飛び先が本文を含む main', () => {
    // Given
    const children = <p>本文</p>;
    // When
    render(<PageTemplate>{children}</PageTemplate>);
    // Then
    const target = document.getElementById('main-content');
    expect(target).toBe(screen.getByRole('main'));
    expect(target).toHaveTextContent('本文');
  });
});
