import { defineConfig } from 'astro/config';

import { loadCompetition } from './src/lib/data/load.ts';

function dataValidation() {
  return {
    name: 'copa-data-validation',
    hooks: {
      'astro:build:start': () => {
        loadCompetition('data/2026/copa.yaml');
      },
    },
  };
}

export default defineConfig({
  site: 'https://grazielevasconcelos.github.io',
  base: '/futsal-cup/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [dataValidation()],
  vite: { build: { cssMinify: true } },
});
