import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    // mongodb-memory-server can take a while to boot on first run.
    testTimeout: 60_000,
    hookTimeout: 120_000,
    // Run serially — the tests share one in-memory database.
    fileParallelism: false,
  },
});
