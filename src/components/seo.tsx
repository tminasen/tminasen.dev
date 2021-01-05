import React from 'react';
import { Helmet } from 'react-helmet';
import { Maybe, Optional } from '../../types/utility';
import { metaData } from '../constants/metaData';

type Props = {
  title: Maybe<string>;
  meta: Optional<Array<{ name: string; content: string }>>;
  description: Optional<string>;
};

const SEO: React.FC<Props> = ({ description, meta, title }) => {
  const metaDescription = description || metaData.description;
  const metaTitle = title ? `${title} - ${metaData.title}` : metaData.title;
  return (
    <Helmet
      htmlAttributes={{ lang: 'ja' }}
      title={metaTitle}
      meta={[
        {
          name: `viewport`,
          content:
            'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0',
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
          content: `${metaData.domain}${metaData.ogpImage}`,
        },
        {
          name: `twitter:card`,
          content: `summary_large_image`,
        },
        {
          name: `twitter:creator`,
          content: metaData.author,
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
          content: `${metaData.domain}${metaData.ogpImage}`,
        },
      ].concat(meta || [])}
    />
  );
};

export default SEO;
