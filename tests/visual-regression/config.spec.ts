import { expect, test } from '@playwright/test';
import {
  buildPageUrl,
  getPreviewBaseUrl,
  PRODUCTION_BASE_URL,
} from './config';

test.describe('Visual regression config', () => {
  let originalPreviewUrl: string | undefined;

  test.beforeEach(() => {
    originalPreviewUrl = process.env.VERCEL_PREVIEW_URL;
  });

  test.afterEach(() => {
    if (originalPreviewUrl === undefined) {
      delete process.env.VERCEL_PREVIEW_URL;
      return;
    }
    process.env.VERCEL_PREVIEW_URL = originalPreviewUrl;
  });

  test('T20: should use VERCEL_PREVIEW_URL when provided', () => {
    process.env.VERCEL_PREVIEW_URL = 'https://example-preview.vercel.app/';

    const result = getPreviewBaseUrl();

    expect(result.url).toBe('https://example-preview.vercel.app');
    expect(result.source).toBe('env');
  });

  test('T20: should fallback to production URL when preview URL is missing', () => {
    delete process.env.VERCEL_PREVIEW_URL;

    const result = getPreviewBaseUrl();

    expect(result.url).toBe(PRODUCTION_BASE_URL);
    expect(result.source).toBe('fallback-production');
  });

  test('should build root page URL', () => {
    expect(buildPageUrl('https://example.com', '/')).toBe('https://example.com/');
  });

  test('should build nested page URL', () => {
    expect(buildPageUrl('https://example.com/', '/tags')).toBe(
      'https://example.com/tags',
    );
  });
});
