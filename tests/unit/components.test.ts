import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import FinalPhase from '../../src/components/FinalPhase.astro';
import HomeShortcuts from '../../src/components/HomeShortcuts.astro';
import NavList from '../../src/components/NavList.astro';
import TeamBadges from '../../src/components/TeamBadges.astro';
import { parseCompetition } from '../../src/lib/data/load';
import type { Competition, Match, TeamId } from '../../src/lib/domain/types';
import type { NavKey } from '../../src/lib/site';
import { withBase } from '../../src/lib/site';
import { validSource } from '../factories/competition';
import { makeCompetition, makeFinal, makeGroupMatch } from '../factories/domain';

const competition = parseCompetition(validSource());

async function renderNav(
  activeNav?: NavKey,
  activeTeamId: TeamId | null = null,
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(NavList, {
    props: { activeNav, activeTeamId, teams: competition.teams },
  });
}

async function renderShortcuts(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(HomeShortcuts, {
    props: { teams: competition.teams },
  });
}

function findLink(html: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`<a\\b[^>]*>\\s*${escaped}\\s*</a>`));
  if (match === null) {
    throw new Error(`Link não encontrado: ${label}`);
  }
  return match[0];
}

function currentPageCount(html: string): number {
  return html.match(/aria-current="page"/g)?.length ?? 0;
}

async function renderBadges(activeCount: number): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(TeamBadges, {
    props: { abbreviation: 'TA', activeCount },
  });
}

async function renderFinalPhase(competition: Competition): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(FinalPhase, {
    props: { competition, now: new Date('2026-12-04T12:00:00-03:00') },
  });
}

function groupMatches(status: Match['status']): readonly Match[] {
  return [
    makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', status }),
    makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc', status }),
    makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc', status }),
    makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta', status }),
    makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta', status }),
    makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb', status }),
  ];
}

describe('badge de elenco', () => {
  it('TST-042: mostra “Elenco em formação” com 4 ativas', async () => {
    const html = await renderBadges(4);
    expect(html).toContain('Elenco em formação');
    expect(html).toContain('TA');
  });

  it('TST-042: não mostra o badge com 6 ativas', async () => {
    const html = await renderBadges(6);
    expect(html).not.toContain('Elenco em formação');
    expect(html).toContain('TA');
  });
});

describe('fase final', () => {
  it('TST-078: mostra “Confrontos a definir” antes do fim do grupo', async () => {
    const competition = makeCompetition({
      matches: [...groupMatches('scheduled'), makeFinal({ status: 'scheduled' })],
      finalists: null,
    });

    const html = await renderFinalPhase(competition);
    expect(html).toContain('Confrontos a definir');
    expect(html).toContain('Acompanhar a classificação');
    expect(html).not.toContain('Pódio');
  });

  it('TST-078: mostra o card da final com o grupo completo', async () => {
    const competition = makeCompetition({
      matches: [...groupMatches('finished'), makeFinal({ status: 'scheduled' })],
      finalists: { final: ['ta', 'tb'] },
    });

    const html = await renderFinalPhase(competition);
    expect(html).toContain('Time TA x Time TB');
    expect(html).toContain('/jogos/final/');
    expect(html).not.toContain('Pódio');
  });

  it('TST-078: mostra o pódio de três posições após a final', async () => {
    const html = await renderFinalPhase(parseCompetition(validSource()));

    expect(html).toContain('Pódio');
    expect(html.match(/podium__item/g)).toHaveLength(3);
    expect(html).toContain('Campeã');
    expect(html).toContain('Vice-campeã');
    expect(html).toContain('3º lugar');
    expect(html).toContain('1 (4) x (3) 1');
  });
});

describe('navegação principal', () => {
  it('TST-079: gera o submenu de Times a partir dos dados', async () => {
    const html = await renderNav('inicio');

    expect(html).toContain('class="nav-submenu"');
    for (const team of competition.teams) {
      expect(html).toContain(`href="${withBase(`/times/${team.id}/`)}"`);
      expect(findLink(html, team.name)).toContain('href=');
    }

    expect(html).toContain(`href="${withBase('/times/')}"`);
    expect(currentPageCount(html)).toBe(1);
    expect(findLink(html, 'Início')).toContain('aria-current="page"');
  });

  it('TST-079: marca a página Times uma única vez', async () => {
    const html = await renderNav('times');

    expect(currentPageCount(html)).toBe(1);
    expect(findLink(html, 'Times')).toContain('aria-current="page"');
    for (const team of competition.teams) {
      expect(findLink(html, team.name)).not.toContain('aria-current');
    }
  });

  it('TST-079: na página do time, marca o time e destaca Times como seção', async () => {
    const html = await renderNav('times', 'tb');

    expect(currentPageCount(html)).toBe(1);
    expect(findLink(html, 'Time B')).toContain('aria-current="page"');
    expect(findLink(html, 'Times')).not.toContain('aria-current');
    expect(findLink(html, 'Times')).toContain('nav-list__link--section');
  });
});

describe('atalhos da Início', () => {
  it('TST-066: lista seções e os três times vindos dos dados', async () => {
    const html = await renderShortcuts();

    expect(html).toContain('class="shortcut-list"');
    expect((html.match(/<li>/g) ?? []).length).toBe(3 + competition.teams.length);
    for (const path of ['/jogos/', '/times/', '/classificacao/']) {
      expect(html).toContain(`href="${withBase(path)}"`);
    }
    for (const team of competition.teams) {
      expect(html).toContain(`href="${withBase(`/times/${team.id}/`)}"`);
      expect(findLink(html, team.name)).toContain('href=');
    }
  });
});
