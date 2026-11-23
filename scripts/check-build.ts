import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const distDirectory = 'dist';
const errors: string[] = [];
const forbiddenTerms = [
  'sesc',
  'airbnb',
  '@font-face',
  'amistoso',
  'shootout',
  'disputa de pênaltis',
  'prorrogação',
];
const proprietaryFontPattern = /font-family\s*:[^;}]*(?:cereal|circular)/i;
const playerIdPattern = /\bp-\d{3}\b/;

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
  ...['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'semi', 'final'].map(
    (matchId) => `jogos/${matchId}/index.html`,
  ),
  ...['ta', 'tb', 'tc'].map((teamId) => `times/${teamId}/index.html`),
];

for (const file of requiredFiles) {
  if (!relativeFiles.includes(file)) {
    fail(`Arquivo obrigatório ausente: dist/${file}`);
  }
}

const javascriptFiles = relativeFiles.filter((file) => /\.(?:js|mjs|cjs)$/i.test(file));
if (javascriptFiles.length > 0) {
  fail(`Arquivo JavaScript externo não permitido encontrado em dist/: ${javascriptFiles.join(', ')}`);
}

const referenceFiles = relativeFiles.filter((file) => /airbnb/i.test(file));
if (referenceFiles.length > 0) {
  fail(`Arquivo de referência visual encontrado em dist/: ${referenceFiles.join(', ')}`);
}

const fontFiles = relativeFiles.filter((file) => /\.(?:woff2?|ttf|otf|eot)$/i.test(file));
if (fontFiles.length > 0) {
  fail(`Arquivo de fonte encontrado em dist/: ${fontFiles.join(', ')}`);
}

const rasterFiles = relativeFiles.filter((file) => /\.(?:png|jpe?g|gif|webp|avif)$/i.test(file));
const unsupportedRasterFiles = rasterFiles.filter(
  (file) => !/^images\/times\/[a-z0-9-]+\.(?:png|jpe?g|webp)$/i.test(file),
);
if (unsupportedRasterFiles.length > 0) {
  fail(`Imagem raster fora dos logos locais de times em dist/: ${unsupportedRasterFiles.join(', ')}`);
}
for (const file of rasterFiles) {
  const size = statSync(join(distDirectory, file)).size;
  if (size > 200 * 1024) {
    fail(`Logo raster acima de 200 KB em dist/${file}: ${size} bytes`);
  }
}

const forbiddenPaths = relativeFiles.filter((file) =>
  /regulamento|jogos\/terceiro|times\/td/i.test(file),
);
if (forbiddenPaths.length > 0) {
  fail(`Rota proibida encontrada em dist/: ${forbiddenPaths.join(', ')}`);
}

const basePath = '/futsal-cup/';
const brokenLinks = new Map<string, string>();

function resolveInternalTarget(href: string): string | null {
  if (!href.startsWith(basePath)) {
    return null;
  }

  const pathname = href.split('#')[0]?.split('?')[0] ?? '';
  const relativePath = pathname.slice(basePath.length);

  if (relativePath === '') {
    return 'index.html';
  }

  return relativePath.endsWith('/') ? `${relativePath}index.html` : relativePath;
}

function checkInternalLink(href: string, page: string): void {
  if (/^javascript:/i.test(href)) {
    fail(`Link javascript: encontrado em dist/${page}`);
    return;
  }

  const target = resolveInternalTarget(href);
  if (target !== null && !relativeFiles.includes(target)) {
    brokenLinks.set(`${href} (${page})`, `Link interno sem destino em dist/${page}: ${href}`);
  }
}

const titles = new Map<string, string>();
const descriptions = new Map<string, string>();

for (const file of htmlFiles) {
  const relativePath = relative(distDirectory, file);
  const html = readFileSync(file, 'utf8');
  const gzipSize = gzipSync(html).byteLength;

  for (const match of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
    const value = match[1];
    if (value !== undefined) {
      checkInternalLink(value, relativePath);
    }
  }

  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  if (scripts.length !== 1) {
    fail(`Esperada exatamente uma inicialização inline do tema em dist/${relativePath}; encontradas ${scripts.length}.`);
  }

  const themeScript = scripts[0];
  if (themeScript !== undefined) {
    const attributes = themeScript[1] ?? '';
    const content = themeScript[2] ?? '';
    if (!/\bdata-theme-script(?:\s|$)/i.test(attributes) || /\bsrc\s*=/i.test(attributes)) {
      fail(`Script inesperado em dist/${relativePath}; somente o script inline de tema é permitido.`);
    }
    if (!content.includes('futsal-cup-theme') || !content.includes('localStorage')) {
      fail(`Inicialização do tema sem leitura da preferência local em dist/${relativePath}.`);
    }
    if (gzipSync(Buffer.from(content)).byteLength > 1024) {
      fail(`JavaScript inline acima de 1 KB gzip em dist/${relativePath}.`);
    }
  }

  if (!html.includes('lang="pt-BR"')) {
    fail(`Idioma pt-BR ausente em dist/${relativePath}`);
  }

  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1];
  if (title === undefined) {
    fail(`Título ausente em dist/${relativePath}`);
  } else {
    const previous = titles.get(title);
    if (previous !== undefined) {
      fail(`Título duplicado em dist/${previous} e dist/${relativePath}: ${title}`);
    } else {
      titles.set(title, relativePath);
    }
  }

  const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1];
  if (description === undefined) {
    fail(`Descrição ausente em dist/${relativePath}`);
  } else {
    const length = [...description].length;
    if (length < 50 || length > 160) {
      fail(`Descrição fora de 50..160 caracteres em dist/${relativePath}: ${length}`);
    }

    const previous = descriptions.get(description);
    if (previous !== undefined) {
      fail(`Descrição duplicada em dist/${previous} e dist/${relativePath}`);
    } else {
      descriptions.set(description, relativePath);
    }
  }

  if (relativePath !== '404.html') {
    for (const marker of [
      'rel="canonical"',
      'property="og:title"',
      'property="og:description"',
      'property="og:url"',
      'property="og:type"',
      'property="og:site_name"',
    ]) {
      if (!html.includes(marker)) {
        fail(`Metadado ${marker} ausente em dist/${relativePath}`);
      }
    }

    if (html.includes('property="og:image"')) {
      fail(`Open Graph com imagem não é permitido em dist/${relativePath}`);
    }
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

  if (playerIdPattern.test(html)) {
    fail(`ID de jogadora encontrado em dist/${relativePath}`);
  }

  if (/\b(?:mailto|tel):/i.test(html)) {
    fail(`Link de contato pessoal encontrado em dist/${relativePath}`);
  }
}

for (const message of brokenLinks.values()) {
  fail(message);
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

console.log(
  `Build válido: ${htmlFiles.length} HTML, ${cssFiles.length} CSS e script inline de tema ≤ 1 KB gzip.`,
);
