import type {
  Competition,
  Player,
  PlayerId,
  PlayerTeam,
  PlayerTeamMap,
  Team,
  TeamId,
} from './types';

export function buildTeamMap(competition: Competition): ReadonlyMap<TeamId, Team> {
  return new Map(competition.teams.map((team) => [team.id, team]));
}

export function buildPlayerTeamMap(competition: Competition): PlayerTeamMap {
  const players = new Map<PlayerId, PlayerTeam>();
  for (const team of competition.teams) {
    for (const player of team.players) {
      players.set(player.id, { player, team });
    }
  }
  return players;
}

export function activePlayers(team: Team): readonly Player[] {
  return team.players.filter((player) => player.leftAt === null);
}

export function isEligibleAt(player: Player, instant: number): boolean {
  const joinedAt = Date.parse(player.joinedAt);
  if (!Number.isFinite(joinedAt) || joinedAt >= instant) return false;
  if (player.leftAt === null) return true;
  const leftAt = Date.parse(player.leftAt);
  return Number.isFinite(leftAt) && instant < leftAt;
}

export function rosterForMatch(
  match: { readonly homeTeamId: TeamId; readonly awayTeamId: TeamId },
  teams: ReadonlyMap<TeamId, Team>,
): readonly Player[] {
  const home = teams.get(match.homeTeamId);
  const away = teams.get(match.awayTeamId);
  return [...(home?.players ?? []), ...(away?.players ?? [])];
}

export function playerBelongsToMatch(
  playerTeam: TeamId,
  match: { readonly homeTeamId: TeamId; readonly awayTeamId: TeamId },
): boolean {
  return playerTeam === match.homeTeamId || playerTeam === match.awayTeamId;
}
