import { cardSummary } from './discipline';
import type {
  Competition,
  GroupMatch,
  PlayerTeamMap,
  RankingResult,
  StandingRow,
  Team,
  TeamId,
} from './types';
import { buildPlayerTeamMap } from './players';
import { deriveScore } from './score';

export class DrawRequiredError extends Error {
  readonly teamIds: readonly TeamId[];

  constructor(teamIds: readonly TeamId[]) {
    super(
      `O sorteio é necessário para desempatar ${teamIds.join(', ')}, mas drawOrder não foi informado.`,
    );
    this.name = 'DrawRequiredError';
    this.teamIds = teamIds;
  }
}

function compareTeamIds(a: StandingRow, b: StandingRow): number {
  if (a.teamId < b.teamId) return -1;
  if (a.teamId > b.teamId) return 1;
  return 0;
}

export function buildStandingRow(
  team: Team,
  groupMatches: readonly GroupMatch[],
  playerTeams: PlayerTeamMap,
): StandingRow {
  let points = 0;
  let played = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let yellow = 0;
  let red = 0;
  let disciplinaryPoints = 0;

  for (const match of groupMatches) {
    if (match.homeTeamId !== team.id && match.awayTeamId !== team.id) continue;
    if (match.status !== 'finished') continue;

    played += 1;
    const score = deriveScore(match, null, playerTeams);
    if (score === null) continue;

    if (score.home > score.away) {
      if (team.id === match.homeTeamId) {
        points += 3;
        wins += 1;
      } else {
        losses += 1;
      }
    } else if (score.home < score.away) {
      if (team.id === match.awayTeamId) {
        points += 3;
        wins += 1;
      } else {
        losses += 1;
      }
    } else {
      points += 1;
      draws += 1;
    }

    if (team.id === match.homeTeamId) {
      goalsFor += score.home;
      goalsAgainst += score.away;
    } else {
      goalsFor += score.away;
      goalsAgainst += score.home;
    }

    for (const player of team.players) {
      const summary = cardSummary(match.events, player.id);
      yellow += summary.yellow;
      red += summary.red;
      disciplinaryPoints += summary.points;
    }
  }

  return {
    position: 0,
    teamId: team.id,
    points,
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    yellow,
    red,
    disciplinaryPoints,
    decidedByDraw: false,
  };
}

type CriterionDirection = 'desc' | 'asc';

interface Criterion {
  readonly value: (row: StandingRow) => number;
  readonly direction: CriterionDirection;
}

const GENERAL_CRITERIA: readonly Criterion[] = [
  { value: (row) => row.wins, direction: 'desc' },
  { value: (row) => row.goalDifference, direction: 'desc' },
  { value: (row) => row.goalsFor, direction: 'desc' },
  { value: (row) => row.goalsAgainst, direction: 'asc' },
  { value: (row) => row.disciplinaryPoints, direction: 'asc' },
];

function splitByCriterion(
  group: readonly StandingRow[],
  criterion: Criterion,
): readonly (readonly StandingRow[])[] {
  const buckets = new Map<number, StandingRow[]>();

  for (const row of group) {
    const value = criterion.value(row);
    const bucket = buckets.get(value);
    if (bucket === undefined) buckets.set(value, [row]);
    else bucket.push(row);
  }

  const values = [...buckets.keys()].sort((a, b) =>
    criterion.direction === 'desc' ? b - a : a - b,
  );

  return values.map((value) => buckets.get(value) ?? []);
}

function resolveHeadToHead(
  a: StandingRow,
  b: StandingRow,
  groupMatches: readonly GroupMatch[],
  playerTeams: PlayerTeamMap,
): readonly [StandingRow, StandingRow] | null {
  const headToHead = groupMatches.filter(
    (match) =>
      (match.homeTeamId === a.teamId && match.awayTeamId === b.teamId) ||
      (match.homeTeamId === b.teamId && match.awayTeamId === a.teamId),
  );

  if (headToHead.length !== 2 || headToHead.some((match) => match.status !== 'finished')) {
    return null;
  }

  let pointsA = 0;
  let pointsB = 0;
  let goalsA = 0;
  let goalsB = 0;

  for (const match of headToHead) {
    const score = deriveScore(match, null, playerTeams);
    if (score === null) return null;

    const aGoals = a.teamId === match.homeTeamId ? score.home : score.away;
    const bGoals = a.teamId === match.homeTeamId ? score.away : score.home;

    if (aGoals > bGoals) pointsA += 3;
    else if (aGoals < bGoals) pointsB += 3;
    else {
      pointsA += 1;
      pointsB += 1;
    }

    goalsA += aGoals;
    goalsB += bGoals;
  }

  if (pointsA !== pointsB) {
    return pointsA > pointsB ? [a, b] : [b, a];
  }

  if (goalsA !== goalsB) {
    return goalsA > goalsB ? [a, b] : [b, a];
  }

  return null;
}

function resolveGroup(
  group: readonly StandingRow[],
  groupMatches: readonly GroupMatch[],
  drawOrder: readonly TeamId[] | null,
  drawTeams: Set<TeamId>,
  provisional: boolean,
  playerTeams: PlayerTeamMap,
): readonly StandingRow[] {
  if (group.length === 1) return group;

  if (group.length === 2) {
    const [a, b] = group;
    if (a !== undefined && b !== undefined) {
      const headToHead = resolveHeadToHead(a, b, groupMatches, playerTeams);
      if (headToHead !== null) return headToHead;
    }
  }

  for (const criterion of GENERAL_CRITERIA) {
    const subgroups = splitByCriterion(group, criterion);
    if (subgroups.length > 1) {
      return subgroups.flatMap((subgroup) =>
        resolveGroup(subgroup, groupMatches, drawOrder, drawTeams, provisional, playerTeams),
      );
    }
  }

  if (drawOrder === null) {
    if (provisional) return [...group].sort(compareTeamIds);
    throw new DrawRequiredError(group.map((row) => row.teamId));
  }

  const ordered = [...group].sort(
    (a, b) => drawOrder.indexOf(a.teamId) - drawOrder.indexOf(b.teamId),
  );
  for (const row of ordered) drawTeams.add(row.teamId);
  return ordered;
}

export function rankTeams(competition: Competition): RankingResult {
  const groupMatches = competition.matches.filter(
    (match): match is GroupMatch => match.stage === 'group',
  );
  const playerTeams = buildPlayerTeamMap(competition);

  const rows = competition.teams.map((team) =>
    buildStandingRow(team, groupMatches, playerTeams),
  );
  const provisional = groupMatches.some((match) => match.status !== 'finished');

  const byPoints = new Map<number, StandingRow[]>();
  for (const row of rows) {
    const bucket = byPoints.get(row.points);
    if (bucket === undefined) byPoints.set(row.points, [row]);
    else bucket.push(row);
  }

  const drawTeams = new Set<TeamId>();
  const ordered: StandingRow[] = [];

  for (const points of [...byPoints.keys()].sort((a, b) => b - a)) {
    const group = byPoints.get(points) ?? [];
    ordered.push(
      ...resolveGroup(
        group,
        groupMatches,
        competition.drawOrder,
        drawTeams,
        provisional,
        playerTeams,
      ),
    );
  }

  return {
    rows: ordered.map((row, index) => ({
      ...row,
      position: index + 1,
      decidedByDraw: drawTeams.has(row.teamId),
    })),
    drawTeams,
    provisional,
  };
}

export function buildStandings(competition: Competition): readonly StandingRow[] {
  return rankTeams(competition).rows;
}
