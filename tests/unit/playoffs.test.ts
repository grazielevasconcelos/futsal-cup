import { describe, expect, it } from 'vitest';

import {
  buildExpectedFinalists,
  buildExpectedSemifinalists,
  buildPodium,
  isGroupComplete,
  isSemiComplete,
} from '../../src/lib/domain/playoffs';
import type { Competition, FinalStageMatch } from '../../src/lib/domain/types';
import {
  goalsFor,
  makeCompetition,
  makeFinal,
  makeGroupMatch,
  makeSemi,
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

function groupComplete(): Competition {
  return makeCompetition({ matches: groupCompleteMatches() });
}

function withSemi(semi = makeSemi({ events: goalsFor('tb', 1) })): Competition {
  return makeCompetition({
    matches: [...groupCompleteMatches(), semi],
    semifinalists: ['tb', 'tc'],
  });
}

function withFinal(final: FinalStageMatch): Competition {
  return makeCompetition({
    matches: [
      ...groupCompleteMatches(),
      makeSemi({ events: goalsFor('tb', 1) }),
      final,
    ],
    semifinalists: ['tb', 'tc'],
    finalists: ['ta', 'tb'],
  });
}

describe('semifinalistas, finalistas e pódio', () => {
  it('não define snapshots nem pódio enquanto o grupo não termina', () => {
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
    expect(buildExpectedSemifinalists(competition)).toBeNull();
    expect(buildExpectedFinalists(competition)).toBeNull();
    expect(buildPodium(competition)).toEqual({
      champion: null,
      runnerUp: null,
      third: null,
    });
  });

  it('define a semifinal como 2º x 3º quando o grupo termina', () => {
    const competition = groupComplete();

    expect(isGroupComplete(competition)).toBe(true);
    expect(isSemiComplete(competition)).toBe(false);
    expect(buildExpectedSemifinalists(competition)).toEqual(['tb', 'tc']);
    expect(buildExpectedFinalists(competition)).toBeNull();
    expect(buildPodium(competition)).toEqual({
      champion: null,
      runnerUp: null,
      third: null,
    });
  });

  it('define a final como 1º x vencedora da semifinal', () => {
    const competition = withSemi();

    expect(isSemiComplete(competition)).toBe(true);
    expect(buildExpectedFinalists(competition)).toEqual(['ta', 'tb']);
  });

  it('define a 3ª colocada como perdedora da semifinal', () => {
    const competition = withSemi();

    expect(buildPodium(competition)).toEqual({
      champion: null,
      runnerUp: null,
      third: 'tc',
    });
  });

  it('não define finalistas quando a semifinal ainda não terminou', () => {
    const competition = withSemi(makeSemi({ status: 'scheduled', startsAt: null }));

    expect(isSemiComplete(competition)).toBe(false);
    expect(buildExpectedFinalists(competition)).toBeNull();
    expect(buildPodium(competition)).toEqual({
      champion: null,
      runnerUp: null,
      third: null,
    });
  });

  it('retorna finalistas nulos quando falta o snapshot de semifinalistas', () => {
    const competition = makeCompetition({
      matches: [...groupCompleteMatches(), makeSemi({ events: goalsFor('tb', 1) })],
    });

    expect(buildExpectedFinalists(competition)).toBeNull();
  });

  it('classifica o 2º quando a semifinal termina empatada', () => {
    const competition = withSemi(makeSemi({ events: [] }));

    expect(buildExpectedFinalists(competition)).toEqual(['ta', 'tb']);
    expect(buildPodium(competition)).toEqual({
      champion: null,
      runnerUp: null,
      third: 'tc',
    });
  });

  it('avança o vencedor administrativo do W.O. da semifinal, mesmo visitante', () => {
    const competition = withSemi(
      makeSemi({
        walkover: { winnerTeamId: 'tc', reason: 'no_show', note: null },
      }),
    );

    expect(buildExpectedFinalists(competition)).toEqual(['ta', 'tc']);
    expect(buildPodium(competition)).toEqual({
      champion: null,
      runnerUp: null,
      third: 'tb',
    });
  });

  it('define campeã e vice quando a final termina no tempo normal', () => {
    const competition = withFinal(makeFinal({ events: goalsFor('tb', 1) }));

    expect(buildPodium(competition)).toEqual({
      champion: 'tb',
      runnerUp: 'ta',
      third: 'tc',
    });
  });

  it('dá o título ao 1º quando a final termina empatada', () => {
    const competition = withFinal(
      makeFinal({ events: [...goalsFor('ta', 1), ...goalsFor('tb', 1)] }),
    );

    expect(buildPodium(competition)).toEqual({
      champion: 'ta',
      runnerUp: 'tb',
      third: 'tc',
    });
  });

  it('dá o título ao 1º quando a final termina 0x0', () => {
    const competition = withFinal(makeFinal({ events: [] }));

    expect(buildPodium(competition)).toEqual({
      champion: 'ta',
      runnerUp: 'tb',
      third: 'tc',
    });
  });

  it('define o campeão pelo W.O. da final, mesmo visitante', () => {
    const competition = withFinal(
      makeFinal({
        walkover: { winnerTeamId: 'tb', reason: 'no_show', note: null },
      }),
    );

    expect(buildPodium(competition)).toEqual({
      champion: 'tb',
      runnerUp: 'ta',
      third: 'tc',
    });
  });

  it('entrega exatamente campeã, vice e 3ª colocada, sem 4º lugar', () => {
    const competition = withFinal(makeFinal({ events: goalsFor('tb', 1) }));
    const podium = buildPodium(competition);

    expect(Object.keys(podium).sort()).toEqual(['champion', 'runnerUp', 'third']);
    expect(podium).toEqual({ champion: 'tb', runnerUp: 'ta', third: 'tc' });
  });
});
