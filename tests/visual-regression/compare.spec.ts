import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PNG } from 'pngjs';
import { compareScreenshots } from './compare';

function createPngFile(
  filePath: string,
  width: number,
  height: number,
  r: number,
  g: number,
  b: number,
) {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }
  const encoded = PNG.sync.write(png);
  fs.writeFileSync(filePath, new Uint8Array(encoded));
}

test.describe('Screenshot compare', () => {
  test('should return 0 diff for identical images', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vrs-identical-'));
    const productionPath = path.join(tmpDir, 'production.png');
    const previewPath = path.join(tmpDir, 'preview.png');
    const diffPath = path.join(tmpDir, 'diff.png');
    const reportPath = path.join(tmpDir, 'report.json');

    createPngFile(productionPath, 4, 4, 100, 120, 140);
    createPngFile(previewPath, 4, 4, 100, 120, 140);

    const result = await compareScreenshots({
      productionPath,
      previewPath,
      diffPath,
      reportPath,
    });

    expect(result.diffPixels).toBe(0);
    expect(result.diffRatio).toBe(0);
    expect(fs.existsSync(diffPath)).toBeTruthy();
    expect(fs.existsSync(reportPath)).toBeTruthy();
  });

  test('should detect diff for different images', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vrs-different-'));
    const productionPath = path.join(tmpDir, 'production.png');
    const previewPath = path.join(tmpDir, 'preview.png');
    const diffPath = path.join(tmpDir, 'diff.png');

    createPngFile(productionPath, 4, 4, 0, 0, 0);
    createPngFile(previewPath, 4, 4, 255, 255, 255);

    const result = await compareScreenshots({
      productionPath,
      previewPath,
      diffPath,
    });

    expect(result.diffPixels).toBeGreaterThan(0);
    expect(result.diffRatio).toBeGreaterThan(0);
  });

  test('should throw when image dimensions are different', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vrs-size-'));
    const productionPath = path.join(tmpDir, 'production.png');
    const previewPath = path.join(tmpDir, 'preview.png');
    const diffPath = path.join(tmpDir, 'diff.png');

    createPngFile(productionPath, 4, 4, 0, 0, 0);
    createPngFile(previewPath, 8, 8, 0, 0, 0);

    await expect(
      compareScreenshots({
        productionPath,
        previewPath,
        diffPath,
      }),
    ).rejects.toThrow('Screenshot dimensions do not match');
  });
});
