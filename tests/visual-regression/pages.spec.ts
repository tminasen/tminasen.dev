import { expect, test } from '@playwright/test';
import path from 'path';
import { compareScreenshots } from './compare';
import { buildPageUrl, getPreviewBaseUrl, PRODUCTION_BASE_URL } from './config';
import { ColorScheme, takeScreenshot } from './helpers';

type VisualRegressionCase = {
  id:
    | 'T1'
    | 'T2'
    | 'T3'
    | 'T4'
    | 'T5'
    | 'T6'
    | 'T7'
    | 'T8'
    | 'T9'
    | 'T10'
    | 'T11'
    | 'T12'
    | 'T13'
    | 'T14'
    | 'T15'
    | 'T16';
  description: string;
  project: 'sp' | 'pc';
  colorScheme: ColorScheme;
  pagePath: string;
  artifactName: string;
  maxDiffRatio?: number;
};

const cases: VisualRegressionCase[] = [
  {
    id: 'T1',
    description: '404 page should match screenshot in SP light mode',
    project: 'sp',
    colorScheme: 'light',
    pagePath: '/404',
    artifactName: '404-sp-light',
  },
  {
    id: 'T2',
    description: '404 page should match screenshot in PC light mode',
    project: 'pc',
    colorScheme: 'light',
    pagePath: '/404',
    artifactName: '404-pc-light',
  },
  {
    id: 'T3',
    description: '404 page should match screenshot in SP dark mode',
    project: 'sp',
    colorScheme: 'dark',
    pagePath: '/404',
    artifactName: '404-sp-dark',
  },
  {
    id: 'T4',
    description: '404 page should match screenshot in PC dark mode',
    project: 'pc',
    colorScheme: 'dark',
    pagePath: '/404',
    artifactName: '404-pc-dark',
  },
  {
    id: 'T5',
    description: 'tags page should match screenshot in SP light mode',
    project: 'sp',
    colorScheme: 'light',
    pagePath: '/tags',
    artifactName: 'tags-sp-light',
  },
  {
    id: 'T6',
    description: 'tags page should match screenshot in PC light mode',
    project: 'pc',
    colorScheme: 'light',
    pagePath: '/tags',
    artifactName: 'tags-pc-light',
  },
  {
    id: 'T7',
    description: 'tags page should match screenshot in SP dark mode',
    project: 'sp',
    colorScheme: 'dark',
    pagePath: '/tags',
    artifactName: 'tags-sp-dark',
  },
  {
    id: 'T8',
    description: 'tags page should match screenshot in PC dark mode',
    project: 'pc',
    colorScheme: 'dark',
    pagePath: '/tags',
    artifactName: 'tags-pc-dark',
  },
  {
    id: 'T9',
    description: 'top page should match screenshot in SP light mode',
    project: 'sp',
    colorScheme: 'light',
    pagePath: '/',
    artifactName: 'top-sp-light',
  },
  {
    id: 'T10',
    description: 'top page should match screenshot in PC light mode',
    project: 'pc',
    colorScheme: 'light',
    pagePath: '/',
    artifactName: 'top-pc-light',
  },
  {
    id: 'T11',
    description: 'top page should match screenshot in SP dark mode',
    project: 'sp',
    colorScheme: 'dark',
    pagePath: '/',
    artifactName: 'top-sp-dark',
  },
  {
    id: 'T12',
    description: 'top page should match screenshot in PC dark mode',
    project: 'pc',
    colorScheme: 'dark',
    pagePath: '/',
    artifactName: 'top-pc-dark',
  },
  {
    id: 'T13',
    description: 'article page should match screenshot in SP light mode',
    project: 'sp',
    colorScheme: 'light',
    pagePath: '/blog/20200520',
    artifactName: 'article-sp-light',
  },
  {
    id: 'T14',
    description: 'article page should match screenshot in PC light mode',
    project: 'pc',
    colorScheme: 'light',
    pagePath: '/blog/20200520',
    artifactName: 'article-pc-light',
  },
  {
    id: 'T15',
    description: 'article page should match screenshot in SP dark mode',
    project: 'sp',
    colorScheme: 'dark',
    pagePath: '/blog/20200520',
    artifactName: 'article-sp-dark',
  },
  {
    id: 'T16',
    description: 'article page should match screenshot in PC dark mode',
    project: 'pc',
    colorScheme: 'dark',
    pagePath: '/blog/20200520',
    artifactName: 'article-pc-dark',
  },
];

const DEFAULT_MAX_DIFF_RATIO = 0.001;
const previewBaseUrl = getPreviewBaseUrl();

test.describe('Visual regression', () => {
  for (const visualCase of cases) {
    test(`${visualCase.id}: ${visualCase.description}`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== visualCase.project,
        `${visualCase.id} is ${visualCase.project.toUpperCase()} only`,
      );

      if (previewBaseUrl.source === 'fallback-production') {
        testInfo.annotations.push({
          type: 'warning',
          description:
            'VERCEL_PREVIEW_URL is not set. Comparing production against production.',
        });
      }

      const productionUrl = buildPageUrl(PRODUCTION_BASE_URL, visualCase.pagePath);
      const previewUrl = buildPageUrl(previewBaseUrl.url, visualCase.pagePath);
      const productionPath = path.join(
        'test-results',
        'production',
        `${visualCase.artifactName}.png`,
      );
      const previewPath = path.join(
        'test-results',
        'preview',
        `${visualCase.artifactName}.png`,
      );
      const diffPath = path.join(
        'test-results',
        'diff',
        `${visualCase.artifactName}.png`,
      );
      const reportPath = path.join(
        'test-results',
        'diff',
        `${visualCase.artifactName}.json`,
      );
      const threshold = visualCase.maxDiffRatio ?? DEFAULT_MAX_DIFF_RATIO;

      await takeScreenshot(page, {
        url: productionUrl,
        colorScheme: visualCase.colorScheme,
        outputPath: productionPath,
      });
      await takeScreenshot(page, {
        url: previewUrl,
        colorScheme: visualCase.colorScheme,
        outputPath: previewPath,
      });

      const result = await compareScreenshots({
        productionPath,
        previewPath,
        diffPath,
        reportPath,
        comparisonThreshold: threshold,
      });

      expect(
        result.diffRatio,
        `diffRatio (${result.diffRatio}) exceeded threshold (${threshold}) for ${visualCase.id}`,
      ).toBeLessThanOrEqual(threshold);
    });
  }
});
