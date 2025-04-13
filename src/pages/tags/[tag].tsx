import { JSX } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { PageTemplate } from '../../templates/PageTemplate';
import { getArticleMetaData } from '../../libraries/articles';
import { ArticleMetaData } from '../../../types/article';
import { LinkComponent } from '../../components/atoms/LinkComponent';
import { Image } from '../../components/atoms/ImageComponent';

interface Props {
  tagName: string;
  articleMetaDataList: ArticleMetaData[];
}

const getArticles = (
  tagName: string,
  articleMetaDataList: ArticleMetaData[],
): JSX.Element | null => {
  const articleList = articleMetaDataList
    .filter(data => data.tag.includes(tagName))
    .map((data): JSX.Element | null => {
      const tagList = data.tag.map(tag => (
        <li className='mr-1.5' key={`/tags/${tag}`}>
          <LinkComponent url={`/tags/${tag}`} color="black">
            {tag}
          </LinkComponent>
        </li>
      ));

      return (
        <li className='basis-full' key={`${data.path}`}>
          <section>
            <div className='flex flex-col justify-around h-20 py-1 px-5 bg-slate-400'>
              <LinkComponent url={data.path} color="black">
                <h1 className='text-xl sm:text-2xl'>{data.title}</h1>
              </LinkComponent>
              <time className='text-xs sm:text-base'>{data.date}</time>
              {tagList.length !== 0 ? (
                <ul className='flex text-xs sm:text-base -my-0.5'>{tagList}</ul>
              ) : null}
            </div>
            <div className='flex h-25 bg-slate-100'>
              <Image
                imageSrc={data.thumbnailImage.url}
                isRounded={false}
                alt={data.title}
                width={{ pc: 150, sp: 150 }}
                height={{ pc: 100, sp: 100 }}
              />
              <p className='text-base sm:text-xl p-2'>
                <LinkComponent url={data.path} color="black">
                  {data.description}
                </LinkComponent>
              </p>
            </div>
          </section>
        </li>
      );
    })
    .filter((element): element is JSX.Element => element !== null);
  if (articleList.length === 0) {
    return null;
  }
  return <ul className='flex flex-wrap gap-y-2'>{articleList}</ul>;
};

const tagPage: React.FC<Props> = ({ tagName, articleMetaDataList }) => {
  return (
    <PageTemplate>
      <article className='text-(--color-text-base)'>
        <h1 className='text-2xl sm:text-3xl mb-4'>{tagName}の記事一覧</h1>
        {getArticles(tagName, articleMetaDataList)}
      </article>
    </PageTemplate>
  );
};
export default tagPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const metaData = await getArticleMetaData();
  const tagList: string[] = metaData
    .map(data => data.tag)
    .reduce((pre, cur) => [...pre, ...cur], []);
  const paths: string[] = Array.from(new Set(tagList)).map(
    tag => `/tags/${tag}`,
  );
  return { paths, fallback: false };
};
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tagName = params?.tag;
  if (tagName == null || Array.isArray(tagName)) {
    return { props: { tagName: null, articleMetaData: [] } };
  }
  const articleMetaDataList: ArticleMetaData[] = await getArticleMetaData();
  return {
    props: {
      tagName,
      articleMetaDataList,
      title: `${tagName}の記事一覧`,
      ogType: 'website',
      path: `/tags/${tagName}`,
    },
  };
};
