/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import IndexPage from '../../../src/pages/index';
import { ArticleMetaData } from '../../../src/types/article';

describe('IndexPage', () => {
  const createMockArticle = (id: number): ArticleMetaData => ({
    title: `Article ${id}`,
    path: `/article-${id}`,
    description: `Description ${id}`,
    thumbnailImage: {
      url: `/image-${id}.png`,
      size: { pc: { width: 300, height: 200 }, sp: { width: 300, height: 200 } },
    },
    date: '2023-01-01',
    tag: ['tag1'],
    ogpImage: `/ogp-${id}.png`,
  });

  const EAGER_CARD_COUNT = 6;

  it('T7: 先頭6件がeager・7件目以降がlazyになる', () => {
    const articles = Array.from({ length: 8 }, (_, i) => createMockArticle(i + 1));
    render(<IndexPage articleMetaDataList={articles} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(8);

    images.forEach((img, index) => {
      if (index < EAGER_CARD_COUNT) {
        expect(img).toHaveAttribute('loading', 'eager');
      } else {
        expect(img).toHaveAttribute('loading', 'lazy');
      }
    });
  });

  it('T8: 記事が6件以下なら全てeager', () => {
    const articles = Array.from({ length: 3 }, (_, i) => createMockArticle(i + 1));
    render(<IndexPage articleMetaDataList={articles} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(3);

    images.forEach((img) => {
      expect(img).toHaveAttribute('loading', 'eager');
      expect(img).not.toHaveAttribute('loading', 'lazy');
    });
  });

  it('T9: 記事0件でもクラッシュしない', () => {
    render(<IndexPage articleMetaDataList={[]} />);
    const images = screen.queryAllByRole('img');
    expect(images.length).toBe(0);
  });

  it('T10: 1件目のみ fetchPriority="high" が維持される', () => {
    const articles = Array.from({ length: 2 }, (_, i) => createMockArticle(i + 1));
    render(<IndexPage articleMetaDataList={articles} />);
    const images = screen.getAllByRole('img');
    
    expect(images[0]).toHaveAttribute('fetchpriority', 'high');
    expect(images[1]).not.toHaveAttribute('fetchpriority', 'high');
  });

  describe('不変条件 (Invariants)', () => {
    it('P1: lazyな画像数 = Math.max(0, 記事数 - EAGER_CARD_COUNT)', () => {
      [0, 3, 6, 10, 20].forEach(count => {
        const articles = Array.from({ length: count }, (_, i) => createMockArticle(i + 1));
        const { container } = render(<IndexPage articleMetaDataList={articles} />);
        
        const images = Array.from(container.querySelectorAll('img'));
        const lazyImages = images.filter(img => img.getAttribute('loading') === 'lazy');
        
        expect(lazyImages.length).toBe(Math.max(0, count - EAGER_CARD_COUNT));
      });
    });

    it('P2: fetchPriority="high" の画像数 <= 1', () => {
      [0, 1, 10].forEach(count => {
        const articles = Array.from({ length: count }, (_, i) => createMockArticle(i + 1));
        const { container } = render(<IndexPage articleMetaDataList={articles} />);
        
        const images = Array.from(container.querySelectorAll('img'));
        const highPriorityImages = images.filter(img => img.getAttribute('fetchpriority') === 'high');
        
        expect(highPriorityImages.length).toBeLessThanOrEqual(1);
      });
    });
  });
});
