import { describe, expect, it } from 'vitest';

import { loadCompetition } from '../../src/lib/data/load';
import { buildSuspensions } from '../../src/lib/domain/discipline';
import { buildPlayerTeamMap } from '../../src/lib/domain/players';
import { deriveScore } from '../../src/lib/domain/score';
import { rankTeams } from '../../src/lib/domain/standings';

describe('apoio de domínio usado pela validação', () => {
  const competition = loadCompetition('tests/fixtures/valida.yaml');

  it('ordena a classificação do fixture conforme o Apêndice A', () => {
    const ranking = rankTeams(competition);
    expect(ranking.rows.map((row) => row.teamId)).toEqual(['tc', 'ta', 'tb']);
    expect(ranking.rows.map((row) => row.points)).toEqual([7, 7, 2]);
    expect(ranking.drawTeams.size).toBe(0);
  });

  it('deriva o W.O. na ordem mandante/visitante', () => {
    const g2 = competition.matches.find((match) => match.id === 'g2');
    if (g2 === undefined) throw new Error('g2 ausente na fixture.');

    expect(deriveScore(g2, null, buildPlayerTeamMap(competition))).toEqual({
      home: 0,
      away: 1,
      kind: 'walkover',
    });
  });

  it('deriva a suspensão da jogadora com segundo amarelo', () => {
    const suspension = buildSuspensions(competition).find(
      (item) => item.playerId === 'p-016',
    );

    expect(suspension).toEqual({
      playerId: 'p-016',
      teamId: 'tc',
      reason: 'secondYellow',
      sentOffIn: 'g3',
      suspendedFor: 'g5',
      pendingFinalists: false,
    });
  });
});
