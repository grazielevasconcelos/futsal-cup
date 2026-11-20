import { buildPlayerTeamMap } from './players';
import { winnerOf } from './score';
import { rankTeams } from './standings';
import type { Competition, Match, Podium, TeamId } from './types';

export function isGroupComplete(competition: Competition): boolean {
  const groupMatches = competition.matches.filter((match) => match.stage === 'group');
  return groupMatches.length === 6 && groupMatches.every((match) => match.status === 'finished');
}

export function isSemiComplete(competition: Competition): boolean {
  const semi = competition.matches.find((match) => match.id === 'semi');
  return semi !== undefined && semi.status === 'finished';
}

function matchById(competition: Competition, matchId: Match['id']): Match | undefined {
  return competition.matches.find((match) => match.id === matchId);
}

/**
 * Snapshot esperado da semifinal: 2º e 3º da classificação final do grupo.
 * Retorna `null` enquanto o grupo não termina. Se o sorteio for necessário
 * sem `drawOrder`, `rankTeams` lança `DrawRequiredError` e a validação
 * reporta VAL-018.
 */
export function buildExpectedSemifinalists(
  competition: Competition,
): readonly [TeamId, TeamId] | null {
  if (!isGroupComplete(competition)) return null;

  const ranking = rankTeams(competition);
  const second = ranking.rows[1];
  const third = ranking.rows[2];
  if (second === undefined || third === undefined) return null;

  return [second.teamId, third.teamId];
}

/**
 * Snapshot esperado da final: 1º da classificação e vencedora da semifinal.
 * Retorna `null` enquanto a semifinal não termina.
 */
export function buildExpectedFinalists(
  competition: Competition,
): readonly [TeamId, TeamId] | null {
  if (!isSemiComplete(competition)) return null;

  const ranking = rankTeams(competition);
  const first = ranking.rows[0];
  const semi = matchById(competition, 'semi');
  if (first === undefined || semi === undefined || competition.semifinalists === null) {
    return null;
  }

  const winner = winnerOf(
    semi,
    { semifinalists: competition.semifinalists, finalists: competition.finalists },
    buildPlayerTeamMap(competition),
  );
  if (winner === null) return null;

  return [first.teamId, winner];
}

/**
 * Pódio de três posições: campeã e vice dependem da final; a 3ª colocada é a
 * perdedora da semifinal e fica conhecida quando a semifinal termina.
 */
export function buildPodium(competition: Competition): Podium {
  if (!isGroupComplete(competition)) {
    return { champion: null, runnerUp: null, third: null };
  }

  const semi = matchById(competition, 'semi');
  if (
    semi === undefined ||
    semi.status !== 'finished' ||
    competition.semifinalists === null
  ) {
    return { champion: null, runnerUp: null, third: null };
  }

  const snapshots = {
    semifinalists: competition.semifinalists,
    finalists: competition.finalists,
  };
  const playerTeams = buildPlayerTeamMap(competition);
  const semiWinner = winnerOf(semi, snapshots, playerTeams);
  if (semiWinner === null) {
    return { champion: null, runnerUp: null, third: null };
  }

  const third =
    semiWinner === competition.semifinalists[0]
      ? competition.semifinalists[1]
      : competition.semifinalists[0];

  const final = matchById(competition, 'final');
  if (
    final === undefined ||
    final.status !== 'finished' ||
    competition.finalists === null
  ) {
    return { champion: null, runnerUp: null, third };
  }

  const champion = winnerOf(final, snapshots, playerTeams);
  if (champion === null) {
    return { champion: null, runnerUp: null, third };
  }

  const [homeTeamId, awayTeamId] = competition.finalists;
  return {
    champion,
    runnerUp: champion === homeTeamId ? awayTeamId : homeTeamId,
    third,
  };
}
