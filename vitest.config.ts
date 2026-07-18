import { defineWorkspace } from 'vitest/config';

// Root vitest config runs tests from all workspaces.
// Each app can also run its own tests via: npm test -w apps/api
export default defineWorkspace([
  {
    test: {
      name: 'web',
      root: './apps/web',
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      env: {
        GEMINI_API_KEY: 'test-key',
      },
    },
  },
  {
    test: {
      name: 'api',
      root: './apps/api',
      globals: true,
      environment: 'node',
      env: {
        GEMINI_API_KEY: 'test-key',
        API_PORT: '5001',
      },
    },
  },
]);
