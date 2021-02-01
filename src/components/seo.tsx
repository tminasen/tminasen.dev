import React from 'react';
import Head from 'next/head';
import { Maybe, Optional } from '../../types/utility';
import { metaData } from '../constants/metaData';

type Props = {
  title: Maybe<string>;
  meta: Optional<Array<{ name: string; content: string }>>;
  description: Optional<string>;
  isEnableViewPort: boolean;
};

const SEO: React.FC<Props> = ({ description, meta, title, isEnableViewPort }) => {
  const metaDescription = description || metaData.description;
  const metaTitle = title ? `${title} - ${metaData.title}` : metaData.title;
  return (
    <Head>
      <title>{metaTitle}</title>
      {isEnableViewPort ? <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0"
      /> : null}
      <meta name="description" content={metaDescription} />
      <meta name="og:title" content={metaTitle} />
      <meta name="og:description" content={metaDescription} />
      <meta name="og:type" content="website" />
      <meta
        name="og:image"
        content={`${metaData.domain}${metaData.ogpImage}`}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={metaData.author} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta
        name="twitter:image"
        content={`${metaData.domain}${metaData.ogpImage}`}
      />
      {meta
        ? meta.map(item => <meta name={item.name} content={item.content} />)
        : null}
    </Head>
  );
};

export default SEO;
