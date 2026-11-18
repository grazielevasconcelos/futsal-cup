import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadCompetitionResult } from '../../src/lib/data/load';

describe('fonte pública 2026', () => {
  it('é válida e tem exatamente 3 times e 7 partidas', () => {
    const result = loadCompetitionResult('data/2026/copa.yaml');

    expect(result.errors).toEqual([]);
    expect(result.competition?.teams).toHaveLength(3);
    expect(result.competition?.matches).toHaveLength(7);
  });

  it('não publica o fixture de temporada concluída', () => {
    const production = readFileSync('data/2026/copa.yaml', 'utf8');
    const fixture = readFileSync('tests/fixtures/valida.yaml', 'utf8');

    expect(production).not.toBe(fixture);
  });
});
