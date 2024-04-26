import React from 'react';
import { PageTemplate } from '../../templates/PageTemplate';
import styled from 'styled-components';
import { color, fontSize } from '../../styles/variable';
import media from 'styled-media-query';
import { GetStaticProps } from 'next';
import { ArticleMetaData, Tag } from '../../../types/article';
import {
  convertTagList,
  getArticleMetaData,
  getTagCount,
} from '../../libraries/articles';
import { LinkComponent } from '../../components/atoms/LinkComponent';

interface Props {
  tagList: Tag[];
}

const PageTitle = styled.h1`
  color: ${color.textBlack};
  font-size: ${fontSize.px28};
  margin-bottom: 16px;
  ${media.lessThan('small')`
    font-size: ${fontSize.px20};
  `}
`;

const TagList = styled.ul`
  font-size: ${fontSize.px16};
  margin-left: 16px;
`;
const TagListItem = styled.li`
  &:not(:first-child) {
    margin-top: 8px;
  }
`;

const TagListPage: React.FC<Props> = ({ tagList }) => {
  return (
    <PageTemplate
      title="タグ一覧"
      ogpImage={undefined}
      isEnableViewPort={true}
      canonicalPath={`/tags`}
      ogType="website"
    >
      <section>
        <PageTitle>タグ一覧</PageTitle>
        <TagList>
          {tagList.map(tag => (
            <TagListItem key={tag.name}>
              <LinkComponent url={tag.url} color="black">
                {`${tag.name}(${tag.articleCount})`}
              </LinkComponent>
            </TagListItem>
          ))}
        </TagList>
      </section>
    </PageTemplate>
  );
};
export default TagListPage;

export const getStaticProps: GetStaticProps = async () => {
  const articleMetaData: ArticleMetaData[] = await getArticleMetaData();
  const tagCount = getTagCount(articleMetaData);
  const tagList: Tag[] = convertTagList(tagCount);
  return { props: { tagList } };
};
