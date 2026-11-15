import type { Finalists, Match, PlayerTeamMap, ResolvedMatch, Score, TeamId } from './types';

export class FinalistsRequiredError extends Error {
  constructor(matchId: Match['id']) {
    super(`A partida ${matchId} precisa de finalists para resolver os participantes.`);
    this.name = 'FinalistsRequiredError';
  }
}

export function resolveMatchTeams(
  match: Match,
  finalists: Finalists | null,
): { readonly homeTeamId: TeamId; readonly awayTeamId: TeamId } {
  if (match.stage === 'group') {
    return { homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId };
  }

  if (finalists === null) {
    throw new FinalistsRequiredError(match.id);
  }

  return { homeTeamId: finalists.final[0], awayTeamId: finalists.final[1] };
}

export function toResolvedMatch(match: Match, finalists: Finalists | null): ResolvedMatch {
  return { ...match, ...resolveMatchTeams(match, finalists) };
}

/**
 * O mapa `playerTeams` não aparece na assinatura da SPEC §9.1, mas é
 * necessário para saber a que time pertence cada evento. Ele é derivado uma
 * única vez por competição com `buildPlayerTeamMap`.
 */
export function deriveScore(
  match: Match,
  finalists: Finalists | null,
  playerTeams: PlayerTeamMap,
): Score | null {
  if (match.status !== 'finished') return null;

  const { homeTeamId, awayTeamId } = resolveMatchTeams(match, finalists);

  if (match.walkover !== null) {
    return match.walkover.winnerTeamId === homeTeamId
      ? { home: 1, away: 0, kind: 'walkover' }
      : { home: 0, away: 1, kind: 'walkover' };
  }

  let home = 0;
  let away = 0;

  for (const event of match.events) {
    const teamId = playerTeams.get(event.playerId)?.team.id;
    if (teamId !== homeTeamId && teamId !== awayTeamId) continue;

    if (event.type === 'goal') {
      if (teamId === homeTeamId) home += 1;
      else away += 1;
      continue;
    }

    if (event.type === 'ownGoal') {
      if (teamId === homeTeamId) away += 1;
      else home += 1;
    }
  }

  return { home, away, kind: 'normal' };
}

export function winnerOf(
  match: Match,
  finalists: Finalists | null,
  playerTeams: PlayerTeamMap,
): TeamId | null {
  if (match.status !== 'finished') return null;

  const { homeTeamId, awayTeamId } = resolveMatchTeams(match, finalists);

  if (match.walkover !== null) return match.walkover.winnerTeamId;

  if (match.shootout !== null) {
    if (match.shootout.home > match.shootout.away) return homeTeamId;
    if (match.shootout.away > match.shootout.home) return awayTeamId;
    return null;
  }

  const score = deriveScore(match, finalists, playerTeams);
  if (score === null || score.home === score.away) return null;
  return score.home > score.away ? homeTeamId : awayTeamId;
}
