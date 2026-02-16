export const PRODUCTION_BASE_URL = 'https://tminasen.dev';

export type PreviewUrlSource = 'env' | 'fallback-production';

export type PreviewBaseUrl = {
  url: string;
  source: PreviewUrlSource;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getPreviewBaseUrl(): PreviewBaseUrl {
  const previewUrl = process.env.VERCEL_PREVIEW_URL?.trim();

  if (previewUrl) {
    return {
      url: normalizeBaseUrl(previewUrl),
      source: 'env',
    };
  }

  return {
    url: PRODUCTION_BASE_URL,
    source: 'fallback-production',
  };
}

export function buildPageUrl(baseUrl: string, pagePath: string): string {
  return new URL(pagePath, `${normalizeBaseUrl(baseUrl)}/`).toString();
}
