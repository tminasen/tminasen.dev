---
path: "/blog/c8nsbkvrndwzjdapcetj"
date: "2020/11/13"
title: "Next.js事始め"
tag: ["Next.js", "React"]
ogpImage: "/images/article/c8nsbkvrndwzjdapcetj/ogp.png"
thumbnailImage: "/images/article/c8nsbkvrndwzjdapcetj/ssc8nsbkvrndwzjdapcetj.png"
---

# はじめに

ずっと触ろうと思って触っていなかったNextを触ってみる。
今回は基本チュートリアルに沿って進めいく。

# TL;DR.

[ソースコード](https://github.com/Tetsuya-Minase/program-samples/tree/master/next-sample)

# テンプレ作成

CLIで作成。

```bash
$ npx create-next-app next-sample
```

`yarn dev`で起動。テンプレのページが表示されればOK。

# ページを追加する

Next.jsのページはpagesディレクトリ配下のexportされているReactComponentが対象となる。  
※パスはファイル名がそのまま使われる。

```bash
# ファイルを追加してみる
$ mkdir pages/posts
$ touch first-post.js
```

```jsx
// 関数名は何でも良いけど、default exportする必要がある
export default function FirstPost() {
  return <h1>First Post</h1>
}
```

アプリケーション起動後、`localhost:3000/posts/first-post`にアクセスできて表示されればOK。
![ssc8nsbkvrndwzjdapcetj.png](/images/article/c8nsbkvrndwzjdapcetj/ssc8nsbkvrndwzjdapcetj.png)

# リンク作成

SPAの様にアプリケーションのみで遷移するようなリンクを作るには、  
Next.jsに用意されている`Link`コンポーネントを使う。

index.jsとfirst-post.jsを`Link`を使うように修正してみる。

```jsx
// index.js
import Link from 'next/link';

export default function Home() {
  return (
    // main直下のh1を修正する
    <h1>
      Read <Link href="/posts/first-post"><a>this page!</a></Link>
    </h1>
  );
}
```

```jsx
// first-post.js
import Link from 'next/link';

export default function FirstPost() {
  return (
    <>
      <h1>First Post</h1>
      <p><Link href="/"><a>Back to home</a></Link></p>
    </>);
}
```

アプリケーションを起動し、遷移できること。サーバーを落としても移動できることが確認できればOK。
※ただの`<a>`タグを使うとサーバーにリクエストが飛ぶので、サーバー落とすとアクセスできなくなる。

# ページ毎にheadの内容を変えたい場合

`<title>`タグなどページ毎に変えたい`<head>`タグ内の要素がある場合は、  
Next.jsが用意している`<Head>`コンポーネントを使うようにする。

```jsx
// first-post.js
import Head from 'next/head';

export default function FirstPost() {
  return (
    <>
      <Head>
        <title>First Post</title>
      </Head>

      <h1>First Post</h1>
      <p><Link href="/"><a>Back to home</a></Link></p>
    </>);
}
```

こうすることで、タイトル部分がページ毎に変わるようになる。

# SSRとSSGを試してみる

Next.jsではデフォルトの挙動がSSRとなっているが、SSGもすることができる。  
せっかくなのでSSGの方も試してみる。

SSGにするかSSRにするかは`getStaticProps`をexportするか、`getServerSideProps`をexportするかで決まる。  
`getStaticProps`をexportするとSSGになり、`getServerSideProps`をexportするとSSRになる。  
※どちらもexportしないとSSGになる。

`first-post.js`でSSGをしたい場合、下記のようなコードになる。

```jsx
export default function FirstPost({pageTitle}) {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <h1>First Post</h1>
      <p><Link href="/"><a>Back to home</a></Link></p>
    </>);
}

// getStaticPropsはdevelop時にはリクエストごとに走るが、
// production時にはビルド時に実行される
export async function getStaticProps() {
  const pageTitle = 'First Post';
  return {
    props: {
      pageTitle
    }
  }
}

// getStaticPropsをexport or なにもexportしないとSSGの挙動になる
// getServerSidePropsをexportするとSSRになる
// export async function getServerSideProps() {
//   const pageTitle = 'First Post';
//   return {
//     props:{
//       pageTitle
//     }
//   }
// }
```

# DynamincPath

ブログ記事のような基本的には同じで動的にパスを変えたい場合の対応。   
`getStaticPaths`関数を使うことで実現できる。

```bash
# 動的なパスに対応したファイルを作成
# []で囲むのがポイント。これで動的なパスに対応できる。
$ touch posts/[id].js
```

```jsx
export default function DynamicPosts({id}) {
  // pathのidをそのまま表示
  return <h1>{id}</h1>
}

// pathから取ったidをcomponentに渡す
export function getStaticProps({params}) {
  return {
    props: {
      id: params.id
    }
  }
}

// 動的にパスを変える用
export function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          // ここのキーが作成したファイルの[]で囲った部分と一致する
          id: 'id1'
        }
      },
      {
        params: {
          id: 'id2'
        }
      },
      {
        params: {
          id: 'id3'
        }
      }
    ],
    fallback: false
  }
}
```

# TypeScript対応

作成されたテンプレはjsベースになっているので、tsベースに修正する。  
CLIが対応してるだろうとか思ってたらそんなことなかったので、公式の通りに修正していく。

```bash
# 必要なライブラリを追加
$ yarn add --dev typescript @types/react @types/node
# tsconfig作る
$ npx tsc --init
```

これで設定はOKなのでひたすらファイルをtsにしていく。  
ほとんど拡張子変えるだけなので、例として`first-post.js`と`[id].js`を変えた結果を載せておく。

```tsx
// fist-post.tsx
import Link from 'next/link';
import Head from 'next/head';
import {GetStaticProps} from 'next';

// 関数名は何でも良いけど、default exportする必要がある
export default function FirstPost({pageTitle}: { pageTitle: string }) {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <h1>First Post</h1>
      <p><Link href="/"><a>Back to home</a></Link></p>
    </>);
}

// getStaticPropsはdevelop時にはリクエストごとに走るが、production時にはビルド時に実行される
export const getStaticProps: GetStaticProps = async () => {
  const pageTitle = 'First Post';
  return {
    props: {
      pageTitle
    }
  }
}
```

```tsx
// [id].tsx
import {GetStaticPaths, GetStaticProps} from "next"

export default function DynamicPosts({id}: { id: string }) {
  return <h1>{id}</h1>
}

// pathから取ったidをcomponentに渡す
export const getStaticProps: GetStaticProps = async ({params}) => ({
  props: {
    id: params?.id
  }
})

// 動的にパスを変える用
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [
    {
      params: {
        id: 'id1'
      }
    },
    {
      params: {
        id: 'id2'
      }
    },
    {
      params: {
        id: 'id3'
      }
    }
  ],
  fallback: false
});
```

# まとめ

今回はNext.jsのチュートリアルに沿って試してみた。  
もっととっつくにくいのかなと思っていたけど、  
全然そんなことなかったのでNext.jsベースで何か作ってみようと思った。

# 参考リンク

- [Create a Next.js App | Learn Next.js](https://nextjs.org/learn/basics/create-nextjs-app?utm_source=next-site&utm_medium=homepage-cta&utm_campaign=next-website)
