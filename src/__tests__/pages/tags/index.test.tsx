import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import TagListPage from '../../../pages/tags/index';
import { Tag } from '../../../types/article';

const TAG_LIST: Tag[] = [
  { name: 'Angular', articleCount: 7, url: '/tags/Angular' },
  { name: 'React', articleCount: 3, url: '/tags/React' },
];

const getTagList = (): HTMLElement =>
  screen.getByRole('heading', { level: 1, name: 'タグ一覧' })
    .nextElementSibling as HTMLElement;

describe('TagListPage', () => {
  it('各タグが「タグ名 記事数」のリンク名で、渡された順に表示される', () => {
    // Given
    const tagList = TAG_LIST;
    // When
    render(<TagListPage tagList={tagList} />);
    // Then
    const links = within(getTagList()).getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAccessibleName('Angular 7');
    expect(links[1]).toHaveAccessibleName('React 3');
  });

  it('チップのリンク先がタグ別一覧である', () => {
    // Given
    const tagList = TAG_LIST;
    // When
    render(<TagListPage tagList={tagList} />);
    // Then
    expect(screen.getByRole('link', { name: 'Angular 7' })).toHaveAttribute(
      'href',
      '/tags/Angular',
    );
  });

  it('タグが0件のときチップを1つも表示しない', () => {
    // Given
    const tagList: Tag[] = [];
    // When
    render(<TagListPage tagList={tagList} />);
    // Then
    expect(within(getTagList()).queryAllByRole('listitem')).toHaveLength(0);
  });
});
