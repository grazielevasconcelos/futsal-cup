import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadCompetitionResult } from '../../src/lib/data/load';

describe('fonte pública 2026', () => {
  it('é válida e tem exatamente 3 times e 8 partidas', () => {
    const result = loadCompetitionResult('data/2026/copa.yaml');

    expect(result.errors).toEqual([]);
    expect(result.competition?.teams).toHaveLength(3);
    expect(result.competition?.matches).toHaveLength(8);

    const teamB = result.competition?.teams.find((team) => team.id === 'tb');
    expect(teamB?.players.filter((player) => player.leftAt === null)).toHaveLength(9);
    expect(teamB?.players.find((player) => player.id === 'p-025')?.nickname).toBe('Elisa');

    const ids = result.competition?.matches.map((item) => item.id);
    expect(ids).toContain('semi');
    expect(ids).toContain('final');

    // O grupo ainda não terminou: os snapshots do mata-mata seguem nulos na fonte pública.
    expect(result.competition?.semifinalists).toBeNull();
    expect(result.competition?.finalists).toBeNull();
  });

  it('não publica o fixture de temporada concluída', () => {
    const production = readFileSync('data/2026/copa.yaml', 'utf8');
    const fixture = readFileSync('tests/fixtures/valida.yaml', 'utf8');

    expect(production).not.toBe(fixture);
  });
});
