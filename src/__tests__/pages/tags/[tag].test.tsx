import { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { GetStaticPropsContext } from 'next';
import TagPage, { getStaticPaths, getStaticProps } from '../../../pages/tags/[tag]';
import { getArticleMetaData } from '../../../libraries/articles';
import { buildTagPageJsonLd } from '../../../libraries/jsonLd';
import { ArticleMetaData } from '../../../types/article';

vi.mock('next/head', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="mock-head">{children}</div>
  ),
}));

vi.mock('../../../libraries/articles', () => ({
  getArticleMetaData: vi.fn(),
}));

const createMockArticle = (
  id: number,
  tags: string[] = ['Next.js', 'React'],
): ArticleMetaData => ({
  title: 'Article ' + id,
  path: '/blog/article-' + id,
  description: 'Description ' + id,
  thumbnailImage: {
    url: '/images/thumb-' + id + '.png',
    size: {
      pc: { width: 336, height: 189 },
      sp: { width: 336, height: 189 },
    },
  },
  date: '2026/01/0' + id,
  tag: tags,
  ogpImage: '/images/ogp-' + id + '.png',
});

const mixedArticles: ArticleMetaData[] = [
  createMockArticle(1, ['Next.js', 'TypeScript']),
  createMockArticle(2, ['React']),
  createMockArticle(3, ['Next.js', 'TailwindCSS', 'CSS', 'UI']),
];

