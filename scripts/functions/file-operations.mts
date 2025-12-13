import { fs, path } from 'zx';
import { randomUUID } from 'crypto';

/**
 * ファイル操作に関する関数を提供するクラス
 */
export class FileOperations {
  /**
   * テンプレートファイルを作成する
   * @param fileName ファイル名（指定がない場合はUUIDを生成）
   * @returns Promise<void>
   */
  async createFile(fileName?: string): Promise<void> {
    // ファイル名が指定されていない場合はUUIDを生成
    const fileId = fileName || randomUUID();

    // 画像用のディレクトリ作成
    const imageDir = path.join('public/images/article', fileId);
    const blogDir = path.join('src/pages/blog');

    try {
      // ディレクトリが存在しない場合は作成
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      if (!fs.existsSync(blogDir)) {
        fs.mkdirSync(blogDir, { recursive: true });
      }

      // 現在の日付を取得
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$1/$2'); // MM/DD/YYYY -> YYYY/MM/DD

      // MDXテンプレートデータを作成
      const templateData = `---
path: "/blog/${fileId}"
date: "${currentDate}"
title: ""
tag: [""]
ogpImage: "/images/article/${fileId}/ogp.png"
thumbnailImage: "/images/article/${fileId}/thumbnail.png"
---

import { ArticleLayout } from '../../components/ArticleLayout';

export const meta = {
  path: "/blog/${fileId}",
  date: "${currentDate}",
  title: "",
  tag: [""],
  ogpImage: "/images/article/${fileId}/ogp.png",
  thumbnailImage: "/images/article/${fileId}/thumbnail.png",
};

export default ({ children }) => <ArticleLayout meta={meta}>{children}</ArticleLayout>;

# はじめに

`;

      // MDXファイルのパス
      const mdxPath = path.join(blogDir, `${fileId}.mdx`);

      // テンプレートデータをファイルに書き込み
      fs.writeFileSync(mdxPath, templateData, 'utf8');

      // 画像ディレクトリに.gitkeepファイルを作成
      const imagePath = path.join(imageDir, '.gitkeep');
      fs.writeFileSync(imagePath, '', 'utf8');

      console.log(`Created template files for: ${fileId}`);
      console.log(`  MDX file: ${mdxPath}`);
      console.log(`  Image dir: ${imageDir}`);
    } catch (error) {
      console.error(`Failed to create template files: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * 画像ファイルの名前を変更する
   * @param dirName ディレクトリ名
   * @returns Promise<void>
   */
  async renameImages(dirName: string): Promise<void> {
    if (!dirName) {
      throw new Error('Directory name is required');
    }

    const dirPath = path.join('public/images/article', dirName);

    try {
      // ディレクトリが存在するか確認
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory does not exist: ${dirPath}`);
      }

      // ディレクトリ内のファイルを取得
      const files = fs.readdirSync(dirPath)
        .filter(file => {
          // ファイルのみをフィルタリング（ディレクトリは除外）
          const filePath = path.join(dirPath, file);
          return fs.statSync(filePath).isFile() && file !== '.gitkeep';
        });

      // ファイルの名前を変更
      for (let i = 0; i < files.length; i++) {
        const oldPath = path.join(dirPath, files[i]);
        const newName = `ss${dirName}-${i + 1}.png`;
        const newPath = path.join(dirPath, newName);

        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: ${files[i]} -> ${newName}`);
      }

      console.log(`Renamed ${files.length} files in ${dirPath}`);
    } catch (error) {
      console.error(`Failed to rename images: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

/**
 * FileOperationsのインスタンスを作成して返す
 * @returns FileOperations
 */
export function createFileOperations(): FileOperations {
  return new FileOperations();
}
