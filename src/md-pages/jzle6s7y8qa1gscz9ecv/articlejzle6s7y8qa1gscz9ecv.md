---
path: "/blog/jzle6s7y8qa1gscz9ecv"
date: "2021/02/04"
title: "markdown内の画像をamp-img対応メモ"
tag: ["TypeScript"]
thumbnailImage: "/images/ogp.png"
---

# はじめに
Next.jsでブログを作ってた今日このごろ。  
markdownからhtmlを生成するブログでamp対応したかったのだが、  
markdown内画像がimgタグに変換されてしまうのでamp-imgに変換する対応をした話。

# TL:DR.
[コード](https://gist.github.com/Tetsuya-Minase/bb293590e6b26d0ae3452658d47e47a2)

# markdownをhtmlに変換する
markdownをhtmlに変換するのにremarkを使う。  
これは[unified](https://github.com/unifiedjs/unified)というシステムの関連でmarkdownのテキストを解析して良い感じに変換できる。  
この辺のシステム関連についてはこちらの[サイト](https://vivliostyle.github.io/vivliostyle_doc/ja/vivliostyle-user-group-vol2/spring-raining/index.html)が参考になった。

[remark-rehype](https://github.com/remarkjs/remark-rehype)のREADMEを参考にmarkdownをhtmlに変換するところまで実装してみる。

```tsx
import unified from 'unified';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import html from 'rehype-stringify';

async function markdown2html(markdownText: string) {
  const processedContent = await unified()
      // markdownを解析
      .use(remarkParse)
      // rehypeに変換
      .use(remark2rehype)
      // 構造化されているデータをhtmlに変換
      .use(html)
      .process(markdownText);
  return processedContent.toString();
}
```

# markdown内の画像をamp対応する
useに渡す関数を作成し、その中で`img`タグを`amp-img`タグに置き換えていく。  
[こちらの記事](https://dev.classmethod.jp/articles/2020-04-15-conv-html-use-rehype/)を参考に実装する。

```tsx
function imageToAmpImage() {
	// node, vfile, doneを受け取る関数を返す
  return function(node: any, vfile: any, done: any) {
		// node.childrenに↓の様なhtmlタグの要素が入っているのでこれを書き換える
		// {
    //    type: 'element',
    //    tagName: 'h1',
    //    properties: {},
    //    children: [Array],
    //    position: [Object]
    // }
    const children = node.children.map((child: any) => {
      // 画像はpタグ配下に出力されるのでpタグのみ対応
      if (child.type === 'element' && child.tagName === 'p') {
				// imgタグのみ取り出し
        const image = child.children.find((c: any) => c.type === 'element' && c.tagName === 'img');
        // 無ければ次
				if (!image) {
          return child;
        }
				
				// imgタグのsrc属性の値取得
        const imagePath = image.properties.src;
				// imgタグのalt属性の値取得
        const imageAlt = image.properties.alt;

        // 既存の画像をamp-imgに置き換え
        const fallbackImage = {
					// 変換しないプロパティはすでにあるものをそのまま使う
          ...image,
					// タグ名をamp-imgに変える。これでimgタグではなくamp-imgになる
          tagName: 'amp-img',
					// amp-imgタグで必要な要素を追加
          properties: {
            ...image.properties,
						// widthとheightが必要なので追加
            width: 800,
            height: 450,
						// 画面幅によって崩れてしまうので800pxある時に表示
            media: '(min-width: 800px)',
						// 後述するが基本はwebp画像を使いたいため、fallback属性を指定する
						fallback: true
          }
        };
				// 小さい画面サイズ用の設定
        const fallbackImageSp = {
          ...image,
          tagName: 'amp-img',
          properties: {
            ...image.properties,
            width: 320,
            height: 180,
						// 画面幅が450px以下のときに表示する
            media: '(max-width: 450px)',
						fallback: true
          }
        };
        // webp画像を用意しているので、webp用のamp-img作成
        const webpImage = {
          type: 'element',
          tagName: 'amp-img',
					// amp-imgのフォールバック属性を指定したamp-imgタグを子要素に持たせる
          children: [fallbackImage],
          properties: {
						// markdown中では拡張子はpngで記載されているので拡張子を変更
            src: image.properties.src.replace(/\.png$/, '.webp'),
            alt: imageAlt,
            width: 800,
            height: 450,
            media: '(min-width: 800px)'
          }
        };  
        const webpImageSp = {
          type: 'element',
          tagName: 'amp-img',
          children: [fallbackImageSp],
          properties: {
            src: image.properties.src.replace(/\.png$/, '.webp'),
            alt: imageAlt,
            width: 320,
            height: 180,
            media: '(max-width: 450px)'
          }
        };
        // webp込のデータ使うので今あるimgは削除して変わりに入れる
        child.children = [...child.children.filter((c:any) => c.type !== 'element' && c.tagName !== 'img'), webpImage, webpImageSp];
      }
      return child;
    });
		// 書き換えた要素で上書きする。これでhtmlの内容を変更する
    node.children = children;
    done();
  }
}
```

# まとめ
今回はmarkdownをhtmlに変換する際に`img`タグを`amp-img`タグに変える対応をした。  
だいぶ泥臭い対応になったけど、意外と簡単にできることがわかってよかった。  
ホントならtsで書いているので型を守りたいとこだったが、unifiedの型定義に合わせた型パズルが上手く行かなかったので一旦諦めている。  
やるなら多分自分で型定義を用意してあげたほうが早そう。
雑に調べてヒットしなかったで自力で実装することにしたけどもしかしたら先人がいるかも知れない。  
それでは今回はこの辺で。

# 参考リンク
- [unifiedjs/unified: ☔️ interface for parsing, inspecting, transforming, and serializing content through syntax trees](https://github.com/unifiedjs/unified)
- [remarkjs/remark\-rehype: plugin to transform from Markdown \(remark\) to HTML \(rehype\)](https://github.com/remarkjs/remark-rehype)
- [Remark で広げる Markdown の世界](https://vivliostyle.github.io/vivliostyle_doc/ja/vivliostyle-user-group-vol2/spring-raining/index.html)
- [rehypeを使ってHTMLを書き換える | Developers.IO](https://dev.classmethod.jp/articles/2020-04-15-conv-html-use-rehype/)