import { sortEvents } from '../domain/events';
import { resolveMatchTeams } from '../domain/score';
import type {
  Finalists,
  Match,
  PlayerId,
  PlayerTeamMap,
  Team,
  TeamId,
} from '../domain/types';

export type MatchEventKind = 'goal' | 'ownGoal' | 'yellow' | 'secondYellow' | 'red';

export interface MatchEventView {
  readonly kind: MatchEventKind;
  readonly minute: string;
  readonly description: string;
  readonly tags: readonly string[];
}

/**
 * ALG-009 aplicado à apresentação: eventos ordenados por minuto e descritos
 * em pt-BR. O segundo amarelo aparece no próprio evento, não como um
 * vermelho separado.
 */
export function buildEventViews(
  match: Match,
  finalists: Finalists | null,
  playerTeams: PlayerTeamMap,
  teams: ReadonlyMap<TeamId, Team>,
): readonly MatchEventView[] {
  if (match.stage === 'final' && finalists === null) return [];

  const { homeTeamId, awayTeamId } = resolveMatchTeams(match, finalists);
  const yellowCounts = new Map<PlayerId, number>();

  return sortEvents(match.events).map((event) => {
    const playerTeam = playerTeams.get(event.playerId);
    const playerName = playerTeam?.player.nickname ?? 'Atleta';
    const teamId = playerTeam?.team.id;
    const teamName = playerTeam?.team.name ?? '';
    const minute =
      event.minute === null ? 'Minuto não informado' : `${event.minute} min`;

    if (event.type === 'goal') {
      const tags: string[] = [];
      if (event.penalty) tags.push('Pênalti');

      if (event.assistPlayerId !== null) {
        const assistant = playerTeams.get(event.assistPlayerId);
        if (assistant !== undefined) {
          tags.push(`Assistência de ${assistant.player.nickname} (${assistant.team.name})`);
        }
      }

      return {
        kind: 'goal',
        minute,
        description: `Gol de ${playerName} (${teamName})`,
        tags,
      };
    }

    if (event.type === 'ownGoal') {
      const opponentId =
        teamId === homeTeamId ? awayTeamId : teamId === awayTeamId ? homeTeamId : null;
      const opponent = opponentId === null ? null : teams.get(opponentId);

      return {
        kind: 'ownGoal',
        minute,
        description: `Gol contra de ${playerName} (${teamName}) — gol para ${opponent?.name ?? 'o adversário'}`,
        tags: [],
      };
    }

    if (event.type === 'yellow') {
      const count = (yellowCounts.get(event.playerId) ?? 0) + 1;
      yellowCounts.set(event.playerId, count);

      if (count === 2) {
        return {
          kind: 'secondYellow',
          minute,
          description: `2º amarelo → vermelho para ${playerName} (${teamName})`,
          tags: [],
        };
      }

      return {
        kind: 'yellow',
        minute,
        description: `Cartão amarelo para ${playerName} (${teamName})`,
        tags: [],
      };
    }

    return {
      kind: 'red',
      minute,
      description: `Cartão vermelho para ${playerName} (${teamName})`,
      tags: [],
    };
  });
}
