import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/web/**/*.test.ts'],
    root: path.resolve(__dirname, '..'),
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'app/components'),
    },
  },
});
