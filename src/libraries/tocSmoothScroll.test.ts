import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTocSmoothScroll } from './tocSmoothScroll';

const JA_ID = 'はじめに';

/** サイドバー目次・折りたたみ目次・本文の見出しを持つ記事の DOM を作る */
const renderArticle = (): void => {
  const encoded = encodeURIComponent(JA_ID);
  document.body.innerHTML = `
    <nav class="toc toc-sidebar" aria-label="目次">
      <ol>
        <li><a href="#${encoded}">${JA_ID}</a></li>
        <li><a href="#b">B</a></li>
        <li><a href="#missing">Missing</a></li>
      </ol>
    </nav>
    <details class="toc toc-collapsible">
      <summary class="toc-title">目次</summary>
      <nav aria-label="目次"><ol><li><a href="#b">B</a></li></ol></nav>
    </details>
    <h2 id="${JA_ID}">${JA_ID}</h2>
    <p><a href="#b" id="body-link">本文中のリンク</a></p>
    <h2 id="b">B</h2>
  `;
};

const link = (selector: string): HTMLAnchorElement =>
  document.querySelector<HTMLAnchorElement>(selector)!;

/** クリックを発火し、既定動作が止められたかを返す */
const click = (target: Element, init: MouseEventInit = {}): boolean => {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
  target.dispatchEvent(event);
  return event.defaultPrevented;
};

const stubReducedMotion = (reduce: boolean): void => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduce && query === '(prefers-reduced-motion: reduce)',
      media: query,
    })),
  );
};

describe('setupTocSmoothScroll', () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;
  let cleanup: () => void = () => {};

  beforeEach(() => {
    renderArticle();
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView as unknown as Element['scrollIntoView'];
    stubReducedMotion(false);
    window.history.replaceState(null, '', '/blog/article');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('サイドバー目次のリンクで見出しへスムーズにスクロールし、標準のジャンプは止める', () => {
    // Given
    cleanup = setupTocSmoothScroll(document);

    // When
    const prevented = click(link('nav.toc-sidebar a[href="#b"]'));

    // Then
    expect(prevented).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('b'));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('折りたたみ目次のリンクでもスムーズにスクロールする', () => {
    // Given
    cleanup = setupTocSmoothScroll(document);

    // When
    const prevented = click(link('details.toc-collapsible a[href="#b"]'));

    // Then
    expect(prevented).toBe(true);
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('b'));
  });

  it('URL の hash が見出しの id に更新される', () => {
    // Given
    cleanup = setupTocSmoothScroll(document);

    // When
    click(link('nav.toc-sidebar a[href="#b"]'));

    // Then
    expect(window.location.hash).toBe('#b');
  });

  it('見出しにフォーカスが移り、フォーカスによる追加のスクロールは起こさない', () => {
    // Given
    cleanup = setupTocSmoothScroll(document);
    const heading = document.getElementById('b')!;
    const focus = vi.spyOn(heading, 'focus');

    // When
    click(link('nav.toc-sidebar a[href="#b"]'));

    // Then
    expect(document.activeElement).toBe(heading);
    expect(heading.getAttribute('tabindex')).toBe('-1');
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('動きを減らす設定のときは一瞬で移動する', () => {
    // Given
    stubReducedMotion(true);
    cleanup = setupTocSmoothScroll(document);

    // When
    click(link('nav.toc-sidebar a[href="#b"]'));

    // Then
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });

  it('日本語の見出し id（URL エンコードされた href）でもスクロールする', () => {
    // Given
    cleanup = setupTocSmoothScroll(document);

    // When
    const prevented = click(link('nav.toc-sidebar li:first-child a'));

    // Then
    expect(prevented).toBe(true);
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById(JA_ID));
  });

  it('リンク先の見出しが無い場合はブラウザ標準の動作に任せる', () => {
    // Given
    cleanup = setupTocSmoothScroll(document);

    // When
    const prevented = click(link('nav.toc-sidebar a[href="#missing"]'));

    // Then
    expect(prevented).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['⌘', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
  ])('%s キー付きのクリックは横取りしない', (_key, modifier) => {
    // Given
    cleanup = setupTocSmoothScroll(document);

    // When
    const prevented = click(link('nav.toc-sidebar a[href="#b"]'), modifier);

    // Then
    expect(prevented).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('目次以外の本文中のリンクは横取りしない', () => {
    // Given
    cleanup = setupTocSmoothScroll(document);

    // When
    const prevented = click(link('#body-link'));

    // Then
    expect(prevented).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('後片付けの後はクリックを横取りしない', () => {
    // Given
    setupTocSmoothScroll(document)();

    // When
    const prevented = click(link('nav.toc-sidebar a[href="#b"]'));

    // Then
    expect(prevented).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
