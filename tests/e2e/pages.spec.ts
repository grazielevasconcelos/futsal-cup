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
    await expect(page.locator('.team-grid img.team-logo')).toHaveCount(3);
    await expect(page.locator('.team-grid img.team-logo').first()).toHaveAttribute(
      'src',
      /\/images\/times\/ta\.webp$/,
    );
    await expect(page.locator('.team-grid .team-logo--fallback')).toHaveCount(2);
  });

  test('TST-071: a lista de jogos agrupa as oito partidas oficiais por data', async ({
    page,
  }) => {
    await page.goto('jogos/');

    await expect(page.getByRole('heading', { level: 1, name: 'Jogos' })).toBeVisible();

    const days = page.locator('section.section');
    await expect(days).toHaveCount(4);
    await expect(days.nth(0)).toContainText('24/11/2026');
    await expect(days.nth(1)).toContainText('26/11/2026');
    await expect(days.nth(2)).toContainText('01/12/2026');
    await expect(days.nth(3)).toContainText('03/12/2026');

    const cards = page.locator('.match-card');
    await expect(cards).toHaveCount(8);
    await expect(cards.filter({ hasText: 'Amistoso' })).toHaveCount(0);
    await expect(page.getByText('3º lugar')).toHaveCount(0);
    await expect(page.getByText('4º lugar')).toHaveCount(0);

    for (const id of ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'semi', 'final']) {
      await expect(page.locator(`a[href$="/jogos/${id}/"]`)).toHaveCount(1);
    }
  });

  test('TST-072: o detalhe mantém a ordem dos eventos por minuto', async ({ page }) => {
    await page.goto('jogos/g5/');

    await expect(page.getByRole('heading', { level: 2, name: 'Eventos' })).toBeVisible();
    await expect(page.locator('.event__minute')).toHaveText([
      '9 min',
      '14 min',
      '18 min',
      '22 min',
    ]);
  });

  test('TST-073: o detalhe do W.O. mostra o placar na ordem mandante/visitante', async ({
    page,
  }) => {
    await page.goto('jogos/g3/');

    await expect(page.locator('.score span[aria-hidden="true"]')).toHaveText('0 x 3 (W.O.)');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Vitória por W.O. — Não compareceu' }),
    ).toBeVisible();
    await expect(page.getByText('TB não compareceu.')).toBeVisible();
    await expect(page.getByText('Sem eventos registrados.')).toBeVisible();
  });

  test('TST-074: o detalhe da final mostra o empate e a vantagem do 1º colocado', async ({
    page,
  }) => {
    await page.goto('jogos/final/');

    await expect(page.locator('.score span[aria-hidden="true"]')).toHaveText('1 x 1');
    await expect(page.locator('.score .visually-hidden')).toContainText(
      'Time C 1 a 1 Time B no tempo normal; Time C conquista o título pela vantagem do empate.',
    );
    await expect(
      page.getByText('O 1º colocado tem mando de campo e vantagem do empate', { exact: false }),
    ).toBeVisible();
    await expect(page.getByText(/\(\d+\) x \(\d+\)/)).toHaveCount(0);
    await expect(page.getByText('nos pênaltis')).toHaveCount(0);
    await expect(page.getByText('disputa de pênaltis')).toHaveCount(0);
    await expect(page.getByText('Pênalti', { exact: true })).toBeVisible();
  });

  test('o detalhe da partida lista as desfalques por suspensão', async ({ page }) => {
    await page.goto('jogos/g6/');

    const absences = page.locator('section[aria-labelledby="desfalques"]');
    await expect(absences.getByRole('heading', { level: 2 })).toHaveText(
      'Desfalques por suspensão',
    );
    await expect(absences.getByRole('heading', { level: 3, name: 'Time C' })).toBeVisible();
    await expect(absences.getByRole('listitem')).toHaveText(['Olívia']);
  });

  test('a página do time tem elenco ativo e estatísticas coletivas', async ({ page }) => {
    await page.goto('times/ta/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.page-header img.team-logo')).toHaveAttribute(
      'src',
      /\/images\/times\/ta\.webp$/,
    );
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

  test('TST-076: a página do time mostra nome público, suspensão e histórico', async ({ page }) => {
    await page.goto('times/ta/');

    await expect(page.locator('.page-header')).not.toContainText('TA');
    await expect(page.locator('.page-header')).not.toContainText('Elenco em formação');

    const roster = page.locator('table.data-table').first();
    await expect(roster.locator('tbody tr')).toHaveCount(7);

    const history = page.locator('section[aria-labelledby="historico"]');
    await expect(history.getByRole('heading', { level: 2 })).toContainText(
      'Atletas com histórico na edição',
    );
    const gabi = history.getByRole('row', { name: /Gabi/ });
    await expect(gabi).toContainText('fora do elenco ativo');
    await expect(gabi.getByRole('cell').nth(2)).toHaveText('1');

    await page.goto('times/tb/');
    const mari = page.getByRole('row', { name: /Mari/ });
    await expect(mari.getByRole('cell').nth(4)).toHaveText('1');
    await expect(mari).toContainText('Sem suspensão');
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

  test('a fase final não tem amistoso nem 3º lugar e mostra o pódio completo', async ({
    page,
  }) => {
    await page.goto('fase-final/');

    await expect(page.getByRole('heading', { level: 1, name: 'Fase final' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Semifinal' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Final', exact: true })).toBeVisible();
    await expect(page.getByText('4º lugar')).toHaveCount(0);

    await expect(page.locator('.friendly-card')).toHaveCount(0);

    await expect(page.locator('main')).toContainText('vantagem do empate');

    const podium = page.locator('.podium__item');
    await expect(podium).toHaveCount(3);
    await expect(page.locator('.podium')).toContainText('Campeã');
    await expect(page.locator('.podium')).toContainText('Vice-campeã');
    await expect(page.locator('.podium')).toContainText('3ª colocada');
  });

  test('a início mostra a campeã e o resultado da final', async ({ page }) => {
    await page.goto('');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#campea')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 2, name: 'Campeã' }),
    ).toBeVisible();
    const champion = page.locator('.podium__item--champion');
    await expect(champion).toContainText('Campeã');
    await expect(champion).toContainText('Time C');
    await expect(page.getByRole('heading', { level: 2, name: 'Pódio' })).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 2, name: 'Resultado da final' })).toBeVisible();
    await expect(page.getByText('Informativo — não é partida oficial')).toHaveCount(0);
    await expect(page.getByText('Amistoso')).toHaveCount(0);
  });

  test('rotas inexistentes caem no 404', async ({ page }) => {
    for (const path of ['times/td/', 'jogos/terceiro/', 'regulamento/']) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });

  test('as páginas não têm overflow horizontal em 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });

    for (const path of [
      'classificacao/',
      'times/',
      'times/ta/',
      'estatisticas/',
      'fase-final/',
      'jogos/semi/',
      'jogos/final/',
    ]) {
      await page.goto(path);
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasOverflow, path).toBe(false);
    }
  });

  test('as páginas não têm violações sérias de acessibilidade', async ({ page }) => {
    for (const path of [
      'classificacao/',
      'times/',
      'times/ta/',
      'estatisticas/',
      'fase-final/',
      'jogos/semi/',
      'jogos/final/',
    ]) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const seriousViolations = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );
      expect(seriousViolations, path).toEqual([]);
    }
  });

  test('o guia de impressão abre por teclado e explica como salvar em PDF', async ({ page }) => {
    await page.goto('');

    const guide = page.locator('.print-help');
    const summary = guide.locator('summary');
    await expect(guide).not.toHaveAttribute('open', '');
    await expect(summary).toHaveText('Como imprimir ou salvar em PDF');

    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(guide).toHaveAttribute('open', '');

    await expect(guide).toContainText('A4');
    await expect(guide).toContainText('Cabeçalhos e rodapés');
    await expect(guide).toContainText('Gráficos de fundo');
    await expect(guide).toContainText('Salvar como PDF');

    await page.keyboard.press('Enter');
    await expect(guide).not.toHaveAttribute('open', '');
  });
});
