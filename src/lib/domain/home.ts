import { canonicalOrder } from './order';
import { localDateInSaoPaulo } from './time';
import type { Competition, Match } from './types';

export type HomeState = 'beforeCup' | 'duringGroup' | 'groupComplete' | 'afterFinal';

function isPast(match: Match, now: Date, today: string): boolean {
  if (match.status !== 'scheduled') return false;
  if (match.startsAt !== null) return Date.parse(match.startsAt) < now.getTime();
  return match.date < today;
}

export function isMatchPast(match: Match, now: Date): boolean {
  return isPast(match, now, localDateInSaoPaulo(now));
}

function groupMatches(competition: Competition): readonly Match[] {
  return competition.matches.filter((match) => match.stage === 'group');
}

export function getHomeState(competition: Competition, now: Date): HomeState {
  const final = competition.matches.find((match) => match.id === 'final');
  if (final?.status === 'finished') return 'afterFinal';

  const group = groupMatches(competition);
  if (group.length === 6 && group.every((match) => match.status === 'finished')) {
    return 'groupComplete';
  }

  const firstDay = group.reduce<string | null>(
    (earliest, match) =>
      earliest === null || match.date < earliest ? match.date : earliest,
    null,
  );
  const today = localDateInSaoPaulo(now);

  if (
    firstDay !== null &&
    group.every((match) => match.status !== 'finished') &&
    today < firstDay
  ) {
    return 'beforeCup';
  }

  return 'duringGroup';
}

function compareStartsAt(a: Match, b: Match): number {
  if (a.startsAt === null && b.startsAt === null) return 0;
  if (a.startsAt === null) return 1;
  if (b.startsAt === null) return -1;
  return Date.parse(a.startsAt) - Date.parse(b.startsAt);
}

function compareUpcoming(a: Match, b: Match): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return compareStartsAt(a, b) || canonicalOrder(a.id) - canonicalOrder(b.id);
}

export function getNextMatch(competition: Competition, now: Date): Match | null {
  const today = localDateInSaoPaulo(now);
  const candidates = competition.matches
    .filter((match) => match.status === 'scheduled' && !isPast(match, now, today))
    .sort(compareUpcoming);

  return candidates[0] ?? null;
}

export function getPendingMatches(
  competition: Competition,
  now: Date,
): readonly Match[] {
  const today = localDateInSaoPaulo(now);
  return competition.matches
    .filter((match) => isPast(match, now, today))
    .sort((a, b) => canonicalOrder(a.id) - canonicalOrder(b.id));
}

export function getNextRoundMatches(
  competition: Competition,
  now: Date,
): readonly Match[] {
  const next = getNextMatch(competition, now);
  if (next === null) return [];

  const today = localDateInSaoPaulo(now);
  return competition.matches
    .filter(
      (match) =>
        match.status === 'scheduled' &&
        match.date === next.date &&
        !isPast(match, now, today),
    )
    .sort((a, b) => canonicalOrder(a.id) - canonicalOrder(b.id));
}

export function getLastResults(competition: Competition): readonly Match[] {
  const finished = competition.matches.filter((match) => match.status === 'finished');
  if (finished.length === 0) return [];

  const latestDate = finished.reduce(
    (latest, match) => (match.date > latest ? match.date : latest),
    finished[0]?.date ?? '',
  );

  return finished
    .filter((match) => match.date === latestDate)
    .sort((a, b) => canonicalOrder(a.id) - canonicalOrder(b.id))
    .slice(0, 4);
}
