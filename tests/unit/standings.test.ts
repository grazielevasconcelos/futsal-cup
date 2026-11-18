import { describe, expect, it } from 'vitest';

import { loadCompetition } from '../../src/lib/data/load';
import { DrawRequiredError, buildStandings, rankTeams } from '../../src/lib/domain/standings';
import type { StandingRow, TeamId } from '../../src/lib/domain/types';
import { goalsFor, makeCompetition, makeGroupMatch, yellow } from '../factories/domain';

function row(rows: readonly StandingRow[], teamId: TeamId): StandingRow {
  const found = rows.find((item) => item.teamId === teamId);
  if (found === undefined) throw new Error(`Linha de ${teamId} ausente.`);
  return found;
}

describe('classificação e desempate', () => {
  it('TST-001: pontua 3/1/0 a partir dos gols registrados', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: goalsFor('ta', 1) }),
        makeGroupMatch({
          id: 'g3',
          home: 'ta',
          away: 'tc',
          events: [...goalsFor('ta', 1), ...goalsFor('tc', 1)],
        }),
        makeGroupMatch({
          id: 'g5',
          home: 'tc',
          away: 'tb',
          events: goalsFor('tc', 2),
        }),
      ],
    });

    const rows = buildStandings(competition);
    expect(row(rows, 'ta')).toMatchObject({ points: 4, wins: 1, draws: 1, losses: 0 });
    expect(row(rows, 'tb')).toMatchObject({ points: 0, wins: 0, draws: 0, losses: 2 });
    expect(row(rows, 'tc')).toMatchObject({ points: 4, wins: 1, draws: 1, losses: 0 });
  });

  it('TST-002: ordena por pontos em ordem decrescente', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: goalsFor('ta', 1) }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc', events: goalsFor('tc', 1) }),
        makeGroupMatch({
          id: 'g5',
          home: 'tc',
          away: 'tb',
          events: [...goalsFor('tc', 1), ...goalsFor('tb', 1)],
        }),
      ],
    });

    const ranking = rankTeams(competition);
    expect(ranking.rows.map((item) => item.teamId)).toEqual(['tc', 'ta', 'tb']);
    expect(ranking.rows.map((item) => item.points)).toEqual([4, 3, 1]);
    expect(ranking.rows.map((item) => item.position)).toEqual([1, 2, 3]);
  });

  it('TST-003: decide pelo confronto direto dos dois jogos', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: goalsFor('ta', 1) }),
        makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta' }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc', events: goalsFor('tc', 2) }),
        makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta', events: goalsFor('tc', 1) }),
        makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc', events: goalsFor('tb', 3) }),
        makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb', events: goalsFor('tc', 1) }),
      ],
    });

    const rows = buildStandings(competition);
    expect(rows.map((item) => item.teamId)).toEqual(['tc', 'ta', 'tb']);
    expect(row(rows, 'ta').points).toBe(4);
    expect(row(rows, 'tb').points).toBe(4);
    expect(row(rows, 'tb').goalDifference).toBeGreaterThan(row(rows, 'ta').goalDifference);
  });

  it('TST-004: usa o saldo agregado do confronto direto quando os pontos empatam', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({
          id: 'g1',
          home: 'ta',
          away: 'tb',
          events: [...goalsFor('ta', 3), ...goalsFor('tb', 1)],
        }),
        makeGroupMatch({
          id: 'g4',
          home: 'tb',
          away: 'ta',
          events: goalsFor('tb', 1),
        }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc' }),
        makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta', events: goalsFor('tc', 5) }),
        makeGroupMatch({
          id: 'g2',
          home: 'tb',
          away: 'tc',
          events: [...goalsFor('tb', 5), ...goalsFor('tc', 5)],
        }),
        makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb', events: goalsFor('tc', 1) }),
      ],
    });

    const rows = buildStandings(competition);
    expect(rows.map((item) => item.teamId)).toEqual(['tc', 'ta', 'tb']);
    expect(row(rows, 'ta').points).toBe(4);
    expect(row(rows, 'tb').points).toBe(4);
    expect(row(rows, 'ta').goalDifference).toBeLessThan(row(rows, 'tb').goalDifference);
  });

  it('TST-005: ignora o confronto direto quando um dos jogos não terminou', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: goalsFor('ta', 1) }),
        makeGroupMatch({
          id: 'g4',
          home: 'tb',
          away: 'ta',
          status: 'scheduled',
          startsAt: '2026-11-26T20:30:00-03:00',
        }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc' }),
        makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta', events: goalsFor('tc', 1) }),
        makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc', events: goalsFor('tb', 2) }),
        makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb' }),
      ],
    });

    const ranking = rankTeams(competition);
    expect(ranking.provisional).toBe(true);
    expect(ranking.rows.map((item) => item.teamId)).toEqual(['tc', 'tb', 'ta']);
  });

  it('TST-006: não aplica confronto direto com três ou mais times empatados', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({
          id: 'g1',
          home: 'ta',
          away: 'tb',
          events: goalsFor('ta', 2),
        }),
        makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta', events: goalsFor('ta', 1) }),
        makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc', events: goalsFor('tb', 1) }),
        makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb', events: goalsFor('tb', 1) }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc', events: goalsFor('tc', 4) }),
        makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta', events: goalsFor('tc', 1) }),
      ],
    });

    const rows = buildStandings(competition);
    expect(rows.map((item) => item.points)).toEqual([6, 6, 6]);
    expect(rows.map((item) => item.teamId)).toEqual(['tc', 'tb', 'ta']);
  });

  it('TST-007: reaplica o confronto direto quando um critério reduz o grupo a dois', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: goalsFor('ta', 2) }),
        makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta', events: goalsFor('ta', 1) }),
        makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc', events: goalsFor('tb', 3) }),
        makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb', events: goalsFor('tb', 1) }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc', events: goalsFor('tc', 1) }),
        makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta', events: goalsFor('tc', 1) }),
      ],
    });

    const rows = buildStandings(competition);
    expect(rows.map((item) => item.points)).toEqual([6, 6, 6]);
    expect(rows.map((item) => item.teamId)).toEqual(['ta', 'tb', 'tc']);
    expect(row(rows, 'ta').goalDifference).toBe(row(rows, 'tb').goalDifference);
    expect(row(rows, 'tb').goalsFor).toBeGreaterThan(row(rows, 'ta').goalsFor);
  });

  it('TST-008: usa o número de vitórias quando os pontos empatam', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'tb', away: 'tc', events: goalsFor('tb', 1) }),
        makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc' }),
        makeGroupMatch({ id: 'g4', home: 'tb', away: 'tc' }),
        makeGroupMatch({ id: 'g6', home: 'tb', away: 'tc' }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc', events: goalsFor('ta', 1) }),
        makeGroupMatch({ id: 'g5', home: 'ta', away: 'tc', events: goalsFor('ta', 1) }),
      ],
    });

    const rows = buildStandings(competition);
    expect(row(rows, 'ta').points).toBe(6);
    expect(row(rows, 'tb').points).toBe(6);
    expect(row(rows, 'ta').wins).toBe(2);
    expect(row(rows, 'tb').wins).toBe(1);
    expect(rows.map((item) => item.teamId)).toEqual(['ta', 'tb', 'tc']);
  });

  it('TST-009: usa saldo de gols e gols pró quando o confronto direto não decide', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb' }),
        makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc', events: goalsFor('tb', 1) }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc', events: goalsFor('ta', 3) }),
      ],
    });

    const rows = buildStandings(competition);
    expect(row(rows, 'ta').points).toBe(4);
    expect(row(rows, 'tb').points).toBe(4);
    expect(row(rows, 'ta').wins).toBe(row(rows, 'tb').wins);
    expect(row(rows, 'ta').goalDifference).toBeGreaterThan(row(rows, 'tb').goalDifference);
    expect(rows.map((item) => item.teamId)).toEqual(['ta', 'tb', 'tc']);
  });

  it('TST-011: usa pontos disciplinares e trata o segundo amarelo como três pontos', () => {
    const matches = [
      makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb', events: [yellow('p-tb1')] }),
      makeGroupMatch({
        id: 'g2',
        home: 'tb',
        away: 'tc',
        events: [yellow('p-tc1'), yellow('p-tc1')],
      }),
      makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc' }),
      makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta' }),
      makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta' }),
      makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb' }),
    ];
    const competition = makeCompetition({ matches });

    const rows = buildStandings(competition);
    expect(rows.map((item) => item.points)).toEqual([4, 4, 4]);
    expect(row(rows, 'ta').disciplinaryPoints).toBe(0);
    expect(row(rows, 'tb').disciplinaryPoints).toBe(1);
    expect(row(rows, 'tc')).toMatchObject({
      yellow: 2,
      red: 1,
      disciplinaryPoints: 3,
    });
    expect(rows.map((item) => item.teamId)).toEqual(['ta', 'tb', 'tc']);
  });

  it('TST-012: aplica o sorteio e marca as linhas decididas por ele', () => {
    const competition = makeCompetition({
      drawOrder: ['tc', 'ta', 'tb'],
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb' }),
        makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc' }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc' }),
        makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta' }),
        makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta' }),
        makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb' }),
      ],
    });

    const ranking = rankTeams(competition);
    expect(ranking.rows.map((item) => item.teamId)).toEqual(['tc', 'ta', 'tb']);
    expect(ranking.rows.every((item) => item.decidedByDraw)).toBe(true);
    expect([...ranking.drawTeams]).toEqual(['tc', 'ta', 'tb']);
  });

  it('TST-013: exige drawOrder quando a classificação final chega ao sorteio', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb' }),
        makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc' }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc' }),
        makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta' }),
        makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta' }),
        makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb' }),
      ],
    });

    expect(() => rankTeams(competition)).toThrow(DrawRequiredError);
  });

  it('TST-014: marca a classificação como provisória', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb' }),
        makeGroupMatch({
          id: 'g2',
          home: 'tb',
          away: 'tc',
          status: 'scheduled',
          startsAt: null,
        }),
      ],
    });

    expect(rankTeams(competition).provisional).toBe(true);
  });

  it('TST-015: converte W.O. em 1x0 na classificação', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({
          id: 'g2',
          home: 'tb',
          away: 'tc',
          walkover: { winnerTeamId: 'tc', reason: 'no_show', note: null },
        }),
      ],
    });

    const rows = buildStandings(competition);
    expect(row(rows, 'tc')).toMatchObject({
      points: 3,
      wins: 1,
      goalsFor: 1,
      goalsAgainst: 0,
      goalDifference: 1,
    });
    expect(row(rows, 'tb')).toMatchObject({
      points: 0,
      losses: 1,
      goalsFor: 0,
      goalsAgainst: 1,
      goalDifference: -1,
    });
  });

  it('TST-016: mantém a final e seus cartões fora da classificação', () => {
    const competition = loadCompetition('tests/fixtures/valida.yaml');
    const rows = buildStandings(competition);

    expect(rows.map((item) => item.teamId)).toEqual(['tc', 'ta', 'tb']);
    expect(rows.map((item) => item.points)).toEqual([7, 7, 2]);
    expect(row(rows, 'ta')).toMatchObject({ yellow: 1, red: 0, disciplinaryPoints: 1 });
    expect(row(rows, 'tc')).toMatchObject({ yellow: 3, red: 1, disciplinaryPoints: 4 });
  });

  it('TST-105: usa a ordem fixa dos IDs em empate total provisório', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb' }),
        makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc' }),
        makeGroupMatch({ id: 'g3', home: 'ta', away: 'tc' }),
        makeGroupMatch({
          id: 'g4',
          home: 'tb',
          away: 'ta',
          status: 'scheduled',
          startsAt: null,
        }),
      ],
    });

    const ranking = rankTeams(competition);
    expect(ranking.provisional).toBe(true);
    expect(ranking.rows.map((item) => item.teamId)).toEqual(['ta', 'tb', 'tc']);
    expect(ranking.drawTeams.size).toBe(0);
    expect(ranking.rows.every((item) => !item.decidedByDraw)).toBe(true);
  });

  it('TST-110: soma W.O. como 1x0 no saldo agregado do confronto direto', () => {
    const competition = makeCompetition({
      matches: [
        makeGroupMatch({
          id: 'g1',
          home: 'ta',
          away: 'tb',
          walkover: { winnerTeamId: 'ta', reason: 'no_show', note: null },
        }),
        makeGroupMatch({ id: 'g4', home: 'tb', away: 'ta', events: goalsFor('tb', 2) }),
        makeGroupMatch({
          id: 'g3',
          home: 'ta',
          away: 'tc',
        }),
        makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta', events: goalsFor('tc', 1) }),
        makeGroupMatch({ id: 'g2', home: 'tb', away: 'tc', events: goalsFor('tc', 5) }),
        makeGroupMatch({
          id: 'g6',
          home: 'tc',
          away: 'tb',
        }),
      ],
    });

    const rows = buildStandings(competition);
    expect(row(rows, 'ta').points).toBe(4);
    expect(row(rows, 'tb').points).toBe(4);
    expect(row(rows, 'ta').goalDifference).toBeGreaterThan(row(rows, 'tb').goalDifference);
    expect(rows.map((item) => item.teamId)).toEqual(['tc', 'tb', 'ta']);
  });
});
