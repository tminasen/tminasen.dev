import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHeadingIds from './rehypeHeadingIds.mjs';
import rehypeToc from './rehypeToc.mjs';
import rehypeDemoteHeadings from './rehypeDemoteHeadings.mjs';

const HEADING_SELECTOR = 'h1,h2,h3,h4,h5,h6';

const convertDemoted = (markdown: string, { withIds = false, times = 1 } = {}): string => {
  const processor = unified().use(remarkParse).use(remarkRehype);
  if (withIds) processor.use(rehypeHeadingIds);
  for (let i = 0; i < times; i++) processor.use(rehypeDemoteHeadings);
  return String(processor.use(rehypeStringify).processSync(markdown));
};

const convertPlain = (markdown: string): string =>
  String(unified().use(remarkParse).use(remarkRehype).use(rehypeStringify).processSync(markdown));

const parse = (html: string): HTMLElement => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

const demote = (markdown: string): HTMLElement => parse(convertDemoted(markdown));

const pipeline = (markdown: string): HTMLElement =>
  parse(
    String(
      unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeHeadingIds)
        .use(rehypeToc)
        .use(rehypeDemoteHeadings)
        .use(rehypeStringify)
        .processSync(markdown),
    ),
  );

const tagsOf = (root: HTMLElement): string[] =>
  Array.from(root.querySelectorAll(HEADING_SELECTOR)).map((h) => h.tagName);

describe('rehypeDemoteHeadings', () => {
  it('h1 が h2 になる', () => {
    // Given
    const md = '# A\n\n本文';
    // When
    const root = demote(md);
    // Then
    expect(tagsOf(root)).toEqual(['H2']);
    expect(root.querySelector('h2')!.textContent).toBe('A');
  });

  it('h1〜h5 がそれぞれ1段下がる', () => {
    // Given
    const md = '# A\n\n## B\n\n### C\n\n#### D\n\n##### E';
    // When
    const root = demote(md);
    // Then
    expect(tagsOf(root)).toEqual(['H2', 'H3', 'H4', 'H5', 'H6']);
  });

  it('h6 は h6 のまま', () => {
    // Given
    const md = '# A\n\n###### F';
    // When
    const root = demote(md);
    // Then
    expect(tagsOf(root)).toEqual(['H2', 'H6']);
  });

  it('h1 がない文書は変更しない', () => {
    // Given
    const md = '## A\n\n### B';
    // When
    const root = demote(md);
    // Then
    expect(tagsOf(root)).toEqual(['H2', 'H3']);
  });

  it('見出し0件の文書は出力が変わらない', () => {
    // Given
    const md = '本文のみ';
    // When
    const withPlugin = convertDemoted(md);
    const withoutPlugin = convertPlain(md);
    // Then
    expect(withPlugin).toBe(withoutPlugin);
  });

  it('id と子要素が保持される', () => {
    // Given
    const md = '# `code` と *強調*';
    // When
    const root = parse(convertDemoted(md, { withIds: true }));
    // Then
    const heading = root.querySelector('h2')!;
    expect(heading.id).toBe('code-と-強調');
    expect(heading.querySelector('code')).not.toBeNull();
    expect(heading.querySelector('em')).not.toBeNull();
  });

  it('入れ子の中の見出しも下がる', () => {
    // Given
    const md = '> # Q\n\n# A';
    // When
    const root = demote(md);
    // Then
    expect(tagsOf(root)).toEqual(['H2', 'H2']);
    expect(root.querySelector('blockquote > h2')!.textContent).toBe('Q');
  });
});

describe('rehypeDemoteHeadings と目次の連携', () => {
  it('目次の階層とリンク先が保たれ、本文は1段下がる', () => {
    // Given
    const md = '# A\n\n## B\n\n### C\n\n# D';
    // When
    const root = pipeline(md);
    // Then
    const top = Array.from(root.querySelectorAll('nav > ol > li')).map(
      (li) => li.querySelector(':scope > a')?.textContent ?? '',
    );
    expect(top).toEqual(['A', 'D']);
    const hrefs = Array.from(root.querySelectorAll('nav a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['#a', '#b', '#c', '#d']);
    expect(root.querySelector('h2#a')).not.toBeNull();
    expect(root.querySelector('h3#b')).not.toBeNull();
    expect(root.querySelector('h4#c')).not.toBeNull();
    expect(root.querySelector('h2#d')).not.toBeNull();
    expect(root.querySelectorAll('h1')).toHaveLength(0);
  });

  it('変換前 h4 の見出しは目次に入らない', () => {
    // Given
    const md = '# A\n\n#### Deep\n\n# B';
    // When
    const root = pipeline(md);
    // Then
    const hrefs = Array.from(root.querySelectorAll('nav a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['#a', '#b']);
    expect(root.querySelector('h5#deep')).not.toBeNull();
  });
});

describe('rehypeDemoteHeadings 不変条件', () => {
  const inputs = [
    '# A',
    '# A\n\n## B\n\n### C\n\n# D',
    '## Setup\n\n### Install',
    '# A\n\n###### F',
    '本文のみ',
    '# A\n\n#### D\n\n##### E\n\n###### F',
    '> # Q\n\n# A',
  ];
  const inputsWithH1 = inputs.filter((md) => /^#\s|\n#\s|> #\s/.test(md));

  it.each(inputsWithH1)('h1 を含む文書から h1 がなくなる: %j', (md) => {
    // Given
    // When
    const root = demote(md);
    // Then
    expect(root.querySelectorAll('h1')).toHaveLength(0);
  });

  it.each(inputs)('見出しの件数と textContent の並びが保たれる: %j', (md) => {
    // Given
    const textsOf = (root: HTMLElement): string[] =>
      Array.from(root.querySelectorAll(HEADING_SELECTOR)).map((h) => h.textContent ?? '');
    // When
    const demoted = textsOf(demote(md));
    const plain = textsOf(parse(convertPlain(md)));
    // Then
    expect(demoted).toEqual(plain);
  });

  it.each(inputs)('2回適用しても1回適用と出力が一致する（冪等）: %j', (md) => {
    // Given
    // When
    const once = convertDemoted(md, { times: 1 });
    const twice = convertDemoted(md, { times: 2 });
    // Then
    expect(twice).toBe(once);
  });
});
