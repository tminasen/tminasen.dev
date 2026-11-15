import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findActiveHeadingId, setupTocHighlight } from './tocHighlight';

describe('tocHighlight.ts', () => {
  describe('findActiveHeadingId', () => {
    it('上端を過ぎた最後の見出しが現在の見出しになる', () => {
      // Given
      const headings = [
        { id: 'a', top: -300 },
        { id: 'b', top: -10 },
        { id: 'c', top: 400 },
      ];

      // When
      const result = findActiveHeadingId(headings, 24);

      // Then
      expect(result).toBe('b');
    });

    it('上端がちょうど基準線の見出しは「過ぎた」に含める', () => {
      // Given
      const headings = [
        { id: 'a', top: -100 },
        { id: 'b', top: 24 },
        { id: 'c', top: 200 },
      ];

      // When
      const result = findActiveHeadingId(headings, 24);

      // Then
      expect(result).toBe('b');
    });

    it('基準線より 1px 下の見出しは含めない', () => {
      // Given
      const headings = [
        { id: 'a', top: -100 },
        { id: 'b', top: 25 },
        { id: 'c', top: 200 },
      ];

      // When
      const result = findActiveHeadingId(headings, 24);

      // Then
      expect(result).toBe('a');
    });

    it('どの見出しも基準線を過ぎていなければ最初の見出し', () => {
      // Given
      const headings = [
        { id: 'a', top: 100 },
        { id: 'b', top: 500 },
      ];

      // When
      const result = findActiveHeadingId(headings, 24);

      // Then
      expect(result).toBe('a');
    });

    it('見出しが0件なら null', () => {
      // Given
      // When
      const result = findActiveHeadingId([], 24);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('invariants', () => {
    const tops = (count: number, start: number, step: number) =>
      Array.from({ length: count }, (_, i) => start + i * step);
    const toHeadings = (values: number[]) =>
      values.map((top, i) => ({ id: `h${i}`, top }));
    const HEADING_SETS = [
      toHeadings([0]),
      toHeadings([-1000]),
      toHeadings([1000]),
      toHeadings([-500, 0, 500]),
      toHeadings(tops(10, -1000, 200)),
      toHeadings(tops(10, 100, 90)),
      toHeadings([-100, -100, 24, 24, 25]),
    ];
    const THRESHOLDS = [-100, -50, -1, 0, 1, 24, 50, 100];
    const cases = HEADING_SETS.flatMap(headings =>
      THRESHOLDS.map(threshold => ({
        headings,
        threshold,
        label: headings.map(h => h.top).join(','),
      })),
    );

    it.each(cases)(
      '結果は必ず入力の id のどれかである (tops: $label, threshold: $threshold)',
      ({ headings, threshold }) => {
        // Given
        // When
        const result = findActiveHeadingId(headings, threshold);

        // Then
        expect(headings.map(h => h.id)).toContain(result);
      },
    );

    it.each(cases)(
      'threshold を大きくしても結果の位置は小さくならない (tops: $label, threshold: $threshold)',
      ({ headings, threshold }) => {
        // Given
        const indexOf = (value: number) =>
          headings.findIndex(h => h.id === findActiveHeadingId(headings, value));

        // When
        const smaller = indexOf(threshold);
        const larger = indexOf(threshold + 1);

        // Then
        expect(larger).toBeGreaterThanOrEqual(smaller);
      },
    );
  });

  describe('setupTocHighlight', () => {
    const IDS = ['a', 'b', 'c'] as const;

    const buildTocDom = (tops: Record<string, number>) => {
      const links = IDS.map(id => `<li><a href="#${id}">${id}</a></li>`).join('');
      document.body.innerHTML = `
        <article>
          <nav class="toc toc-sidebar" aria-label="目次"><ol>${links}</ol></nav>
          <details class="toc toc-collapsible">
            <summary>目次</summary>
            <nav aria-label="目次"><ol>${links}</ol></nav>
          </details>
          ${IDS.map(id => `<h2 id="${id}">${id}</h2>`).join('')}
        </article>`;
      applyTops(tops);
    };

    const applyTops = (tops: Record<string, number>) => {
      IDS.forEach(id => {
        const heading = document.getElementById(id)!;
        vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
          top: tops[id],
        } as DOMRect);
      });
    };

    const currentLinks = () =>
      Array.from(document.querySelectorAll('[aria-current]'));

    beforeEach(() => {
      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      document.body.innerHTML = '';
    });

    it('初期表示で現在の見出しのサイドバー項目だけに aria-current が付く', () => {
      // Given
      buildTocDom({ a: -50, b: 10, c: 300 });

      // When
      const cleanup = setupTocHighlight(document);

      // Then
      const active = document.querySelector('nav.toc-sidebar a[href="#b"]')!;
      expect(active.getAttribute('aria-current')).toBe('location');
      expect(currentLinks()).toEqual([active]);
      cleanup();
    });

    it('スクロールで現在の見出しが切り替わり、常に1つだけ', () => {
      // Given
      buildTocDom({ a: -50, b: 10, c: 300 });
      const cleanup = setupTocHighlight(document);
      applyTops({ a: -500, b: -200, c: 20 });

      // When
      window.dispatchEvent(new Event('scroll'));

      // Then
      const active = document.querySelector('nav.toc-sidebar a[href="#c"]')!;
      expect(currentLinks()).toEqual([active]);
      cleanup();
    });

    it('後片付け後はスクロールしても変わらない', () => {
      // Given
      buildTocDom({ a: -50, b: 10, c: 300 });
      const cleanup = setupTocHighlight(document);
      cleanup();
      applyTops({ a: -500, b: -200, c: 20 });

      // When
      window.dispatchEvent(new Event('scroll'));

      // Then
      const active = document.querySelector('nav.toc-sidebar a[href="#b"]')!;
      expect(currentLinks()).toEqual([active]);
    });

    it('サイドバー目次が無い記事でも例外にならない', () => {
      // Given
      document.body.innerHTML = '<article><h2 id="a">a</h2></article>';

      // When
      const run = () => {
        const cleanup = setupTocHighlight(document);
        cleanup();
      };

      // Then
      expect(run).not.toThrow();
      expect(currentLinks()).toHaveLength(0);
    });
  });
});
