import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://grazielevasconcelos.github.io',
  base: '/futsal-cup/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  vite: { build: { cssMinify: true } },
});
