import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const printPath = fileURLToPath(new URL('../../src/styles/print.css', import.meta.url));
const tokensPath = fileURLToPath(new URL('../../src/styles/tokens.css', import.meta.url));

const printCss = readFileSync(printPath, 'utf8');
const tokensCss = readFileSync(tokensPath, 'utf8');
const printTokens = tokensCss.slice(tokensCss.indexOf('@media print'));

describe('impressão', () => {
  it('define uma página A4 retrato com margens em milímetros', () => {
    expect(printCss).toMatch(/@page\s*\{[^}]*size:\s*A4 portrait;/);
    expect(printCss).toMatch(/@page\s*\{[^}]*margin:\s*12mm 14mm 16mm;/);
  });

  it('força o tema claro e mantém as cores de impressão nos tokens', () => {
    expect(printTokens).toMatch(/color-scheme:\s*light;/);
    expect(printTokens).toMatch(/--color-surface:\s*#ffffff;/);
    expect(printTokens).toMatch(/--color-text:\s*#222222;/);
    expect(printTokens).toMatch(/--shadow-card:\s*none;/);
    expect(printTokens).toMatch(/--shadow-floating:\s*none;/);
  });

  it('aplica a escala tipográfica de papel em pt', () => {
    expect(printTokens).toMatch(/--text-display-size:\s*22pt;/);
    expect(printTokens).toMatch(/--text-heading-1-size:\s*18pt;/);
    expect(printTokens).toMatch(/--text-heading-2-size:\s*13pt;/);
    expect(printTokens).toMatch(/--text-body-size:\s*10pt;/);
    expect(printTokens).toMatch(/--text-small-size:\s*8\.5pt;/);
    expect(printTokens).toMatch(/--team-logo-size:\s*3\.5rem;/);
    expect(printTokens).toMatch(/--team-logo-size-lg:\s*7rem;/);
    expect(printTokens).toMatch(/--print-table-cell-padding-block:\s*3pt;/);
    expect(printTokens).toMatch(/--print-table-cell-padding-inline:\s*4pt;/);
  });

  it('oculta navegação, controles e dicas que não fazem sentido no papel', () => {
    for (const selector of [
      '.skip-link',
      '.theme-toggle',
      '.primary-nav',
      '.menu-mobile',
      '.table-scroll__hint',
      '.page-back',
      '.section--nav',
      '.print-help',
    ]) {
      expect(printCss).toMatch(
        new RegExp(`${selector.replace('.', '\\.')}[\\s,][^}]*display:\\s*none`),
      );
    }
  });

  it('libera a rolagem das tabelas e mantém o cabeçalho em cada página', () => {
    expect(printCss).toMatch(/\.table-scroll\s*\{[^}]*overflow:\s*visible;/);
    expect(printCss).toMatch(/\.data-table--wide\s*\{[^}]*min-width:\s*0;/);
    expect(printCss).toMatch(/\.data-table thead\s*\{[^}]*display:\s*table-header-group;/);
    expect(printCss).toMatch(/\.data-table thead th\s*\{[^}]*print-color-adjust:\s*exact;/);
  });

  it('evita quebra dentro de cards e linhas e preserva órfãs e viúvas', () => {
    expect(printCss).toMatch(/\.card-grid > li,[\s\S]*?break-inside:\s*avoid;/);
    expect(printCss).toMatch(/\.data-table tr\s*\{[^}]*break-inside:\s*avoid;/);
    expect(printCss).toMatch(/h1,\s*h2,\s*h3,[\s\S]*?break-after:\s*avoid;/);
    expect(printCss).toMatch(/orphans:\s*3;/);
    expect(printCss).toMatch(/widows:\s*3;/);
  });

  it('não usa cores avulsas, imports ou requisições externas', () => {
    expect(printCss).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(printCss).not.toMatch(/\brgba?\(/i);
    expect(printCss).not.toMatch(/@import/i);
    expect(printCss).not.toMatch(/https?:/i);
  });
});
