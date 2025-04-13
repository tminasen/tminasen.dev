import React from 'react';
import Document, {
  Html,
  Main,
  Head,
  NextScript,
} from 'next/document';

export default class MyDocument extends Document {

  render() {
    return (
      <Html lang="ja">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
