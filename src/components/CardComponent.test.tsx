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
    date: '2023/01/01',
    tags: ['tag1', 'tag2'],
  };

  it('loading propsがImageへ伝搬される', () => {
    const { container } = render(
      <CardComponent {...defaultProps} loading="lazy" />,
    );
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('画像の alt が空', () => {
    // Given
    const props = defaultProps;
    // When
    const { container } = render(<CardComponent {...props} />);
    // Then
    expect(container.querySelector('img')!.getAttribute('alt')).toBe('');
  });

  it('リンク名にタイトルが1回だけ含まれる', () => {
    // Given
    const props = defaultProps;
    // When
    render(<CardComponent {...props} />);
    // Then
    expect(screen.getByRole('link', { name: /Test Title/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Test Title[\s\S]*Test Title/ }),
    ).toBeNull();
  });

  it('カードの中身が 日付 → タイトル → 抜粋 → タグ の順に並ぶ', () => {
    // Given
    const props = defaultProps;
    // When
    const { container } = render(<CardComponent {...props} />);
    // Then
    const ordered = [
      container.querySelector('time')!,
      screen.getByRole('heading', { level: 2, name: 'Test Title' }),
      screen.getByText('Test Excerpt'),
      screen.getByText('#tag1'),
    ];
    for (let i = 0; i < ordered.length - 1; i++) {
      expect(
        ordered[i].compareDocumentPosition(ordered[i + 1]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it('should set time dateTime attribute to YYYY-MM-DD while keeping YYYY/MM/DD as text content (T17)', () => {
    // Given
    const props = {
      title: 'Test Title',
      path: '/test-path',
      excerpt: 'Test Excerpt',
      image: mockImage,
      date: '2023/01/05',
      tags: ['tag1'],
    };
    // When
    const { container } = render(<CardComponent {...props} />);
    // Then
    const time = container.querySelector('time')!;
    expect(time.getAttribute('datetime')).toBe('2023-01-05');
    expect(time.textContent).toBe('2023/01/05');
  });
});
