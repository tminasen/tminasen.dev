import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // ユニットテストはテスト対象と同じ場所に置く（src 配下でコロケーション）。
    // tests/visual-regression は Playwright 専用のため、この include には元々かからない。
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
