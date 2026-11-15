import { describe, expect, it } from 'vitest';

import {
  buildExpectedFinalists,
  buildPodium,
  isGroupComplete,
} from '../../src/lib/domain/finalists';
import { buildFriendlyCard } from '../../src/lib/domain/friendly';
import type { Competition } from '../../src/lib/domain/types';
import {
  goalsFor,
  makeCompetition,
  makeFinal,
  makeGroupMatch,
} from '../factories/domain';

function groupCompleteMatches() {
  return [
    makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: goalsFor('ta', 1) }),
    makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc', events: goalsFor('tb', 1) }),
    makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc', events: goalsFor('ta', 1) }),
    makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta', events: goalsFor('ta', 1) }),
    makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta', events: goalsFor('ta', 1) }),
    makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb', events: goalsFor('tb', 1) }),
  ];
}

function completeCompetition(final: Competition['matches'][number]): Competition {
  return makeCompetition({
    matches: [...groupCompleteMatches(), final],
    finalists: { final: ['ta', 'tb'] },
  });
}

describe('finalistas e pódio', () => {
  it('retorna finalistas nulos enquanto o grupo não termina', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: goalsFor('ta', 1) }),
        makeGroupMatch({
          id: 'g2',
          home: 'tb',
          away: 'tc',
          status: 'scheduled',
          startsAt: null,
        }),
      ],
    });

    expect(isGroupComplete(competition)).toBe(false);
    expect(buildExpectedFinalists(competition)).toBeNull();
    expect(buildPodium(competition)).toEqual({
      champion: null,
      runnerUp: null,
      third: null,
    });
  });

  it('define o 1º x 2º da classificação quando o grupo termina', () => {
    const competition = completeCompetition(makeFinal({ status: 'scheduled', startsAt: null }));

    expect(isGroupComplete(competition)).toBe(true);
    expect(buildExpectedFinalists(competition)).toEqual({ final: ['ta', 'tb'] });
  });

  it('define a terceira colocada antes da final e não cria quarto lugar', () => {
    const competition = completeCompetition(makeFinal({ status: 'scheduled', startsAt: null }));

    expect(buildPodium(competition)).toEqual({
      champion: null,
      runnerUp: null,
      third: 'tc',
    });
  });

  it('define campeã e vice quando a final termina no tempo normal', () => {
    const competition = completeCompetition(makeFinal({ events: goalsFor('tb', 1) }));

    expect(buildPodium(competition)).toEqual({
      champion: 'tb',
      runnerUp: 'ta',
      third: 'tc',
    });
  });

  it('define a campeã pelo W.O. da final', () => {
    const competition = completeCompetition(
      makeFinal({
        walkover: { winnerTeamId: 'ta', reason: 'no_show', note: null },
      }),
    );

    expect(buildPodium(competition)).toEqual({
      champion: 'ta',
      runnerUp: 'tb',
      third: 'tc',
    });
  });

  it('define a campeã pela disputa de pênaltis', () => {
    const competition = completeCompetition(
      makeFinal({
        events: [...goalsFor('ta', 1), ...goalsFor('tb', 1)],
        shootout: { home: 3, away: 4 },
      }),
    );

    expect(buildPodium(competition)).toEqual({
      champion: 'tb',
      runnerUp: 'ta',
      third: 'tc',
    });
  });

  it('TST-113: entrega campeã, vice e terceira sem quarta posição', () => {
    const competition = completeCompetition(makeFinal({ events: goalsFor('ta', 1) }));
    const podium = buildPodium(competition);

    expect(Object.keys(podium).sort()).toEqual(['champion', 'runnerUp', 'third']);
    expect(podium).toEqual({ champion: 'ta', runnerUp: 'tb', third: 'tc' });
  });
});

describe('cartão informativo do amistoso', () => {
  it('TST-106: monta o cartão a partir do metadado friendly', () => {
    const competition = makeCompetition({
      friendly: {
        date: '2026-12-03',
        startsAt: '2026-12-03T18:30:00-03:00',
        venue: 'Vila Mariana, São Paulo',
        note: 'Amistoso do 3º colocado contra um time convidado.',
      },
    });

    expect(buildFriendlyCard(competition)).toEqual({
      title: 'Amistoso do 3º colocado',
      date: '2026-12-03',
      startsAt: '2026-12-03T18:30:00-03:00',
      venue: 'Vila Mariana, São Paulo',
      note: 'Amistoso do 3º colocado contra um time convidado.',
      informational: true,
    });
  });

  it('TST-114: não cria placeholder quando não há amistoso', () => {
    expect(buildFriendlyCard(makeCompetition({ friendly: null }))).toBeNull();
  });

  it('TST-108: não transforma o amistoso em partida nem altera o pódio', () => {
    const competition = completeCompetition(makeFinal({ events: goalsFor('ta', 1) }));
    const withFriendly: Competition = {
      ...competition,
      friendly: {
        date: '2026-12-03',
        startsAt: '2026-12-03T18:30:00-03:00',
        venue: 'Vila Mariana, São Paulo',
        note: 'Amistoso do 3º colocado.',
      },
    };

    expect(withFriendly.matches).toHaveLength(7);
    expect(buildPodium(withFriendly)).toEqual(buildPodium(competition));
    expect(buildExpectedFinalists(withFriendly)).toEqual(buildExpectedFinalists(competition));
  });
});
