import fs from 'fs';
import path from 'path';
import type { Page } from '@playwright/test';

export type ColorScheme = 'light' | 'dark';

export type TakeScreenshotInput = {
  url: string;
  colorScheme: ColorScheme;
  outputPath: string;
};

export async function setColorScheme(
  page: Page,
  colorScheme: ColorScheme,
): Promise<void> {
  await page.emulateMedia({ colorScheme });
  await page.evaluate(
    () =>
      new Promise<void>(resolve => {
        requestAnimationFrame(() => resolve());
      }),
  );
}

export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

export async function takeScreenshot(
  page: Page,
  input: TakeScreenshotInput,
): Promise<void> {
  await setColorScheme(page, input.colorScheme);
  await page.goto(input.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await waitForPageReady(page);

  fs.mkdirSync(path.dirname(input.outputPath), { recursive: true });
  await page.screenshot({
    path: input.outputPath,
    fullPage: true,
    animations: 'disabled',
  });
}
