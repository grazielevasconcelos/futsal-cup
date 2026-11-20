import { compareText } from '../data/text';
import { cardSummary } from './discipline';
import { buildPlayerTeamMap, buildTeamMap } from './players';
import { deriveScore, resolveMatchTeams } from './score';
import type {
  Competition,
  Match,
  PlayoffSnapshots,
  PlayerId,
  PlayerStats,
  Team,
  TeamId,
  TeamStats,
} from './types';

const TEAM_ORDER: readonly TeamId[] = ['ta', 'tb', 'tc'];

interface MutablePlayerStats {
  playerId: PlayerId;
  nickname: string;
  teamId: TeamId;
  goals: number;
  assists: number;
  ownGoals: number;
  yellow: number;
  red: number;
  disciplinaryPoints: number;
  active: boolean;
}

interface MutableTeamStats {
  teamId: TeamId;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  yellow: number;
  red: number;
  disciplinaryPoints: number;
}

function snapshotsOf(competition: Competition): PlayoffSnapshots {
  return {
    semifinalists: competition.semifinalists,
    finalists: competition.finalists,
  };
}

function finishedMatches(competition: Competition): readonly Match[] {
  return competition.matches.filter((match) => match.status === 'finished');
}

function participants(
  match: Match,
  competition: Competition,
  teams: ReadonlyMap<TeamId, Team>,
): readonly Team[] {
  const { homeTeamId, awayTeamId } = resolveMatchTeams(match, snapshotsOf(competition));
  return [teams.get(homeTeamId), teams.get(awayTeamId)].filter(
    (team): team is Team => team !== undefined,
  );
}

/**
 * Soma gols, assistências, gols contra e cartões de todas as partidas
 * oficiais encerradas (grupo + semifinal + final).
 */
export function buildPlayerStats(competition: Competition): readonly PlayerStats[] {
  const stats = new Map<PlayerId, MutablePlayerStats>();

  for (const team of competition.teams) {
    for (const player of team.players) {
      stats.set(player.id, {
        playerId: player.id,
        nickname: player.nickname,
        teamId: team.id,
        goals: 0,
        assists: 0,
        ownGoals: 0,
        yellow: 0,
        red: 0,
        disciplinaryPoints: 0,
        active: player.leftAt === null,
      });
    }
  }

  const teams = buildTeamMap(competition);

  for (const match of finishedMatches(competition)) {
    for (const event of match.events) {
      const entry = stats.get(event.playerId);
      if (entry === undefined) continue;

      if (event.type === 'goal') {
        entry.goals += 1;
        if (event.assistPlayerId !== null) {
          const assistant = stats.get(event.assistPlayerId);
          if (assistant !== undefined) assistant.assists += 1;
        }
      } else if (event.type === 'ownGoal') {
        entry.ownGoals += 1;
      } else if (event.type === 'yellow') {
        entry.yellow += 1;
      } else {
        entry.red += 1;
      }
    }

    for (const team of participants(match, competition, teams)) {
      for (const player of team.players) {
        const entry = stats.get(player.id);
        if (entry === undefined) continue;
        const summary = cardSummary(match.events, player.id);
        entry.red += summary.redDerived;
        entry.disciplinaryPoints += summary.points;
      }
    }
  }

  return [...stats.values()];
}

/**
 * Agrega as 8 partidas oficiais do time (grupo + semifinal + final). Empates
 * no mata-mata contam como empate em V/E/D; GP/GC/SG consideram o tempo
 * normal e não existe campanha de pênaltis.
 */
