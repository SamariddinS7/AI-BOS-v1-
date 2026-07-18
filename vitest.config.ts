import { defineConfig } from 'vitest/config';
import path from 'path';

// Root vitest config — runs all tests in the monorepo.
// Each app also has its own vitest.config.ts for workspace-scoped runs.
export default defineConfig({
  test: {
    globals: true,
    include: [
      'apps/web/src/**/*.test.{ts,tsx}',
      'apps/api/src/**/*.test.ts',
    ],
    env: {
      GEMINI_API_KEY: 'test-key',
      API_PORT: '5001',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web/src'),
    },
  },
});
