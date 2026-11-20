import { describe, expect, it } from 'vitest';

import { loadCompetition } from '../../src/lib/data/load';
import { buildTeamMap } from '../../src/lib/domain/players';
import {
  buildPlayerStats,
  buildTeamStats,
  rankAssists,
  rankOwnGoals,
  rankPlayerCards,
  rankTeamCards,
  rankTopScorers,
} from '../../src/lib/domain/stats';
import type { PlayerStats, Team, TeamId, TeamStats } from '../../src/lib/domain/types';
import {
  goal,
  makeCompetition,
  makeGroupMatch,
  yellow,
} from '../factories/domain';

function stat(stats: readonly PlayerStats[], playerId: string): PlayerStats {
  const found = stats.find((item) => item.playerId === playerId);
  if (found === undefined) throw new Error(`Estatística de ${playerId} ausente.`);
  return found;
}

function teamStat(stats: readonly TeamStats[], teamId: TeamId): TeamStats {
  const found = stats.find((item) => item.teamId === teamId);
  if (found === undefined) throw new Error(`Estatística do time ${teamId} ausente.`);
  return found;
}

const competition = loadCompetition('tests/fixtures/valida.yaml');
const teams = buildTeamMap(competition);
const playerStats = buildPlayerStats(competition);
const teamStats = buildTeamStats(competition);

describe('estatísticas individuais', () => {
  it('TST-028: conta gol normal na artilharia e no placar', () => {
    expect(stat(playerStats, 'p-003').goals).toBe(1);
  });

  it('TST-029: conta pênalti do tempo normal na artilharia', () => {
    const paula = stat(playerStats, 'p-017');
    expect(paula.goals).toBe(2);
    expect(paula.assists).toBe(1);
  });

  it('TST-030: registra gol contra sem somar gol para a jogadora', () => {
    const eva = stat(playerStats, 'p-005');
    expect(eva.ownGoals).toBe(1);
    expect(eva.goals).toBe(0);
  });

  it('TST-031: conta assistência válida para a companheira de time', () => {
    expect(stat(playerStats, 'p-007').assists).toBe(1);
    expect(stat(playerStats, 'p-018').assists).toBe(1);
  });

  it('TST-033: não cria gols de shootout e conta o pênalti da final uma única vez', () => {
    expect(stat(playerStats, 'p-017').goals).toBe(2);
    expect(stat(playerStats, 'p-017').assists).toBe(1);
    expect(stat(playerStats, 'p-018').goals).toBe(1);
    expect(stat(playerStats, 'p-018').assists).toBe(1);
  });

  it('TST-034: ordena a artilharia por gols, assistências e nomes', () => {
    expect(rankTopScorers(playerStats, teams).map((item) => item.playerId)).toEqual([
      'p-012',
      'p-002',
      'p-017',
      'p-004',
      'p-003',
      'p-018',
      'p-020',
      'p-015',
      'p-019',
    ]);
  });

  it('TST-035: ordena as assistências por assistências, gols e nomes', () => {
    expect(rankAssists(playerStats, teams).map((item) => item.playerId)).toEqual([
      'p-013',
      'p-002',
      'p-012',
      'p-017',
      'p-003',
      'p-018',
      'p-020',
      'p-006',
      'p-007',
      'p-021',
    ]);
  });

  it('TST-036: ordena os cartões por pontos, vermelhos, amarelos e nomes', () => {
    expect(rankPlayerCards(playerStats, teams).map((item) => item.playerId)).toEqual([
      'p-016',
      'p-014',
      'p-010',
      'p-005',
      'p-009',
      'p-019',
      'p-021',
    ]);
  });

  it('TST-037: mantém gols contra fora da artilharia', () => {
    const ownGoals = rankOwnGoals(playerStats, teams);
    expect(ownGoals.map((item) => item.playerId)).toEqual(['p-005']);
    expect(rankTopScorers(playerStats, teams).map((item) => item.playerId)).not.toContain(
      'p-005',
    );
  });

  it('TST-038: marca jogadora fora do elenco ativo sem apagar o histórico', () => {
    expect(stat(playerStats, 'p-007')).toMatchObject({ active: false, assists: 1 });
    expect(stat(playerStats, 'p-002').active).toBe(true);
  });

  it('TST-027: conta cartões de W.O. nas estatísticas', () => {
    const custom = makeCompetition({
      matches: [
        makeGroupMatch({
          id: 'g2',
          home: 'tb',
          away: 'tc',
          walkover: { winnerTeamId: 'tc', reason: 'insufficient_players', note: null },
          events: [yellow('p-tb1'), yellow('p-tc1')],
        }),
      ],
    });

    expect(stat(buildPlayerStats(custom), 'p-tb1').yellow).toBe(1);
    expect(stat(buildPlayerStats(custom), 'p-tc1').yellow).toBe(1);
    expect(teamStat(buildTeamStats(custom), 'tb').disciplinaryPoints).toBe(1);
  });
});

