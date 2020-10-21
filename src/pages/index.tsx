import React from 'react';
import { graphql } from 'gatsby';

import { PageTemplate } from '../templates/PageTemplate';
import { IndexPageQuery } from '../../types/graphql-types';
import styled from 'styled-components';
import media from 'styled-media-query';
import { CardComponent } from '../components/CardComponent';

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: bold;
  ${media.lessThan('small')`
    font-size: 2rem;
  `}
`;
const ArticleCardList = styled.ul`
  font-size: 1.6rem;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  ${media.lessThan('small')`
    justify-content: center;
  `}
`;
const CardWrapper = styled.li`
  margin: 12px 20px 0 0;
  ${media.lessThan('small')`
    margin: 12px 0 0 0;
  `}
`;
const Article = styled.article``;

type Props = {
  data: IndexPageQuery;
};

const createArticle = (
  articleData: IndexPageQuery['allMarkdownRemark']['nodes'],
) => {
  const linkItems = articleData
    .map(item => {
      const frontmatter = item.frontmatter;
      const excerpt = item.excerpt;
      if (
        frontmatter?.path == undefined ||
        frontmatter?.title == undefined ||
        frontmatter.thumbnailImage?.childImageSharp?.fluid == undefined ||
        excerpt == undefined
      ) {
        return undefined;
      }
      return (
        <CardWrapper key={`${frontmatter.title}:${frontmatter.path}`}>
          <CardComponent
            title={frontmatter.title}
            path={frontmatter.path}
            image={frontmatter.thumbnailImage?.childImageSharp?.fluid}
            excerpt={excerpt}
          />
        </CardWrapper>
      );
    })
    .filter((item): item is JSX.Element => item !== undefined);
  if (linkItems.length === 0) {
    return null;
  }
  return <ArticleCardList>{linkItems}</ArticleCardList>;
};

const IndexPage: React.FC<Props> = ({ data }) => {
  const articles = createArticle(data.allMarkdownRemark.nodes);
  return (
    <PageTemplate title={undefined}>
      <Article>
        <Title>記事一覧</Title>
        {articles}
      </Article>
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
          thumbnailImage {
            childImageSharp {
              fluid(maxWidth: 300) {
                src
                aspectRatio
                srcSet
                sizes
              }
            }
          }
        }
        excerpt(format: PLAIN, truncate: true, pruneLength: 130)
      }
    }
  }
`;
