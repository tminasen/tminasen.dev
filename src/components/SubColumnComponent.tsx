import React from 'react';
import styled from 'styled-components';
import media from 'styled-media-query';
import { contentsBackgroundColor } from '../styles/variable';
import { TagCount } from '../../types/article';
import { LinkComponent } from './atoms/LinkComponent';
import { convertTagList } from '../libraries/articles';

type TagLink = {
  name: string;
  articleCount: number;
  url: string;
};
interface Props {
  tagCount: TagCount;
}

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  width: 15%;
  align-items: center;
  background-color: ${contentsBackgroundColor.white};
  border-radius: 1rem;
  margin-bottom: 1rem;
  padding: 0.2rem 0.4rem;
  ${media.lessThan('small')`
    display: none;
  `}
`;
const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: bold;
`;
const TagList = styled.ul`
  font-size: 1.6rem;
`;
const TagListItem = styled.li`
  &:not(:last-child) {
    margin: 0 0 0.8rem 0;
  }
`;

export const SubColumnComponent: React.FC<Props> = ({ tagCount }) => {
  const tagLinkList: TagLink[] = convertTagList(tagCount);
  if (tagLinkList.length === 0) {
    return null;
  }
  const tagList = tagLinkList.map(tagLink => (
    <TagListItem key={tagLink.name}>
      <LinkComponent url={tagLink.url} color="black">
        {`${tagLink.name}(${tagLink.articleCount})`}
      </LinkComponent>
    </TagListItem>
  ));
  return (
    <Aside>
      <Title>タグ一覧</Title>
      {tagList.length ? <TagList>{tagList}</TagList> : null}
    </Aside>
  );
};
