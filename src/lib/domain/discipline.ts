import { buildPlayerTeamMap } from './players';
import { byCanonicalOrder } from './order';
import { winnerOf } from './score';
import type {
  Competition,
  Event,
  Match,
  MatchId,
  PlayerId,
  Suspension,
  Team,
  TeamId,
} from './types';

export interface CardSummary {
  readonly yellow: number;
  readonly red: number;
  readonly redDerived: number;
  readonly points: number;
}

export function cardSummary(events: readonly Event[], playerId: PlayerId): CardSummary {
  const yellow = events.filter(
    (event) => event.type === 'yellow' && event.playerId === playerId,
  ).length;
  const directRed = events.filter(
    (event) => event.type === 'red' && event.playerId === playerId,
  ).length;

  const redDerived = yellow === 2 ? 1 : 0;
  const red = directRed + redDerived;

  let points: number;
  if (yellow >= 2) {
    points = 3;
  } else if (directRed >= 1) {
    points = 2 + yellow;
  } else {
    points = yellow;
  }

  return { yellow, red, redDerived, points };
}

export interface RedCard {
  readonly playerId: PlayerId;
  readonly reason: 'direct' | 'secondYellow';
}

export function redCardsForTeamInMatch(team: Team, match: Match): readonly RedCard[] {
  const reds: RedCard[] = [];

  for (const player of team.players) {
    const summary = cardSummary(match.events, player.id);
    if (summary.red === 0) continue;

    const hasDirectRed = match.events.some(
      (event) => event.type === 'red' && event.playerId === player.id,
    );

    reds.push({
      playerId: player.id,
      reason: hasDirectRed ? 'direct' : 'secondYellow',
    });
  }

  return reds;
}

/**
 * Partidas reais do time no chaveamento. Inclui a semifinal apenas quando o
 * time é semifinalista e a final apenas quando é finalista. Assim, o 1º
 * colocado não tem semifinal e sua próxima partida após o grupo é a final.
 */
export function matchesForTeam(competition: Competition, teamId: TeamId): readonly Match[] {
  const matches: Match[] = competition.matches.filter(
    (match) =>
      match.stage === 'group' &&
      (match.homeTeamId === teamId || match.awayTeamId === teamId),
  );

  const semi = competition.matches.find((match) => match.stage === 'semi');
  if (
    semi !== undefined &&
    competition.semifinalists !== null &&
    competition.semifinalists.includes(teamId)
  ) {
    matches.push(semi);
  }

  const final = competition.matches.find((match) => match.stage === 'final');
  if (
    final !== undefined &&
    competition.finalists !== null &&
    competition.finalists.includes(teamId)
  ) {
    matches.push(final);
  }

  return matches.sort(byCanonicalOrder);
}

function isPendingFinalists(
  competition: Competition,
  teamId: TeamId,
  sentOffIn: Match,
): boolean {
  if (competition.finalists !== null) return false;

  if (sentOffIn.stage === 'group') {
    // O 1º colocado não disputa a semifinal; sem finalists, a final é a
    // próxima partida possível. O 2º/3º já têm a semifinal como próxima.
    return !competition.semifinalists?.includes(teamId);
  }

  if (sentOffIn.stage === 'semi') {
    const semi = sentOffIn;
    const winner = winnerOf(
      semi,
      { semifinalists: competition.semifinalists, finalists: competition.finalists },
      buildPlayerTeamMap(competition),
    );
    return winner === teamId;
  }

  return false;
}

export function buildSuspensions(competition: Competition): readonly Suspension[] {
  const suspensions: Suspension[] = [];

  for (const team of competition.teams) {
    const matches = matchesForTeam(competition, team.id);

    matches.forEach((match, index) => {
      const reds = redCardsForTeamInMatch(team, match);

      for (const red of reds) {
        const next = matches[index + 1];
        suspensions.push({
          playerId: red.playerId,
          teamId: team.id,
          reason: red.reason,
          sentOffIn: match.id as MatchId,
          suspendedFor: next?.id ?? null,
          pendingFinalists:
            next === undefined && isPendingFinalists(competition, team.id, match),
        });
      }
    });
  }

  return suspensions;
}

export function suspendedFor(
  match: Match,
  competition: Competition,
): ReadonlySet<PlayerId> {
  const suspended = new Set<PlayerId>();

  for (const suspension of buildSuspensions(competition)) {
    if (suspension.suspendedFor === match.id) {
      suspended.add(suspension.playerId);
    }
  }

  return suspended;
}
