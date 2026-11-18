import { expect, test, type Page } from '@playwright/test';

const routes = [
  '',
  'jogos/',
  'classificacao/',
  'times/',
  'estatisticas/',
  'fase-final/',
] as const;

async function expectNoPageOverflow(page: Page, path: string): Promise<void> {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow, path).toBe(false);
}

test.describe('compatibilidade entre navegadores', () => {
  test('as rotas principais carregam em 320px sem overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });

    for (const path of routes) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoPageOverflow(page, path);
    }
  });

  test('o menu móvel abre e fecha pelo teclado sem JavaScript', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('');

    const menu = page.locator('details.menu-mobile');
    const summary = menu.locator('summary');
    await summary.focus();

    await page.keyboard.press('Enter');
    await expect(menu).toHaveAttribute('open', '');
    const mobileNav = page.getByRole('navigation', { name: 'Principal (menu móvel)' });
    await expect(mobileNav.getByRole('link')).toHaveCount(9);
    await expect(mobileNav.locator('.nav-submenu').getByRole('link')).toHaveCount(3);

    await page.keyboard.press('Space');
    await expect(menu).not.toHaveAttribute('open', '');
  });

  test('o skip link e a tabela larga funcionam pelo teclado', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('classificacao/');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('#conteudo')).toBeFocused();

    const tableRegion = page.locator('.table-scroll').first();
    await expect(tableRegion).toHaveAttribute('role', 'region');
    await expect(tableRegion).toHaveAttribute('tabindex', '0');
    await expect(tableRegion.getByRole('table')).toBeVisible();

    const scrolls = await tableRegion.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    );
    expect(scrolls).toBe(true);
  });
});
