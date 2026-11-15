import { byCanonicalOrder } from './order';
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

export function matchesForTeam(competition: Competition, teamId: TeamId): readonly Match[] {
  const matches: Match[] = competition.matches.filter(
    (match) =>
      match.stage === 'group' &&
      (match.homeTeamId === teamId || match.awayTeamId === teamId),
  );

  if (competition.finalists !== null) {
    const final = competition.matches.find((match) => match.stage === 'final');
    if (final !== undefined && competition.finalists.final.includes(teamId)) {
      matches.push(final);
    }
  }

  return matches.sort(byCanonicalOrder);
}

export function buildSuspensions(competition: Competition): readonly Suspension[] {
  const suspensions: Suspension[] = [];

  for (const team of competition.teams) {
    const matches = matchesForTeam(competition, team.id);

    matches.forEach((match, index) => {
      const reds = redCardsForTeamInMatch(team, match);

      for (const red of reds) {
        const next = matches[index + 1];
        const pendingFinalists =
          next === undefined && competition.finalists === null && match.stage === 'group';

        suspensions.push({
          playerId: red.playerId,
          teamId: team.id,
          reason: red.reason,
          sentOffIn: match.id as MatchId,
          suspendedFor: next?.id ?? null,
          pendingFinalists,
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
