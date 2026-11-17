/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/data/**/*.test.ts'],
    environment: 'node',
    globals: false,
    coverage: { enabled: false },
  },
});
