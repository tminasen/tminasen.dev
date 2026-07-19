# システム構成図(C4モデル)

tminasen.dev(水無瀬のプログラミング日記)のシステム構成を、C4モデルの Level 1(System Context)および Level 2(Container)で記述する。

## アーキテクチャの要点

- Next.js 16(Pages Router + MDX)で `output: 'export'` の完全静的サイト(SSG)。ランタイムのバックエンドは持たない
- 記事は `src/pages/blog/*.mdx` としてリポジトリ内に格納され、GitHubが記事コンテンツのマスターデータ置き場を兼ねる
- ホスティングはVercel(本番: tminasen.dev + PRごとのプレビューデプロイ)
- OGP画像・RSSフィードはローカルのCLIスクリプトで事前生成し、生成物ごとコミットする方式(ビルド時には再生成しない)
- CIはGitHub ActionsによるVisual Regression Test(本番とVercelプレビューのスクリーンショット比較)

## Level 1: System Context(システムコンテキスト図)

```mermaid
C4Context
    title System Context - tminasen.dev(静的ブログシステム)

    Person(reader, "読者", "プログラミング記事を読む一般ユーザー")
    Person(author, "著者(tminasen)", "記事の執筆・サイトの開発を行う")

    System(blog, "tminasen.dev", "Next.js製の静的ブログサイト。記事の閲覧・タグ検索・RSS配信を提供する")

    System_Ext(vercel, "Vercel", "静的サイトのビルド・ホスティング・CDN配信。PRごとのプレビュー環境も提供")
    System_Ext(github, "GitHub", "ソースコード・記事(MDX)の管理。GitHub ActionsによるCI実行")
    System_Ext(x, "X (Twitter)", "記事シェア先のSNS")
    System_Ext(rssReader, "RSSリーダー", "フィード購読クライアント")

    Rel(reader, blog, "記事を閲覧する", "HTTPS")
    Rel(reader, x, "記事をシェアする", "HTTPS (tweet intent URL)")
    Rel(reader, github, "記事のソース(MDX)を閲覧する", "HTTPS")
    Rel(rssReader, blog, "フィードを取得する", "HTTPS (/rss/feed.xml)")

    Rel(author, github, "記事・コードをpush / PR作成", "git (HTTPS/SSH)")
    Rel(github, vercel, "pushを契機にビルド・デプロイをトリガー", "Webhook")
    Rel(vercel, blog, "静的コンテンツとしてホスティング・配信", "CDN")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### 補足(コンテキストレベルの関係性)

- 本システムはランタイムのバックエンドを一切持たない完全静的サイトである。動的な処理(シェア、ソース閲覧)はすべて外部システムへのリンクで実現している
- 記事公開のトリガーは `git push`(GitHubへのマージ)である

## Level 2: Container(コンテナ図)

```mermaid
C4Container
    title Container - tminasen.dev(ビルドパイプライン含む)

    Person(reader, "読者")
    Person(author, "著者(tminasen)")

    System_Boundary(blogSystem, "tminasen.dev システム") {
        Container(staticSite, "静的サイト", "Next.js 16 / React 19 / Tailwind CSS 4", "next build (output: 'export') で生成された静的HTML/CSS/JS。記事一覧・記事詳細・タグページ・404を提供")
        ContainerDb(articles, "記事コンテンツ", "MDX + frontmatter (src/pages/blog/*.mdx)", "記事本文とメタデータ(title, date, tags等)。gray-matterでビルド時にパース")
        ContainerDb(publicAssets, "静的アセット", "public/ (画像, rss/feed.xml)", "OGP画像・アイコン・生成済みRSSフィード")

        Container(articleCreator, "記事作成スクリプト", "tsx / zx (scripts/article-scripts)", "記事IDの採番とMDX雛形の生成 (pnpm create:article)")
        Container(ogpGen, "OGP画像生成スクリプト", "tsx / Puppeteer (scripts/generate-ogp)", "git diffで変更された記事のタイトルをogp-base.htmlに埋め込み、1200x630pxのPNGを生成")
        Container(rssGen, "RSS生成スクリプト", "tsx / feed (scripts/generate-rss)", "最新10件の記事メタデータからRSSフィードXMLを生成")
        Container(vrt, "Visual Regressionテスト", "Playwright / pixelmatch (tests/)", "本番環境とVercelプレビュー環境のスクリーンショットを比較し差分率を検出")
    }

    System_Ext(vercel, "Vercel", "本番 (tminasen.dev) とPRプレビューのビルド・CDN配信")
    System_Ext(ghActions, "GitHub Actions", "PR時にVRTを実行するCI。Deployment APIでプレビューURLを解決")
    System_Ext(github, "GitHubリポジトリ", "コード・記事のバージョン管理")
    System_Ext(x, "X (Twitter)", "シェア先SNS")

    Rel(author, articleCreator, "記事雛形を作成", "CLI (pnpm create:article)")
    Rel(author, ogpGen, "OGP画像を生成", "CLI (pnpm generate:ogp)")
    Rel(author, rssGen, "フィードを更新", "CLI (pnpm generate:rss)")
    Rel(author, github, "MDX・生成物をcommit/push", "git")

    Rel(articleCreator, articles, "MDXファイルを生成", "File I/O")
    Rel(ogpGen, articles, "frontmatterからタイトルを取得", "File I/O")
    Rel(ogpGen, publicAssets, "ogp.pngを出力", "File I/O")
    Rel(rssGen, articles, "記事メタデータを取得", "File I/O")
    Rel(rssGen, publicAssets, "feed.xmlを出力", "File I/O")

    Rel(vercel, articles, "ビルド時にMDXを読み込み静的HTML化", "next build (@next/mdx, remark/rehype, shiki)")
    Rel(vercel, staticSite, "ビルド成果物をCDN配信", "デプロイ")

    Rel(ghActions, vercel, "プレビューURLを解決", "GitHub Deployment API")
    Rel(vrt, staticSite, "本番/プレビューをスクリーンショット比較", "HTTPS (Playwright)")
    Rel(ghActions, vrt, "PRごとに実行", "CI")

    Rel(reader, staticSite, "閲覧", "HTTPS")
    Rel(staticSite, x, "シェアリンク", "tweet intent URL")
    Rel(staticSite, github, "記事ソースへのリンク", "HTTPS")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### 補足(コンテナレベルのデータフロー)

1. **執筆フロー**: 著者がCLIスクリプトで記事雛形を作成 → MDXを執筆 → OGP画像・RSSをローカルで生成してcommit(生成物もリポジトリにコミットする方式で、ビルド時には再生成しない)
2. **ビルド・配信フロー**: `next build` 時に `gray-matter` でfrontmatterをパースし、`remark-gfm` / `rehype-pretty-code`(shiki)でMDXを変換して静的HTMLを出力。Vercelがそのままエッジ配信するため、実行時のサーバーコンポーネントやAPIは存在しない
3. **品質保証フロー**: PR作成時にGitHub ActionsがGitHub Deployment APIをポーリングしてVercelプレビューURLを取得し、Playwrightで本番と全ページのスクリーンショット差分(pixelmatch)を検証する

## 備考

- ルートの `Cargo.toml` はワークスペースメンバーとして `scripts/article-scripts` を指定しているが、当該ディレクトリに Rust ソースは存在せず TypeScript(`article-creator.mts`)のみである。Rust版スクリプトからの移行の名残と思われるため、本図には含めていない
- README の Netlify バッジは旧構成の名残であり、現在のホスティングは Vercel である
