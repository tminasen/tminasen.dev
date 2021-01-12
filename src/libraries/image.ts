import sizeOf from 'image-size';
import path from 'path';

const PC_MAX_WIDTH = 384;
const PC_DEFAULT_HEIGHT = 216;
const SP_MAX_WIDTH = 320;
const SP_DEFAULT_HEIGHT = 180;

/**
 * 画像のサイズを取得する
 * @param imagePath 画像のパス
 */
export function getImageSize(imagePath: string) {
  const targetPath = path.join(process.cwd(), 'public/', imagePath);
  const image = sizeOf(targetPath);
  const pcRatio = PC_MAX_WIDTH / (image?.width ?? PC_MAX_WIDTH);
  const spRatio = SP_MAX_WIDTH / (image?.width ?? SP_MAX_WIDTH);
  return {
    pc: {
      width: PC_MAX_WIDTH,
      height: (image?.height ?? PC_DEFAULT_HEIGHT) * pcRatio,
    },
    sp: {
      width: SP_MAX_WIDTH,
      height: (image?.height ?? SP_DEFAULT_HEIGHT) * spRatio,
    },
  };
}
