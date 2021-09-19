import sizeOf from 'image-size';
import path from 'path';

const PC_THUMBNAIL_MAX_WIDTH = 336;
const PC_THUMBNAIL_DEFAULT_HEIGHT = 189;
// const SP_THUMBNAIL_MAX_WIDTH = 320;
// const SP_THUMBNAIL_DEFAULT_HEIGHT = 180;
const SP_THUMBNAIL_MAX_WIDTH = 336;
const SP_THUMBNAIL_DEFAULT_HEIGHT = 189;

const PC_ARTICLE_MAX_WIDTH = 800;
const PC_ARTICLE_DEFAULT_HEIGHT = 450;
const SP_ARTICLE_MAX_WIDTH = 320;
const SP_ARTICLE_DEFAULT_HEIGHT = 180;

/**
 * 画像のサイズを取得する
 * @param imagePath 画像のパス
 * @param type thumbnail: サムネイル用 / article: 記事用
 */
export function getImageSize(imagePath: string, type: 'thumbnail' | 'article') {
  const targetPath = path.join(process.cwd(), 'public/', imagePath);
  const image = sizeOf(targetPath);

  switch (type) {
    case 'thumbnail':
      const pcThumbnailRatio =
        PC_THUMBNAIL_MAX_WIDTH / (image?.width ?? PC_THUMBNAIL_MAX_WIDTH);
      const spThumbnailRatio =
        SP_THUMBNAIL_MAX_WIDTH / (image?.width ?? SP_THUMBNAIL_MAX_WIDTH);
      return {
        pc: {
          width: PC_THUMBNAIL_MAX_WIDTH,
          height:
            (image?.height ?? PC_THUMBNAIL_DEFAULT_HEIGHT) * pcThumbnailRatio,
        },
        sp: {
          width: SP_THUMBNAIL_MAX_WIDTH,
          height:
            (image?.height ?? SP_THUMBNAIL_DEFAULT_HEIGHT) * spThumbnailRatio,
        },
      };
    case 'article':
      const pcArticleRatio =
        PC_ARTICLE_MAX_WIDTH / (image?.width ?? PC_ARTICLE_MAX_WIDTH);
      const spArticleRatio =
        SP_ARTICLE_MAX_WIDTH / (image?.width ?? SP_ARTICLE_MAX_WIDTH);
      return {
        pc: {
          width: PC_ARTICLE_MAX_WIDTH,
          height: (image?.height ?? PC_ARTICLE_DEFAULT_HEIGHT) * pcArticleRatio,
        },
        sp: {
          width: SP_ARTICLE_MAX_WIDTH,
          height: (image?.height ?? SP_ARTICLE_DEFAULT_HEIGHT) * spArticleRatio,
        },
      };
    default:
      const _: never = type;
      throw new Error(`type ${type} is not allowed.`);
  }
}
