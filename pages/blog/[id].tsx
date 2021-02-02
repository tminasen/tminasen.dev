import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getArticleMetaData } from '../../src/libraries/articles';
import { PageTemplate } from '../../src/templates/PageTemplate';
import { ArticleMetaData } from '../../types/article';
import { Optional } from '../../types/utility';
import styled from 'styled-components';
import { contentsBackgroundColor } from '../../src/styles/variable';
import media from 'styled-media-query';
import { TwitterShareButton } from '../../src/components/atoms/TwitterShareButton';
import { GithubArticleButton } from '../../src/components/atoms/GithubArticleButton';
import { MdTemplate } from '../../src/templates/MdTemplate';

export const config = { amp: true };

const Article = styled.article``;
const TitleWrapper = styled.div`
  background-color: ${contentsBackgroundColor.white};
  border-radius: 1rem;
  padding: 0.2rem 0.4rem;
  margin: 0 0 1.6rem 0;
`;
const TitleSubWrapper = styled.div`
  display: flex;
  align-items: center;
`;
const ArticleTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: bolder;
  margin: 0 0 0.8rem 0;
  ${media.lessThan('small')`
    font-size: 2rem;
  `}
`;
const ArticleDate = styled.time`
  font-size: 1.6rem;
  ${media.lessThan('small')`
    font-size: 1.2rem;
  `}
`;

interface Props {
  id: string;
  articleMetaData: ArticleMetaData[];
}

const articlePage = ({ id, articleMetaData }: Props) => {
  const targetMetaData: Optional<ArticleMetaData> = articleMetaData.filter(
    data => data.path === `/blog/${id}`,
  )[0];
  if (targetMetaData == null) {
    return null;
  }
  return (
    <PageTemplate title={targetMetaData.title} metaData={articleMetaData} isEnableViewPort={false} canonicalPath={articleMetaData[0]?.path}>
      <Article>
        <TitleWrapper>
          <ArticleTitle>{targetMetaData.title}</ArticleTitle>
          <TitleSubWrapper>
            <ArticleDate>{targetMetaData.date}</ArticleDate>
          </TitleSubWrapper>
        </TitleWrapper>
        <MdTemplate html={targetMetaData.html} />
        <TwitterShareButton
          title={targetMetaData.title}
          path={targetMetaData.path}
        />
        <GithubArticleButton path={targetMetaData.path} />
      </Article>
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
  const articleMetaData: ArticleMetaData[] = await getArticleMetaData();
  return { props: { id, articleMetaData } };
};
