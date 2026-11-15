import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ReactNode } from 'react';
import { HeadComponent } from './HeadComponent';

vi.mock('next/head', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="mock-head">{children}</div>
  ),
}));

type MockScriptProps = {
  id?: string;
  src?: string;
  strategy?: string;
  children?: ReactNode;
};

vi.mock('next/script', () => ({
  default: ({ id, src, strategy, children }: MockScriptProps) => (
    <div
      data-testid="mock-script"
      data-id={id}
      data-src={src}
      data-strategy={strategy}
    >
      {children}
    </div>
  ),
}));

const defaultProps = {
  ogpImage: undefined,
  title: 'テストタイトル',
  additionalMetaData: undefined,
  description: 'テスト説明',
  canonicalPath: '/test',
  ogType: 'website' as const,
};

describe('HeadComponent', () => {
  it('should not render any <script> element inside <Head>', () => {
    render(<HeadComponent {...defaultProps} />);

    const head = screen.getByTestId('mock-head');
    expect(head.querySelectorAll('script').length).toBe(0);
  });

  it('should render gtag init script via next/script with id="gtag-init" and strategy="afterInteractive"', () => {
    render(<HeadComponent {...defaultProps} />);

    const scripts = screen.getAllByTestId('mock-script');
    const initScript = scripts.find(
      script => script.getAttribute('data-id') === 'gtag-init',
    );

    expect(initScript).toBeDefined();
    expect(initScript).toHaveAttribute('data-strategy', 'afterInteractive');
    expect(initScript?.textContent).toContain(
      "gtag('config', 'G-L82JQBNL8M')",
    );
  });

  it('should render the external gtag/js Script before the gtag-init Script', () => {
    render(<HeadComponent {...defaultProps} />);

    const scripts = screen.getAllByTestId('mock-script');
    const externalIndex = scripts.findIndex(script =>
      script.getAttribute('data-src')?.includes('googletagmanager.com/gtag/js'),
    );
    const initIndex = scripts.findIndex(
      script => script.getAttribute('data-id') === 'gtag-init',
    );

    expect(externalIndex).toBeGreaterThanOrEqual(0);
    expect(initIndex).toBeGreaterThanOrEqual(0);
    expect(externalIndex).toBeLessThan(initIndex);
  });

  describe('OGP / Twitter meta tags', () => {
    const ogProps = {
      ...defaultProps,
      title: '記事A',
      description: '要約',
      ogpImage: '/images/a.png',
      ogType: 'article' as const,
    };

    it('should render og:* with the property attribute', () => {
      // Given / When
      render(<HeadComponent {...ogProps} />);

      // Then
      // React 19 は <meta> を document.head に巻き上げるため document から検索する
      const head = document;
      const content = (prop: string) =>
        head
          .querySelector(`meta[property="${prop}"]`)
          ?.getAttribute('content');
      expect(content('og:title')).toBe('記事A - 水無瀬のプログラミング日記');
      expect(content('og:description')).toBe('要約');
      expect(content('og:type')).toBe('article');
      expect(content('og:image')).toBe('https://tminasen.dev/images/a.png');
      expect(head.querySelectorAll('meta[name^="og:"]').length).toBe(0);
    });

    it('should keep twitter:* with the name attribute', () => {
      // Given / When
      render(<HeadComponent {...ogProps} />);

      // Then
      const head = document;
      expect(head.querySelector('meta[name="twitter:card"]')).not.toBeNull();
      expect(head.querySelector('meta[name="twitter:title"]')).not.toBeNull();
      expect(head.querySelectorAll('meta[property^="twitter:"]').length).toBe(
        0,
      );
    });

    it('should fallback to metaData.description for description and og:description when description prop is undefined (T11)', () => {
      // Given
      const props = { ...defaultProps, description: undefined };
      // When
      render(<HeadComponent {...props} />);
      // Then
      expect(
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute('content'),
      ).toBe('tminasen（水無瀬）によるプログラミング・Web開発・AI活用の技術ブログ');
      expect(
        document
          .querySelector('meta[property="og:description"]')
          ?.getAttribute('content'),
      ).toBe('tminasen（水無瀬）によるプログラミング・Web開発・AI活用の技術ブログ');
    });

    it('should fallback to metaData.description when description prop is an empty string (T12)', () => {
      // Given
      const props = { ...defaultProps, description: '' };
      // When
      render(<HeadComponent {...props} />);
      // Then
      expect(
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute('content'),
      ).toBe('tminasen（水無瀬）によるプログラミング・Web開発・AI活用の技術ブログ');
    });

    it('should render og:url with canonicalPath when canonicalPath is specified (T13)', () => {
      // Given
      const props = { ...defaultProps, canonicalPath: '/blog/abc' };
      // When
      render(<HeadComponent {...props} />);
      // Then
      expect(
        document
          .querySelector('meta[property="og:url"]')
          ?.getAttribute('content'),
      ).toBe('https://tminasen.dev/blog/abc');
    });

    it('should render og:url as https://tminasen.dev/ when canonicalPath is undefined (T14)', () => {
      // Given
      const props = { ...defaultProps, canonicalPath: undefined };
      // When
      render(<HeadComponent {...props} />);
      // Then
      expect(
        document
          .querySelector('meta[property="og:url"]')
          ?.getAttribute('content'),
      ).toBe('https://tminasen.dev/');
    });

    it('should render og:site_name with metaData.title (T15)', () => {
      // Given / When
      render(<HeadComponent {...defaultProps} />);
      // Then
      expect(
        document
          .querySelector('meta[property="og:site_name"]')
          ?.getAttribute('content'),
      ).toBe('水無瀬のプログラミング日記');
    });

    it('should render RSS link[rel="alternate"][type="application/rss+xml"] inside Head (T16)', () => {
      // Given / When
      render(<HeadComponent {...defaultProps} />);
      // Then
      const rssLink = document.querySelector(
        'link[rel="alternate"][type="application/rss+xml"]',
      );
      expect(rssLink).not.toBeNull();
      expect(rssLink).toHaveAttribute(
        'href',
        'https://tminasen.dev/rss/feed.xml',
      );
      expect(rssLink).toHaveAttribute('title', '水無瀬のプログラミング日記');
    });
  });
});
