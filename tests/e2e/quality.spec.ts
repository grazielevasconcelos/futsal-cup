import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const routes = [
  '',
  'jogos/',
  'jogos/g1/',
  'jogos/g2/',
  'jogos/g3/',
  'jogos/g4/',
  'jogos/g5/',
  'jogos/g6/',
  'jogos/final/',
  'classificacao/',
  'times/',
  'times/ta/',
  'times/tb/',
  'times/tc/',
  'estatisticas/',
  'fase-final/',
] as const;

const tableRoutes = [
  'classificacao/',
  'times/ta/',
  'estatisticas/',
] as const;

async function tabUntilFocused(page: Page, selector: string, maxTabs = 60): Promise<void> {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(
      (target) => document.activeElement?.matches(target) ?? false,
      selector,
    );
    if (focused) {
      return;
    }
  }

  throw new Error(`Não foi possível focar ${selector} com Tab em ${maxTabs} tentativas.`);
}

test.describe('qualidade e acessibilidade', () => {
  test('as páginas não fazem requisições de terceiros', async ({ page }) => {
    const externalRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) {
        return;
      }

      if (new URL(url).origin !== 'http://127.0.0.1:4321') {
        externalRequests.push(url);
      }
    });

    for (const path of routes) {
      await page.goto(path);
    }

    expect(externalRequests).toEqual([]);
  });

  test('o foco visível aparece no skip link e no contêiner de tabela', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('classificacao/');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(skipLink).toBeFocused();

    const skipLinkOutline = await skipLink.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
        color: style.outlineColor,
      };
    });
    expect(skipLinkOutline.style).not.toBe('none');
    expect(skipLinkOutline.width).toBeGreaterThanOrEqual(3);
    expect(skipLinkOutline.color).not.toBe('transparent');

    await page.goto('classificacao/');
    await tabUntilFocused(page, '.table-scroll');
    const tableOutline = await page.locator('.table-scroll').first().evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(tableOutline.style).not.toBe('none');
    expect(tableOutline.width).toBeGreaterThanOrEqual(3);
  });

  test('o menu móvel abre e fecha pelo teclado', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('');

    const menu = page.locator('details.menu-mobile');
    const summary = menu.locator('summary');
    await summary.focus();

    await page.keyboard.press('Enter');
    await expect(menu).toHaveAttribute('open', '');

    await page.keyboard.press('Space');
    await expect(menu).not.toHaveAttribute('open', '');
  });

  test('todas as rotas ficam sem overflow horizontal em 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });

    for (const path of routes) {
      await page.goto(path);
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasOverflow, path).toBe(false);
    }
  });

  test('o equivalente a zoom 200% mantém conteúdo e sem overflow', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 400 });

    for (const path of routes) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasOverflow, path).toBe(false);
    }
  });

  test('a tabela larga tem região focável, instrução e rolagem por teclado', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('classificacao/');

    const region = page.locator('.table-scroll').first();
    await expect(region).toHaveAttribute('role', 'region');
    await expect(region).toHaveAttribute('tabindex', '0');

    const hintId = await region.getAttribute('aria-describedby');
    expect(hintId).toBeTruthy();
    await expect(page.locator(`#${hintId}`)).toContainText('Deslize horizontalmente');

    const scrolls = await region.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    );
    expect(scrolls).toBe(true);

    if (test.info().project.name !== 'desktop-chromium') {
      return;
    }

    await tabUntilFocused(page, '.table-scroll');
    const before = await region.evaluate((element) => element.scrollLeft);
    await page.keyboard.press('ArrowRight');
    const after = await region.evaluate((element) => element.scrollLeft);
    expect(after).toBeGreaterThan(before);
  });

  test.describe('com movimento reduzido', () => {
    test.use({ reducedMotion: 'reduce' });

    test('não há transições nem rolagem suave', async ({ page }) => {
      await page.goto('');

      const motion = await page.evaluate(() => {
        const link = document.querySelector('a');
        return {
          scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
          transitionDuration: link === null ? null : getComputedStyle(link).transitionDuration,
        };
      });

      expect(motion.scrollBehavior).toBe('auto');
      expect(motion.transitionDuration).toBe('0s');
    });
  });

  test('badges e estados têm texto visível, não apenas cor', async ({ page }) => {
    const allLabels: string[] = [];

    for (const path of ['jogos/', 'jogos/g1/', 'classificacao/', 'fase-final/']) {
      await page.goto(path);
      const labels = await page.locator('.badge').allTextContents();
      for (const label of labels) {
        expect(label.trim(), path).not.toBe('');
      }
      allLabels.push(...labels);
    }

    expect(allLabels.length).toBeGreaterThan(0);
  });

  test('todas as tabelas têm caption e cabeçalhos com scope', async ({ page }) => {
    for (const path of tableRoutes) {
      await page.goto(path);
      const problems = await page.evaluate(() => {
        const issues: string[] = [];

        document.querySelectorAll('table').forEach((table, index) => {
          const caption = table.querySelector('caption')?.textContent?.trim() ?? '';
          if (caption === '') {
            issues.push(`tabela ${index + 1}: caption ausente`);
          }

          table.querySelectorAll('th').forEach((header, headerIndex) => {
            const scope = header.getAttribute('scope');
            if (scope !== 'col' && scope !== 'row') {
              issues.push(`tabela ${index + 1}, cabeçalho ${headerIndex + 1}: scope ausente`);
            }
          });
        });

        return issues;
      });

      expect(problems, path).toEqual([]);
    }
  });

  test('todas as rotas não têm violações sérias de acessibilidade', async ({ page }) => {
    for (const path of routes) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const seriousViolations = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );
      expect(seriousViolations, path).toEqual([]);
    }
  });
});
