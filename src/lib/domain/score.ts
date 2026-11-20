import type {
  KnockoutMatch,
  Match,
  PlayoffSnapshots,
  PlayerTeamMap,
  ResolvedMatch,
  Score,
  TeamId,
} from './types';

export class SnapshotsRequiredError extends Error {
  constructor(matchId: Match['id']) {
    super(`A partida ${matchId} precisa dos snapshots do mata-mata para resolver os participantes.`);
    this.name = 'SnapshotsRequiredError';
  }
}

function knockoutTeams(
  match: KnockoutMatch,
  snapshots: PlayoffSnapshots | null,
): readonly [TeamId, TeamId] {
  const pair =
    match.stage === 'semi' ? snapshots?.semifinalists : snapshots?.finalists;
  if (pair === undefined || pair === null) throw new SnapshotsRequiredError(match.id);
  return pair;
}

export function resolveMatchTeams(
  match: Match,
  snapshots: PlayoffSnapshots | null,
): { readonly homeTeamId: TeamId; readonly awayTeamId: TeamId } {
  if (match.stage === 'group') {
    return { homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId };
  }

  const [homeTeamId, awayTeamId] = knockoutTeams(match, snapshots);
  return { homeTeamId, awayTeamId };
}

export function toResolvedMatch(
  match: Match,
  snapshots: PlayoffSnapshots | null,
): ResolvedMatch {
  return { ...match, ...resolveMatchTeams(match, snapshots) };
}

/**
 * O mapa `playerTeams` é necessário para saber a que time pertence cada
 * evento. Ele é derivado uma única vez por competição com
 * `buildPlayerTeamMap`.
 */
export function deriveScore(
  match: Match,
  snapshots: PlayoffSnapshots | null,
  playerTeams: PlayerTeamMap,
): Score | null {
  if (match.status !== 'finished') return null;

  const { homeTeamId, awayTeamId } = resolveMatchTeams(match, snapshots);

  if (match.walkover !== null) {
    return match.walkover.winnerTeamId === homeTeamId
      ? { home: 3, away: 0, kind: 'walkover' }
      : { home: 0, away: 3, kind: 'walkover' };
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

/**
 * Vencedor administrativo/esportivo. Em empate no tempo normal de uma
 * partida de mata-mata, vence o mandante do snapshot por vantagem do empate.
 * Em partida de grupo empatada, retorna `null`.
 */
export function winnerOf(
  match: Match,
  snapshots: PlayoffSnapshots | null,
  playerTeams: PlayerTeamMap,
): TeamId | null {
  if (match.status !== 'finished') return null;

  const { homeTeamId, awayTeamId } = resolveMatchTeams(match, snapshots);

  if (match.walkover !== null) return match.walkover.winnerTeamId;

  const score = deriveScore(match, snapshots, playerTeams);
  if (score === null) return null;
  if (score.home === score.away) {
    return match.stage === 'group' ? null : homeTeamId;
  }
  return score.home > score.away ? homeTeamId : awayTeamId;
}
