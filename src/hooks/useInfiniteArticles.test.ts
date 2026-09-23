import { renderHook, act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useInfiniteArticles } from './useInfiniteArticles';
import { ArticleMetaData } from '../types/article';

const buildArticles = (start: number, count: number): ArticleMetaData[] =>
  Array.from({ length: count }, (_, i) => ({
    title: `Article ${start + i}`,
    path: `/art${start + i}`,
    date: '2023-01-01',
    tag: ['tag1'],
    thumbnailImage: {
      url: '/img.jpg',
      size: { pc: { width: 100, height: 100 }, sp: { width: 50, height: 50 } },
    },
    ogpImage: '/ogp.jpg',
    description: 'desc',
  }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useInfiniteArticles', () => {
  it('should hold only the initial articles at first', () => {
    // Given
    const initialArticles = buildArticles(1, 12);
    const totalPages = 3;

    // When
    const { result } = renderHook(() =>
      useInfiniteArticles({ initialArticles, totalPages }),
    );

    // Then
    expect(result.current.articles.length).toBe(12);
    expect(result.current.status).toBe('idle');
  });

  it('should be done at initial state when totalPages is 1', () => {
    // Given
    const initialArticles = buildArticles(1, 5);
    const totalPages = 1;

    // When
    const { result } = renderHook(() =>
      useInfiniteArticles({ initialArticles, totalPages }),
    );

    // Then
    expect(result.current.status).toBe('done');
  });

  it('should fetch page-2 chunk and append articles on loadMore', async () => {
    // Given
    const initialArticles = buildArticles(1, 12);
    const totalPages = 3;
    const page2Articles = buildArticles(13, 12);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(page2Articles),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() =>
      useInfiniteArticles({ initialArticles, totalPages }),
    );

    // When
    await act(async () => {
      await result.current.loadMore();
    });

    // Then
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/articles/page-2.json');
    expect(result.current.articles.length).toBe(24);
    expect(result.current.articles.at(-1)?.path).toBe('/art24');
    expect(result.current.status).toBe('idle');
  });

  it('should be loading while fetching', () => {
    // Given
    const initialArticles = buildArticles(1, 12);
    const totalPages = 3;
    let resolveFetch: (value: unknown) => void = () => {};
    const fetchMock = vi.fn(
      () => new Promise(resolve => (resolveFetch = resolve)),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() =>
      useInfiniteArticles({ initialArticles, totalPages }),
    );

    // When
    act(() => {
      result.current.loadMore();
    });

    // Then
    expect(result.current.status).toBe('loading');
    // クリーンアップ: 未解決のPromiseを残さない
    resolveFetch({ ok: true, json: () => Promise.resolve([]) });
  });

  it('should become done after loading the last page', async () => {
    // Given
    const initialArticles = buildArticles(1, 12);
    const totalPages = 2;
    const page2Articles = buildArticles(13, 12);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(page2Articles),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() =>
      useInfiniteArticles({ initialArticles, totalPages }),
    );

    // When
    await act(async () => {
      await result.current.loadMore();
    });

    // Then
    expect(result.current.articles.length).toBe(24);
    expect(result.current.status).toBe('done');
  });

  it('should not fetch after status becomes done', async () => {
    // Given
    const initialArticles = buildArticles(1, 12);
    const totalPages = 2;
    const page2Articles = buildArticles(13, 12);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(page2Articles),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() =>
      useInfiniteArticles({ initialArticles, totalPages }),
    );
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.status).toBe('done');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // When
    await act(async () => {
      await result.current.loadMore();
    });

    // Then
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.articles.length).toBe(24);
  });

  it('should end without throwing when fetch rejects', async () => {
    // Given
    const initialArticles = buildArticles(1, 12);
    const totalPages = 3;
    const fetchMock = vi.fn().mockRejectedValue(new Error('network'));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() =>
      useInfiniteArticles({ initialArticles, totalPages }),
    );

    // When
    await act(async () => {
      await expect(result.current.loadMore()).resolves.not.toThrow();
    });

    // Then
    expect(result.current.articles.length).toBe(12);
    expect(result.current.status).toBe('done');
  });

  it('should end when response is not ok', async () => {
    // Given
    const initialArticles = buildArticles(1, 12);
    const totalPages = 3;
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() =>
      useInfiniteArticles({ initialArticles, totalPages }),
    );

    // When
    await act(async () => {
      await result.current.loadMore();
    });

    // Then
    expect(result.current.articles.length).toBe(12);
    expect(result.current.status).toBe('done');
  });

  it('should end when response body is not an array', async () => {
    // Given
    const initialArticles = buildArticles(1, 12);
    const totalPages = 3;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ foo: 'bar' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() =>
      useInfiniteArticles({ initialArticles, totalPages }),
    );

    // When
    await act(async () => {
      await result.current.loadMore();
    });

    // Then
    expect(result.current.articles.length).toBe(12);
    expect(result.current.status).toBe('done');
  });

  it('should not fetch twice on duplicate calls while loading', async () => {
    // Given
    const initialArticles = buildArticles(1, 12);
    const totalPages = 3;
    let resolveFetch: (value: unknown) => void = () => {};
    const fetchMock = vi.fn(
      () => new Promise(resolve => (resolveFetch = resolve)),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() =>
      useInfiniteArticles({ initialArticles, totalPages }),
    );

    // When
    act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });

    // Then
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // クリーンアップ
    await act(async () => {
      resolveFetch({ ok: true, json: () => Promise.resolve([]) });
      await Promise.resolve();
    });
  });

  describe('invariants', () => {
    // articles.length is monotonically non-decreasing and always >= initialArticles.length
    // no duplicate paths exist in articles
    // once status is 'done', the number of fetch calls no longer increases
    it('should hold across success, error, and duplicate scenarios', async () => {
      const scenarios: Array<{
        name: string;
        response: () => Promise<{ ok: boolean; json?: () => Promise<unknown> }>;
      }> = [
        {
          name: 'success',
          response: () =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve(buildArticles(13, 12)),
            }),
        },
        {
          name: 'http error',
          response: () => Promise.resolve({ ok: false }),
        },
        {
          name: 'invalid body',
          response: () =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        },
      ];

      for (const scenario of scenarios) {
        const initialArticles = buildArticles(1, 12);
        const totalPages = 3;
        const fetchMock = vi.fn(scenario.response);
        vi.stubGlobal('fetch', fetchMock);
        const { result } = renderHook(() =>
          useInfiniteArticles({ initialArticles, totalPages }),
        );

        const before = result.current.articles.length;
        await act(async () => {
          await result.current.loadMore();
        });
        const afterLength = result.current.articles.length;

        // articles length must never decrease
        expect(afterLength).toBeGreaterThanOrEqual(before);
        expect(afterLength).toBeGreaterThanOrEqual(initialArticles.length);

        // paths must remain unique
        const paths = result.current.articles.map(a => a.path);
        expect(new Set(paths).size).toBe(paths.length);

        if (result.current.status === 'done') {
          const callsAtDone = fetchMock.mock.calls.length;
          await act(async () => {
            await result.current.loadMore();
          });
          // no additional fetch should happen once done
          expect(fetchMock.mock.calls.length).toBe(callsAtDone);
        }

        vi.unstubAllGlobals();
      }
    });
  });
});
