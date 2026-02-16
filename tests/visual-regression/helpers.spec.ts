import { expect, test } from '@playwright/test';
import { PRODUCTION_BASE_URL, buildPageUrl } from './config';
import { setColorScheme, waitForPageReady } from './helpers';

test.describe('Visual helper', () => {
  test('T18: color scheme switch should update root color variables', async ({
    page,
  }) => {
    await page.goto(buildPageUrl(PRODUCTION_BASE_URL, '/404'));

    await setColorScheme(page, 'light');
    const lightColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-bg-base')
        .trim(),
    );

    await setColorScheme(page, 'dark');
    const darkColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-bg-base')
        .trim(),
    );

    await setColorScheme(page, 'light');
    const revertedLightColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-bg-base')
        .trim(),
    );

    expect(lightColor).toBe('#f5f5f5');
    expect(darkColor).toBe('#1f2937');
    expect(revertedLightColor).toBe(lightColor);
  });

  test('T19: waitForPageReady should wait until fonts are loaded', async ({
    page,
  }) => {
    await page.goto(buildPageUrl(PRODUCTION_BASE_URL, '/'));
    await waitForPageReady(page);

    const fontStatus = await page.evaluate(() => document.fonts.status);
    expect(fontStatus).toBe('loaded');
  });
});
