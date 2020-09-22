import React from 'react';
import { graphql } from 'gatsby';
import { PageTemplate } from './PageTemplate';
import { MdPageDataQuery } from '../../types/graphql-types';
import styled from 'styled-components';
import media from 'styled-media-query';
import './MdArticleStyle.css';
import { TwitterShareButton } from '../components/TwitterShareButton';

type Props = {
  data: MdPageDataQuery;
};
const Article = styled.article``;
const TitleWrapper = styled.div`
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

export const MdTemplate: React.FC<Props> = ({ data: { markdownRemark } }) => {
  const { frontmatter, html } = markdownRemark ?? {};
  if (frontmatter == null || html == null) {
    return null;
  }
  return (
    <PageTemplate>
      <React.Fragment>
        <Article>
          <TitleWrapper>
            <ArticleTitle>{frontmatter.title}</ArticleTitle>
            <TitleSubWrapper>
              <ArticleDate>{frontmatter.date}</ArticleDate>
              <TwitterShareButton title={frontmatter.title} />
            </TitleSubWrapper>
          </TitleWrapper>
          <div id="mdArticle" dangerouslySetInnerHTML={{ __html: html }} />
        </Article>
      </React.Fragment>
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
