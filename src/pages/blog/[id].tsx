import { JSX } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getArticleMetaData } from '../../libraries/articles';
import { PageTemplate } from '../../templates/PageTemplate';
import { ArticleMetaData } from '../../../types/article';
import { Optional } from '../../../types/utility';
import { XShareButton } from '../../components/atoms/XShareButton';
import { GithubArticleButton } from '../../components/atoms/GithubArticleButton';
import { MdTemplate } from '../../templates/MdTemplate';
import { LinkComponent } from '../../components/atoms/LinkComponent';

interface Props {
  id: string;
  ogType: string;
  articleMetaData: ArticleMetaData;
}

const TagLink = ({ tag }: { tag: string }): JSX.Element => {
  return (
    <li key={tag} className='border border-solid border-black rounded-4xl text-base leading-[1.5] px-2'>
      <LinkComponent url={`/tags/${tag}`} color="black">
        {tag}
      </LinkComponent>
    </li>
  );
};

const articlePage = ({ id, articleMetaData }: Props) => {
  return (
    <PageTemplate>
      <article className='max-w-93 sm:max-w-5xl flex flex-col mx-auto'>
        <div className='bg-white rounded-sm px-3 sm:px-4 py-1'>
          <h1 className='text-2xl sm:text-3xl font-bold leading-[1.5] text-(--color-text-base)'>{articleMetaData.title}</h1>
          <ul className='flex items-center mt-2 space-x-1'>
            {articleMetaData.tag.map(t => (
              <TagLink tag={t} />
            ))}
          </ul>
          <time className='block mt-1 text-base leading-[1.5]'>{articleMetaData.date}</time>
        </div>
        <MdTemplate html={articleMetaData.html} />
        <div className='flex mt-2 content-center items-center gap-x-2'>
          <XShareButton
            title={articleMetaData.title}
            path={articleMetaData.path}
          />
          <GithubArticleButton path={articleMetaData.path} />
        </div>
      </article>
    </PageTemplate>
  );
};

export default articlePage;

export const getStaticPaths: GetStaticPaths = async () => {
  const metaData = await getArticleMetaData();
  const paths: string[] = metaData.map(data => data.path);
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id;
  if (id == null || Array.isArray(id)) {
    return { props: { id: null } };
  }
  const articleMetaDataList: ArticleMetaData[] = await getArticleMetaData();
  const targetMetaData: Optional<ArticleMetaData> = articleMetaDataList.filter(
    data => data.path === `/blog/${id}`,
  )[0];
  if (targetMetaData == null) {
    return { props: { id: null } };
  }
  return {
    props: {
      id,
      ogType: 'article',
      articleMetaData: targetMetaData,
    },
  };
};
