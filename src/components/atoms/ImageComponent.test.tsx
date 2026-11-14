import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Image } from './ImageComponent';

describe('ImageComponent', () => {
  const defaultProps = {
    imageSrc: '/test.png',
    isRounded: false,
    alt: 'test alt',
    width: { pc: 336, sp: 336 },
    height: { pc: 189, sp: 189 },
  };

  it('loading="lazy" 指定時にimgへ属性が付く', () => {
    render(<Image {...defaultProps} loading="lazy" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('loading="eager" 指定時にimgへ属性が付く', () => {
    render(<Image {...defaultProps} loading="eager" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('loading 未指定時はloading属性が付かない', () => {
    render(<Image {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('loading');
  });

  it('decoding="async" が常に付与される', () => {
    render(<Image {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('既存の fetchPriority と loading が同時指定できる', () => {
    render(<Image {...defaultProps} fetchPriority="high" loading="eager" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(img).toHaveAttribute('loading', 'eager');
  });
});
