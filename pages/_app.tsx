import React from 'react';
import '../src/index.css';
import '../src/styles/highlight/prism.css';
import { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
