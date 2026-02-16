[![Netlify Status](https://api.netlify.com/api/v1/badges/ebd8225c-0e3e-4a4f-8760-3e7a033cdfee/deploy-status)](https://app.netlify.com/sites/compassionate-babbage-77c519/deploys)

# MyBlog

個人用のブログ

## Visual Regression Test

### 実行方法

```bash
yarn test:visual tests/visual-regression
```

`VERCEL_PREVIEW_URL` を指定すると、本番環境とプレビュー環境の差分比較を実行します。

```bash
VERCEL_PREVIEW_URL=https://example-preview.vercel.app yarn test:visual tests/visual-regression
```

`VERCEL_PREVIEW_URL` 未指定時は、本番環境同士の比較（差分なし想定）として実行されます。

### 生成物

- `test-results/production/*.png` : 本番環境スクリーンショット
- `test-results/preview/*.png` : プレビュー環境スクリーンショット
- `test-results/diff/*.png` : 差分画像
- `test-results/diff/*.json` : 差分率レポート

### CI

- GitHub Actions: `.github/workflows/visual-regression.yml`
- GitHub Deployment API から Vercel プレビューURLを取得して比較します
- 失敗時は `test-results` / `playwright-report` がアーティファクトに保存されます。
