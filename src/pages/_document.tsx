import React from 'react';
import Document, {
  DocumentContext,
  Html,
  Main,
  Head,
  NextScript,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';
// @ts-ignore
import css from '!!raw-loader!../index.css';
// @ts-ignore
import prismCss from '!!raw-loader!../styles/highlight/prism.css';
import { DocumentInitialProps } from 'next/dist/shared/lib/utils';

export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [
          ...React.Children.toArray(initialProps.styles),
          <style
            key="custom"
            dangerouslySetInnerHTML={{
              __html: `${css}\n${prismCss}`,
            }}
          />,
          ...sheet.getStyleElement(),
        ],
      };
    } finally {
      sheet.seal();
    }
  }

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
