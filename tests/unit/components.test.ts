import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import FinalPhase from '../../src/components/FinalPhase.astro';
import TeamBadges from '../../src/components/TeamBadges.astro';
import { parseCompetition } from '../../src/lib/data/load';
import type { Competition, Match } from '../../src/lib/domain/types';
import { validSource } from '../factories/competition';
import { makeCompetition, makeFinal, makeGroupMatch } from '../factories/domain';

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
