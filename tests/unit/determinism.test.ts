import { describe, expect, it } from 'vitest';

import { loadCompetition } from '../../src/lib/data/load';
import {
  buildExpectedFinalists,
  buildExpectedSemifinalists,
  buildPodium,
} from '../../src/lib/domain/playoffs';
import { getNextMatch, getLastResults } from '../../src/lib/domain/home';
import { buildPlayerStats, buildTeamStats } from '../../src/lib/domain/stats';
import { buildStandings } from '../../src/lib/domain/standings';
import type { Competition } from '../../src/lib/domain/types';

const NOW = new Date('2026-11-20T12:00:00-03:00');

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    Object.freeze(value);
    for (const key of Object.getOwnPropertyNames(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

function snapshot(competition: Competition): Record<string, unknown> {
  return {
    standings: buildStandings(competition),
    players: buildPlayerStats(competition),
    teams: buildTeamStats(competition),
    semifinalists: buildExpectedSemifinalists(competition),
    finalists: buildExpectedFinalists(competition),
    podium: buildPodium(competition),
  };
}

function scheduleSnapshot(competition: Competition): Record<string, unknown> {
  return {
    nextMatch: getNextMatch(competition, NOW),
    lastResults: getLastResults(competition).map((match) => match.id),
  };
}

function withReversedEvents(competition: Competition): Competition {
  return {
    ...competition,
    matches: competition.matches.map((match) => ({
      ...match,
      events: [...match.events].reverse(),
    })),
  };
}

describe('determinismo e pureza do domínio', () => {
  it('TST-091: duas execuções produzem classificação, estatísticas e pódio idênticos', () => {
    const first = loadCompetition('tests/fixtures/valida.yaml');
    const second = loadCompetition('tests/fixtures/valida.yaml');

    expect(snapshot(second)).toEqual(snapshot(first));
    expect(scheduleSnapshot(second)).toEqual(scheduleSnapshot(first));
  });

  it('TST-092: a ordem dos eventos não altera classificação nem estatísticas', () => {
    const competition = loadCompetition('tests/fixtures/valida.yaml');
    const shuffled = withReversedEvents(competition);

    expect(snapshot(shuffled)).toEqual(snapshot(competition));
  });

  it('TST-093: os construtores não mutam a competição congelada', () => {
    const frozen = deepFreeze(loadCompetition('tests/fixtures/valida.yaml'));

    expect(() => snapshot(frozen)).not.toThrow();
    expect(() => scheduleSnapshot(frozen)).not.toThrow();
  });
});