describe('estatísticas coletivas', () => {
  it('TST-115: agrega grupo, semifinal e final e conta empate no mata-mata como empate', () => {
    expect(teamStat(teamStats, 'ta')).toMatchObject({
      played: 5,
      wins: 2,
      draws: 1,
      losses: 2,
      goalsFor: 5,
      goalsAgainst: 6,
      goalDifference: -1,
    });
    expect(teamStat(teamStats, 'tc')).toMatchObject({
      played: 5,
      wins: 2,
      draws: 2,
      losses: 1,
      goalsFor: 8,
      goalsAgainst: 4,
      goalDifference: 4,
    });
    expect(teamStat(teamStats, 'tb')).toMatchObject({
      played: 6,
      wins: 1,
      draws: 3,
      losses: 2,
      goalsFor: 5,
      goalsAgainst: 8,
      goalDifference: -3,
    });
  });

  it('TST-026: conta cartões da semifinal e da final nas estatísticas sem alterar a classificação', () => {
    expect(teamStat(teamStats, 'ta')).toMatchObject({
      yellow: 1,
      red: 0,
      disciplinaryPoints: 1,
    });
    expect(teamStat(teamStats, 'tc')).toMatchObject({
      yellow: 4,
      red: 1,
      disciplinaryPoints: 5,
    });
    expect(teamStat(teamStats, 'tb')).toMatchObject({
      yellow: 3,
      red: 1,
      disciplinaryPoints: 6,
    });
  });

  it('ordena os cartões por time', () => {
    expect(rankTeamCards(teamStats, teams).map((item) => item.teamId)).toEqual([
      'tb',
      'tc',
      'ta',
    ]);
  });

  it('não conta a final antes de ela terminar', () => {
    const scheduledFinal = makeCompetition({
      teams: competition.teams,
      semifinalists: competition.semifinalists,
      finalists: competition.finalists,
      matches: competition.matches.map((match) =>
        match.id === 'final'
          ? { ...match, status: 'scheduled', events: [] }
          : match,
      ),
    });

    expect(teamStat(buildTeamStats(scheduledFinal), 'tc').played).toBe(4);
  });

  it('respeita o elenco com jogadoras que saíram para cartões', () => {
    const custom = makeCompetition({
      teams: [
        {
          id: 'ta',
          name: 'Time A',
          displayName: null,
          abbreviation: 'TA',
          logo: null,
          players: [
            {
              id: 'p-ta1',
              nickname: 'Ana',
              position: 'linha',
              joinedAt: '2026-01-01T00:00:00-03:00',
              leftAt: '2026-11-30T00:00:00-03:00',
            },
          ],
        } satisfies Team,
        teams.get('tb') ?? {
          id: 'tb',
          name: 'Time B',
          displayName: null,
          abbreviation: 'TB',
          logo: null,
          players: [],
        },
        teams.get('tc') ?? {
          id: 'tc',
          name: 'Time C',
          displayName: null,
          abbreviation: 'TC',
          logo: null,
          players: [],
        },
      ],
      matches: [
        makeGroupMatch({
          id: 'g1',
          home: 'ta',
          away: 'tb',
          events: [yellow('p-ta1'), goal('p-ta1')],
        }),
      ],
    });

    expect(stat(buildPlayerStats(custom), 'p-ta1')).toMatchObject({
      active: false,
      goals: 1,
      yellow: 1,
      disciplinaryPoints: 1,
    });
    expect(teamStat(buildTeamStats(custom), 'ta')).toMatchObject({
      yellow: 1,
      disciplinaryPoints: 1,
    });
  });
});
