#!/usr/bin/env tsx

import { $, path, fs } from 'zx';
import { Feed } from 'feed';
import { getArticleMetaData } from '../functions/article.mts';
import { dateFromDateString } from '../functions/date.mts';

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
    if (!d) return;
    
    const date = dateFromDateString(d.date);
    if (date instanceof Error) {
      throw date;
    }
    feed.addItem({
      title: d.title,
      id: `${BASE_URL}/blog/${d.path}`,
      link: `${BASE_URL}/blog/${d.path}`,
      description: d.description,
      author: [
        {
          name: 'tminasen',
          link: 'https://twitter.com/tminasen',
        },
      ],
      date,
      image: `${BASE_URL}${d.ogpImage}`,
    });
  });
  if (!fs.existsSync(RSS_DIRECTORY)) {
    fs.mkdirSync(RSS_DIRECTORY);
  }
  fs.writeFileSync(`${RSS_DIRECTORY}/feed.xml`, feed.rss2(), {
    encoding: 'utf-8',
  });
})();
