import { describe, expect, it } from 'vitest';

import { loadCompetition } from '../../src/lib/data/load';
import {
  buildSuspensions,
  cardSummary,
  suspendedFor,
} from '../../src/lib/domain/discipline';
import type {
  Event,
  GroupMatch,
  GroupMatchId,
  Match,
  MatchStatus,
} from '../../src/lib/domain/types';
import {
  makeCompetition,
  makeFinal,
  makeGroupMatch,
  makeSemi,
  red,
  yellow,
} from '../factories/domain';

const GROUP_MATCHUPS = [
  ['g1', 'ta', 'tb'],
  ['g2', 'tb', 'tc'],
  ['g3', 'ta', 'tc'],
  ['g4', 'tb', 'ta'],
  ['g5', 'tc', 'ta'],
  ['g6', 'tc', 'tb'],
] as const;

function groupMatches(
  eventsByMatch: Partial<Record<GroupMatchId, readonly Event[]>> = {},
): readonly GroupMatch[] {
  return GROUP_MATCHUPS.map(([id, home, away]) =>
    makeGroupMatch({ id, home, away, events: eventsByMatch[id] ?? [] }),
  );
}

interface BracketInput {
  readonly groupEvents?: Partial<Record<GroupMatchId, readonly Event[]>>;
  readonly semiEvents?: readonly Event[];
  readonly semiStatus?: MatchStatus;
  readonly finalEvents?: readonly Event[];
  readonly finalStatus?: MatchStatus;
}

function bracketMatches(input: BracketInput = {}): readonly Match[] {
  const semiStatus = input.semiStatus ?? 'finished';
  const finalStatus = input.finalStatus ?? 'scheduled';

  return [
    ...groupMatches(input.groupEvents ?? {}),
    makeSemi({
      status: semiStatus,
      startsAt: semiStatus === 'scheduled' ? null : '2026-12-02T20:30:00-03:00',
      events: input.semiEvents ?? [],
    }),
    makeFinal({
      status: finalStatus,
      startsAt: finalStatus === 'scheduled' ? null : '2026-12-03T20:30:00-03:00',
      events: input.finalEvents ?? [],
    }),
  ];
}

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
      matches: groupMatches({ g1: [red('p-ta1')] }),
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

  it('TST-019: segundo amarelo no mesmo jogo também suspende a próxima partida', () => {
    const competition = makeCompetition({
      matches: groupMatches({ g1: [yellow('p-ta1'), yellow('p-ta1')] }),
    });

    expect(buildSuspensions(competition)).toContainEqual({
      playerId: 'p-ta1',
      teamId: 'ta',
      reason: 'secondYellow',
      sentOffIn: 'g1',
      suspendedFor: 'g3',
      pendingFinalists: false,
    });
  });

  it('TST-023: não suspende quando não há próxima partida', () => {
    const competition = makeCompetition({
      matches: bracketMatches({
        finalEvents: [red('p-ta1')],
        finalStatus: 'finished',
      }),
      semifinalists: ['tb', 'tc'],
      finalists: ['ta', 'tb'],
    });

    expect(buildSuspensions(competition)).toContainEqual({
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
      matches: groupMatches({
        g1: [yellow('p-ta1')],
        g3: [yellow('p-ta1')],
      }),
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
    const competition = loadCompetition('tests/fixtures/valida.yaml');

    const changed = makeCompetition({
      teams: competition.teams,
      matches: competition.matches.map((match) =>
        match.id === 'g3'
          ? { ...match, events: [...match.events, red('p-001')] }
          : match,
      ),
      semifinalists: competition.semifinalists,
      finalists: competition.finalists,
    });

    const suspension = buildSuspensions(changed).find((item) => item.playerId === 'p-001');
    expect(suspension).toMatchObject({ sentOffIn: 'g3', suspendedFor: 'g4' });
  });

  it('TST-121: 1º colocado cumpre na final o vermelho do último jogo de grupo', () => {
    const groupEvents = { g5: [red('p-ta1')] };

    const pending = makeCompetition({
      matches: bracketMatches({ groupEvents, semiStatus: 'scheduled' }),
      semifinalists: ['tb', 'tc'],
      finalists: null,
    });

    expect(buildSuspensions(pending)).toContainEqual({
      playerId: 'p-ta1',
      teamId: 'ta',
      reason: 'direct',
      sentOffIn: 'g5',
      suspendedFor: null,
      pendingFinalists: true,
    });

    const defined = makeCompetition({
      matches: bracketMatches({ groupEvents }),
      semifinalists: ['tb', 'tc'],
      finalists: ['ta', 'tb'],
    });

    expect(buildSuspensions(defined)).toContainEqual({
      playerId: 'p-ta1',
      teamId: 'ta',
      reason: 'direct',
      sentOffIn: 'g5',
      suspendedFor: 'final',
      pendingFinalists: false,
    });
  });

  it('TST-122: vermelho na semifinal só suspende na final se o time avançar', () => {
    const advanced = makeCompetition({
      matches: bracketMatches({ semiEvents: [red('p-ta1')] }),
      semifinalists: ['ta', 'tb'],
      finalists: ['tc', 'ta'],
    });

    expect(buildSuspensions(advanced)).toContainEqual({
      playerId: 'p-ta1',
      teamId: 'ta',
      reason: 'direct',
      sentOffIn: 'semi',
      suspendedFor: 'final',
      pendingFinalists: false,
    });

    const eliminated = makeCompetition({
      matches: bracketMatches({ semiEvents: [red('p-tb1')] }),
      semifinalists: ['ta', 'tb'],
      finalists: ['tc', 'ta'],
    });

    expect(buildSuspensions(eliminated)).toContainEqual({
      playerId: 'p-tb1',
      teamId: 'tb',
      reason: 'direct',
      sentOffIn: 'semi',
      suspendedFor: null,
      pendingFinalists: false,
    });
  });

  it('TST-123: 2º ou 3º cumpre na semifinal o vermelho do último jogo de grupo', () => {
    const competition = makeCompetition({
      matches: bracketMatches({
        groupEvents: { g6: [red('p-tb1')] },
        semiStatus: 'scheduled',
      }),
      semifinalists: ['ta', 'tb'],
      finalists: null,
    });

    expect(buildSuspensions(competition)).toContainEqual({
      playerId: 'p-tb1',
      teamId: 'tb',
      reason: 'direct',
      sentOffIn: 'g6',
      suspendedFor: 'semi',
      pendingFinalists: false,
    });
  });

  it('expõe as jogadoras suspensas em uma partida', () => {
    const competition = makeCompetition({
      matches: groupMatches({ g1: [red('p-ta1')] }),
    });
    const g3 = competition.matches.find((match) => match.id === 'g3');
    if (g3 === undefined) throw new Error('g3 ausente.');

    expect([...suspendedFor(g3, competition)]).toEqual(['p-ta1']);
  });
});
