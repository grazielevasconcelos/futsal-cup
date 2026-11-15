import type { GroupMatchId, Match, MatchId, TeamId } from './types';

export const CANONICAL_MATCH_ORDER: readonly MatchId[] = [
  'g1',
  'g2',
  'g3',
  'g4',
  'g5',
  'g6',
  'final',
];

export const CANONICAL_GROUP_ORDER: readonly GroupMatchId[] = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];

export const ORIGINAL_MATCH_DATES: Readonly<Record<MatchId, string>> = {
  g1: '2026-11-24',
  g2: '2026-11-24',
  g3: '2026-11-26',
  g4: '2026-11-26',
  g5: '2026-12-01',
  g6: '2026-12-01',
  final: '2026-12-03',
};

export const EXPECTED_GROUP_MATCHUPS: Readonly<
  Record<GroupMatchId, { homeTeamId: TeamId; awayTeamId: TeamId; round: 1 | 2 | 3 }>
> = {
  g1: { homeTeamId: 'ta', awayTeamId: 'tb', round: 1 },
  g2: { homeTeamId: 'tb', awayTeamId: 'tc', round: 1 },
  g3: { homeTeamId: 'ta', awayTeamId: 'tc', round: 2 },
  g4: { homeTeamId: 'tb', awayTeamId: 'ta', round: 2 },
  g5: { homeTeamId: 'tc', awayTeamId: 'ta', round: 3 },
  g6: { homeTeamId: 'tc', awayTeamId: 'tb', round: 3 },
};

export function canonicalOrder(matchId: MatchId): number {
  return CANONICAL_MATCH_ORDER.indexOf(matchId);
}

export function byCanonicalOrder(a: Match, b: Match): number {
  return canonicalOrder(a.id) - canonicalOrder(b.id);
}
