import { useCallback, useRef, useState } from 'react';
import { ArticleMetaData } from '../types/article';
import { getArticleChunkUrl } from '../libraries/articleChunk';

export type InfiniteArticlesStatus = 'idle' | 'loading' | 'done';

type UseInfiniteArticlesParams = {
  initialArticles: ArticleMetaData[];
  totalPages: number;
};

type UseInfiniteArticlesResult = {
  articles: ArticleMetaData[];
  status: InfiniteArticlesStatus;
  loadMore: () => Promise<void>;
};

/**
 * 記事チャンクを追加読み込みしながら記事一覧を蓄積する
 * @param params 初期記事と総ページ数
 */
export const useInfiniteArticles = ({
  initialArticles,
  totalPages,
}: UseInfiniteArticlesParams): UseInfiniteArticlesResult => {
  const [articles, setArticles] = useState(initialArticles);
  const [loadedPage, setLoadedPage] = useState(1);
  const [status, setStatus] = useState<InfiniteArticlesStatus>(
    totalPages <= 1 ? 'done' : 'idle',
  );
  // React の状態更新はバッチ処理されるため、同期的な多重呼び出しを防ぐには
  // レンダリングをまたがず即座に参照・更新できる ref で排他制御する。
  // このフラグは「読み込み中かどうか」ではなく「以降の loadMore 呼び出しを
  // 禁止するロック」として機能する。成功時は次ページの有無に応じて
  // ロックの要否を判定し（最終ページ到達後は再取得不要のため恒久的にロック）、
  // エラー時は「失敗時は何もせず終了する」仕様に従い常にロックしたままにする。
  const isLockedRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLockedRef.current || loadedPage >= totalPages) {
      return;
    }

    isLockedRef.current = true;
    setStatus('loading');
    const nextPage = loadedPage + 1;

    try {
      const response = await fetch(getArticleChunkUrl(nextPage));
      if (!response.ok) {
        setStatus('done');
        return;
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        setStatus('done');
        return;
      }

      setArticles(current => [...current, ...(data as ArticleMetaData[])]);
      setLoadedPage(nextPage);
      const isLastPage = nextPage >= totalPages;
      setStatus(isLastPage ? 'done' : 'idle');
      isLockedRef.current = isLastPage;
      return;
    } catch {
      setStatus('done');
      return;
    }
  }, [loadedPage, totalPages]);

  return { articles, status, loadMore };
};
