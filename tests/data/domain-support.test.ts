import { describe, expect, it } from 'vitest';

import { loadCompetition } from '../../src/lib/data/load';
import { buildSuspensions } from '../../src/lib/domain/discipline';
import { buildPlayerTeamMap } from '../../src/lib/domain/players';
import { buildPodium } from '../../src/lib/domain/playoffs';
import { deriveScore, winnerOf } from '../../src/lib/domain/score';
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
    const g3 = competition.matches.find((match) => match.id === 'g3');
    if (g3 === undefined) throw new Error('g3 ausente na fixture.');

    expect(deriveScore(g3, null, buildPlayerTeamMap(competition))).toEqual({
      home: 0,
      away: 3,
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
      sentOffIn: 'g5',
      suspendedFor: 'g6',
      pendingFinalists: false,
    });
  });

  describe('snapshots e pódio da fase final', () => {
    const playerTeams = buildPlayerTeamMap(competition);
    const snapshots = {
      semifinalists: competition.semifinalists,
      finalists: competition.finalists,
    };

    function knockout(id: string) {
      const found = competition.matches.find((match) => match.id === id);
      if (found === undefined) throw new Error(`${id} ausente na fixture.`);
      return found;
    }

    it('registra os snapshots de semifinalistas e finalistas', () => {
      expect(competition.semifinalists).toEqual(['ta', 'tb']);
      expect(competition.finalists).toEqual(['tc', 'tb']);
    });

    it('aponta tb como vencedora da semifinal', () => {
      expect(winnerOf(knockout('semi'), snapshots, playerTeams)).toBe('tb');
    });

    it('monta o pódio com campeã, vice-campeã e 3ª colocada', () => {
      expect(buildPodium(competition)).toEqual({
        champion: 'tc',
        runnerUp: 'tb',
        third: 'ta',
      });
    });

    it('dá o título a tc pela vantagem do empate na final 1x1', () => {
      const final = knockout('final');

      expect(deriveScore(final, snapshots, playerTeams)).toEqual({
        home: 1,
        away: 1,
        kind: 'normal',
      });
      expect(winnerOf(final, snapshots, playerTeams)).toBe('tc');
    });
  });
});
