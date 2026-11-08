#!/usr/bin/env tsx

import { $, path, fs } from 'zx';
import { Feed } from 'feed';
import { getArticleMetaData } from '../../src/libraries/articles';
import { buildFeedItem } from '../../src/libraries/rssItem';

const BASE_URL = 'https://tminasen.dev';
const getCurrentDirectory = await $`pwd`;
const currentDirectory = getCurrentDirectory.stdout.trim();
const RSS_DIRECTORY = path.join(currentDirectory, 'public/rss');
const feed = new Feed({
  title: '水無瀬のプログラミング日記feed',
  description: '水無瀬のプログラミング日記のfeed',
  id: BASE_URL,
  link: BASE_URL,
  language: 'ja',
  image: `${BASE_URL}/images/ogp.png`,
  favicon: `${BASE_URL}/images/icon32x.png`,
  copyright: `All rights reserved ${new Date().getFullYear()}, tminasen`,
  updated: new Date(),
  author: {
    name: 'tminasen',
    link: 'https://twitter.com/tminasen',
  },
});

(async () => {
  const metaData = await getArticleMetaData();
  metaData.slice(0, 10).forEach(d => {
    feed.addItem(buildFeedItem(d, BASE_URL));
  });
  if (!fs.existsSync(RSS_DIRECTORY)) {
    fs.mkdirSync(RSS_DIRECTORY);
  }
  fs.writeFileSync(`${RSS_DIRECTORY}/feed.xml`, feed.rss2(), {
    encoding: 'utf-8',
  });
})();
