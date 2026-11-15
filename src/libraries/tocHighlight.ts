export type HeadingPosition = { id: string; top: number };

/**
 * 現在読んでいる見出しの id を返す。
 * 上端が threshold 以内に入った最後の見出し。どれも入っていなければ最初の見出し。
 * 見出しは文書順に並んでいる前提
 */
export function findActiveHeadingId(
  headings: readonly HeadingPosition[],
  threshold: number,
): string | null {
  if (headings.length === 0) {
    return null;
  }
  const passed = headings.filter(heading => heading.top <= threshold);
  return (passed.length > 0 ? passed[passed.length - 1] : headings[0]).id;
}

// 見出しの scroll-margin-top（1rem = 16px）に 8px の余裕を足した基準線
const ACTIVE_THRESHOLD = 24;

/**
 * サイドバー目次（nav.toc-sidebar）のうち、現在読んでいる見出しのリンクにだけ
 * aria-current="location" を付け、スクロール・リサイズに追従させる。
 * @returns リスナーを外す後片付け関数
 */
export function setupTocHighlight(doc: Document): () => void {
  const links = Array.from(
    doc.querySelectorAll<HTMLAnchorElement>('nav.toc-sidebar a[href^="#"]'),
  );
  const targets = links.flatMap(link => {
    const id = decodeURIComponent(link.getAttribute('href')!.slice(1));
    const heading = doc.getElementById(id);
    return heading ? [{ id, link, heading }] : [];
  });
  if (targets.length === 0) {
    return () => {};
  }

  const update = () => {
    const activeId = findActiveHeadingId(
      targets.map(({ id, heading }) => ({
        id,
        top: heading.getBoundingClientRect().top,
      })),
      ACTIVE_THRESHOLD,
    );
    targets.forEach(({ id, link }) => {
      if (id === activeId) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  // 1フレームに1回だけ再計算する
  let pending = false;
  let frameId = 0;
  const schedule = () => {
    if (pending) {
      return;
    }
    pending = true;
    frameId = requestAnimationFrame(() => {
      pending = false;
      update();
    });
  };

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  return () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (pending) {
      cancelAnimationFrame(frameId);
      pending = false;
    }
  };
}
