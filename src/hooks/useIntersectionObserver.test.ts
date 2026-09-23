import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIntersectionObserver } from './useIntersectionObserver';

type MockObserverInstance = {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
};

const setupIntersectionObserverMock = () => {
  let capturedCallback: IntersectionObserverCallback = () => {};
  const instance: MockObserverInstance = {
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
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
    getCallback: () => capturedCallback,
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useIntersectionObserver', () => {
  it('should call observe when mounted with enabled true', () => {
    // Given
    const { instance } = setupIntersectionObserverMock();
    const onIntersect = vi.fn();

    // When
    const { result } = renderHook(() =>
      useIntersectionObserver({ onIntersect, enabled: true }),
    );
    const div = document.createElement('div');
    act(() => {
      result.current(div);
    });

    // Then
    expect(instance.observe).toHaveBeenCalledTimes(1);
  });

  it('should call onIntersect when intersecting', () => {
    // Given
    const { getCallback } = setupIntersectionObserverMock();
    const onIntersect = vi.fn();
    const { result } = renderHook(() =>
      useIntersectionObserver({ onIntersect, enabled: true }),
    );
    const div = document.createElement('div');
    act(() => {
      result.current(div);
    });

    // When
    act(() => {
      getCallback()(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    // Then
    expect(onIntersect).toHaveBeenCalledTimes(1);
  });

  it('should not call onIntersect when not intersecting', () => {
    // Given
    const { getCallback } = setupIntersectionObserverMock();
    const onIntersect = vi.fn();
    const { result } = renderHook(() =>
      useIntersectionObserver({ onIntersect, enabled: true }),
    );
    const div = document.createElement('div');
    act(() => {
      result.current(div);
    });

    // When
    act(() => {
      getCallback()(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    // Then
    expect(onIntersect).not.toHaveBeenCalled();
  });

  it('should disconnect on unmount', () => {
    // Given
    const { instance } = setupIntersectionObserverMock();
    const onIntersect = vi.fn();
    const { result, unmount } = renderHook(() =>
      useIntersectionObserver({ onIntersect, enabled: true }),
    );
    const div = document.createElement('div');
    act(() => {
      result.current(div);
    });

    // When
    unmount();

    // Then
    expect(instance.disconnect).toHaveBeenCalledTimes(1);
  });

  it('should not observe when enabled is false', () => {
    // Given
    const { instance } = setupIntersectionObserverMock();
    const onIntersect = vi.fn();

    // When
    const { result } = renderHook(() =>
      useIntersectionObserver({ onIntersect, enabled: false }),
    );
    const div = document.createElement('div');
    act(() => {
      result.current(div);
    });

    // Then
    expect(instance.observe).not.toHaveBeenCalled();
  });

  it('should not throw when IntersectionObserver is undefined', () => {
    // Given
    vi.stubGlobal('IntersectionObserver', undefined);
    const onIntersect = vi.fn();

    // When
    const render = () => {
      const { result } = renderHook(() =>
        useIntersectionObserver({ onIntersect, enabled: true }),
      );
      const div = document.createElement('div');
      act(() => {
        result.current(div);
      });
    };

    // Then
    expect(render).not.toThrow();
  });
});
