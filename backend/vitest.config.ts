import { defineConfig } from 'vitest/config';

process.env.NODE_ENV = 'test';
process.env.USE_MONGODB = 'false';

export default defineConfig({
  test: {
    testTimeout: 10000
  }
});
