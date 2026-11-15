import { buildPlayerTeamMap } from './players';
import { winnerOf } from './score';
import { rankTeams } from './standings';
import type { Competition, Finalists, Podium } from './types';

export function isGroupComplete(competition: Competition): boolean {
  const groupMatches = competition.matches.filter((match) => match.stage === 'group');
  return groupMatches.length === 6 && groupMatches.every((match) => match.status === 'finished');
}

/**
 * Snapshot esperado da final: 1º e 2º da classificação final do grupo.
 * Retorna `null` enquanto o grupo não termina. Se o sorteio for necessário
 * sem `drawOrder`, `rankTeams` lança `DrawRequiredError` e a validação
 * reporta VAL-018.
 */
export function buildExpectedFinalists(competition: Competition): Finalists | null {
  if (!isGroupComplete(competition)) return null;

  const ranking = rankTeams(competition);
  const first = ranking.rows[0];
  const second = ranking.rows[1];
  if (first === undefined || second === undefined) return null;

  return { final: [first.teamId, second.teamId] };
}

/**
 * Pódio de três posições: campeã e vice dependem da final; a 3ª colocada é
 * a 3ª da classificação do grupo e não depende do resultado da final.
 */
export function buildPodium(competition: Competition): Podium {
  if (!isGroupComplete(competition)) {
    return { champion: null, runnerUp: null, third: null };
  }

  const ranking = rankTeams(competition);
  const third = ranking.rows[2]?.teamId ?? null;
  const final = competition.matches.find((match) => match.id === 'final');

  if (
    final === undefined ||
    final.status !== 'finished' ||
    competition.finalists === null
  ) {
    return { champion: null, runnerUp: null, third };
  }

  const winner = winnerOf(final, competition.finalists, buildPlayerTeamMap(competition));
  if (winner === null) {
    return { champion: null, runnerUp: null, third };
  }

  const [homeTeamId, awayTeamId] = competition.finalists.final;
  return {
    champion: winner,
    runnerUp: winner === homeTeamId ? awayTeamId : homeTeamId,
    third,
  };
}
