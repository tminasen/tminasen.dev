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
});
