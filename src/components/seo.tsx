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
          name: `viewport`,
          content:
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0',
        },
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
          content: `summary_large_image`,
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
    >
      <script
        async
        src="https://platform.twitter.com/widgets.js"
        charSet="utf-8"
      />
    </Helmet>
  );
};

export default SEO;
