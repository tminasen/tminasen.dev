import React from 'react';
import { PageTemplate } from '../../templates/PageTemplate';
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

const TagListPage: React.FC<Props> = ({ tagList }) => {
  return (
    <PageTemplate>
      <section>
        <h1 className='text-(--color-text-base) text-2xl sm:text-3xl mb-4'>タグ一覧</h1>
        <ul className='text-base ml-4 space-y-1'>
          {tagList.map(tag => (
            <li key={tag.name}>
              <LinkComponent url={tag.url} color="black">
                {`${tag.name}(${tag.articleCount})`}
              </LinkComponent>
            </li>
          ))}
        </ul>
      </section>
    </PageTemplate>
  );
};
export default TagListPage;

export const getStaticProps: GetStaticProps = async () => {
  const articleMetaData: ArticleMetaData[] = await getArticleMetaData();
  const tagCount = getTagCount(articleMetaData);
  const tagList: Tag[] = convertTagList(tagCount);
  return {
    props: { tagList, title: 'タグ一覧', ogType: 'website', path: '/tags' },
  };
};
