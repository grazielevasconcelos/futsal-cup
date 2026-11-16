import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('páginas da competição', () => {
  test('a classificação tem 13 colunas e os critérios de desempate', async ({ page }) => {
    await page.goto('classificacao/');

    await expect(page.getByRole('heading', { level: 1, name: 'Classificação' })).toBeVisible();

    const table = page.locator('table.data-table');
    await expect(table).toHaveCount(1);
    await expect(table.locator('caption')).toContainText(
      'Classificação da fase classificatória',
    );
    await expect(table.locator('thead th')).toHaveCount(13);

    await expect(
      page.getByRole('heading', { level: 2, name: 'Critérios de desempate' }),
    ).toBeVisible();
    await expect(
      page.locator('section[aria-labelledby="criterios-desempate"] ol > li'),
    ).toHaveCount(7);
  });

  test('a lista de times mostra três cards com estatísticas', async ({ page }) => {
    await page.goto('times/');

    await expect(page.getByRole('heading', { level: 1, name: 'Times' })).toBeVisible();
    await expect(page.locator('.team-grid > li')).toHaveCount(3);
    await expect(page.locator('.team-grid dl.stat-list')).toHaveCount(3);

    const links = page.locator('.team-grid a');
    await expect(links).toHaveCount(3);
    await expect(links.first()).toHaveAttribute('href', /\/times\/ta\/$/);
  });

  test('a página do time tem elenco ativo e estatísticas coletivas', async ({ page }) => {
    await page.goto('times/ta/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Estatísticas coletivas' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Elenco ativo' })).toBeVisible();
    await expect(page.locator('#elenco-ativo-hint')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Suspensão' })).toBeVisible();

    const roster = page.locator('table.data-table').first();
    await expect(roster.locator('caption')).toContainText('Elenco ativo');
    await expect(roster.locator('tbody tr')).not.toHaveCount(0);
  });

  test('as estatísticas têm as cinco seções pedidas', async ({ page }) => {
    await page.goto('estatisticas/');

    await expect(page.getByRole('heading', { level: 1, name: 'Estatísticas' })).toBeVisible();

    for (const section of [
      'Artilharia',
      'Assistências',
      'Cartões por jogadora',
      'Cartões por time',
      'Gols contra',
    ]) {
      await expect(page.getByRole('heading', { level: 2, name: section })).toBeVisible();
    }

    await expect(page.locator('section.section')).toHaveCount(5);
  });

  test('a fase final não tem disputa de 3º lugar e o amistoso é informativo', async ({ page }) => {
    await page.goto('fase-final/');

    await expect(page.getByRole('heading', { level: 1, name: 'Fase final' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Final' })).toBeVisible();
    await expect(page.getByText('4º lugar')).toHaveCount(0);

    const friendly = page.locator('.friendly-card');
    if ((await friendly.count()) > 0) {
      await expect(friendly).toContainText('Informativo — não é partida oficial');
      await expect(friendly.locator('.score')).toHaveCount(0);
      await expect(friendly.locator('a')).toHaveCount(0);
    }

    const podium = page.locator('.podium__item');
    const podiumCount = await podium.count();
    if (podiumCount > 0) {
      expect(podiumCount).toBe(3);
      await expect(page.locator('.podium')).toContainText('Campeã');
      await expect(page.locator('.podium')).toContainText('Vice-campeã');
      await expect(page.locator('.podium')).toContainText('3º lugar');
    }
  });

  test('a início mostra um dos quatro estados e não exibe o amistoso', async ({ page }) => {
    await page.goto('');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Informativo — não é partida oficial')).toHaveCount(0);
    await expect(page.locator('#primeira-rodada, #proxima-rodada, #final, #campea')).toHaveCount(
      1,
    );
  });

  test('rotas inexistentes caem no 404', async ({ page }) => {
    for (const path of ['times/td/', 'jogos/terceiro/', 'regulamento/']) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });

  test('as páginas não têm overflow horizontal em 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });

    for (const path of ['classificacao/', 'times/', 'times/ta/', 'estatisticas/', 'fase-final/']) {
      await page.goto(path);
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasOverflow, path).toBe(false);
    }
  });

  test('as páginas não têm violações sérias de acessibilidade', async ({ page }) => {
    for (const path of ['classificacao/', 'times/', 'times/ta/', 'estatisticas/', 'fase-final/']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const seriousViolations = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );
      expect(seriousViolations, path).toEqual([]);
    }
  });
});
