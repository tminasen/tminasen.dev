import { expect, test } from '@playwright/test';

type VisualFailure = {
  id: string;
  description: string;
  project: string;
  diffRatio: number | null;
  threshold: number | null;
};

type ParserModule = {
  extractFailuresFromReport: (report: unknown) => VisualFailure[];
  buildVisualRegressionComment: (input: {
    failures: VisualFailure[];
    reportUrl: string;
  }) => string;
};

const parser = require('../../.github/scripts/parse-visual-regression-results.js') as ParserModule;

test.describe('parse visual regression results', () => {
  test('should extract failed visual test entries when report has failed tests', () => {
    const report = {
      suites: [
        {
          title: 'Visual regression',
          specs: [
            {
              title: 'T1: 404 page should match screenshot in SP light mode',
              tests: [
                {
                  projectName: 'sp',
                  results: [
                    {
                      status: 'failed',
                      errors: [
                        {
                          message:
                            'Error: diffRatio (0.0041) exceeded threshold (0.001) for T1',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          suites: [],
        },
      ],
    };

    const failures = parser.extractFailuresFromReport(report);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatchObject({
      id: 'T1',
      description: '404 page should match screenshot in SP light mode',
      project: 'sp',
      diffRatio: 0.0041,
      threshold: 0.001,
    });
  });

  test('should keep failed test entry even when diff metrics are not in error message', () => {
    const report = {
      suites: [
        {
          title: 'Visual regression',
          specs: [
            {
              title: 'T2: tags page should match screenshot in PC dark mode',
              tests: [
                {
                  projectName: 'pc',
                  results: [
                    {
                      status: 'failed',
                      errors: [{ message: 'Timeout of 60000ms exceeded.' }],
                    },
                  ],
                },
              ],
            },
          ],
          suites: [],
        },
      ],
    };

    const failures = parser.extractFailuresFromReport(report);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatchObject({
      id: 'T2',
      description: 'tags page should match screenshot in PC dark mode',
      diffRatio: null,
      threshold: null,
    });
  });

  test('should return empty failure list when report has no failed tests', () => {
    const report = {
      suites: [
        {
          title: 'Visual regression',
          specs: [
            {
              title: 'T3: top page should match screenshot in PC light mode',
              tests: [
                {
                  projectName: 'pc',
                  results: [{ status: 'passed', errors: [] }],
                },
              ],
            },
          ],
          suites: [],
        },
      ],
    };

    const failures = parser.extractFailuresFromReport(report);

    expect(failures).toEqual([]);
  });

  test('should build comment body with identifier, failed table and report URL', () => {
    const body = parser.buildVisualRegressionComment({
      failures: [
        {
          id: 'T1',
          description: '404 page should match screenshot in SP light mode',
          project: 'sp',
          diffRatio: 0.0041,
          threshold: 0.001,
        },
      ],
      reportUrl: 'https://example.github.io/repo/pr-123/',
    });

    expect(body).toMatch(/<!-- visual-regression-report -->/);
    expect(body).toMatch(
      /\| T1 \| 404 page should match screenshot in SP light mode \| SP \| 0.41% \| 0.10% \|/,
    );
    expect(body).toMatch(
      /\[View HTML Report\]\(https:\/\/example.github.io\/repo\/pr-123\/\)/,
    );
  });
});
