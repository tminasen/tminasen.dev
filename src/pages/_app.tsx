import React from 'react';
import '../index.css';
import '../styles/highlight/prism.css';
import { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
