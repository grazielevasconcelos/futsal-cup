import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { SITE_NAME } from '../../src/lib/site';
import { loadCompetition } from '../../src/lib/data/load';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe('fonte única de dados', () => {
  it('TST-089: nomes de times e apelidos não estão hardcoded em src/', () => {
    const competition = loadCompetition('tests/fixtures/valida.yaml');
    const names = competition.teams.flatMap((team) => [
      team.name,
      ...team.players.map((player) => player.nickname),
    ]);

    const occurrences: string[] = [];
    for (const file of sourceFiles('src')) {
      const content = readFileSync(file, 'utf8').split(SITE_NAME).join('');
      for (const name of names) {
        if (content.includes(name)) {
          occurrences.push(`${name} em ${file}`);
        }
      }
    }

    expect(occurrences).toEqual([]);
  });
});
