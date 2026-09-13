/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';

import TagPage from '../../../../src/pages/tags/[tag]';
import { ArticleMetaData } from '../../../../src/types/article';

describe('TagPage', () => {
  const createMockArticle = (id: number, tags: string[] = ['test-tag']): ArticleMetaData => ({
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

  it('T11: 1件目がeager、2件目以降がlazyになる', () => {
    const articles = Array.from({ length: 3 }, (_, i) => createMockArticle(i + 1));
    render(<TagPage tagName="test-tag" articleMetaDataList={articles} />);
    
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(3);
    
    expect(images[0]).toHaveAttribute('loading', 'eager');
    expect(images[1]).toHaveAttribute('loading', 'lazy');
    expect(images[2]).toHaveAttribute('loading', 'lazy');
  });

  it('T12: 記事が1件の場合はeagerのみ付与される', () => {
    const articles = [createMockArticle(1)];
    render(<TagPage tagName="test-tag" articleMetaDataList={articles} />);
    
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(1);
    
    expect(images[0]).toHaveAttribute('loading', 'eager');
    expect(images[0]).not.toHaveAttribute('loading', 'lazy');
  });
});
