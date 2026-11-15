const TOC_LINK_SELECTOR = '.toc a[href^="#"]';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const hasModifier = (event: MouseEvent): boolean =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

/**
 * 目次（.toc）のリンクをクリックしたとき、見出しまでスムーズにスクロールさせる。
 * 「動きを減らす」設定では即時に移動する。URL の hash の更新と見出しへのフォーカス移動は
 * 通常のページ内リンクと同じにする。修飾キー付きのクリックやリンク先が無い場合はブラウザに任せる。
 * @returns リスナーを外す後片付け関数
 */
export function setupTocSmoothScroll(doc: Document): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || hasModifier(event)) {
      return;
    }
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(TOC_LINK_SELECTOR);
    if (!link) {
      return;
    }
    const href = link.getAttribute('href')!;
    const heading = doc.getElementById(decodeURIComponent(href.slice(1)));
    if (!heading) {
      return;
    }

    event.preventDefault();
    const win = doc.defaultView;
    const reduceMotion = win?.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false;
    heading.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    win?.history.pushState(win.history.state, '', href);
    // 通常のページ内リンクと同様に、キーボード操作の起点を見出しへ移す（スクロールは上で行うため抑止）
    if (!heading.hasAttribute('tabindex')) {
      heading.setAttribute('tabindex', '-1');
    }
    heading.focus({ preventScroll: true });
  };

  doc.addEventListener('click', onClick);
  return () => doc.removeEventListener('click', onClick);
}
