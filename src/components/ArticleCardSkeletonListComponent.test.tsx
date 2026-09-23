import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ArticleCardSkeletonListComponent } from './ArticleCardSkeletonListComponent';

describe('ArticleCardSkeletonListComponent', () => {
  it('should render the specified number of skeletons', () => {
    // Given
    const count = 3;

    // When
    render(<ArticleCardSkeletonListComponent count={count} />);

    // Then
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('should render nothing when count is 0', () => {
    // Given
    const count = 0;

    // When
    const { container } = render(
      <ArticleCardSkeletonListComponent count={count} />,
    );

    // Then
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should announce loading state to assistive technology', () => {
    // Given
    const count = 12;

    // When
    render(<ArticleCardSkeletonListComponent count={count} />);

    // Then
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-label', '記事を読み込み中');
  });
});
