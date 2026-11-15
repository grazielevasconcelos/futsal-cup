import { describe, expect, it } from 'vitest';

import { loadCompetition } from '../../src/lib/data/load';
import {
  getHomeState,
  getLastResults,
  getNextMatch,
  getNextRoundMatches,
  getPendingMatches,
  isMatchPast,
} from '../../src/lib/domain/home';
import type { Competition, Match } from '../../src/lib/domain/types';
import {
  makeCompetition,
  makeFinal,
  makeGroupMatch,
} from '../factories/domain';

function scheduledMatches(): readonly Match[] {
  return [
    makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'scheduled',
      date: '2026-11-24',
      startsAt: '2026-11-24T19:00:00-03:00',
    }),
    makeGroupMatch({
      id: 'g2',
      home: 'tb',
      away: 'tc',
      status: 'scheduled',
      date: '2026-11-24',
      startsAt: '2026-11-24T20:30:00-03:00',
    }),
    makeGroupMatch({
      id: 'g3',
      home: 'ta',
      away: 'tc',
      status: 'scheduled',
      date: '2026-11-26',
      startsAt: '2026-11-26T19:00:00-03:00',
    }),
    makeGroupMatch({
      id: 'g4',
      home: 'tb',
      away: 'ta',
      status: 'scheduled',
      date: '2026-11-26',
      startsAt: '2026-11-26T20:30:00-03:00',
    }),
    makeGroupMatch({
      id: 'g5',
      home: 'tc',
      away: 'ta',
      status: 'scheduled',
      date: '2026-12-01',
      startsAt: '2026-12-01T19:00:00-03:00',
    }),
    makeGroupMatch({
      id: 'g6',
      home: 'tc',
      away: 'tb',
      status: 'scheduled',
      date: '2026-12-01',
      startsAt: '2026-12-01T20:30:00-03:00',
    }),
    makeFinal({
      status: 'scheduled',
      date: '2026-12-03',
      startsAt: '2026-12-03T20:30:00-03:00',
    }),
  ];
}

function scheduledCup(): Competition {
  return makeCompetition({ matches: scheduledMatches() });
}

describe('estado da Início', () => {
  it('TST-066: identifica o estado antes da copa', () => {
    expect(
      getHomeState(scheduledCup(), new Date('2026-11-20T12:00:00-03:00')),
    ).toBe('beforeCup');
  });

  it('TST-067: identifica o estado durante a classificatória', () => {
    expect(
      getHomeState(scheduledCup(), new Date('2026-11-24T18:00:00-03:00')),
    ).toBe('duringGroup');

    const withResult = makeCompetition({
      matches: scheduledMatches().map((match) =>
        match.id === 'g1' ? { ...match, status: 'finished' } : match,
      ),
    });
    expect(getHomeState(withResult, new Date('2026-11-20T12:00:00-03:00'))).toBe(
      'duringGroup',
    );
  });

  it('TST-068: identifica o grupo completo antes da final', () => {
    const competition = makeCompetition({
      matches: scheduledMatches().map((match) =>
        match.stage === 'group' ? { ...match, status: 'finished' } : match,
      ),
    });

    expect(
      getHomeState(competition, new Date('2026-12-02T12:00:00-03:00')),
    ).toBe('groupComplete');
  });

  it('TST-069: identifica o estado após a final', () => {
    expect(
      getHomeState(loadCompetition('data/2026/copa.yaml'), new Date('2026-12-04T12:00:00-03:00')),
    ).toBe('afterFinal');
  });
});

describe('próximo jogo e resultados', () => {
  it('TST-070: partida agendada vencida não é próximo jogo', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({
          id: 'g1',
          home: 'ta',
          away: 'tb',
          status: 'scheduled',
          date: '2026-11-24',
          startsAt: '2026-11-24T19:00:00-03:00',
        }),
      ],
    });
    const now = new Date('2026-11-24T20:00:00-03:00');

    expect(isMatchPast(competition.matches[0] as Match, now)).toBe(true);
    expect(getNextMatch(competition, now)).toBeNull();
    expect(getPendingMatches(competition, now).map((match) => match.id)).toEqual(['g1']);
  });

  it('escolhe o próximo jogo por data, horário e ordem canônica', () => {
    const competition = scheduledCup();
    const now = new Date('2026-11-24T18:00:00-03:00');

    expect(getNextMatch(competition, now)?.id).toBe('g1');
    expect(getNextRoundMatches(competition, now).map((match) => match.id)).toEqual([
      'g1',
      'g2',
    ]);
  });

  it('coloca partidas sem horário depois das que têm horário no mesmo dia', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({
          id: 'g1',
          home: 'ta',
          away: 'tb',
          status: 'scheduled',
          date: '2026-11-24',
          startsAt: null,
        }),
        makeGroupMatch({
          id: 'g2',
          home: 'tb',
          away: 'tc',
          status: 'scheduled',
          date: '2026-11-24',
          startsAt: '2026-11-24T20:30:00-03:00',
        }),
      ],
    });

    expect(
      getNextMatch(competition, new Date('2026-11-24T18:00:00-03:00'))?.id,
    ).toBe('g2');
  });

  it('ignora partidas adiadas como próximo jogo', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({
          id: 'g1',
          home: 'ta',
          away: 'tb',
          status: 'postponed',
          date: '2026-11-24',
          startsAt: null,
        }),
      ],
    });

    expect(
      getNextMatch(competition, new Date('2026-11-20T12:00:00-03:00')),
    ).toBeNull();
  });

  it('usa a data local de São Paulo para partidas sem horário', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({
          id: 'g1',
          home: 'ta',
          away: 'tb',
          status: 'scheduled',
          date: '2026-11-24',
          startsAt: null,
        }),
      ],
    });

    expect(
      isMatchPast(competition.matches[0] as Match, new Date('2026-11-24T02:00:00Z')),
    ).toBe(false);
  });

  it('lista os resultados da última data encerrada em ordem canônica', () => {
    const groupOnly = makeCompetition({
      matches: scheduledMatches().map((match) =>
        match.stage === 'group' ? { ...match, status: 'finished' } : match,
      ),
    });

    expect(getLastResults(groupOnly).map((match) => match.id)).toEqual(['g5', 'g6']);
    expect(getLastResults(scheduledCup())).toEqual([]);
  });

  it('usa a final como último resultado quando ela termina', () => {
    expect(
      getLastResults(loadCompetition('data/2026/copa.yaml')).map((match) => match.id),
    ).toEqual(['final']);
  });
});
