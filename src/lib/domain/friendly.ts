import type { Competition, FriendlyCard } from './types';

/**
 * O amistoso é apenas um metadado informativo. Não é partida e não entra em
 * placar, classificação, estatísticas, suspensões ou pódio.
 */
export function buildFriendlyCard(competition: Competition): FriendlyCard | null {
  if (competition.friendly === null) return null;

  return {
    title: 'Amistoso do 3º colocado',
    date: competition.friendly.date,
    startsAt: competition.friendly.startsAt,
    venue: competition.friendly.venue,
    note: competition.friendly.note,
    informational: true,
  };
}
