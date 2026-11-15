import React from 'react';
import { PageTemplate } from '../../templates/PageTemplate';
import { GetStaticProps } from 'next';
import { ArticleMetaData, Tag } from '../../types/article';
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
      <section className='mx-auto w-full max-w-[760px] px-4 sm:px-0'>
        <h1 className='text-(--color-text-base) text-2xl sm:text-[28px] font-bold sm:leading-[1.4] mb-6'>タグ一覧</h1>
        <ul className='flex flex-wrap gap-2 text-sm'>
          {tagList.map(tag => (
            <li
              key={tag.name}
              className='flex *:flex *:min-h-8 *:items-center *:px-3 *:py-1 border border-solid border-(--color-border) rounded-full bg-(--color-bg-card) leading-[1.5]'
            >
              <LinkComponent url={tag.url} color="black">
                {`${tag.name} ${tag.articleCount}`}
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
