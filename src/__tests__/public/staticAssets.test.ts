import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';
import { describe, expect, it } from 'vitest';

const publicFile = (relativePath: string) =>
  path.join(process.cwd(), 'public', relativePath);

describe('public/images/XSocialIcon.webp', () => {
  it('表示サイズ(28px)の2倍の幅に縮小されている', () => {
    // Given
    const filePath = publicFile('images/XSocialIcon.webp');
    // When
    const { width, height, type } = sizeOf(filePath);
    // Then
    expect({ width, height, type }).toEqual({
      width: 56,
      height: 57,
      type: 'webp',
    });
  });
});

describe('public/favicon.ico', () => {
  it('16/32/48 の3サイズだけを含む', () => {
    // Given
    const ico = fs.readFileSync(publicFile('favicon.ico'));
    // When
    const count = ico.readUInt16LE(4);
    const widths = Array.from({ length: count }, (_, i) =>
      ico.readUInt8(6 + 16 * i),
    );
    // Then
    expect(count).toBe(3);
    expect(widths).toEqual([16, 32, 48]);
  });

  it('ファイルサイズが 20KB 未満', () => {
    // Given
    const filePath = publicFile('favicon.ico');
    // When
    const { size } = fs.statSync(filePath);
    // Then
    expect(size).toBeLessThan(20480);
  });
});
