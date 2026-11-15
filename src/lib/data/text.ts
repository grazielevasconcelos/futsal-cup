/**
 * Normalização de texto definida na SPEC §5.5.
 * A comparação não depende de ICU para manter o build determinístico.
 */
export function normalizeText(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ');
}

export function uniqueKey(value: string): string {
  return normalizeText(value).toLowerCase();
}

export function sortKey(value: string): string {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function compareCodeUnits(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function compareText(a: string, b: string): number {
  return (
    compareCodeUnits(sortKey(a), sortKey(b)) ||
    compareCodeUnits(normalizeText(a), normalizeText(b)) ||
    compareCodeUnits(a, b)
  );
}
