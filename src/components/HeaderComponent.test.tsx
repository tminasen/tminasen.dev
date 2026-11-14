import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { HeaderComponent } from './HeaderComponent';

const SITE_TITLE = '水無瀬のプログラミング日記';

describe('HeaderComponent', () => {
  it('トップ以外では見出しを出力しない', () => {
    // Given
    const props = { siteTitle: SITE_TITLE, isTopPage: false };
    // When
    render(<HeaderComponent {...props} />);
    // Then
    expect(screen.queryAllByRole('heading')).toHaveLength(0);
  });

  it('トップではサイト名が h1', () => {
    // Given
    const props = { siteTitle: SITE_TITLE, isTopPage: true };
    // When
    render(<HeaderComponent {...props} />);
    // Then
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(SITE_TITLE);
  });

  it('サイト名はトップへのリンク', () => {
    // Given
    const props = { siteTitle: SITE_TITLE, isTopPage: false };
    // When
    render(<HeaderComponent {...props} />);
    // Then
    expect(screen.getByRole('link', { name: SITE_TITLE }).getAttribute('href')).toBe('/');
  });

  it('ナビに「タグ」「RSS」のリンクがある', () => {
    // Given
    const props = { siteTitle: SITE_TITLE, isTopPage: false };
    // When
    render(<HeaderComponent {...props} />);
    // Then
    const links = within(screen.getByRole('navigation', { name: 'グローバルメニュー' })).getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links.map((a) => a.textContent)).toEqual(['タグ', 'RSS']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/tags', '/rss/feed.xml']);
  });

  it('開閉ボタンと開閉状態が存在しない', () => {
    // Given
    const props = { siteTitle: SITE_TITLE, isTopPage: false };
    // When
    const { container } = render(<HeaderComponent {...props} />);
    // Then
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(container.querySelector('[aria-expanded]')).toBeNull();
  });
});
