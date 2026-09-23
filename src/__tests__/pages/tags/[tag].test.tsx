import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import TagPage from '../../../pages/tags/[tag]';
import { ArticleMetaData } from '../../../types/article';

const createArticle = (
  id: number,
  tags: string[] = ['test-tag'],
): ArticleMetaData => ({
  title: `Article ${id}`,
  path: `/article-${id}`,
  description: `Description ${id}`,
  thumbnailImage: {
    url: `/image-${id}.png`,
    size: { pc: { width: 300, height: 200 }, sp: { width: 300, height: 200 } },
  },
  date: '2023-01-01',
  tag: tags,
  ogpImage: `/ogp-${id}.png`,
});

describe('TagPage', () => {
  it('should load the first image eagerly and the rest lazily', () => {
    // Given
    const articles = Array.from({ length: 3 }, (_, i) => createArticle(i + 1));

    // When
    render(<TagPage tagName="test-tag" articleMetaDataList={articles} />);

    // Then
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('loading', 'eager');
    expect(images[1]).toHaveAttribute('loading', 'lazy');
    expect(images[2]).toHaveAttribute('loading', 'lazy');
  });

  it('should load the only image eagerly when there is a single article', () => {
    // Given
    const articles = [createArticle(1)];

    // When
    render(<TagPage tagName="test-tag" articleMetaDataList={articles} />);

    // Then
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('loading', 'eager');
  });
});
