import type { Team } from '../domain/types';

export function formatTeamLabel(team: Pick<Team, 'displayName' | 'name'>): string {
  return team.displayName ?? team.name;
}
