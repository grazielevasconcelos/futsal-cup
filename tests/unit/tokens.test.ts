import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const tokensPath = fileURLToPath(new URL('../../src/styles/tokens.css', import.meta.url));
const tokensCss = readFileSync(tokensPath, 'utf8');

const declarations = new Map<string, string>();
for (const match of tokensCss.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
  const [, name, value] = match;
  if (name && value) {
    declarations.set(name, value.trim());
  }
}

function readToken(name: string): string {
  const value = declarations.get(name);
  if (!value) {
    throw new Error(`Token ausente: ${name}`);
  }
  return value;
}

function parseHex(value: string): readonly [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match?.[1]) {
    throw new Error(`Cor hexadecimal inválida: ${value}`);
  }

  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function relativeLuminance(value: string): number {
  const channels = parseHex(value).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  const [red = 0, green = 0, blue = 0] = channels;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

const requiredTokens = [
  '--color-text',
  '--color-text-muted',
  '--color-surface',
  '--color-surface-subtle',
  '--color-border',
  '--color-accent',
  '--color-accent-strong',
  '--color-on-accent',
  '--color-focus',
  '--font-family-body',
  '--text-display-size',
  '--text-display-line',
  '--text-heading-1-size',
  '--text-heading-1-line',
  '--text-heading-2-size',
  '--text-heading-2-line',
  '--text-body-size',
  '--text-body-line',
  '--text-small-size',
  '--text-small-line',
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-5',
  '--space-6',
  '--radius-small',
  '--radius-card',
  '--radius-pill',
  '--shadow-card',
  '--shadow-floating',
  '--motion-default',
  '--page-gutter',
  '--content-max',
  '--measure',
  '--tap-target',
  '--border-width',
  '--focus-width',
  '--focus-offset',
  '--table-min-width',
  '--site-title-max',
  '--underline-width',
  '--underline-width-hover',
  '--underline-offset',
  '--z-skip-link',
  '--gradient-accent',
] as const;

describe('tokens do projeto', () => {
  it.each(requiredTokens)('define %s', (token) => {
    expect(declarations.has(token)).toBe(true);
  });

  it('não contém fontes proprietárias nem importações externas', () => {
    expect(tokensCss).not.toMatch(/airbnb/i);
    expect(tokensCss).not.toMatch(/cereal/i);
    expect(tokensCss).not.toMatch(/circular/i);
    expect(tokensCss).not.toMatch(/@font-face/i);
    expect(tokensCss).not.toMatch(/fonts\.(googleapis|gstatic)/i);
  });

  it.each([
    ['texto principal sobre superfície', '--color-text', '--color-surface', 4.5],
    ['texto principal sobre superfície sutil', '--color-text', '--color-surface-subtle', 4.5],
    ['texto secundário sobre superfície', '--color-text-muted', '--color-surface', 4.5],
    ['texto secundário sobre superfície sutil', '--color-text-muted', '--color-surface-subtle', 4.5],
    ['superfície sobre texto principal', '--color-surface', '--color-text', 4.5],
    ['texto sobre acento', '--color-text', '--color-accent', 4.5],
    ['acento sobre superfície (texto grande)', '--color-accent', '--color-surface', 3],
    ['acento forte sobre superfície', '--color-accent-strong', '--color-surface', 4.5],
    ['foco sobre superfície', '--color-focus', '--color-surface', 3],
    ['foco sobre superfície sutil', '--color-focus', '--color-surface-subtle', 3],
    ['foco sobre acento', '--color-focus', '--color-accent', 3],
    ['foco sobre acento forte', '--color-focus', '--color-accent-strong', 3],
  ])('%s atende ao contraste mínimo', (_label, foregroundToken, backgroundToken, minimum) => {
    const foreground = readToken(foregroundToken);
    const background = readToken(backgroundToken);
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(minimum);
  });
});