describe('TagPage (src/pages/tags/[tag].tsx)', () => {
  it('指定したタグを含む記事のみが CardComponent の構造（日付・タイトル・抜粋・リンク・空 alt サムネイル）で描画され、ページ見出し {tagName}の記事一覧 が h1 で表示される', () => {
    // Given
    const tagName = 'Next.js';
    const articleMetaDataList = mixedArticles;

    // When
    const { container } = render(
      <TagPage tagName={tagName} articleMetaDataList={articleMetaDataList} />,
    );

    // Then
    expect(
      screen.getByRole('heading', { level: 1, name: 'Next.jsの記事一覧' }),
    ).toBeInTheDocument();

    const cards = container.querySelectorAll('article');
    expect(cards).toHaveLength(2);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Article 1' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026/01/01')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(within(cards[0]).getByRole('link')).toHaveAttribute(
      'href',
      '/blog/article-1',
    );
    expect(cards[0].querySelector('img')?.getAttribute('alt')).toBe('');

    expect(
      screen.getByRole('heading', { level: 2, name: 'Article 3' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026/01/03')).toBeInTheDocument();
    expect(screen.getByText('Description 3')).toBeInTheDocument();
    expect(within(cards[1]).getByRole('link')).toHaveAttribute(
      'href',
      '/blog/article-3',
    );
    expect(cards[1].querySelector('img')?.getAttribute('alt')).toBe('');

    expect(screen.queryByText('Article 2')).not.toBeInTheDocument();
  });

  it('カード内のタグ表示が CardComponent の仕様（先頭最大3件、#タグ名 形式、カード全体が単一リンクで内包タグ個別リンクを持たない）に揃っている', () => {
    // Given
    const tagName = 'Next.js';
    const articleMetaDataList = [
      createMockArticle(3, ['Next.js', 'TailwindCSS', 'CSS', 'UI']),
    ];

    // When
    render(
      <TagPage tagName={tagName} articleMetaDataList={articleMetaDataList} />,
    );

    // Then
    expect(screen.getByText('#Next.js')).toBeInTheDocument();
    expect(screen.getByText('#TailwindCSS')).toBeInTheDocument();
    expect(screen.getByText('#CSS')).toBeInTheDocument();
    expect(screen.queryByText('#UI')).not.toBeInTheDocument();

    const main = screen.getByRole('main');
    const linksInMain = within(main).getAllByRole('link');
    expect(linksInMain).toHaveLength(1);
    expect(linksInMain[0]).toHaveAttribute('href', '/blog/article-3');
    expect(
      within(main).queryByRole('link', { name: 'Next.js' }),
    ).not.toBeInTheDocument();
  });

  it('カード内の要素順序が CardComponent と同じ「日付 → タイトル → 抜粋 → タグ」になっており、サムネイル画像が thumbnailImage.size（336×189）で描画される', () => {
    // Given
    const tagName = 'Next.js';
    const articleMetaDataList = [createMockArticle(1, ['Next.js'])];

    // When
    const { container } = render(
      <TagPage tagName={tagName} articleMetaDataList={articleMetaDataList} />,
    );

    // Then
    const ordered = [
      container.querySelector('time')!,
      screen.getByRole('heading', { level: 2, name: 'Article 1' }),
      screen.getByText('Description 1'),
      screen.getByText('#Next.js'),
    ];
    for (let i = 0; i < ordered.length - 1; i++) {
      expect(
        ordered[i].compareDocumentPosition(ordered[i + 1]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }

    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('width', '336');
    expect(img).toHaveAttribute('height', '189');
  });

  it('指定タグに一致する記事が 0 件のとき、記事カードおよび一覧の ul 要素を描画せず見出しのみを表示する', () => {
    // Given
    const tagName = 'Vue';
    const articleMetaDataList = mixedArticles;

    // When
    const { container } = render(
      <TagPage tagName={tagName} articleMetaDataList={articleMetaDataList} />,
    );

    // Then
    expect(
      screen.getByRole('heading', { level: 1, name: 'Vueの記事一覧' }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('article')).toHaveLength(0);
    expect(within(screen.getByRole('main')).queryByRole('list')).toBeNull();
  });

  it('一致する記事が 8 件あるとき、先頭1枚目のみ fetchpriority="high"、先頭6枚目まで loading="eager"、7〜8枚目が loading="lazy" となる', () => {
    // Given
    const tagName = 'Next.js';
    const articleMetaDataList = Array.from({ length: 8 }, (_, i) =>
      createMockArticle(i + 1, ['Next.js']),
    );

    // When
    const { container } = render(
      <TagPage tagName={tagName} articleMetaDataList={articleMetaDataList} />,
    );

    // Then
    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(8);
    images.forEach((img, index) => {
      if (index === 0) {
        expect(img).toHaveAttribute('fetchpriority', 'high');
      } else {
        expect(img).not.toHaveAttribute('fetchpriority', 'high');
      }
      expect(img).toHaveAttribute('loading', index < 6 ? 'eager' : 'lazy');
    });
  });

  it('getStaticPaths: 全記事のタグから重複を除外した /tags/<tag> パス配列と fallback: false を返す', async () => {
    // Given
    vi.mocked(getArticleMetaData).mockResolvedValueOnce(mixedArticles);

    // When
    const result = await getStaticPaths({});

    // Then
    expect(result).toEqual({
      paths: [
        '/tags/Next.js',
        '/tags/TypeScript',
        '/tags/React',
        '/tags/TailwindCSS',
        '/tags/CSS',
        '/tags/UI',
      ],
      fallback: false,
    });
  });

  it('getStaticProps: 有効な params.tag が渡されたとき、tagName, articleMetaDataList, title, ogType, path を含む props を返す', async () => {
    // Given
    vi.mocked(getArticleMetaData).mockResolvedValueOnce(mixedArticles);
    const context: GetStaticPropsContext = { params: { tag: 'Next.js' } };

    // When
    const result = await getStaticProps(context);

    // Then
    expect(result).toEqual({
      props: {
        tagName: 'Next.js',
        articleMetaDataList: mixedArticles,
        title: 'Next.jsの記事一覧',
        ogType: 'website',
        path: '/tags/Next.js',
      },
    });
  });

  it('getStaticProps & tagPage: params.tag が未定義または配列のとき、articleMetaDataList: [] を返し、その props で tagPage をレンダリングしてもクラッシュしない', async () => {
    // Given
    const context1: GetStaticPropsContext = { params: {} };
    const context2: GetStaticPropsContext = { params: { tag: ['a', 'b'] } };

    // When
    const result1 = (await getStaticProps(context1)) as {
      props: { tagName: string; articleMetaDataList: ArticleMetaData[] };
    };
    const result2 = (await getStaticProps(context2)) as {
      props: { tagName: string; articleMetaDataList: ArticleMetaData[] };
    };

    // Then
    expect(result1).toEqual({
      props: { tagName: '', articleMetaDataList: [] },
    });
    expect(result2).toEqual({
      props: { tagName: '', articleMetaDataList: [] },
    });

    const { container: container1, unmount: unmount1 } = render(
      <TagPage {...result1.props} />,
    );
    expect(container1.querySelectorAll('article')).toHaveLength(0);
    unmount1();

    const { container: container2, unmount: unmount2 } = render(
      <TagPage {...result2.props} />,
    );
    expect(container2.querySelectorAll('article')).toHaveLength(0);
    unmount2();
  });

  describe('invariants', () => {
    it('P1: どのような記事リストに対しても、対象タグを持つ記事のみが過不足なく元の順序でカード描画される', () => {
      // Given / When / Then
      const tagName = 'Next.js';
      const patterns: ArticleMetaData[][] = Array.from(
        { length: 16 },
        (_, length) =>
          Array.from({ length }, (__, index) =>
            createMockArticle(
              index + 1,
              index % 2 === 0 || index % 3 === 0 ? ['Next.js', 'React'] : ['React'],
            ),
          ),
      );

      patterns.forEach(articleMetaDataList => {
        const expectedArticles = articleMetaDataList.filter(a =>
          a.tag.includes(tagName),
        );
        const { container, unmount } = render(
          <TagPage
            tagName={tagName}
            articleMetaDataList={articleMetaDataList}
          />,
        );

        const cards = Array.from(container.querySelectorAll('article'));
        expect(cards).toHaveLength(expectedArticles.length);

        const renderedHrefs = cards.map(card =>
          within(card).getByRole('link').getAttribute('href'),
        );
        expect(renderedHrefs).toEqual(expectedArticles.map(a => a.path));

        unmount();
      });
    });

    it('P2: フィルタ後の記事数に関わらず、ファーストビュー（6枚）を超える分のみが遅延読み込みになり、fetchpriority="high" は最大1枚に保たれる', () => {
      // Given / When / Then
      const tagName = 'Next.js';
      [0, 1, 6, 7, 12].forEach(count => {
        const matchingArticles = Array.from({ length: count }, (_, i) =>
          createMockArticle(i + 1, ['Next.js']),
        );
        const nonMatchingArticles = [
          createMockArticle(101, ['React']),
          createMockArticle(102, ['Vue']),
        ];
        const articleMetaDataList = [
          ...matchingArticles,
          ...nonMatchingArticles,
        ];

        const { container, unmount } = render(
          <TagPage
            tagName={tagName}
            articleMetaDataList={articleMetaDataList}
          />,
        );

        const images = Array.from(container.querySelectorAll('img'));
        const lazyImages = images.filter(
          img => img.getAttribute('loading') === 'lazy',
        );
        const highPriorityImages = images.filter(
          img => img.getAttribute('fetchpriority') === 'high',
        );

        expect(lazyImages).toHaveLength(Math.max(0, count - 6));
        expect(highPriorityImages).toHaveLength(count >= 1 ? 1 : 0);

        unmount();
      });
    });
  });

  it('should set time dateTime attribute to YYYY-MM-DD while keeping YYYY/MM/DD as text content (T20)', () => {
    // Given
    const articles = [{ ...createMockArticle(1, ['test-tag']), date: '2023/01/01' }];

    // When
    const { container } = render(
      <TagPage tagName="test-tag" articleMetaDataList={articles} />,
    );

    // Then
    const time = container.querySelector('time')!;
    expect(time.getAttribute('datetime')).toBe('2023-01-01');
    expect(time.textContent).toBe('2023/01/01');
  });

  it('should render a CollectionPage JSON-LD script on the tag page (T22)', () => {
    // Given
    const articles = [createMockArticle(1, ['test-tag'])];

    // When
    const { container } = render(
      <TagPage tagName="test-tag" articleMetaDataList={articles} />,
    );

    // Then
    const scripts = container.ownerDocument.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0].textContent ?? '')).toEqual(
      buildTagPageJsonLd('test-tag'),
    );
  });
});
