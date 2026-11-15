import { describe, expect, it } from 'vitest';

import { validateCompetition } from '../../src/lib/data/load';
import { codes, player, team, validData } from '../factories/competition';

describe('validação semântica de times e elencos', () => {
  it('VAL-004: bloqueia IDs de time duplicados', () => {
    const data = validData();
    team(data, 'tc').id = 'ta';
    expect(codes(validateCompetition(data))).toContain('VAL-004');
  });

  it('VAL-005: bloqueia abreviação repetida sem diferenciar maiúsculas', () => {
    const data = validData();
    team(data, 'tb').abbreviation = 'TA';
    expect(codes(validateCompetition(data))).toContain('VAL-005');
  });

  it('VAL-006: bloqueia ID de jogadora em dois times', () => {
    const data = validData();
    team(data, 'tb').players[0].id = 'p-002';
    expect(codes(validateCompetition(data))).toContain('VAL-006');
  });

  it('VAL-007: bloqueia apelido duplicado no mesmo time', () => {
    const data = validData();
    team(data, 'ta').players[1].nickname = 'ana';
    expect(codes(validateCompetition(data))).toContain('VAL-007');
  });

  it('VAL-007: bloqueia apelido vazio após normalização', () => {
    const data = validData();
    player(data, 'p-001').nickname = '   ';
    expect(codes(validateCompetition(data))).toContain('VAL-007');
  });

  it('VAL-008: bloqueia leftAt anterior ou igual a joinedAt', () => {
    const data = validData();
    player(data, 'p-001').leftAt = '2026-11-10T00:00:00-03:00';
    expect(codes(validateCompetition(data))).toContain('VAL-008');
  });

  it('VAL-009: bloqueia a 9ª jogadora ativa simultânea', () => {
    const data = validData();
    const ta = team(data, 'ta');
    ta.players.push({
      id: 'p-099',
      nickname: 'Extra',
      position: 'linha',
      joinedAt: '2026-11-10T00:00:00-03:00',
      leftAt: null,
    });

    const errorCodes = codes(validateCompetition(data));
    expect(errorCodes).toContain('VAL-009');
  });

  it('VAL-010: bloqueia evento de jogadora que mudou de time após atuar', () => {
    const data = validData();
    const tb = team(data, 'tb');
    const moved = tb.players.find((entry: Record<string, any>) => entry.id === 'p-009');
    tb.players = tb.players.filter((entry: Record<string, any>) => entry.id !== 'p-009');
    team(data, 'tc').players.push(moved);

    const errorCodes = codes(validateCompetition(data));
    expect(errorCodes).toContain('VAL-010');
    expect(errorCodes).toContain('VAL-019');
  });
});
