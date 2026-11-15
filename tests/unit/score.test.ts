import { describe, expect, it } from 'vitest';

import { buildPlayerTeamMap } from '../../src/lib/domain/players';
import {
  FinalistsRequiredError,
  deriveScore,
  resolveMatchTeams,
  toResolvedMatch,
  winnerOf,
} from '../../src/lib/domain/score';
import type { Competition, Finalists, Match } from '../../src/lib/domain/types';
import {
  goal,
  goalsFor,
  makeCompetition,
  makeFinal,
  makeGroupMatch,
  ownGoal,
} from '../factories/domain';

const finalists: Finalists = { final: ['ta', 'tb'] };

function cupWith(...matches: readonly Match[]): Competition {
  return makeCompetition({ matches });
}

function playerTeams(competition: Competition) {
  return buildPlayerTeamMap(competition);
}

describe('resolveMatchTeams', () => {
  it('usa os participantes registrados na partida de grupo', () => {
    const match = makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta' });

    expect(resolveMatchTeams(match, null)).toEqual({
      homeTeamId: 'tb',
      awayTeamId: 'ta',
    });
  });

  it('usa a ordem dos finalistas na final', () => {
    expect(resolveMatchTeams(makeFinal(), finalists)).toEqual({
      homeTeamId: 'ta',
      awayTeamId: 'tb',
    });
  });

  it('falha ao resolver a final sem finalistas', () => {
    expect(() => resolveMatchTeams(makeFinal(), null)).toThrow(FinalistsRequiredError);
  });

  it('resolve a partida mantendo os demais campos', () => {
    const match = makeFinal({ shootout: { home: 4, away: 3 } });

    expect(toResolvedMatch(match, finalists)).toMatchObject({
      id: 'final',
      homeTeamId: 'ta',
      awayTeamId: 'tb',
      shootout: { home: 4, away: 3 },
    });
  });
});

describe('deriveScore', () => {
  it('TST-028: converte gol normal em placar', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: [goal('p-ta1')],
    });

    expect(deriveScore(match, null, playerTeams(cupWith(match)))).toEqual({
      home: 1,
      away: 0,
      kind: 'normal',
    });
  });

  it('TST-029: conta pênalti do tempo normal no placar', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: [...goalsFor('ta', 1, { penalty: true }), ...goalsFor('tb', 2)],
    });

    expect(deriveScore(match, null, playerTeams(cupWith(match)))).toMatchObject({
      home: 1,
      away: 2,
    });
  });

  it('TST-030: gol contra soma para o adversário', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: [goal('p-ta1'), ownGoal('p-ta1')],
    });

    expect(deriveScore(match, null, playerTeams(cupWith(match)))).toEqual({
      home: 1,
      away: 1,
      kind: 'normal',
    });
  });

  it('ignora eventos de jogadoras fora da partida', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: [goal('p-tc1')],
    });

    expect(deriveScore(match, null, playerTeams(cupWith(match)))).toEqual({
      home: 0,
      away: 0,
      kind: 'normal',
    });
  });

  it('aplica W.O. 1x0 na ordem mandante/visitante e ignora gols', () => {
    const homeWinner = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: [goal('p-tb1')],
      walkover: { winnerTeamId: 'ta', reason: 'withdrawal', note: null },
    });
    const awayWinner = makeGroupMatch({
      id: 'g2',
      home: 'tb',
      away: 'tc',
      walkover: { winnerTeamId: 'tc', reason: 'no_show', note: null },
    });

    expect(deriveScore(homeWinner, null, playerTeams(cupWith(homeWinner)))).toEqual({
      home: 1,
      away: 0,
      kind: 'walkover',
    });
    expect(deriveScore(awayWinner, null, playerTeams(cupWith(awayWinner)))).toEqual({
      home: 0,
      away: 1,
      kind: 'walkover',
    });
  });

  it('TST-033: o shootout não altera o placar do tempo normal', () => {
    const match = makeFinal({
      events: [goal('p-ta1'), goal('p-tb1')],
      shootout: { home: 4, away: 3 },
    });

    expect(deriveScore(match, finalists, playerTeams(cupWith(match)))).toEqual({
      home: 1,
      away: 1,
      kind: 'normal',
    });
  });

  it('retorna null para partida não finalizada', () => {
    const scheduled = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'scheduled',
    });
    const postponed = makeGroupMatch({
      id: 'g2',
      home: 'tb',
      away: 'tc',
      status: 'postponed',
      startsAt: null,
    });
    const teams = playerTeams(cupWith(scheduled, postponed));

    expect(deriveScore(scheduled, null, teams)).toBeNull();
    expect(deriveScore(postponed, null, teams)).toBeNull();
  });
});

describe('winnerOf', () => {
  it('identifica a vencedora pelo placar normal', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: goalsFor('tb', 1),
    });

    expect(winnerOf(match, null, playerTeams(cupWith(match)))).toBe('tb');
  });

  it('retorna null em empate sem shootout', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: [goal('p-ta1'), goal('p-tb1')],
    });

    expect(winnerOf(match, null, playerTeams(cupWith(match)))).toBeNull();
  });

  it('dá precedência ao W.O.', () => {
    const match = makeGroupMatch({
      id: 'g2',
      home: 'tb',
      away: 'tc',
      events: [goal('p-tb1')],
      walkover: { winnerTeamId: 'tc', reason: 'no_show', note: null },
    });

    expect(winnerOf(match, null, playerTeams(cupWith(match)))).toBe('tc');
  });

  it('decide a final pelo shootout', () => {
    const match = makeFinal({
      events: [goal('p-ta1'), goal('p-tb1')],
      shootout: { home: 3, away: 4 },
    });

    expect(winnerOf(match, finalists, playerTeams(cupWith(match)))).toBe('tb');
  });

  it('retorna null para partida não finalizada', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'scheduled',
    });

    expect(winnerOf(match, null, playerTeams(cupWith(match)))).toBeNull();
  });
});
