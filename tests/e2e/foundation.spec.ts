import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('fundação do site', () => {
  test('a página inicial carrega com título, cabeçalho e skip link', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('');

    await expect(page).toHaveTitle('Copa de Futsal Feminino Vila Mariana 2026');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Copa de Futsal Feminino Vila Mariana 2026',
      }),
    ).toBeVisible();

    const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(skipLink).toHaveAttribute('href', '#conteudo');

    const desktopNav = page.getByRole('navigation', { name: 'Principal', exact: true });
    await expect(desktopNav.getByRole('link')).toHaveCount(6);
    await expect(desktopNav.getByRole('link', { name: 'Início' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('o skip link é o primeiro foco e leva ao conteúdo', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('#conteudo')).toBeFocused();
  });

  test('o menu móvel abre pelo elemento nativo details', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('');

    const menu = page.locator('details.menu-mobile');
    await expect(menu).not.toHaveAttribute('open', '');
    await page.getByText('Menu', { exact: true }).click();
    await expect(menu).toHaveAttribute('open', '');

    const mobileNav = page.getByRole('navigation', { name: 'Principal (menu móvel)' });
    await expect(mobileNav.getByRole('link')).toHaveCount(9);

    const submenu = mobileNav.locator('.nav-submenu');
    await expect(submenu).toBeVisible();
    await expect(submenu.getByRole('link')).toHaveCount(3);
    for (const name of ['Time A', 'Time B', 'Time C']) {
      await expect(submenu.getByRole('link', { name, exact: true })).toBeVisible();
    }
  });

  test('o cabeçalho móvel organiza título e ações sem quebra acidental', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('');

    const title = page.locator('.site-title');
    const actions = page.locator('.site-header__actions');
    const menuButton = page.locator('.menu-mobile summary');
    const themeButton = page.locator('.theme-toggle');

    const titleBox = await title.boundingBox();
    const actionsBox = await actions.boundingBox();
    const menuBox = await menuButton.boundingBox();
    const themeBox = await themeButton.boundingBox();

    expect(titleBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    expect(themeBox).not.toBeNull();
    expect(titleBox!.y + titleBox!.height).toBeLessThanOrEqual(actionsBox!.y);
    expect(Math.abs(menuBox!.y - themeBox!.y)).toBeLessThanOrEqual(1);
    expect(actionsBox!.x + actionsBox!.width).toBeLessThanOrEqual(320);
  });

  test('o submenu de Times abre com hover e fecha ao sair', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('');

    const desktopNav = page.getByRole('navigation', { name: 'Principal', exact: true });
    const submenu = desktopNav.locator('.nav-submenu');
    await expect(submenu).toBeHidden();

    await desktopNav.getByRole('link', { name: 'Times', exact: true }).hover();
    await expect(submenu).toBeVisible();
    await expect(submenu.getByRole('link')).toHaveCount(3);
    await expect(desktopNav.getByRole('link')).toHaveCount(9);

    const labels = ['De primeira FC', 'Time B de Bola', 'Sem Horas'];
    const teamLabels = submenu.locator('.team-identity > span');
    for (const [index, label] of labels.entries()) {
      await teamLabels.nth(index).evaluate((element, text) => {
        element.textContent = text;
      }, label);
      await expect(teamLabels.nth(index)).toHaveCSS('white-space', 'nowrap');
    }

    const submenuBounds = await submenu.boundingBox();
    expect(submenuBounds).not.toBeNull();
    expect(submenuBounds!.x + submenuBounds!.width).toBeLessThanOrEqual(1280);
    const submenuScrolls = await submenu.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    );
    expect(submenuScrolls).toBe(false);

    await page.getByRole('heading', { level: 1 }).hover();
    await expect(submenu).toBeHidden();
  });

  test('o teclado revela e percorre o submenu de Times', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('');

    const desktopNav = page.getByRole('navigation', { name: 'Principal', exact: true });
    const submenu = desktopNav.locator('.nav-submenu');
    const submenuLinks = submenu.getByRole('link');

    await desktopNav.getByRole('link', { name: 'Times', exact: true }).focus();
    await expect(submenu).toBeVisible();
    await expect(submenuLinks).toHaveCount(3);

    await page.keyboard.press('Tab');
    await expect(submenuLinks.first()).toBeFocused();

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(submenuLinks.last()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(desktopNav.getByRole('link', { name: 'Estatísticas' })).toBeFocused();
    await expect(submenu).toBeHidden();
  });

  test('a página do time marca apenas o link do time como atual', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('times/ta/');

    const desktopNav = page.getByRole('navigation', { name: 'Principal', exact: true });
    const timesLink = desktopNav.getByRole('link', { name: 'Times', exact: true });
    await expect(timesLink).not.toHaveAttribute('aria-current', 'page');
    await expect(timesLink).toHaveClass(/nav-list__link--section/);
    await expect(desktopNav.locator('[aria-current="page"]')).toHaveCount(1);

    await timesLink.hover();
    const teamLink = desktopNav
      .locator('.nav-submenu')
      .getByRole('link', { name: 'Time A', exact: true });
    await expect(teamLink).toHaveAttribute('aria-current', 'page');
  });

  test('não há overflow horizontal da página em 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('');

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  });

  test('a página 404 é servida com status 404 e link de retorno', async ({ page }) => {
    const response = await page.goto('pagina-que-nao-existe/');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página não encontrada');
    await expect(page.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute(
      'href',
      '/futsal-cup/',
    );
  });

  test('a página inicial não tem violações sérias de acessibilidade', async ({ page }) => {
    await page.goto('');

    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    expect(seriousViolations).toEqual([]);
  });
});
