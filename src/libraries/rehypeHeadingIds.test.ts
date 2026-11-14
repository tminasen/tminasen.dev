import { afterEach, describe, expect, it, vi } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHeadingIds from './rehypeHeadingIds.mjs';

type Node = { type: string; value?: string; tagName?: string; properties?: Record<string, unknown>; children?: Node[] };

const text = (value: string): Node => ({ type: 'text', value });
const expr = (value: string): Node => ({ type: 'mdxTextExpression', value });
const el = (tagName: string, children: Node[], properties: Record<string, unknown> = {}): Node => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const root = (...children: Node[]): Node => ({ type: 'root', children });

const transform = (tree: Node): Node => {
  (rehypeHeadingIds() as (tree: Node) => void)(tree);
  return tree;
};

const idsOf = (html: string): (string | null)[] => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return Array.from(container.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => h.getAttribute('id'));
};

const autoIds = (markdown: string): (string | null)[] =>
  idsOf(
    String(
      unified().use(remarkParse).use(remarkRehype).use(rehypeHeadingIds).use(rehypeStringify).processSync(markdown),
    ),
  );

afterEach(() => {
  vi.restoreAllMocks();
});

describe('rehypeHeadingIds', () => {
  it('MDX コメントの明示 id が付与され、コメントと末尾空白が除去される', () => {
    // Given
    const h2 = el('h2', [text('はじめに '), expr('/* #introduction */')]);
    const tree = root(h2);
    // When
    transform(tree);
    // Then
    expect(h2.properties?.id).toBe('introduction');
    expect(h2.children).toEqual([text('はじめに')]);
  });

  it('未指定の見出しは GitHub 互換規則で自動 id が付く', () => {
    // Given
    const md = '## はじめに\n\n## TL;DR.\n\n## その1: 状態管理にSignalsを使った';
    // When
    const ids = autoIds(md);
    // Then
    expect(ids).toEqual(['はじめに', 'tldr', 'その1-状態管理にsignalsを使った']);
  });

  it('自動 id の重複は -1, -2 が付く', () => {
    // Given
    const md = '## 例\n\n## 例\n\n## 例';
    // When
    const ids = autoIds(md);
    // Then
    expect(ids).toEqual(['例', '例-1', '例-2']);
  });

  it('明示 id の重複も -1 が付き、例外は出ない', () => {
    // Given
    const a = el('h2', [text('A '), expr('/* #intro */')]);
    const b = el('h2', [text('B '), expr('/* #intro */')]);
    const tree = root(a, b);
    // When
    const act = () => transform(tree);
    // Then
    expect(act).not.toThrow();
    expect(a.properties?.id).toBe('intro');
    expect(b.properties?.id).toBe('intro-1');
  });

  it('明示 id と自動 id の衝突は後勝ちで -1 が付く', () => {
    // Given
    const a = el('h2', [text('まとめ'), expr('/* #summary */')]);
    const b = el('h2', [text('Summary')]);
    const tree = root(a, b);
    // When
    transform(tree);
    // Then
    expect(a.properties?.id).toBe('summary');
    expect(b.properties?.id).toBe('summary-1');
  });

  it('自動 slug が空になる見出しには id を付けない', () => {
    // Given
    const md = '## !!!\n\n## A';
    // When
    const ids = autoIds(md);
    // Then
    expect(ids).toEqual([null, 'a']);
  });

  it('形式不正の明示 id は自動 id にフォールバックし警告する', () => {
    // Given
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const invalid = expr('/* #はじめに */');
    const h2 = el('h2', [text('はじめに '), invalid]);
    const tree = root(h2);
    // When
    const act = () => transform(tree);
    // Then
    expect(act).not.toThrow();
    expect(h2.properties?.id).toBe('はじめに');
    expect(h2.children).toContain(invalid);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('見出し以外のコメントには触れない', () => {
    // Given
    const p = el('p', [text('本文 '), expr('/* #foo */')]);
    const tree = root(p);
    // When
    transform(tree);
    // Then
    expect(p.properties).toEqual({});
    expect(p.children).toEqual([text('本文 '), expr('/* #foo */')]);
  });

  it('h4〜h6 にも id が付く', () => {
    // Given
    const md = '#### Deep\n\n###### Deeper';
    // When
    const ids = autoIds(md);
    // Then
    expect(ids).toEqual(['deep', 'deeper']);
  });

  it('既に id を持つ見出しは変更しない', () => {
    // Given
    const a = el('h2', [text('はじめに')], { id: 'custom' });
    const b = el('h2', [text('custom')]);
    const tree = root(a, b);
    // When
    transform(tree);
    // Then
    expect(a.properties?.id).toBe('custom');
    expect(b.properties?.id).toBe('custom-1');
  });
});

describe('rehypeHeadingIds 不変条件', () => {
  const inputs = [
    '## 例\n\n## 例\n\n## 例',
    '## はじめに\n\n## TL;DR.\n\n## その1: 状態管理にSignalsを使った',
    '## A\n\n## a\n\n## A-1\n\n## A',
    '## !!!\n\n## A\n\n## ???',
    '# Hello, World!\n\n## `useState` の *使い方*\n\n### foo_bar baz',
    '#### Deep\n\n###### Deeper\n\n#### Deep',
  ];

  it.each(inputs)('自動 id が一意で、使用可能な文字のみで構成される: %j', (md) => {
    // Given
    // When
    const ids = autoIds(md).filter((id): id is string => id !== null);
    // Then
    // P5
    expect(new Set(ids).size).toBe(ids.length);
    // P6
    ids.forEach((id) => expect(id).toMatch(/^[\p{L}\p{M}\p{N}\p{Pc}-]+$/u));
  });
});
