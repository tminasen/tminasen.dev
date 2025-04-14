#!/usr/bin/env tsx

import puppeteer from 'puppeteer';
import { $, path, argv, fs } from 'zx';
import { getArticleMetaData } from '../functions/article.mts';

// zxを使用してカレントディレクトリを取得
const getCurrentDirectory = await $`pwd`;
const currentDirectory = getCurrentDirectory.stdout.trim();

const OGP_BASE_HTML = `file:${path.resolve(
  currentDirectory,
  './scripts/generate-ogp/ogp-base.html',
)}`;
const OGP_IMAGE_BASE_PATH = 'public/images/article/';

// 型定義
interface TitleData {
  title: string;
}

(async () => {
  // コマンド引数のフィルタリング
  const commandArguments = argv._.filter(
    (a: string) =>
      !a.includes('node_modules/.bin/ts-node') &&
      !a.includes('scripts/generate-ogp/generate-ogp.mts'),
  );
  
  if (commandArguments.length === 0) {
    throw new Error('required git diff result.');
  }
  
  // 変更された記事のフィルタリング
  const changedArticles = commandArguments.filter((a: string) =>
    a.includes('content/md-pages'),
  );
  
  // 記事メタデータの取得
  const metaData = await getArticleMetaData();
  
  // 各記事に対してOGP画像を生成
  for (const data of metaData) {
    // dataがundefinedの場合はスキップ
    if (!data) continue;
    
    const fullFilePath = `content/md-pages/${data.path}/article${data.path}.md`;
    
    // 変更された記事のみ処理
    if (!changedArticles.includes(fullFilePath)) {
      continue;
    }
    
    // Puppeteerを使用してOGP画像を生成
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });
    await page.goto(OGP_BASE_HTML);
    await page.waitForSelector('#title');
    
    // タイトルを設定
    await page.evaluate(
      ({ title }: TitleData) => {
        const titleElement = document.getElementById('title');
        if (titleElement) {
          titleElement.innerText = title;
        }
      },
      { title: data.title },
    );
    
    // OGP画像の保存先ディレクトリを作成
    const ogpDirectory = path.join(
      currentDirectory,
      OGP_IMAGE_BASE_PATH,
      data.path,
    );
    
    // zxのfsを使用してディレクトリ存在確認と作成
    if (!fs.existsSync(ogpDirectory)) {
      fs.mkdirSync(ogpDirectory);
    }
    
    // スクリーンショットを撮影してOGP画像として保存
    await page.screenshot({
      path: path.join(ogpDirectory, 'ogp.png'),
    });
    
    await browser.close();
  }
})();
