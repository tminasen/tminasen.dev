import React from 'react';
import '../index.css';
import '../styles/highlight/shiki.css';
import { AppProps } from 'next/app';
import { HeadComponent } from '../components/HeadComponent';

export default function MyApp({ Component, pageProps }: AppProps) {
  const hasCanonical = Boolean(pageProps.articleMetaData?.path || pageProps.path);
  return (
    <>
      {hasCanonical && (
        <HeadComponent
          title={pageProps.articleMetaData?.title || pageProps.title}
          ogpImage={pageProps.articleMetaData?.ogpImage}
          additionalMetaData={undefined}
          description={undefined}
          canonicalPath={pageProps.articleMetaData?.path || pageProps.path}
          ogType={pageProps.ogType}
        />
      )}
      <Component {...pageProps} />
    </>
  );
}
