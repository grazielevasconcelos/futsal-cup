import { describe, expect, it } from 'vitest';

import { compareText, normalizeText, sortKey, uniqueKey } from '../../src/lib/data/text';

describe('normalização de texto', () => {
  it('remove espaços nas pontas e colapsa espaços internos', () => {
    expect(normalizeText('  Ana   Maria  ')).toBe('Ana Maria');
  });

  it('compara apelidos sem diferenciar maiúsculas de minúsculas', () => {
    expect(uniqueKey('Ana')).toBe('ana');
    expect(uniqueKey('ANA')).toBe(uniqueKey('ana'));
  });

  it('mantém acentos distintos na unicidade', () => {
    expect(uniqueKey('Ana')).not.toBe(uniqueKey('Aná'));
  });

  it('ordena sem depender de ICU e usa code unit como desempate', () => {
    expect(compareText('África', 'Brasil')).toBeLessThan(0);
    expect(compareText('Ana', 'Aná')).toBeLessThan(0);
    expect(compareText('Ana', 'Ana')).toBe(0);
    expect(sortKey('Olívia')).toBe('olivia');
  });
});
