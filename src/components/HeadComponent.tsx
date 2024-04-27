import React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { Maybe, Optional } from '../../types/utility';
import { metaData } from '../constants/metaData';
import { OgType } from '../../types/mets';

type Props = {
  ogpImage: Optional<string>;
  title: Maybe<string>;
  additionalMetaData: Optional<Array<{ name: string; content: string }>>;
  description: Optional<string>;
  canonicalPath: Optional<string>;
  ogType: OgType;
};

export const HeadComponent: React.FC<Props> = ({
  description,
  additionalMetaData,
  title,
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
        <title>{metaTitle}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0"
        />
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
        {/* Google tag (gtag.js) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L82JQBNL8M');
            `,
          }}
        />
      </Head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-L82JQBNL8M"
        strategy="afterInteractive"
      />
    </>
  );
};
