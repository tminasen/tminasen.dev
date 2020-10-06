import React from 'react';
import styled from 'styled-components';
import media from 'styled-media-query';
import { graphql, Link } from 'gatsby';
import { TagArticlesQuery } from '../../types/graphql-types';
import { PageTemplate } from './PageTemplate';
import { fontColor } from '../styles/variable';

type Props = {
  pageContext: {
    tagName: string;
  };
  data: TagArticlesQuery;
};
const PageTitle = styled.h1`
  color: ${fontColor.black};
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
  color: ${fontColor.black};
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
const ArticleImage = styled.img``;
const LinkStyle: React.CSSProperties = {
  display: 'inline-block',
  color: fontColor.black,
  textDecoration: 'none',
};

const getArticles = (
  nodes: TagArticlesQuery['allMarkdownRemark']['nodes'],
): JSX.Element | null => {
  const articleList = nodes
    .map(({ frontmatter, excerpt }): JSX.Element | null => {
      if (
        frontmatter?.path == null ||
        frontmatter?.title == null ||
        frontmatter?.date == null ||
        frontmatter.thumbnailImage?.publicURL == undefined ||
        frontmatter?.tag == null
      ) {
        return null;
      }
      const { path, title, date, tag } = frontmatter;
      const tagList =
        tag
          ?.filter((t): t is string => !!t)
          .map(t => (
            <TitleTagListItem key={`/tags/${t}`}>
              <Link to={`/tags/${t}`} style={LinkStyle}>
                {t}
              </Link>
            </TitleTagListItem>
          )) ?? [];

      return (
        <ArticleListItem key={`${path}`}>
          <ArticleWrapper>
            <ArticleTitleWrapper>
              <Link to={path} style={LinkStyle}>
                <ArticleTitle>{title}</ArticleTitle>
              </Link>
              <ArticleDate>{date}</ArticleDate>
              {tagList.length !== 0 ? (
                <TitleTagList>{tagList}</TitleTagList>
              ) : null}
            </ArticleTitleWrapper>
            <DescriptionWrapper>
              <ArticleImage
                src={frontmatter.thumbnailImage?.publicURL}
                width="150px"
                height="100px"
              />
              <ArticleDescription>
                <Link to={path} style={LinkStyle}>
                  {excerpt}
                </Link>
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

export const TagListTemplate: React.FC<Props> = ({
  pageContext: { tagName },
  data: {
    allMarkdownRemark: { nodes },
  },
}) => {
  return (
    <PageTemplate>
      <article>
        <PageTitle>{tagName}の記事一覧</PageTitle>
        {getArticles(nodes)}
      </article>
    </PageTemplate>
  );
};

export default TagListTemplate;

export const articleData = graphql`
  query TagArticles($tagName: String) {
    allMarkdownRemark(
      filter: { frontmatter: { tag: { eq: $tagName } } }
      sort: { fields: frontmatter___date, order: DESC }
    ) {
      nodes {
        frontmatter {
          path
          title
          date
          tag
          thumbnailImage {
            publicURL
          }
        }
        excerpt(format: PLAIN, truncate: true, pruneLength: 150)
      }
    }
  }
`;
