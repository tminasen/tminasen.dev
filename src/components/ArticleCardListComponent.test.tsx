import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ArticleCardListComponent } from './ArticleCardListComponent';
import { ArticleMetaData } from '../types/article';

// CardComponent はモックせず実描画する。
// loading / fetchPriority は <img> 属性として初めて検証できるため、
// モックすると本コンポーネントの責務（何枚目を eager にするか）が一切検証されなくなる。
const createArticle = (id: number): ArticleMetaData => ({
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

const createArticles = (count: number): ArticleMetaData[] =>
  Array.from({ length: count }, (_, i) => createArticle(i + 1));

// ファーストビュー相当の枚数。ArticleCardListComponent の実装と同じ値。
const EAGER_CARD_COUNT = 6;

describe('ArticleCardListComponent', () => {
  it('should render a card for each article', () => {
    // Given
    const articles = createArticles(2);

    // When
    render(<ArticleCardListComponent articleMetaDataList={articles} />);

    // Then
    expect(screen.getByText('Article 1')).toBeInTheDocument();
    expect(screen.getByText('Article 2')).toBeInTheDocument();
  });

  it('should load the first six images eagerly and the rest lazily', () => {
    // Given
    const articles = createArticles(8);

    // When
    render(<ArticleCardListComponent articleMetaDataList={articles} />);

    // Then
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(8);
    images.forEach((img, index) => {
      expect(img).toHaveAttribute(
        'loading',
        index < EAGER_CARD_COUNT ? 'eager' : 'lazy',
      );
    });
  });

  it('should load every image eagerly when there are six or fewer articles', () => {
    // Given
    const articles = createArticles(3);

    // When
    render(<ArticleCardListComponent articleMetaDataList={articles} />);

    // Then
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    images.forEach(img => {
      expect(img).toHaveAttribute('loading', 'eager');
    });
  });

  it('should render nothing and not crash when there are no articles', () => {
    // Given
    const articles: ArticleMetaData[] = [];

    // When
    render(<ArticleCardListComponent articleMetaDataList={articles} />);

    // Then
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('should set fetchPriority high only on the first image', () => {
    // Given
    const articles = createArticles(2);

    // When
    render(<ArticleCardListComponent articleMetaDataList={articles} />);

    // Then
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('fetchpriority', 'high');
    expect(images[1]).not.toHaveAttribute('fetchpriority', 'high');
  });

  describe('invariants', () => {
    it('should keep the lazy image count equal to max(0, articleCount - 6)', () => {
      // Given / When / Then
      [0, 3, 6, 10, 20].forEach(count => {
        const { container, unmount } = render(
          <ArticleCardListComponent articleMetaDataList={createArticles(count)} />,
        );
        const lazyImages = Array.from(container.querySelectorAll('img')).filter(
          img => img.getAttribute('loading') === 'lazy',
        );

        expect(lazyImages).toHaveLength(Math.max(0, count - EAGER_CARD_COUNT));
        unmount();
      });
    });

    it('should never set fetchPriority high on more than one image', () => {
      // Given / When / Then
      [0, 1, 10].forEach(count => {
        const { container, unmount } = render(
          <ArticleCardListComponent articleMetaDataList={createArticles(count)} />,
        );
        const highPriorityImages = Array.from(
          container.querySelectorAll('img'),
        ).filter(img => img.getAttribute('fetchpriority') === 'high');

        expect(highPriorityImages.length).toBeLessThanOrEqual(1);
        unmount();
      });
    });
  });
});
