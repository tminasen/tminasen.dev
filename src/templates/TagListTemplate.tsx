import React from 'react';
import styled from 'styled-components';
import { graphql } from 'gatsby';
import { TagArticlesQuery } from '../../types/graphql-types';

type Props = {
  pageContext: {
    tagName: string;
  };
  data: TagArticlesQuery;
};
const Title = styled.h1``;

const getArticles = (
  nodes: TagArticlesQuery['allMarkdownRemark']['nodes'],
): JSX.Element | null => {
  const articleList = nodes
    .map(({ frontmatter, excerpt }): JSX.Element | null => {
      if (frontmatter?.path == null || frontmatter?.title == null) {
        return null;
      }
      const { path, title } = frontmatter;
      return (
        <li>
          <h1>
            <a href={path}>{title}</a>
          </h1>
          <span>{excerpt}</span>
        </li>
      );
    })
    .filter((element): element is JSX.Element => element !== null);
  if (articleList.length === 0) {
    return null;
  }
  return <ul>{articleList}</ul>;
};

export const TagListTemplate: React.FC<Props> = ({
  pageContext: { tagName },
  data: {
    allMarkdownRemark: { nodes },
  },
}) => {
  return (
    <div>
      <Title>{tagName}の記事一覧</Title>
      {getArticles(nodes)}
    </div>
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
        }
        excerpt(format: PLAIN, truncate: true, pruneLength: 100)
      }
    }
  }
`;
