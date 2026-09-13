import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CardComponent } from './CardComponent';
import { ThumbnailImage } from '../types/article';

describe('CardComponent', () => {
  const mockImage: ThumbnailImage = {
    url: '/test.png',
    size: {
      pc: { width: 336, height: 189 },
      sp: { width: 336, height: 189 },
    },
  };

  const defaultProps = {
    title: 'Test Title',
    path: '/test-path',
    excerpt: 'Test Excerpt',
    image: mockImage,
    date: '2023-01-01',
    tags: ['tag1', 'tag2'],
  };

  it('T6: loading propsがImageへ伝搬される', () => {
    render(<CardComponent {...defaultProps} loading="lazy" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
