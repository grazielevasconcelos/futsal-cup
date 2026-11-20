import { describe, expect, it } from 'vitest';

import { buildPlayerTeamMap } from '../../src/lib/domain/players';
import {
  SnapshotsRequiredError,
  deriveScore,
  resolveMatchTeams,
  toResolvedMatch,
  winnerOf,
} from '../../src/lib/domain/score';
import type { Competition, Match, PlayoffSnapshots } from '../../src/lib/domain/types';
import {
  goal,
  goalsFor,
  makeCompetition,
  makeFinal,
  makeGroupMatch,
  makeSemi,
  ownGoal,
} from '../factories/domain';

const snapshots: PlayoffSnapshots = {
  semifinalists: ['ta', 'tb'],
  finalists: ['tc', 'ta'],
};

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

  it('usa a ordem dos semifinalistas na semifinal', () => {
    expect(resolveMatchTeams(makeSemi(), snapshots)).toEqual({
      homeTeamId: 'ta',
      awayTeamId: 'tb',
    });
  });

  it('usa a ordem dos finalistas na final', () => {
    expect(resolveMatchTeams(makeFinal(), snapshots)).toEqual({
      homeTeamId: 'tc',
      awayTeamId: 'ta',
    });
  });

  it('falha ao resolver a semifinal sem semifinalistas', () => {
    expect(() =>
      resolveMatchTeams(makeSemi(), { semifinalists: null, finalists: ['tc', 'ta'] }),
    ).toThrow(SnapshotsRequiredError);
  });

  it('falha ao resolver a final sem finalistas', () => {
    expect(() =>
      resolveMatchTeams(makeFinal(), { semifinalists: ['ta', 'tb'], finalists: null }),
    ).toThrow(SnapshotsRequiredError);
  });

  it('resolve a partida mantendo os demais campos', () => {
    const match = makeFinal({ events: goalsFor('tc', 1) });

    expect(toResolvedMatch(match, snapshots)).toMatchObject({
      id: 'final',
      homeTeamId: 'tc',
      awayTeamId: 'ta',
      status: 'finished',
      date: '2026-12-03',
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

  it('aplica W.O. 3x0 na ordem mandante/visitante e ignora gols', () => {
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
      home: 3,
      away: 0,
      kind: 'walkover',
    });
    expect(deriveScore(awayWinner, null, playerTeams(cupWith(awayWinner)))).toEqual({
      home: 0,
      away: 3,
      kind: 'walkover',
    });
  });

  it('deriva o placar da semifinal a partir dos semifinalistas', () => {
    const match = makeSemi({
      events: [...goalsFor('ta', 1), ...goalsFor('tb', 2)],
    });

    expect(deriveScore(match, snapshots, playerTeams(cupWith(match)))).toEqual({
      home: 1,
      away: 2,
      kind: 'normal',
    });
  });

  it('mantém o empate no placar da final, sem converter a vantagem em gol', () => {
    const match = makeFinal({
      events: [...goalsFor('tc', 1), ...goalsFor('ta', 1)],
    });

    expect(deriveScore(match, snapshots, playerTeams(cupWith(match)))).toEqual({
      home: 1,
      away: 1,
      kind: 'normal',
    });
  });

  it('falha ao derivar placar de mata-mata sem o snapshot necessário', () => {
    const match = makeSemi({ events: goalsFor('ta', 1) });

    expect(() => deriveScore(match, null, playerTeams(cupWith(match)))).toThrow(
      SnapshotsRequiredError,
    );
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

  it('retorna null em empate de partida de grupo', () => {
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

  it('classifica o 2º quando a semifinal termina empatada', () => {
    const match = makeSemi({
      events: [goal('p-ta1'), goal('p-tb1')],
    });

    expect(winnerOf(match, snapshots, playerTeams(cupWith(match)))).toBe('ta');
  });

  it('dá o título ao 1º quando a final termina empatada', () => {
    const match = makeFinal({
      events: [goal('p-tc1'), goal('p-ta1')],
    });

    expect(winnerOf(match, snapshots, playerTeams(cupWith(match)))).toBe('tc');
  });

  it('define o vencedor da semifinal pelo placar normal, inclusive visitante', () => {
    const match = makeSemi({ events: goalsFor('tb', 1) });

    expect(winnerOf(match, snapshots, playerTeams(cupWith(match)))).toBe('tb');
  });

  it('define o campeão pelo W.O. da final, inclusive visitante', () => {
    const match = makeFinal({
      walkover: { winnerTeamId: 'ta', reason: 'no_show', note: null },
    });

    expect(winnerOf(match, snapshots, playerTeams(cupWith(match)))).toBe('ta');
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
