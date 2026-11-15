export const THUMBNAIL_VARIANT_WIDTHS = [336, 672] as const;

/**
 * サムネイル縮小版（webp）のパスを返す
 * @param imagePath 元画像のパス（例: /images/article/abc/thumbnail.png）
 * @param width 縮小版の幅
 */
export function getThumbnailVariantPath(
  imagePath: string,
  width: number,
): string {
  return imagePath.replace(/\.[^./]+$/, `-${width}w.webp`);
}

/**
 * 元画像の幅を超えない範囲で、生成対象の縮小版の幅を返す（拡大はしない）
 * @param originalWidth 元画像の幅
 */
export function getThumbnailVariantWidths(originalWidth: number): number[] {
  return THUMBNAIL_VARIANT_WIDTHS.filter(width => width <= originalWidth);
}

/**
 * サムネイル縮小版の srcset 文字列を組み立てる
 * @param imagePath 元画像のパス
 * @param originalWidth 元画像の幅
 * @returns 縮小版がない（元画像の幅が最小幅未満）場合は undefined
 */
export function buildThumbnailSrcSet(
  imagePath: string,
  originalWidth: number,
): string | undefined {
  const widths = getThumbnailVariantWidths(originalWidth);
  if (widths.length === 0) {
    return undefined;
  }
  return widths
    .map(width => `${getThumbnailVariantPath(imagePath, width)} ${width}w`)
    .join(', ');
}
