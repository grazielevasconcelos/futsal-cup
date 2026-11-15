export const COMPETITION_TIME_ZONE = 'America/Sao_Paulo';

const localDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: COMPETITION_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function localDateInSaoPaulo(instant: Date): string {
  const parts = localDateFormatter.formatToParts(instant);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get('year') ?? '0000'}-${values.get('month') ?? '00'}-${values.get('day') ?? '00'}`;
}
