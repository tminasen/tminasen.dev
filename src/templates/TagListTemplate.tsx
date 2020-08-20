import React from 'react';
import styled from 'styled-components';
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
`;
const ArticleTitleWrapper = styled.div`
  background-color: #b0bec5;
  height: 8rem;
  padding: 0.8rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;
const ArticleDate = styled.time`
  font-size: 1.6rem;
`;
const TitleTagList = styled.ul`
  display: flex;
  font-size: 1.6rem;
`;
const TitleTagListItem = styled.li`
  margin-right: 0.5rem;
`;
const ArticleDescription = styled.p`
  font-size: 2rem;
`;
const DescriptionWrapper = styled.div`
  background-color: #eceff1;
  height: 10rem;
`;
const ArticleReadMore = styled.div`
  bottom: 0;
  right: 0;
`;
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
        frontmatter?.tag == null
      ) {
        return null;
      }
      const { path, title, date, tag } = frontmatter;
      const tagList =
        tag
          ?.filter((t): t is string => !!t)
          .map(t => (
            <TitleTagListItem>
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
              <ArticleDescription>{excerpt}</ArticleDescription>
              <ArticleReadMore>
                <Link to={path} style={LinkStyle}>
                  続きを読む……
                </Link>
              </ArticleReadMore>
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
        }
        excerpt(format: PLAIN, truncate: true, pruneLength: 100)
      }
    }
  }
`;
