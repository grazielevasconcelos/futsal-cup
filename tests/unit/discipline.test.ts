import { describe, expect, it } from 'vitest';

import { loadCompetition } from '../../src/lib/data/load';
import {
  buildSuspensions,
  cardSummary,
  suspendedFor,
} from '../../src/lib/domain/discipline';
import {
  makeCompetition,
  makeFinal,
  makeGroupMatch,
  red,
  yellow,
} from '../factories/domain';

describe('cartões e pontos disciplinares', () => {
  it('TST-017: um amarelo vale 1 ponto e um vermelho direto vale 2', () => {
    expect(cardSummary([yellow('p-ta1')], 'p-ta1')).toEqual({
      yellow: 1,
      red: 0,
      redDerived: 0,
      points: 1,
    });
    expect(cardSummary([red('p-ta1')], 'p-ta1')).toEqual({
      yellow: 0,
      red: 1,
      redDerived: 0,
      points: 2,
    });
  });

  it('TST-018: amarelo e vermelho direto no mesmo jogo valem 3 pontos', () => {
    expect(cardSummary([yellow('p-ta1'), red('p-ta1')], 'p-ta1')).toEqual({
      yellow: 1,
      red: 1,
      redDerived: 0,
      points: 3,
    });
  });

  it('TST-019: segundo amarelo deriva vermelho e vale 3 pontos', () => {
    expect(cardSummary([yellow('p-ta1'), yellow('p-ta1')], 'p-ta1')).toEqual({
      yellow: 2,
      red: 1,
      redDerived: 1,
      points: 3,
    });
  });
});

describe('suspensões', () => {
  it('TST-022: suspende na próxima partida canônica do time', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: [red('p-ta1')] }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc' }),
      ],
    });

    expect(buildSuspensions(competition)).toContainEqual({
      playerId: 'p-ta1',
      teamId: 'ta',
      reason: 'direct',
      sentOffIn: 'g1',
      suspendedFor: 'g3',
      pendingFinalists: false,
    });
  });

  it('TST-023: não suspende quando não há próxima partida', () => {
    const competition = makeCompetition({
      finalists: { final: ['ta', 'tc'] },
      matches: [
        makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb', events: [red('p-tb1')] }),
        makeFinal({ events: [red('p-ta1')], shootout: { home: 4, away: 3 } }),
      ],
    });

    const suspensions = buildSuspensions(competition);
    expect(suspensions).toContainEqual({
      playerId: 'p-tb1',
      teamId: 'tb',
      reason: 'direct',
      sentOffIn: 'g6',
      suspendedFor: null,
      pendingFinalists: false,
    });
    expect(suspensions).toContainEqual({
      playerId: 'p-ta1',
      teamId: 'ta',
      reason: 'direct',
      sentOffIn: 'final',
      suspendedFor: null,
      pendingFinalists: false,
    });
  });

  it('TST-025: não suspende por acúmulo de amarelos entre partidas', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: [yellow('p-ta1')] }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc', events: [yellow('p-ta1')] }),
      ],
    });

    expect(buildSuspensions(competition)).toEqual([]);
  });

  it('TST-027: considera cartões registrados em W.O. por elenco insuficiente', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({
          id: 'g2',
          home: 'tb',
          away: 'tc',
          walkover: { winnerTeamId: 'tc', reason: 'insufficient_players', note: null },
          events: [red('p-tb1')],
        }),
        makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta' }),
      ],
    });

    expect(buildSuspensions(competition)).toContainEqual({
      playerId: 'p-tb1',
      teamId: 'tb',
      reason: 'direct',
      sentOffIn: 'g2',
      suspendedFor: 'g4',
      pendingFinalists: false,
    });
  });

  it('TST-112: aplica a suspensão na segunda partida do mesmo dia', () => {
    const competition = loadCompetition('data/2026/copa.yaml');

    const changed = makeCompetition({
      teams: competition.teams,
      matches: competition.matches.map((match) =>
        match.id === 'g3'
          ? { ...match, events: [...match.events, red('p-001')] }
          : match,
      ),
    });

    const suspension = buildSuspensions(changed).find((item) => item.playerId === 'p-001');
    expect(suspension).toMatchObject({ sentOffIn: 'g3', suspendedFor: 'g4' });
  });

  it('marca suspensão pendente enquanto os finalistas não são definidos', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta', events: [red('p-ta1')] }),
      ],
    });

    const suspension = buildSuspensions(competition).find((item) => item.playerId === 'p-ta1');
    expect(suspension).toMatchObject({ suspendedFor: null, pendingFinalists: true });
  });

  it('expõe as jogadoras suspensas em uma partida', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: [red('p-ta1')] }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc' }),
      ],
    });
    const g3 = competition.matches[1];
    if (g3 === undefined) throw new Error('g3 ausente.');

    expect([...suspendedFor(g3, competition)]).toEqual(['p-ta1']);
  });
});
