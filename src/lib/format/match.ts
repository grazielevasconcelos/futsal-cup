import { isMatchPast } from '../domain/home';
import { deriveScore, resolveMatchTeams, winnerOf } from '../domain/score';
import type { Match, PlayoffSnapshots, PlayerTeamMap, WalkoverReason } from '../domain/types';

export function walkoverReasonLabel(reason: WalkoverReason): string {
  if (reason === 'no_show') return 'Não compareceu';
  if (reason === 'insufficient_players') return 'Menos de 3 jogadoras em quadra';
  return 'Desistência';
}

function snapshotFor(
  match: Match,
  snapshots: PlayoffSnapshots | null,
): readonly [string, string] | null {
  if (match.stage === 'group') return null;
  const pair =
    match.stage === 'semi' ? snapshots?.semifinalists : snapshots?.finalists;
  return pair ?? null;
}

/**
 * O mapa de jogadoras é necessário para derivar o placar a partir dos gols.
 * A assinatura da SPEC §7.11 não o inclui porque recebe a partida isolada;
 * assim como em `deriveScore`, ele é passado explicitamente.
 */
export function formatScore(
  match: Match,
  snapshots: PlayoffSnapshots | null,
  playerTeams: PlayerTeamMap,
): string {
  if (match.stage !== 'group' && snapshotFor(match, snapshots) === null) {
    return 'Confrontos a definir';
  }
  if (match.status === 'postponed') return 'Adiada';
  if (match.status === 'scheduled') return 'A definir';

  const score = deriveScore(match, snapshots, playerTeams);
  if (score === null) return 'A definir';

  if (match.walkover !== null) return `${score.home} x ${score.away} (W.O.)`;
  return `${score.home} x ${score.away}`;
}

export function formatScoreAccessible(
  match: Match,
  snapshots: PlayoffSnapshots | null,
  homeName: string,
  awayName: string,
  playerTeams: PlayerTeamMap,
): string {
  if (match.stage !== 'group' && snapshotFor(match, snapshots) === null) {
    return 'Confrontos a definir; a fase final depende da etapa anterior.';
  }
  if (match.status === 'postponed') return 'Partida adiada.';
  if (match.status === 'scheduled') return 'Partida agendada; placar a definir.';

  const score = deriveScore(match, snapshots, playerTeams);
  if (score === null) return 'Partida agendada; placar a definir.';

  const teams = resolveMatchTeams(match, snapshots);
  const winner = winnerOf(match, snapshots, playerTeams);
  const winnerName =
    winner === null ? '' : winner === teams.homeTeamId ? homeName : awayName;

  if (match.walkover !== null) {
    return `${homeName} ${score.home} a ${score.away} ${awayName} por W.O. — ${walkoverReasonLabel(match.walkover.reason)}.`;
  }

  if (match.stage !== 'group' && score.home === score.away) {
    if (match.stage === 'semi') {
      return `${homeName} ${score.home} a ${score.away} ${awayName} no tempo normal; ${winnerName} avança pela vantagem do empate.`;
    }
    return `${homeName} ${score.home} a ${score.away} ${awayName} no tempo normal; ${winnerName} conquista o título pela vantagem do empate.`;
  }

  return `${homeName} ${score.home} a ${score.away} ${awayName}.`;
}

export function formatStatus(match: Match, now: Date): string {
  if (match.status === 'finished') return 'Encerrada';
  if (match.status === 'postponed') return 'Adiada';
  if (isMatchPast(match, now)) return 'Resultado pendente';
  return 'Agendada';
}

export function formatStage(match: Match): string {
  if (match.stage === 'semi') return 'Semifinal';
  if (match.stage === 'final') return 'Final';
  return `Rodada ${match.round}`;
}
