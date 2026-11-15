#!/usr/bin/env tsx

import { $, path, fs } from 'zx';
import sharp from 'sharp';
import { getArticleMetaData } from '../../src/libraries/articles';
import {
  getThumbnailVariantPath,
  getThumbnailVariantWidths,
} from '../../src/libraries/thumbnailVariants';

const getCurrentDirectory = await $`pwd`;
const currentDirectory = getCurrentDirectory.stdout.trim();
const PUBLIC_DIRECTORY = path.join(currentDirectory, 'public');

(async () => {
  const articles = await getArticleMetaData();
  // 複数の記事が同じ画像を使うため、重複を除く
  const thumbnailUrls = [
    ...new Set(articles.map(article => article.thumbnailImage.url)),
  ];

  for (const url of thumbnailUrls) {
    const sourcePath = path.join(PUBLIC_DIRECTORY, url);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`thumbnail source not found: ${sourcePath}`);
    }
    const { width: originalWidth } = await sharp(sourcePath).metadata();

    for (const width of getThumbnailVariantWidths(originalWidth ?? 0)) {
      const destinationPath = path.join(
        PUBLIC_DIRECTORY,
        getThumbnailVariantPath(url, width),
      );
      await sharp(sourcePath).resize({ width }).webp().toFile(destinationPath);
      console.log(
        `generated: ${path.relative(currentDirectory, destinationPath)}`,
      );
    }
  }
})();
