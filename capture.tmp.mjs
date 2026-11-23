import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.env.BASE_URL;
const outRoot = process.env.OUT_DIR;
const routes = [
  ['inicio', ''],
  ['jogos', 'jogos/'],
  ['partida-final', 'jogos/final/'],
  ['times', 'times/'],
  ['time-ta', 'times/ta/'],
  ['classificacao', 'classificacao/'],
  ['fase-final', 'fase-final/'],
];
const widths = [320, 390, 768, 1280];
const themes = ['light', 'dark'];

const browser = await chromium.launch();
const report = [];

for (const width of widths) {
  for (const theme of themes) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: 'light',
    });
    const page = await context.newPage();
    await page.addInitScript((value) => {
      localStorage.setItem('futsal-cup-theme', value);
    }, theme);

    for (const [name, path] of routes) {
      await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        theme: document.documentElement.dataset.theme,
      }));

      if (metrics.scrollWidth > metrics.clientWidth) {
        report.push({ width, theme, route: path, overflow: metrics.scrollWidth - metrics.clientWidth });
      }
      if (metrics.theme !== theme) {
        report.push({ width, theme, route: path, wrongTheme: metrics.theme });
      }

      const dir = `${outRoot}/${width}-${theme}`;
      mkdirSync(dir, { recursive: true });
      await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
    }

    await context.close();
  }
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
console.log('capturas em', outRoot);
