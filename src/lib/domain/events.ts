import type { Event } from './types';

/**
 * ALG-009: minuto ascendente, eventos sem minuto ao final e empate pelo
 * índice no arquivo. A ordenação é apenas de apresentação.
 */
export function sortEvents(events: readonly Event[]): readonly Event[] {
  return events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => {
      if (a.event.minute === null && b.event.minute === null) return a.index - b.index;
      if (a.event.minute === null) return 1;
      if (b.event.minute === null) return -1;
      if (a.event.minute !== b.event.minute) return a.event.minute - b.event.minute;
      return a.index - b.index;
    })
    .map((entry) => entry.event);
}
