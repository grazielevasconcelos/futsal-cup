import baseConfig from './astro.config.mjs';

// Build de teste do E2E: usa a fixture concluída e mantém dist/ de produção intacto.
export default {
  ...baseConfig,
  outDir: 'dist-test',
};
