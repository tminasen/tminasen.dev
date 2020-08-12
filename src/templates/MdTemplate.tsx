import React from 'react';
import { graphql } from 'gatsby';
import { PageTemplate } from './PageTemplate';
import { MdPageDataQuery } from '../../types/graphql-types';

type Props = {
  data: MdPageDataQuery;
};

export const MdTemplate: React.FC<Props> = ({ data: { markdownRemark } }) => {
  const { frontmatter, html } = markdownRemark ?? {};
  if (frontmatter == null || html == null) {
    return null;
  }
  return (
    <PageTemplate>
      <div className="blog-post-container">
        <div className="blog-post">
          <h1>{frontmatter.title}</h1>
          <h2>{frontmatter.date}</h2>
          <div
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default MdTemplate;

export const pageQuery = graphql`
  query MdPageData($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
      }
    }
  }
`;
