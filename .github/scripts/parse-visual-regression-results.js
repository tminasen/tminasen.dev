const fs = require('fs');
const path = require('path');

const COMMENT_IDENTIFIER = '<!-- visual-regression-report -->';
const DEFAULT_REPORT_PATH = 'test-results/playwright-report.json';
const DEFAULT_OUTPUT_PATH = 'test-results/visual-regression-comment.md';
const DIFF_MESSAGE_PATTERN =
  /diffRatio\s*\(([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\)\s*exceeded threshold\s*\(([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\)\s*for\s*(T\d+)/i;

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseSpecTitle(title) {
  if (typeof title !== 'string') {
    return { id: null, description: '' };
  }
  const match = title.match(/^\s*(T\d+)\s*:\s*(.+)\s*$/);
  if (!match) {
    return { id: null, description: title.trim() };
  }
  return {
    id: match[1],
    description: match[2].trim(),
  };
}

function getErrorMessages(result) {
  const errors = toArray(result?.errors);
  const messages = [];
  for (const error of errors) {
    if (error && typeof error.message === 'string') {
      messages.push(error.message);
    }
  }
  if (result?.error && typeof result.error.message === 'string') {
    messages.push(result.error.message);
  }
  return messages;
}

function parseDiffMetrics(messages) {
  for (const message of messages) {
    const match = String(message).match(DIFF_MESSAGE_PATTERN);
    if (match) {
      return {
        id: match[3],
        diffRatio: Number.parseFloat(match[1]),
        threshold: Number.parseFloat(match[2]),
      };
    }
  }
  return {
    id: null,
    diffRatio: null,
    threshold: null,
  };
}

function isFailedStatus(status) {
  return status === 'failed' || status === 'timedOut' || status === 'interrupted';
}

function walkSuites(suites, visitor) {
  for (const suite of toArray(suites)) {
    for (const spec of toArray(suite.specs)) {
      visitor(spec);
    }
    walkSuites(suite.suites, visitor);
  }
}

function extractFailuresFromReport(report) {
  const failures = [];
  walkSuites(report?.suites, spec => {
    const parsedTitle = parseSpecTitle(spec?.title);
    for (const testCase of toArray(spec?.tests)) {
      const results = toArray(testCase?.results);
      const finalResult = results.at(-1);
      const failedByStatus = isFailedStatus(testCase?.status);
      const failedByFinalResult = isFailedStatus(finalResult?.status);
      if (!failedByStatus && !failedByFinalResult) {
        continue;
      }

      const failedResults = results.filter(result => isFailedStatus(result?.status));
      const failureSources = failedResults.length > 0 ? failedResults : [finalResult];
      const messages = failureSources.flatMap(getErrorMessages);
      const metrics = parseDiffMetrics(messages);
      const id = metrics.id || parsedTitle.id || 'UNKNOWN';
      const description = parsedTitle.description || String(spec?.title || '').trim();
      const project = typeof testCase?.projectName === 'string' ? testCase.projectName : '';

      failures.push({
        id,
        description,
        project,
        diffRatio: Number.isFinite(metrics.diffRatio) ? metrics.diffRatio : null,
        threshold: Number.isFinite(metrics.threshold) ? metrics.threshold : null,
      });
    }
  });

  return failures;
}

function formatPercent(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'N/A';
  }
  return `${(value * 100).toFixed(2)}%`;
}

function normalizeProject(project) {
  if (!project) {
    return '-';
  }
  return String(project).toUpperCase();
}

function buildVisualRegressionComment(input) {
  const failures = toArray(input?.failures);
  const reportUrl = String(input?.reportUrl || '').trim();
  const lines = [
    COMMENT_IDENTIFIER,
    '## ⚠️ Visual Regression Test Failed',
    '',
  ];

  if (failures.length === 0) {
    lines.push(
      '失敗は検出されましたが、失敗テストの詳細を抽出できませんでした。',
      '',
    );
  } else {
    const failedIds = [...new Set(failures.map(failure => failure.id))];
    lines.push(`**失敗:** ${failedIds.join(', ')}`, '');
    lines.push('| Test ID | Description | Project | Diff Ratio | Threshold |');
    lines.push('|---------|-------------|---------|------------|-----------|');

    for (const failure of failures) {
      const safeDescription = String(failure.description || '').replace(/\|/g, '\\|');
      lines.push(
        `| ${failure.id} | ${safeDescription} | ${normalizeProject(
          failure.project,
        )} | ${formatPercent(failure.diffRatio)} | ${formatPercent(failure.threshold)} |`,
      );
    }
    lines.push('');
  }

  if (reportUrl) {
    lines.push(`**Detailed Report:** [View HTML Report](${reportUrl})`, '');
  }

  lines.push(
    '---',
    '<details>',
    '<summary>How to fix</summary>',
    '',
    '1. HTMLレポートで差分を確認',
    '2. 意図した変更ならこのPRをマージ',
    '3. 意図しない変更ならスタイルを修正',
    '',
    '</details>',
    '',
  );

  return lines.join('\n');
}

function parseCliArgs(argv) {
  const args = {
    reportPath: DEFAULT_REPORT_PATH,
    outputPath: DEFAULT_OUTPUT_PATH,
    reportUrl: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--report-path' && argv[i + 1]) {
      args.reportPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--output-path' && argv[i + 1]) {
      args.outputPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--report-url' && argv[i + 1]) {
      args.reportUrl = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function runCli(argv) {
  const args = parseCliArgs(argv);
  let report = {};

  if (fs.existsSync(args.reportPath)) {
    const raw = fs.readFileSync(args.reportPath, 'utf-8');
    report = JSON.parse(raw);
  }

  const failures = extractFailuresFromReport(report);
  const body = buildVisualRegressionComment({
    failures,
    reportUrl: args.reportUrl,
  });

  fs.mkdirSync(path.dirname(args.outputPath), { recursive: true });
  fs.writeFileSync(args.outputPath, body);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `failure_count=${failures.length}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `comment_path=${args.outputPath}\n`);
  }
}

if (require.main === module) {
  runCli(process.argv.slice(2));
}

module.exports = {
  COMMENT_IDENTIFIER,
  extractFailuresFromReport,
  buildVisualRegressionComment,
  runCli,
};
