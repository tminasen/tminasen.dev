import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHeadingIds from './rehypeHeadingIds.mjs';
import rehypeToc from './rehypeToc.mjs';

const convert = (markdown: string, options: { slug?: boolean; toc?: boolean } = {}): string => {
  const { slug = true, toc = true } = options;
  const processor = unified().use(remarkParse).use(remarkRehype);
  if (slug) processor.use(rehypeHeadingIds);
  if (toc) processor.use(rehypeToc);
  return String(processor.use(rehypeStringify).processSync(markdown));
};

const parse = (html: string): HTMLElement => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

const run = (markdown: string, options?: { slug?: boolean; toc?: boolean }): HTMLElement =>
  parse(convert(markdown, options));

const hrefsOf = (root: HTMLElement): string[] =>
  Array.from(root.querySelectorAll('nav a')).map((a) => a.getAttribute('href') ?? '');

const liText = (li: Element): string => li.querySelector(':scope > a')?.textContent ?? '';

describe('rehypeToc', () => {
  it('h1 が2件ある記事の本文先頭に目次 nav が挿入される', () => {
    // Given
    const md = '# はじめに\n\n本文\n\n# まとめ\n\n本文';
    // When
    const root = run(md);
    // Then
    const first = root.firstElementChild!;
    expect(first.matches('nav[aria-label="目次"]')).toBe(true);
    const items = first.querySelectorAll(':scope > ol > li');
    expect(items).toHaveLength(2);
    const links = Array.from(items).map((li) => li.querySelector('a')!);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#はじめに', '#まとめ']);
    expect(links.map((a) => a.textContent)).toEqual(['はじめに', 'まとめ']);
  });

  it('h1/h2/h3 が階層通りに入れ子になる', () => {
    // Given
    const md = '# A\n\n## B\n\n### C\n\n# D';
    // When
    const root = run(md);
    // Then
    const top = root.querySelectorAll('nav > ol > li');
    expect(Array.from(top).map(liText)).toEqual(['A', 'D']);
    const b = top[0].querySelector(':scope > ol > li')!;
    expect(liText(b)).toBe('B');
    expect(liText(b.querySelector(':scope > ol > li')!)).toBe('C');
  });

  it('最上位が h2 の記事は h2 を最上位として入れ子化する', () => {
    // Given
    const md = '## Setup\n\n### Install\n\n## Usage';
    // When
    const root = run(md);
    // Then
    const top = root.querySelectorAll('nav > ol > li');
    expect(Array.from(top).map(liText)).toEqual(['Setup', 'Usage']);
    expect(liText(top[0].querySelector(':scope > ol > li')!)).toBe('Install');
  });

  it('h4 以下は目次に含めない', () => {
    // Given
    const md = '# A\n\n#### Deep\n\n# B';
    // When
    const root = run(md);
    // Then
    expect(hrefsOf(root)).toEqual(['#a', '#b']);
    expect(Array.from(root.querySelectorAll('nav a')).some((a) => a.textContent === 'Deep')).toBe(false);
  });

  it('見出し以外の本文が先行していても nav が先頭に入る', () => {
    // Given
    const md = '導入文\n\n# A\n\n# B';
    // When
    const root = run(md);
    // Then
    const children = Array.from(root.children);
    expect(children[0].tagName).toBe('NAV');
    expect(children[1].tagName).toBe('P');
    expect(children[1].textContent).toBe('導入文');
  });

  it('装飾付き見出しはプレーンテキストでリンク化される', () => {
    // Given
    const md = '# `useState` の *使い方*\n\n# まとめ';
    // When
    const root = run(md);
    // Then
    const first = root.querySelector('nav a')!;
    expect(first.textContent).toBe('useState の 使い方');
    expect(first.querySelector('code, em')).toBeNull();
  });

  it('見出し0件では目次を出さない', () => {
    // Given
    const md = '本文のみ';
    // When
    const withToc = convert(md);
    // Then
    expect(parse(withToc).querySelector('nav')).toBeNull();
    expect(withToc).toBe(convert(md, { toc: false }));
  });

  it('見出し1件では目次を出さない', () => {
    // Given
    const md = '# A\n\n本文';
    // When
    const root = run(md);
    // Then
    expect(root.querySelector('nav')).toBeNull();
  });

  it('見出しちょうど2件で目次が出る（h1 と h3 の混在・レベル飛び）', () => {
    // Given
    const md = '# A\n\n### C';
    // When
    const root = run(md);
    // Then
    expect(root.querySelector('nav')).not.toBeNull();
    const top = root.querySelectorAll('nav > ol > li');
    expect(Array.from(top).map(liText)).toEqual(['A']);
    expect(liText(top[0].querySelector(':scope > ol > li')!)).toBe('C');
  });

  it('同名見出しは別々の一意なリンクになる', () => {
    // Given
    const md = '## 例\n\n## 例';
    // When
    const root = run(md);
    // Then
    const hrefs = hrefsOf(root);
    expect(hrefs).toEqual(['#例', '#例-1']);
    const headingIds = Array.from(root.querySelectorAll('h2')).map((h) => h.id);
    expect(headingIds).toEqual(['例', '例-1']);
  });

  it('h4 は件数に数えない', () => {
    // Given
    const md = '# A\n\n#### Deep';
    // When
    const root = run(md);
    // Then
    expect(root.querySelector('nav')).toBeNull();
  });

  it('id を持たない見出しは目次に含めない', () => {
    // Given
    const md = '# A\n\n# B';
    // When
    const act = () => run(md, { slug: false });
    // Then
    expect(act).not.toThrow();
    expect(act().querySelector('nav')).toBeNull();
  });

  it('空文字 id の見出し（記号・絵文字のみ）は目次に含めない', () => {
    // Given
    const md = '# !!!\n\n# A\n\n# B';
    // When
    const root = run(md);
    // Then
    const hrefs = hrefsOf(root);
    expect(hrefs).toEqual(['#a', '#b']);
    expect(hrefs).not.toContain('#');
  });

  it('本文の見出し要素自体は変更されない', () => {
    // Given
    const md = '# A\n\n## B';
    // When
    const root = run(md);
    // Then
    const h1 = root.querySelector('h1#a')!;
    const h2 = root.querySelector('h2#b')!;
    expect(h1.textContent).toBe('A');
    expect(h2.textContent).toBe('B');
  });
});

