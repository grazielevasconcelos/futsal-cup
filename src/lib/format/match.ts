import { isMatchPast } from '../domain/home';
import { deriveScore, resolveMatchTeams, winnerOf } from '../domain/score';
import type { Finalists, Match, PlayerTeamMap, WalkoverReason } from '../domain/types';

export function walkoverReasonLabel(reason: WalkoverReason): string {
  if (reason === 'no_show') return 'Não compareceu';
  if (reason === 'insufficient_players') return 'Menos de 3 jogadoras em quadra';
  return 'Desistência';
}

/**
 * O mapa de jogadoras é necessário para derivar o placar a partir dos gols.
 * A assinatura da SPEC §9.1 não o inclui porque recebe a partida isolada;
 * assim como em `deriveScore`, ele é passado explicitamente.
 */
export function formatScore(
  match: Match,
  finalists: Finalists | null,
  playerTeams: PlayerTeamMap,
): string {
  if (match.stage !== 'group' && finalists === null) return 'Confrontos a definir';
  if (match.status === 'postponed') return 'Adiada';
  if (match.status === 'scheduled') return 'A definir';

  const score = deriveScore(match, finalists, playerTeams);
  if (score === null) return 'A definir';

  if (match.walkover !== null) return `${score.home} x ${score.away} (W.O.)`;
  if (match.shootout !== null) {
    return `${score.home} (${match.shootout.home}) x (${match.shootout.away}) ${score.away}`;
  }
  return `${score.home} x ${score.away}`;
}

export function formatScoreAccessible(
  match: Match,
  finalists: Finalists | null,
  homeName: string,
  awayName: string,
  playerTeams: PlayerTeamMap,
): string {
  if (match.stage !== 'group' && finalists === null) {
    return 'Confrontos a definir; a fase final depende das 6 partidas da classificatória.';
  }
  if (match.status === 'postponed') return 'Partida adiada.';
  if (match.status === 'scheduled') return 'Partida agendada; placar a definir.';

  const score = deriveScore(match, finalists, playerTeams);
  if (score === null) return 'Partida agendada; placar a definir.';

  const teams = resolveMatchTeams(match, finalists);
  const winner = winnerOf(match, finalists, playerTeams);
  const winnerName =
    winner === null ? '' : winner === teams.homeTeamId ? homeName : awayName;

  if (match.walkover !== null) {
    return `${homeName} ${score.home} a ${score.away} ${awayName} por W.O. — ${walkoverReasonLabel(match.walkover.reason)}.`;
  }

  if (match.shootout !== null) {
    return `${homeName} ${score.home} a ${score.away} ${awayName} no tempo normal; ${match.shootout.home} a ${match.shootout.away} nos pênaltis; vitória de ${winnerName}.`;
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
  if (match.stage === 'final') return 'Final';
  return `Rodada ${match.round}`;
}
