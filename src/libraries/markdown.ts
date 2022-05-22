import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import html from 'rehype-stringify';
import { getImageSize } from './image';
const rehypePrism = require('@mapbox/rehype-prism');

/**
 * markdown文字列から以下のタグを取り除く
 * <ul>
 *  <li>見出し</li>
 *  <li>リンク</li>
 *  <li>リスト</li>
 * </ul>
 * @param markdownText markdown形式文字列
 * @returns markdownのタグを取り除いた文字列
 */
export function removeTags(markdownText: string): string {
  return markdownText
    .replace(/^#{1,3} (.*)$/gm, '$1')
    .replace(/\[(.+)]\(.+\)/gm, '$1')
    .replace(/^\s+\[*-] (.+)$/gm, '$1');
}

/**
 * markdownテキストをhtmlに変換する
 * @param markdownText markdownテキスト
 * @returns html
 */
export async function markdown2Html(markdownText: string): Promise<any> {
  const processedContent = await unified()
    .use(remarkParse)
    .use(remark2rehype)
    .use(rehypePrism)
    .use(html)
    .use(setImageSize)
    .process(markdownText);
  return processedContent.toString();
}

/**
 * imgタグにwidthとheightを指定する
 */
function setImageSize() {
  return function (node: any, vfile: any, done: any) {
    const children = node.children.map((child: any) => {
      // 画像のサイズ指定
      if (child.type === 'element' && child.tagName === 'p') {
        const image = child.children.find(
          (c: any) => c.type === 'element' && c.tagName === 'img',
        );
        if (!image) {
          return child;
        }
        const imagePath = image.properties.src;
        const imageAlt = image.properties.alt;
        const imageSize = getImageSize(imagePath, 'article');
        // 既存の画像をamp-imgに置き換え
        const fallbackImage = {
          ...image,
          tagName: 'amp-img',
          properties: {
            ...image.properties,
            width: imageSize.pc.width,
            height: imageSize.pc.height,
            media: '(min-width: 451px)',
            fallback: true,
          },
        };
        const fallbackImageSp = {
          ...image,
          tagName: 'amp-img',
          properties: {
            ...image.properties,
            width: imageSize.sp.width,
            height: imageSize.sp.height,
            media: '(max-width: 450px)',
            fallback: true,
          },
        };
        // webp用のamp-img作成
        const webpImage = {
          type: 'element',
          tagName: 'amp-img',
          children: [fallbackImage],
          properties: {
            src: image.properties.src.replace(/\.png$/, '.webp'),
            alt: imageAlt,
            width: imageSize.pc.width,
            height: imageSize.pc.height,
            media: '(min-width: 451px)',
          },
        };
        const webpImageSp = {
          type: 'element',
          tagName: 'amp-img',
          children: [fallbackImageSp],
          properties: {
            src: image.properties.src.replace(/\.png$/, '.webp'),
            alt: imageAlt,
            width: imageSize.sp.width,
            height: imageSize.sp.height,
            media: '(max-width: 450px)',
          },
        };
        // webp込のデータ使うので今あるimgは削除
        child.children = [
          ...child.children.filter(
            (c: any) => c.type !== 'element' && c.tagName !== 'img',
          ),
          webpImage,
          webpImageSp,
        ];
      }
      return child;
    });
    node.children = children;
    done();
  };
}
