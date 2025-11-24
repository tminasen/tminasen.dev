import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import html from 'rehype-stringify';
import { getImageSize } from './image';
import rehypePrism from '@mapbox/rehype-prism';

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
    .use(setTargetBlankToLink)
    .use(setImageSize)
    .process(markdownText);
  return processedContent.toString();
}

/**
 * imgタグにwidthとheightを指定する
 */
function setImageSize() {
  return function (node: any, vfile: any, done: any) {
    node.children = node.children.map((child: any) => {
      if (child.type !== 'element' || child.tagName !== 'p') {
        return child;
      }
      const image = child.children.find(
        (c: any) => c.type === 'element' && c.tagName === 'img',
      );
      if (!image) {
        return child;
      }
      const imagePath = image.properties.src;
      const imageAlt = image.properties.alt;
      const imageSize = getImageSize(imagePath, 'article');
      // webp込みの画像にする
      const webpImage = {
        type: 'element',
        tagName: 'source',
        properties: {
          type: 'image/webp',
          srcset: image.properties.src.replace(/\.png$/, '.webp')
        },
      };
      const fallbackImage = {
        ...image,
        tagName: 'img',
        properties: {
          ...image.properties,
          width: imageSize.pc.width,
          height: imageSize.pc.height,
          alt: imageAlt,
          media: '(min-width: 451px)',
        },
      };
      const imageSource = {
        type: 'element',
        tagName: 'picture',
        children: [webpImage, fallbackImage]
      }

      // webp込のデータ使うので今あるimgは削除
      child.children = [
        ...child.children.filter(
          (c: any) => c.type !== 'element' && c.tagName !== 'img',
        ),
        imageSource,
      ];
      return child;
    });
    done();
  };
}

/**
 * リンクにtarget="_blank"を追加する
 */
function setTargetBlankToLink() {
  return function (node: Record<string, any>, vfile: object, done: Function) {
    node.children = node.children.map((child: any) => {
      if (
        child.type !== 'element' ||
        !(child.tagName === 'p' || child.tagName === 'ul')
      ) {
        return child;
      }
      // リストの場合は別処理
      if (child.tagName === 'ul') {
        child.children = setListLink(child.children);
        return child;
      }
      child.children = child.children.map((c: any) => {
        if (c.type !== 'element' || c.tagName !== 'a') {
          return c;
        }
        return {
          ...c,
          properties: {
            ...c.properties,
            target: '_blank',
          },
        };
      });

      return child;
    });
    done();
  };
}

/**
 * リストの中のリンクを探してtarget="_blank"を追加する
 * @param children
 */
function setListLink(children: Record<string, any>[]) {
  return children.map((c: any) => {
    if (c.type !== 'element' || c.tagName !== 'li') {
      return c;
    }

    c.children = c.children.map((ch: any) => {
      if (ch.tagName === 'ul') {
        ch.children = setListLink(ch.children);
        return ch;
      }
      if (ch.tagName === 'a') {
        return {
          ...ch,
          properties: {
            ...ch.properties,
            target: '_blank',
          },
        };
      }
      return ch;
    });
    return c;
  });
}