export function buildTeamStats(competition: Competition): readonly TeamStats[] {
  const stats = new Map<TeamId, MutableTeamStats>();

  for (const team of competition.teams) {
    stats.set(team.id, {
      teamId: team.id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      yellow: 0,
      red: 0,
      disciplinaryPoints: 0,
    });
  }

  const teams = buildTeamMap(competition);
  const playerTeams = buildPlayerTeamMap(competition);
  const snapshots = snapshotsOf(competition);

  for (const match of finishedMatches(competition)) {
    const { homeTeamId, awayTeamId } = resolveMatchTeams(match, snapshots);
    const score = deriveScore(match, snapshots, playerTeams);
    if (score === null) continue;

    const results = [
      { teamId: homeTeamId, goalsFor: score.home, goalsAgainst: score.away },
      { teamId: awayTeamId, goalsFor: score.away, goalsAgainst: score.home },
    ] as const;

    for (const result of results) {
      const entry = stats.get(result.teamId);
      if (entry === undefined) continue;

      entry.played += 1;
      entry.goalsFor += result.goalsFor;
      entry.goalsAgainst += result.goalsAgainst;

      if (result.goalsFor > result.goalsAgainst) {
        entry.wins += 1;
      } else if (result.goalsFor < result.goalsAgainst) {
        entry.losses += 1;
      } else {
        entry.draws += 1;
      }
    }

    for (const team of participants(match, competition, teams)) {
      const entry = stats.get(team.id);
      if (entry === undefined) continue;

      for (const player of team.players) {
        const summary = cardSummary(match.events, player.id);
        entry.yellow += summary.yellow;
        entry.red += summary.red;
        entry.disciplinaryPoints += summary.points;
      }
    }
  }

  return TEAM_ORDER.flatMap((teamId) => {
    const entry = stats.get(teamId);
    if (entry === undefined) return [];
    return [{ ...entry, goalDifference: entry.goalsFor - entry.goalsAgainst }];
  });
}

function teamName(stats: PlayerStats, teams: ReadonlyMap<TeamId, Team>): string {
  const team = teams.get(stats.teamId);
  return team === undefined ? '' : (team.displayName ?? team.name);
}

export function rankTopScorers(
  stats: readonly PlayerStats[],
  teams: ReadonlyMap<TeamId, Team>,
): readonly PlayerStats[] {
  return stats
    .filter((item) => item.goals >= 1)
    .slice()
    .sort(
      (a, b) =>
        b.goals - a.goals ||
        b.assists - a.assists ||
        compareText(a.nickname, b.nickname) ||
        compareText(teamName(a, teams), teamName(b, teams)) ||
        compareText(a.playerId, b.playerId),
    );
}

export function rankAssists(
  stats: readonly PlayerStats[],
  teams: ReadonlyMap<TeamId, Team>,
): readonly PlayerStats[] {
  return stats
    .filter((item) => item.assists >= 1)
    .slice()
    .sort(
      (a, b) =>
        b.assists - a.assists ||
        b.goals - a.goals ||
        compareText(a.nickname, b.nickname) ||
        compareText(teamName(a, teams), teamName(b, teams)) ||
        compareText(a.playerId, b.playerId),
    );
}

export function rankPlayerCards(
  stats: readonly PlayerStats[],
  teams: ReadonlyMap<TeamId, Team>,
): readonly PlayerStats[] {
  return stats
    .filter((item) => item.yellow > 0 || item.red > 0)
    .slice()
    .sort(
      (a, b) =>
        b.disciplinaryPoints - a.disciplinaryPoints ||
        b.red - a.red ||
        b.yellow - a.yellow ||
        compareText(a.nickname, b.nickname) ||
        compareText(teamName(a, teams), teamName(b, teams)) ||
        compareText(a.playerId, b.playerId),
    );
}

export function rankTeamCards(
  stats: readonly TeamStats[],
  teams: ReadonlyMap<TeamId, Team>,
): readonly TeamStats[] {
  return stats.slice().sort(
    (a, b) =>
      b.disciplinaryPoints - a.disciplinaryPoints ||
      b.red - a.red ||
      b.yellow - a.yellow ||
      compareText(
        teams.get(a.teamId)?.displayName ?? teams.get(a.teamId)?.name ?? '',
        teams.get(b.teamId)?.displayName ?? teams.get(b.teamId)?.name ?? '',
      ) ||
      compareText(a.teamId, b.teamId),
  );
}

export function rankOwnGoals(
  stats: readonly PlayerStats[],
  teams: ReadonlyMap<TeamId, Team>,
): readonly PlayerStats[] {
  return stats
    .filter((item) => item.ownGoals >= 1)
    .slice()
    .sort(
      (a, b) =>
        b.ownGoals - a.ownGoals ||
        compareText(a.nickname, b.nickname) ||
        compareText(teamName(a, teams), teamName(b, teams)) ||
        compareText(a.playerId, b.playerId),
    );
}
