#!/usr/bin/env tsx

import { $, path, fs } from 'zx';
import { getArticleMetaData } from '../../src/libraries/articles';
import { buildArticleChunks } from '../../src/libraries/articleChunk';
import { ARTICLES_PER_PAGE } from '../../src/libraries/pagination';

const getCurrentDirectory = await $`pwd`;
const currentDirectory = getCurrentDirectory.stdout.trim();
const ARTICLES_DIRECTORY = path.join(currentDirectory, 'public/articles');

(async () => {
  const articles = await getArticleMetaData();
  const chunks = buildArticleChunks(articles, ARTICLES_PER_PAGE);

  await fs.ensureDir(ARTICLES_DIRECTORY);

  for (const chunk of chunks) {
    const filePath = path.join(ARTICLES_DIRECTORY, `page-${chunk.page}.json`);
    await fs.writeJson(filePath, chunk.articles);
  }
})();
