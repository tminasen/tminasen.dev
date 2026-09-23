import { render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import IndexPage, { getStaticProps } from '../../pages/index';
import { ArticleMetaData } from '../../types/article';

vi.mock('../../components/ArticleCardListComponent', () => ({
  ArticleCardListComponent: ({
    articleMetaDataList,
  }: {
    articleMetaDataList: ArticleMetaData[];
  }) => (
    <ul data-testid="article-list">
      {articleMetaDataList.map(a => (
        <li key={a.path}>{a.title}</li>
      ))}
    </ul>
  ),
}));

const buildArticles = (count: number): ArticleMetaData[] =>
  Array.from({ length: count }, (_, i) => ({
    title: `Article ${i + 1}`,
    path: `/art${i + 1}`,
    thumbnailImage: {
      url: '/img.jpg',
      size: { pc: { width: 100, height: 100 }, sp: { width: 50, height: 50 } },
    },
    description: `desc${i + 1}`,
    date: '2023-01-01',
    tag: ['tag1'],
    ogpImage: '/ogp.jpg',
  }));

const getArticleMetaDataMock = vi.fn();
vi.mock('../../libraries/articles', () => ({
  getArticleMetaData: () => getArticleMetaDataMock(),
}));

type MockObserverInstance = {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

const setupIntersectionObserverMock = () => {
  let capturedCallback: IntersectionObserverCallback = () => {};
  const instance: MockObserverInstance = {
    observe: vi.fn(),
    disconnect: vi.fn(),
  };
  const MockIntersectionObserver = vi.fn(function (
    this: unknown,
    callback: IntersectionObserverCallback,
  ) {
    capturedCallback = callback;
    return instance;
  });
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

  return {
    instance,
    intersect: () =>
      capturedCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('IndexPage', () => {
  describe('getStaticProps', () => {
    it('should pass only the first page and total pages as props', async () => {
      // Given
      getArticleMetaDataMock.mockResolvedValue(buildArticles(30));

      // When
      const result = await getStaticProps();
      const { props } = result as { props: any };

      // Then
      expect(props.articleMetaDataList.length).toBe(12);
      expect(props.totalPages).toBe(3);
      expect(JSON.stringify(props)).not.toContain('Article 13');
    });
  });

  describe('rendering', () => {
    it('should render only the first 12 articles without skeleton', async () => {
      // Given
      setupIntersectionObserverMock();
      getArticleMetaDataMock.mockResolvedValue(buildArticles(30));
      const { props } = (await getStaticProps()) as { props: any };

      // When
      render(<IndexPage {...props} />);

      // Then
      expect(screen.getByText('Article 1')).toBeInTheDocument();
      expect(screen.getByText('Article 12')).toBeInTheDocument();
      expect(screen.queryByText('Article 13')).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).toBeNull();
    });

    it('should show skeleton on intersect and render 24 articles after fetch resolves', async () => {
      // Given
      const { intersect } = setupIntersectionObserverMock();
      getArticleMetaDataMock.mockResolvedValue(buildArticles(30));
      const { props } = (await getStaticProps()) as { props: any };
      const page2Articles = buildArticles(24).slice(12, 24);
      let resolveFetch: (value: unknown) => void = () => {};
      const fetchMock = vi.fn(
        () =>
          new Promise(resolve => {
            resolveFetch = resolve;
          }),
      );
      vi.stubGlobal('fetch', fetchMock);
      render(<IndexPage {...props} />);

      // When
      intersect();

      // Then（解決前）
      expect(await screen.findByRole('status')).toBeInTheDocument();

      // When（解決後）
      resolveFetch({ ok: true, json: () => Promise.resolve(page2Articles) });

      // Then（解決後）
      expect(await screen.findByText('Article 24')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByRole('status')).toBeNull();
      });
    });

    it('should not observe or render skeleton when totalPages is 1', async () => {
      // Given
      const { instance } = setupIntersectionObserverMock();
      getArticleMetaDataMock.mockResolvedValue(buildArticles(10));
      const { props } = (await getStaticProps()) as { props: any };

      // When
      render(<IndexPage {...props} />);

      // Then
      expect(instance.observe).not.toHaveBeenCalled();
      expect(screen.queryByRole('status')).toBeNull();
    });

    it('should not crash when there are no articles', async () => {
      // Given
      setupIntersectionObserverMock();
      getArticleMetaDataMock.mockResolvedValue([]);

      // When
      const render_ = async () => {
        const { props } = (await getStaticProps()) as { props: any };
        render(<IndexPage {...props} />);
      };

      // Then
      await expect(render_()).resolves.not.toThrow();
      const articleList = screen.getByTestId('article-list');
      expect(articleList.querySelectorAll('li')).toHaveLength(0);
    });

    it('should keep 12 articles without error UI when fetching more fails', async () => {
      // Given
      const { intersect } = setupIntersectionObserverMock();
      getArticleMetaDataMock.mockResolvedValue(buildArticles(30));
      const { props } = (await getStaticProps()) as { props: any };
      const fetchMock = vi.fn().mockRejectedValue(new Error('network'));
      vi.stubGlobal('fetch', fetchMock);
      render(<IndexPage {...props} />);

      // When
      intersect();
      await waitFor(() => {
        expect(screen.queryByRole('status')).toBeNull();
      });

      // Then
      expect(screen.getByText('Article 12')).toBeInTheDocument();
      expect(screen.queryByText('Article 13')).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
    });

    // 記事27件だと3ページ目が端数3件になるケース
    it('should render skeleton count matching remaining articles for last partial page', async () => {
      // Given
      const { intersect } = setupIntersectionObserverMock();
      getArticleMetaDataMock.mockResolvedValue(buildArticles(27));
      const { props } = (await getStaticProps()) as { props: any };
      const page2Articles = buildArticles(27).slice(12, 24);
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(page2Articles),
        })
        .mockImplementationOnce(
          () =>
            new Promise(() => {
              // 3ページ目は未解決のまま留め、スケルトン枚数を検証する
            }),
        );
      vi.stubGlobal('fetch', fetchMock);
      render(<IndexPage {...props} />);

      // When（2ページ目読み込み完了まで待機）
      intersect();
      await screen.findByText('Article 24');

      // Then（3ページ目読み込み中、残り3件分のスケルトンのみ表示される）
      intersect();
      const status = await screen.findByRole('status');
      expect(within(status).getAllByRole('listitem')).toHaveLength(3);
    });
  });
});
