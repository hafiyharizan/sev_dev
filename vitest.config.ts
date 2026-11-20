import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  oxc: { jsx: { runtime: 'automatic' } }, // tsconfig uses jsx: preserve for Next.js; tests need real transforms
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      // the real package throws outside the Next.js server bundle
      'server-only': path.resolve(__dirname, 'tests/stubs/server-only.ts'),
    },
  },
});
