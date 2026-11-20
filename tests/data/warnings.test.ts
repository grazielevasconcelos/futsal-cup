import { describe, expect, it } from 'vitest';

import { validateCompetition } from '../../src/lib/data/load';
import {
  match,
  player,
  team,
  validData,
  warningCodes,
} from '../factories/competition';

describe('avisos não bloqueantes', () => {
  it('VAL-W01: avisa time com menos de 7 jogadoras ativas sem bloquear', () => {
    const data = validData();
    player(data, 'p-021').leftAt = '2026-12-05T00:00:00-03:00';
    player(data, 'p-022').leftAt = '2026-12-05T00:00:00-03:00';

    const result = validateCompetition(data);
    expect(result.errors).toEqual([]);
    expect(warningCodes(result)).toContain('VAL-W01');
    expect(result.competition).not.toBeNull();
  });

  it('VAL-W02: avisa partida fora do calendário original sem bloquear', () => {
    const data = validData();
    const g1 = match(data, 'g1');
    g1.date = '2026-11-23';
    g1.startsAt = '2026-11-23T19:00:00-03:00';

    const result = validateCompetition(data);
    expect(result.errors).toEqual([]);
    expect(warningCodes(result)).toContain('VAL-W02');
  });

  it('VAL-W03: avisa nomes de time duplicados sem bloquear', () => {
    const data = validData();
    team(data, 'tb').displayName = 'Time A';

    const result = validateCompetition(data);
    expect(result.errors).toEqual([]);
    expect(warningCodes(result)).toContain('VAL-W03');
  });

  it('VAL-W04: avisa semifinal e final agendadas no passado sem bloquear', () => {
    const data = validData();
    const semi = match(data, 'semi');
    semi.status = 'scheduled';
    semi.events = [];
    semi.walkover = null;

    const final = match(data, 'final');
    final.status = 'scheduled';
    final.events = [];
    final.walkover = null;

    data.finalists = null;

    const result = validateCompetition(data, {
      now: new Date('2026-12-10T12:00:00-03:00'),
    });
    expect(result.errors).toEqual([]);
    expect(warningCodes(result)).toContain('VAL-W04');
    expect(warningCodes(result).filter((code) => code === 'VAL-W04')).toHaveLength(2);
  });
});
