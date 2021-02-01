import Document, { DocumentContext, Html, Main, Head, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
// @ts-ignore
import css from '!!raw-loader!../src/index.css';
// @ts-ignore
import prismCss from "!!raw-loader!../src/styles/highlight/prism.css";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
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
        styles: (
          <>
            {initialProps.styles}
            <style
              key="custom"
              dangerouslySetInnerHTML={{
                __html: `${css}\n${prismCss}`,
              }}
            />
            {sheet.getStyleElement()}
          </>
        ),
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
