import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const distDirectory = 'dist';
const errors: string[] = [];
const forbiddenTerms = ['sesc', 'airbnb', '@font-face'];
const proprietaryFontPattern = /font-family\s*:[^;}]*(?:cereal|circular)/i;

function fail(message: string): void {
  errors.push(message);
}

function listFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

if (!existsSync(distDirectory)) {
  console.error('dist/ não encontrado. Rode npm run build antes de npm run test:build.');
  process.exit(1);
}

const files = listFiles(distDirectory);
const relativeFiles = files.map((file) => relative(distDirectory, file));
const htmlFiles = files.filter((file) => extname(file) === '.html');
const cssFiles = files.filter((file) => extname(file) === '.css');

const requiredFiles = [
  'index.html',
  '404.html',
  'favicon.svg',
  'jogos/index.html',
  'classificacao/index.html',
  'times/index.html',
  'estatisticas/index.html',
  'fase-final/index.html',
];

for (const file of requiredFiles) {
  if (!relativeFiles.includes(file)) {
    fail(`Arquivo obrigatório ausente: dist/${file}`);
  }
}

const javascriptFiles = relativeFiles.filter((file) => /\.(?:js|mjs|cjs)$/i.test(file));
if (javascriptFiles.length > 0) {
  fail(`JavaScript de cliente encontrado em dist/: ${javascriptFiles.join(', ')}`);
}

const referenceFiles = relativeFiles.filter((file) => /airbnb/i.test(file));
if (referenceFiles.length > 0) {
  fail(`Arquivo de referência visual encontrado em dist/: ${referenceFiles.join(', ')}`);
}

const fontFiles = relativeFiles.filter((file) => /\.(?:woff2?|ttf|otf|eot)$/i.test(file));
if (fontFiles.length > 0) {
  fail(`Arquivo de fonte encontrado em dist/: ${fontFiles.join(', ')}`);
}

const forbiddenPaths = relativeFiles.filter((file) => /regulamento/i.test(file));
if (forbiddenPaths.length > 0) {
  fail(`Rota de Regulamento encontrada em dist/: ${forbiddenPaths.join(', ')}`);
}

for (const file of htmlFiles) {
  const relativePath = relative(distDirectory, file);
  const html = readFileSync(file, 'utf8');
  const gzipSize = gzipSync(html).byteLength;

  if (html.includes('<script')) {
    fail(`Tag <script> encontrada em dist/${relativePath}`);
  }

  if (!html.includes('lang="pt-BR"')) {
    fail(`Idioma pt-BR ausente em dist/${relativePath}`);
  }

  if (/regulamento/i.test(html)) {
    fail(`Referência a Regulamento encontrada em dist/${relativePath}`);
  }

  if (gzipSize > 60 * 1024) {
    fail(`HTML acima de 60 KB gzip em dist/${relativePath}: ${gzipSize} bytes`);
  }

  for (const term of forbiddenTerms) {
    if (html.toLowerCase().includes(term)) {
      fail(`Termo proibido "${term}" encontrado em dist/${relativePath}`);
    }
  }

  if (proprietaryFontPattern.test(html)) {
    fail(`Fonte proprietária encontrada em dist/${relativePath}`);
  }
}

for (const file of cssFiles) {
  const relativePath = relative(distDirectory, file);
  const css = readFileSync(file, 'utf8');
  const gzipSize = gzipSync(css).byteLength;

  if (gzipSize > 30 * 1024) {
    fail(`CSS acima de 30 KB gzip em dist/${relativePath}: ${gzipSize} bytes`);
  }

  for (const term of forbiddenTerms) {
    if (css.toLowerCase().includes(term)) {
      fail(`Termo proibido "${term}" encontrado em dist/${relativePath}`);
    }
  }

  if (proprietaryFontPattern.test(css)) {
    fail(`Fonte proprietária encontrada em dist/${relativePath}`);
  }
}

const notFoundPath = join(distDirectory, '404.html');
if (existsSync(notFoundPath)) {
  const notFound = readFileSync(notFoundPath, 'utf8');
  if (!notFound.includes('noindex')) {
    fail('A página 404 deve conter meta robots noindex.');
  }
  if (notFound.includes('rel="canonical"') || notFound.includes('property="og:')) {
    fail('A página 404 não deve conter canonical nem Open Graph.');
  }
}

if (errors.length > 0) {
  console.error('Falhas na checagem do build:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Build válido: ${htmlFiles.length} HTML, ${cssFiles.length} CSS, 0 KB de JS de cliente.`);
