import { buildSuspensions } from '../domain/discipline';
import type {
  Competition,
  Match,
  PlayerId,
  Suspension,
  Team,
  TeamId,
} from '../domain/types';
import { buildTeamMap } from '../domain/players';
import { resolveMatchTeams } from '../domain/score';
import { formatDate } from './date';

function opponentOf(match: Match, teamId: TeamId, competition: Competition): TeamId | null {
  try {
    const { homeTeamId, awayTeamId } = resolveMatchTeams(match, {
      semifinalists: competition.semifinalists,
      finalists: competition.finalists,
    });
    if (homeTeamId === teamId) return awayTeamId;
    if (awayTeamId === teamId) return homeTeamId;
    return null;
  } catch {
    return null;
  }
}

/**
 * Status textual de suspensão da jogadora para a página do time e do elenco
 * (ALG-005). A função agrega todas as suspensões da jogadora e prioriza a
 * partida ainda não encerrada.
 */
export function buildSuspensionLabels(
  competition: Competition,
): ReadonlyMap<PlayerId, string> {
  const teams = buildTeamMap(competition);
  const matchesById = new Map(competition.matches.map((match) => [match.id, match]));
  const suspensionsByPlayer = new Map<PlayerId, Suspension[]>();

  for (const suspension of buildSuspensions(competition)) {
    const entries = suspensionsByPlayer.get(suspension.playerId);
    if (entries === undefined) suspensionsByPlayer.set(suspension.playerId, [suspension]);
    else entries.push(suspension);
  }

  const labels = new Map<PlayerId, string>();

  for (const team of competition.teams) {
    for (const player of team.players) {
      const suspensions = suspensionsByPlayer.get(player.id) ?? [];

      if (suspensions.length === 0) {
        labels.set(player.id, 'Sem suspensão');
        continue;
      }

      const pending = suspensions.find((suspension) => {
        if (suspension.suspendedFor === null) return false;
        const match = matchesById.get(suspension.suspendedFor);
        return match !== undefined && match.status !== 'finished';
      });

      if (pending !== undefined && pending.suspendedFor !== null) {
        const match = matchesById.get(pending.suspendedFor);
        const opponentId =
          match === undefined ? null : opponentOf(match, team.id, competition);
        const opponent = opponentId === null ? undefined : teams.get(opponentId);

        if (match !== undefined && opponent !== undefined) {
          labels.set(
            player.id,
            `Suspensa na partida contra ${opponent.name} de ${formatDate(match.date)}`,
          );
          continue;
        }
      }

      if (suspensions.some((suspension) => suspension.pendingFinalists)) {
        labels.set(player.id, 'Suspensão pendente — fase final a definir');
        continue;
      }

      if (suspensions.some((suspension) => suspension.suspendedFor === null)) {
        labels.set(player.id, 'Suspensão sem efeito — sem próxima partida');
        continue;
      }

      labels.set(player.id, 'Sem suspensão');
    }
  }

  return labels;
}

export function positionLabel(position: Team['players'][number]['position']): string {
  if (position === 'goleira') return 'Goleira';
  if (position === 'linha') return 'Linha';
  return '—';
}
