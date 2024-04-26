#! /usr/bin/env node

import puppeteer from 'puppeteer';
import {$, path, argv, fs} from 'zx';
import {getArticleMetaData} from '../functions/article.mjs';

const getCurrentDirectory = await $`pwd`;
const currentDirectory = getCurrentDirectory.stdout.trim();

const OGP_BASE_HTML = `file:${path.resolve(
  currentDirectory,
  './scripts/generate-ogp/ogp-base.html',
)}`;
const OGP_IMAGE_BASE_PATH = 'public/images/article/';

(async () => {
  const commandArguments = argv._.filter(
    a =>
      !a.includes('node_modules/.bin/ts-node') &&
      !a.includes('scripts/generate-ogp/GenerateOgp.ts'),
  );
  if (commandArguments.length === 0) {
    throw new Error('required git diff result.');
  }
  const changedArticles = commandArguments.filter(a =>
    a.includes('src/md-pages'),
  );
  const metaData = await getArticleMetaData();
  for (const data of metaData) {
    const fullFilePath = `src/md-pages/${data.path}/article${data.path}.md`;
    if (!changedArticles.includes(fullFilePath)) {
      continue;
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1200, height: 630});
    await page.goto(OGP_BASE_HTML);
    await page.waitForSelector('#title');
    await page.evaluate(
      ({title}) => {
        const titleElement = document.getElementById('title');
        titleElement.innerText = title;
      },
      {title: data.title},
    );
    const ogpDirectory = path.join(
      currentDirectory,
      OGP_IMAGE_BASE_PATH,
      data.path,
    );
    if (!fs.existsSync(ogpDirectory)) {
      fs.mkdirSync(ogpDirectory);
    }
    await page.screenshot({
      path: path.join(ogpDirectory, 'ogp.png'),
    });
    await browser.close();
  }
})();
