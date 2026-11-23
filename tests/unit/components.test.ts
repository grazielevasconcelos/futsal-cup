import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import FinalPhase from '../../src/components/FinalPhase.astro';
import HomeShortcuts from '../../src/components/HomeShortcuts.astro';
import NavList from '../../src/components/NavList.astro';
import PodiumList from '../../src/components/PodiumList.astro';
import TeamBadges from '../../src/components/TeamBadges.astro';
import TeamLogo from '../../src/components/TeamLogo.astro';
import { parseCompetition } from '../../src/lib/data/load';
import { buildTeamMap } from '../../src/lib/domain/players';
import { buildPodium } from '../../src/lib/domain/playoffs';
import type { Competition, Match, TeamId } from '../../src/lib/domain/types';
import type { NavKey } from '../../src/lib/site';
import { withBase } from '../../src/lib/site';
import { validSource } from '../factories/competition';
import {
  goalsFor,
  makeCompetition,
  makeFinal,
  makeGroupMatch,
  makeSemi,
} from '../factories/domain';

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
    props: { activeCount },
  });
}

async function renderTeamLogo(logo: string | null): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(TeamLogo, { props: { logo } });
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

function finishedGroupMatches(): readonly Match[] {
  return [
    makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: goalsFor('ta', 1) }),
    makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc', events: goalsFor('tb', 1) }),
    makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc', events: goalsFor('ta', 1) }),
    makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta', events: goalsFor('ta', 1) }),
    makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta', events: goalsFor('ta', 1) }),
    makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb', events: goalsFor('tb', 1) }),
  ];
}

function groupCompleteCompetition(): Competition {
  return makeCompetition({
    matches: [
      ...finishedGroupMatches(),
      makeSemi({ status: 'scheduled' }),
      makeFinal({ status: 'scheduled' }),
    ],
    semifinalists: ['tb', 'tc'],
    finalists: null,
  });
}

describe('badge de elenco', () => {
  it('TST-042: mostra “Elenco em formação” com 4 ativas', async () => {
    const html = await renderBadges(4);
    expect(html).toContain('Elenco em formação');
    expect(html).not.toContain('TA');
  });

  it('TST-042: não mostra o badge com 6 ativas', async () => {
    const html = await renderBadges(6);
    expect(html).not.toContain('Elenco em formação');
    expect(html).not.toContain('TA');
  });
});

describe('logo de time', () => {
  it('usa o asset local com base URL do site', async () => {
    const html = await renderTeamLogo('/images/times/ta.webp');
    expect(html).toContain(`src="${withBase('/images/times/ta.webp')}"`);
    expect(html).toContain('alt=""');
  });

  it('não renderiza imagem quando não há logo', async () => {
    const html = await renderTeamLogo(null);
    expect(html).not.toContain('<img');
  });
});

describe('fase final', () => {
  it('TST-078: não mostra pódio antes do fim do grupo', async () => {
    const competition = makeCompetition({
      matches: [
        ...groupMatches('scheduled'),
        makeSemi({ status: 'scheduled', startsAt: null }),
        makeFinal({ status: 'scheduled', startsAt: null }),
      ],
    });

    const html = await renderFinalPhase(competition);
    expect(html).toContain('Confrontos a definir');
    expect(html).toContain(`href="${withBase('/classificacao/')}"`);
    expect(html).not.toContain('class="card match-card"');
    expect(html).not.toContain('podium__item');
  });

  it('TST-078: mostra a semifinal entre o 2º e o 3º com o grupo completo', async () => {
    const html = await renderFinalPhase(groupCompleteCompetition());

    expect(html).toContain('Time TB x Time TC');
    expect(html).toContain(`href="${withBase('/jogos/semi/')}"`);
    expect(html).not.toContain('Confrontos a definir');
  });

  it('TST-078: mostra a final com o 1º colocado e “Vencedora da semifinal” antes da semifinal', async () => {
    const html = await renderFinalPhase(groupCompleteCompetition());

    expect(html).toContain('Time TA x Vencedora da semifinal');
    expect(html).toContain(`href="${withBase('/jogos/final/')}"`);
    expect(html).not.toContain('Confrontos a definir');
    expect(html).not.toContain('Pódio');
  });

  it('TST-078: lista a 3ª colocada como perdedora da semifinal', async () => {
    const competition = makeCompetition({
      matches: [
        ...finishedGroupMatches(),
        makeSemi({ events: goalsFor('tb', 1) }),
        makeFinal({ status: 'scheduled' }),
      ],
      semifinalists: ['tb', 'tc'],
      finalists: ['ta', 'tb'],
    });
    const podium = buildPodium(competition);
    expect(podium).toEqual({ champion: null, runnerUp: null, third: 'tc' });

    const container = await AstroContainer.create();
    const html = await container.renderToString(PodiumList, {
      props: { podium, teams: buildTeamMap(competition) },
    });

    expect(html).toContain('3ª colocada');
    expect(html).toContain('Time TC');
    expect(html).not.toContain('4º lugar');
  });

  it('TST-078: mostra a 3ª colocada e o card da final após a semifinal', async () => {
    const competition = makeCompetition({
      matches: [
        ...finishedGroupMatches(),
        makeSemi({ events: goalsFor('tb', 1) }),
        makeFinal({ status: 'scheduled' }),
      ],
      semifinalists: ['tb', 'tc'],
      finalists: ['ta', 'tb'],
    });

    const html = await renderFinalPhase(competition);

    expect(html).toContain('3ª colocada: Time TC');
    expect(html).toContain('A 3ª colocada é a perdedora da semifinal.');
    expect(html).toContain('Time TA x Time TB');
    expect(html).toContain(`href="${withBase('/jogos/final/')}"`);
    expect(html).not.toContain('id="podio"');
    expect(html).not.toContain('podium__item');
  });

  it('TST-078: mostra o pódio completo de três posições após a final', async () => {
    const html = await renderFinalPhase(parseCompetition(validSource()));
    const podiumHtml = html.match(
      /<section class="section" aria-labelledby="podio">[\s\S]*?<\/section>/,
    )?.[0];

    expect(podiumHtml).toBeDefined();
    expect(podiumHtml?.match(/<li class="podium__item\b/g)).toHaveLength(3);
    expect(podiumHtml).toContain('Campeã');
    expect(podiumHtml).toContain('Vice-campeã');
    expect(podiumHtml).toContain('3ª colocada');
    expect(podiumHtml).toContain('Time C');
    expect(podiumHtml).toContain('Time B');
    expect(podiumHtml).toContain('Time A');
    expect(html).toContain('1 x 1');
    expect(html).toContain('Time C conquista o título pela vantagem do empate');
    expect(html).not.toContain('4º lugar');
    expect(html).not.toContain('pênaltis');
  });

  it('TST-078: não renderiza card de amistoso', async () => {
    const html = await renderFinalPhase(parseCompetition(validSource()));

    expect(html.match(/class="card match-card"/g)).toHaveLength(2);
    expect(html).not.toContain('Amistoso');
    expect(html).not.toContain('amistoso');
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
