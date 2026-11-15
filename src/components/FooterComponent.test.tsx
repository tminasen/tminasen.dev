import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { FooterComponent } from './FooterComponent';

describe('FooterComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-15T00:00:00+09:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('フッターに4つのリンクがこの順で並ぶ', () => {
    // Given
    // When
    render(<FooterComponent />);

    // Then
    const links = within(screen.getByRole('contentinfo')).getAllByRole('link');
    expect(links.map(link => link.textContent)).toEqual([
      'RSS',
      'GitHub',
      'X',
      'llms.txt',
    ]);
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/rss/feed.xml',
      'https://github.com/tminasen/',
      'https://x.com/tminasen',
      '/llms.txt',
    ]);
  });

  it('著作権表記を現在の西暦で1行表示する', () => {
    // Given
    // When
    render(<FooterComponent />);

    // Then
    expect(
      screen.getByText('© 2026 tminasen ・ This site uses Google Analytics.'),
    ).toBeInTheDocument();
  });
});
