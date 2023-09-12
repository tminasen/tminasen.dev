import React from 'react';
import Script from 'next/script';
import Head from 'next/head';
import { Maybe, Optional } from '../../types/utility';
import { metaData } from '../constants/metaData';
import { OgType } from '../../types/mets';

type Props = {
  isEnableViewPort: boolean;
  ogpImage: Optional<string>;
  title: Maybe<string>;
  additionalMetaData: Optional<Array<{ name: string; content: string }>>;
  description: Optional<string>;
  canonicalPath: Optional<string>;
  ogType: OgType;
};

const ampAnalytics = () => {
  const json = JSON.stringify({
    vars: {
      gtag_id: 'UA-145135064-2',
      config: {
        'UA-145135064-2': { groups: 'default' },
      },
    },
  });
  return (
    // @ts-ignore
    <amp-analytics type="gtag" data-credentials="include">
      <script
        type="application/json"
        dangerouslySetInnerHTML={{ __html: json }}
      ></script>
      {/* @ts-ignore */}
    </amp-analytics>
  );
};

export const HeadComponent: React.FC<Props> = ({
  description,
  additionalMetaData,
  title,
  isEnableViewPort,
  canonicalPath,
  ogType,
  ogpImage,
}) => {
  const metaDescription = description || metaData.description;
  const metaTitle = title ? `${title} - ${metaData.title}` : metaData.title;
  const metaImage = ogpImage
    ? `${metaData.domain}${ogpImage}`
    : `${metaData.domain}${metaData.ogpImage}`;
  return (
    <>
      <Head>
        <Script
          async
          custom-element="amp-analytics"
          src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"
        ></Script>
        <title>{metaTitle}</title>
        {isEnableViewPort ? (
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0"
          />
        ) : null}
        <meta name="description" content={metaDescription} />
        <meta name="og:title" content={metaTitle} />
        <meta name="og:description" content={metaDescription} />
        <meta name="og:type" content={ogType} />
        <meta
          name="og:image"
          content={metaImage ?? `${metaData.domain}${metaData.ogpImage}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content={metaData.author} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta
          name="twitter:image"
          content={metaImage ?? `${metaData.domain}${metaData.ogpImage}`}
        />
        <link
          rel="canonical"
          href={`${metaData.domain}${canonicalPath ?? '/'}`}
        />
        {additionalMetaData
          ? additionalMetaData.map(item => (
              <meta name={item.name} content={item.content} />
            ))
          : null}
      </Head>
      {ampAnalytics()}
    </>
  );
};
