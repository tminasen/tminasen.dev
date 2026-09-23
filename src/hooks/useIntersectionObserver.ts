import { useCallback, useEffect, useRef } from 'react';

type UseIntersectionObserverParams = {
  onIntersect: () => void;
  enabled: boolean;
};

/**
 * 要素が画面に交差したことを検知するコールバックrefを返す
 * `IntersectionObserver` が利用できない環境では何もしない
 * @param params 交差時のコールバックと監視の有効フラグ
 * @returns 監視対象要素に付与するコールバックref
 */
export const useIntersectionObserver = ({
  onIntersect,
  enabled,
}: UseIntersectionObserverParams): ((node: Element | null) => void) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  const setNode = useCallback(
    (node: Element | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!enabled || !node || typeof IntersectionObserver === 'undefined') {
        return;
      }

      const observer = new IntersectionObserver(
        entries => {
          if (entries.some(entry => entry.isIntersecting)) {
            onIntersectRef.current();
          }
        },
        { rootMargin: '0px' },
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    [enabled],
  );

  return setNode;
};