describe('rehypeToc 不変条件', () => {
  const inputs = [
    '# はじめに\n\n本文\n\n# まとめ\n\n本文',
    '# A\n\n## B\n\n### C\n\n# D',
    '## Setup\n\n### Install\n\n## Usage',
    '# A\n\n#### Deep\n\n# B',
    '導入文\n\n# A\n\n# B',
    '# `useState` の *使い方*\n\n# まとめ',
    '# A\n\n### C',
    '## 例\n\n## 例',
    '# A\n\n## B\n\n## C\n\n### D\n\n# E\n\n### F',
  ];

  it.each(inputs)('目次リンクの数・リンク先・順序・一意性が本文見出しの id と対応する: %j', (md) => {
    // Given
    // When
    const root = run(md);
    // Then
    const nav = root.querySelector('nav');
    expect(nav).not.toBeNull();
    const hrefs = hrefsOf(root);
    const bodyIds = Array.from(root.querySelectorAll('h1[id], h2[id], h3[id]'))
      .filter((h) => !nav!.contains(h))
      .map((h) => h.id);
    // P1
    expect(hrefs).toHaveLength(bodyIds.length);
    // P2
    hrefs.forEach((href) => expect(root.querySelector(`[id="${href.slice(1)}"]`)).not.toBeNull());
    // P3
    expect(hrefs.map((h) => h.slice(1))).toEqual(bodyIds);
    // P4
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe('rehypeHeadingIds と rehypeToc の連携', () => {
  it('明示 id が目次リンクに使われ、目次文字列にコメントが混ざらない', () => {
    // Given
    const tree = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'h2', properties: {}, children: [{ type: 'text', value: 'はじめに ' }, { type: 'mdxTextExpression', value: '/* #introduction */' }] },
        { type: 'element', tagName: 'h2', properties: {}, children: [{ type: 'text', value: 'まとめ ' }, { type: 'mdxTextExpression', value: '/* #summary */' }] },
      ],
    };
    // When
    (rehypeHeadingIds() as (t: unknown) => void)(tree);
    (rehypeToc() as (t: unknown) => void)(tree);
    // Then
    type TestNode = {
      type: string;
      tagName?: string;
      value?: string;
      properties?: Record<string, unknown>;
      children?: TestNode[];
    };
    const nav = tree.children[0] as TestNode;
    const links = nav.children![1].children!.map((li) => li.children![0]);
    expect(links.map((a) => a.properties!.href)).toEqual(['#introduction', '#summary']);
    expect(links.map((a) => a.children![0].value)).toEqual(['はじめに', 'まとめ']);
  });
});
