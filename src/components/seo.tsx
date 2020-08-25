import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Helmet } from 'react-helmet';

type Props = {
  title: string;
  meta?: Array<{ name: string; content: string }>;
  description?: string;
};

const SEO: React.FC<Props> = ({ description, meta, title }) => {
  const { site, imageSharp } = useStaticQuery(
    graphql`
      query SEOData {
        site {
          siteMetadata {
            title
            description
            author
            domain
          }
        }
        imageSharp(fluid: { originalName: { eq: "ogp.png" } }) {
          fluid {
            originalImg
          }
        }
      }
    `,
  );
  const metaDescription = description || site.siteMetadata.description;
  const metaTitle = title || site.siteMetadata.title;
  return (
    <Helmet
      htmlAttributes={{ lang: 'ja' }}
      title={metaTitle}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: metaTitle,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          property: `og:image`,
          content: `${site.siteMetadata.domain}${imageSharp.fluid.originalImg}`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.author,
        },
        {
          name: `twitter:title`,
          content: metaTitle,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
        {
          name: `twitter:image`,
          content: `${site.siteMetadata.domain}${imageSharp.fluid.originalImg}`,
        },
      ].concat(meta || [])}
    />
  );
};

export default SEO;
