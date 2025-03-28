import { JSX } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import styled from 'styled-components';
import { color } from '../../styles/variable';
import media from 'styled-media-query';
import { PageTemplate } from '../../templates/PageTemplate';
import { getArticleMetaData } from '../../libraries/articles';
import { ArticleMetaData } from '../../../types/article';
import { LinkComponent } from '../../components/atoms/LinkComponent';
import { Image } from '../../components/atoms/ImageComponent';

interface Props {
  tagName: string;
  articleMetaDataList: ArticleMetaData[];
}

const PageTitle = styled.h1`
  color: ${color.textBlack};
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
  ${media.lessThan('small')`
    font-size:2rem;
  `}
`;
const ArticleList = styled.ul`
  display: flex;
  flex-wrap: wrap;
`;
const ArticleListItem = styled.li`
  flex-basis: 100%;
  margin-bottom: 2rem;
`;
const ArticleWrapper = styled.section`
  color: ${color.textBlack};
`;
const ArticleTitle = styled.h1`
  font-size: 2.4rem;
  ${media.lessThan('small')`
    font-size: 2rem;
  `}
`;
const ArticleTitleWrapper = styled.div`
  background-color: #b0bec5;
  height: 8rem;
  padding: 0.4rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;
const ArticleDate = styled.time`
  font-size: 1.6rem;
  ${media.lessThan('small')`
    font-size: 1.2rem;
  `}
`;
const TitleTagList = styled.ul`
  display: flex;
  font-size: 1.6rem;
  /** 上下の間が広いので減らしておく */
  margin: -0.2rem 0;
  ${media.lessThan('small')`
    font-size: 1.2rem;
  `}
`;
const TitleTagListItem = styled.li`
  margin-right: 0.5rem;
`;
const ArticleDescription = styled.p`
  font-size: 2rem;
  padding: 8px;
  ${media.lessThan('small')`
    font-size: 1.6rem;
  `}
`;
const DescriptionWrapper = styled.div`
  background-color: #eceff1;
  height: 10rem;
  display: flex;
`;

const getArticles = (
  tagName: string,
  articleMetaDataList: ArticleMetaData[],
): JSX.Element | null => {
  const articleList = articleMetaDataList
    .filter(data => data.tag.includes(tagName))
    .map((data): JSX.Element | null => {
      const tagList = data.tag.map(tag => (
        <TitleTagListItem key={`/tags/${tag}`}>
          <LinkComponent url={`/tags/${tag}`} color="black">
            {tag}
          </LinkComponent>
        </TitleTagListItem>
      ));

      return (
        <ArticleListItem key={`${data.path}`}>
          <ArticleWrapper>
            <ArticleTitleWrapper>
              <LinkComponent url={data.path} color="black">
                <ArticleTitle>{data.title}</ArticleTitle>
              </LinkComponent>
              <ArticleDate>{data.date}</ArticleDate>
              {tagList.length !== 0 ? (
                <TitleTagList>{tagList}</TitleTagList>
              ) : null}
            </ArticleTitleWrapper>
            <DescriptionWrapper>
              <Image
                imageSrc={data.thumbnailImage.url}
                isRounded={false}
                alt={data.title}
                width={{ pc: 150, sp: 150 }}
                height={{ pc: 100, sp: 100 }}
              />
              <ArticleDescription>
                <LinkComponent url={data.path} color="black">
                  {data.description}
                </LinkComponent>
              </ArticleDescription>
            </DescriptionWrapper>
          </ArticleWrapper>
        </ArticleListItem>
      );
    })
    .filter((element): element is JSX.Element => element !== null);
  if (articleList.length === 0) {
    return null;
  }
  return <ArticleList>{articleList}</ArticleList>;
};

const tagPage: React.FC<Props> = ({ tagName, articleMetaDataList }) => {
  return (
    <PageTemplate>
      <article>
        <PageTitle>{tagName}の記事一覧</PageTitle>
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
