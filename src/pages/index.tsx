import React from 'react';
import { graphql, Link } from 'gatsby';

import { PageTemplate } from '../templates/PageTemplate';
import { IndexPageQuery } from '../../types/graphql-types';
import styled from 'styled-components';
import media from 'styled-media-query';

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: bold;
  ${media.lessThan('small')`
    font-size: 2rem;
  `}
`;
const Ul = styled.ul`
  font-size: 1.6rem;
`;
const ArticleWrapper = styled.article`
  width: 100%;
`;

type Props = {
  data: IndexPageQuery;
};

const createArticle = (
  articleData: IndexPageQuery['allMarkdownRemark']['nodes'],
) => {
  const linkItems = articleData
    .map(item => {
      const frontmatter = item.frontmatter;
      if (frontmatter?.path == undefined || frontmatter?.title == undefined) {
        return undefined;
      }
      return (
        <li key={`${frontmatter.title}:${frontmatter.path}`}>
          <Link to={frontmatter.path}>{frontmatter.title}</Link>
        </li>
      );
    })
    .filter((item): item is JSX.Element => item !== undefined);
  if (linkItems.length === 0) {
    return null;
  }
  return <Ul>{linkItems}</Ul>;
};

const IndexPage: React.FC<Props> = ({ data }) => {
  const articles = createArticle(data.allMarkdownRemark.nodes);
  return (
    <PageTemplate>
      <ArticleWrapper>
        <Title>記事一覧</Title>
        {articles}
      </ArticleWrapper>
    </PageTemplate>
  );
};

export default IndexPage;

export const pageQuery = graphql`
  query IndexPage {
    allMarkdownRemark(sort: { order: DESC, fields: frontmatter___date }) {
      nodes {
        frontmatter {
          path
          tag
          title
        }
      }
    }
  }
`;
