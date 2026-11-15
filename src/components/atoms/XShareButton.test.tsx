import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { XShareButton } from './XShareButton';

describe('XShareButton', () => {
  it('img に width と height が付く', () => {
    // Given
    const props = { title: 'タイトル', path: '/blog/x' };
    // When
    render(<XShareButton {...props} />);
    // Then
    const img = screen.getByRole('img', { name: 'Xに投稿する' });
    expect(img).toHaveAttribute('width', '28');
    expect(img).toHaveAttribute('height', '28');
  });
});
