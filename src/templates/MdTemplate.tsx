import React from 'react';
import { graphql } from 'gatsby';
import { PageTemplate } from './PageTemplate';
import { MdPageDataQuery } from '../../types/graphql-types';
import styled from 'styled-components';
import './MdArticleStyle.css';

type Props = {
  data: MdPageDataQuery;
};
const Article = styled.article``;
const TitleWrapper = styled.div`
  margin: 0 0 1.6rem 0;
`;
const ArticleTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: bolder;
  margin: 0 0 0.8rem 0;
`;
const ArticleDate = styled.time`
  font-size: 1.6rem;
`;

export const MdTemplate: React.FC<Props> = ({ data: { markdownRemark } }) => {
  const { frontmatter, html } = markdownRemark ?? {};
  if (frontmatter == null || html == null) {
    return null;
  }
  return (
    <PageTemplate>
      <Article>
        <TitleWrapper>
          <ArticleTitle>{frontmatter.title}</ArticleTitle>
          <ArticleDate>{frontmatter.date}</ArticleDate>
        </TitleWrapper>
        <div id="mdArticle" dangerouslySetInnerHTML={{ __html: html }} />
      </Article>
    </PageTemplate>
  );
};

export default MdTemplate;

export const pageQuery = graphql`
  query MdPageData($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date
        path
        title
      }
    }
  }
`;
