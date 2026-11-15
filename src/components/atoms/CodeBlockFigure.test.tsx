import { act, fireEvent, render, screen } from '@testing-library/react';
import { ComponentProps, FC } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { CodeBlockFigure } from './CodeBlockFigure';
import { useMDXComponents } from '../../../mdx-components';

const codeFigure = (lang: string, text: string) => (
  <CodeBlockFigure data-rehype-pretty-code-figure="">
    <pre data-language={lang}>
      <code>{text}</code>
    </pre>
  </CodeBlockFigure>
);

const stubClipboard = (writeText: ReturnType<typeof vi.fn>) =>
  vi.stubGlobal('navigator', { clipboard: { writeText } });

const clickCopy = async (name = 'コピー') => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name }));
  });
};

describe('CodeBlockFigure', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('言語名をバーに出す', () => {
    // Given
    // When
    render(codeFigure('tsx', 'const a = 1;'));

    // Then
    expect(screen.getByText('tsx', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'コピー' })).toBeInTheDocument();
  });

  it('plaintext は言語名を出さないがコピーボタンはある', () => {
    // Given
    // When
    render(codeFigure('plaintext', 'hello'));

    // Then
    expect(screen.queryByText('plaintext')).toBeNull();
    expect(screen.getByRole('button', { name: 'コピー' })).toBeInTheDocument();
  });

  it('title があれば言語名より title を出し、figcaption は別に描画しない', () => {
    // Given
    const figure = (
      <CodeBlockFigure data-rehype-pretty-code-figure="">
        <figcaption data-rehype-pretty-code-title="">src/index.css</figcaption>
        <pre data-language="css">
          <code>body {'{}'}</code>
        </pre>
      </CodeBlockFigure>
    );

    // When
    const { container } = render(figure);

    // Then
    expect(screen.getAllByText('src/index.css')).toHaveLength(1);
    expect(screen.queryByText('css')).toBeNull();
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('コードブロック以外の figure はそのまま描画する', () => {
    // Given
    const figure = (
      <CodeBlockFigure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="図" src="/a.png" />
      </CodeBlockFigure>
    );

    // When
    const { container } = render(figure);

    // Then
    expect(container.querySelector('figure img')).not.toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  describe('コピー', () => {
    it('コードのテキストを書き込み「コピーしました」を表示する', async () => {
      // Given
      const writeText = vi.fn().mockResolvedValue(undefined);
      stubClipboard(writeText);
      render(codeFigure('ts', 'const a = 1;\nconst b = 2;'));

      // When
      await clickCopy();

      // Then
      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText).toHaveBeenCalledWith('const a = 1;\nconst b = 2;');
      expect(
        screen.getByRole('button', { name: 'コピーしました' }),
      ).toBeInTheDocument();
    });

    it('1999ms 時点ではまだ「コピーしました」', async () => {
      // Given
      stubClipboard(vi.fn().mockResolvedValue(undefined));
      render(codeFigure('ts', 'x'));
      await clickCopy();

      // When
      act(() => {
        vi.advanceTimersByTime(1999);
      });

      // Then
      expect(
        screen.getByRole('button', { name: 'コピーしました' }),
      ).toBeInTheDocument();
    });

    it('2000ms で「コピー」に戻る', async () => {
      // Given
      stubClipboard(vi.fn().mockResolvedValue(undefined));
      render(codeFigure('ts', 'x'));
      await clickCopy();

      // When
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Then
      expect(screen.getByRole('button', { name: 'コピー' })).toBeInTheDocument();
    });

    it('書き込みが失敗したら「コピーできませんでした」を表示する', async () => {
      // Given
      stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
      render(codeFigure('ts', 'x'));

      // When
      await clickCopy();

      // Then
      expect(
        screen.getByRole('button', { name: 'コピーできませんでした' }),
      ).toBeInTheDocument();
    });

    it('クリップボード API が無い環境でも例外にならない', async () => {
      // Given
      vi.stubGlobal('navigator', {});
      render(codeFigure('ts', 'x'));

      // When
      await clickCopy();

      // Then
      expect(
        screen.getByRole('button', { name: 'コピーできませんでした' }),
      ).toBeInTheDocument();
    });
  });

  describe('useMDXComponents', () => {
    it('MDX の figure がコードブロック用部品に差し替わる', () => {
      // Given
      const Figure = useMDXComponents({}).figure as FC<ComponentProps<'figure'>>;

      // When
      render(
        <Figure data-rehype-pretty-code-figure="">
          <pre data-language="tsx">
            <code>x</code>
          </pre>
        </Figure>,
      );

      // Then
      expect(screen.getByRole('button', { name: 'コピー' })).toBeInTheDocument();
    });
  });
});
