#!/usr/bin/env tsx

import { argv } from 'zx';
import { createFileOperations } from '../functions/file-operations.mts';

/**
 * メインの実行関数
 */
async function main(): Promise<void> {
  try {
    // コマンドライン引数の処理
    const fileOperations = createFileOperations();
    
    // --rename オプションが指定されている場合
    if (argv.rename) {
      const dirName = typeof argv.rename === 'string' ? argv.rename : '';
      await fileOperations.renameImages(dirName);
    } 
    // --name または -n オプションが指定されている場合
    else {
      const fileName = argv.name || argv.n;
      await fileOperations.createFile(fileName);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * ヘルプメッセージを表示する
 */
function showHelp(): void {
  console.log(`
Article Creator - article utility tools

Usage:
  article-creator [options]

Options:
  --name, -n <FILE_NAME>  Specify file name
  --rename <DIR_NAME>     Rename image files in the specified directory
  --help                  Show this help message
  --version               Show version information

Examples:
  article-creator                     Create a new article with a generated UUID
  article-creator --name my-article   Create a new article with the name "my-article"
  article-creator --rename my-article Rename image files in the "my-article" directory
  `);
}

/**
 * バージョン情報を表示する
 */
function showVersion(): void {
  console.log('Article Creator v0.0.2');
  console.log('Author: tminasen');
}

// ヘルプまたはバージョン情報の表示
if (argv.help) {
  showHelp();
} else if (argv.version) {
  showVersion();
} else {
  // メイン処理の実行
  main().catch(error => {
    console.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
