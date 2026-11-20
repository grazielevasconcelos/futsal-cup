import { describe, expect, it } from 'vitest';

import { validateCompetition } from '../../src/lib/data/load';
import { activePlayers } from '../../src/lib/domain/players';
import { codes, player, team, validData } from '../factories/competition';

function addPlayer(
  data: Record<string, any>,
  teamId: string,
  entry: Record<string, any>,
): void {
  team(data, teamId).players.push(entry);
}

describe('validação semântica de times e elencos', () => {
  it('VAL-002: mantém os nomes-base associados aos IDs estáveis', () => {
    const data = validData();
    team(data, 'ta').name = 'De primeira FC';
    expect(codes(validateCompetition(data))).toContain('VAL-002');
  });

  it('VAL-004: bloqueia IDs de time duplicados', () => {
    const data = validData();
    const tc = team(data, 'tc');
    tc.id = 'ta';
    tc.name = 'Time A';
    expect(codes(validateCompetition(data))).toContain('VAL-004');
  });

  it('VAL-005: bloqueia abreviação repetida sem diferenciar maiúsculas', () => {
    const data = validData();
    team(data, 'tb').abbreviation = 'TA';
    expect(codes(validateCompetition(data))).toContain('VAL-005');
  });

  it('VAL-002: rejeita logo em URL externa', () => {
    const data = validData();
    team(data, 'ta').logo = 'https://example.com/logo.webp';
    expect(codes(validateCompetition(data))).toContain('VAL-002');
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

  it('VAL-009: bloqueia a 10ª jogadora ativa simultânea', () => {
    const data = validData();
    const ta = team(data, 'ta');
    ta.players.push({
      id: 'p-099',
      nickname: 'Extra',
      position: 'linha',
      joinedAt: '2026-11-10T00:00:00-03:00',
      leftAt: null,
    });
    ta.players.push({
      id: 'p-100',
      nickname: 'Extra 2',
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

  it('TST-039: aceita elenco com 7, 8 e 9 jogadoras ativas', () => {
    const seven = validData();
    const sevenResult = validateCompetition(seven);
    expect(sevenResult.errors).toEqual([]);
    expect(activePlayers(team(seven, 'tb') as any)).toHaveLength(7);

    const eight = validData();
    player(eight, 'p-007').leftAt = null;
    const eightResult = validateCompetition(eight);
    expect(eightResult.errors).toEqual([]);
    expect(activePlayers(team(eight, 'ta') as any)).toHaveLength(8);

    const nine = validData();
    player(nine, 'p-007').leftAt = null;
    addPlayer(nine, 'ta', {
      id: 'p-099',
      nickname: 'Nove',
      position: 'linha',
      joinedAt: '2026-11-10T00:00:00-03:00',
      leftAt: null,
    });
    expect(validateCompetition(nine).errors).toEqual([]);
    expect(activePlayers(team(nine, 'ta') as any)).toHaveLength(9);
  });

  it('TST-043: aceita apelidos diferentes que só variam pelo acento', () => {
    const data = validData();
    player(data, 'p-001').nickname = 'Ana';
    player(data, 'p-002').nickname = 'Aná';

    expect(codes(validateCompetition(data))).not.toContain('VAL-007');
  });

  it('TST-045: leftAt preserva o histórico e libera a vaga', () => {
    const data = validData();
    const saiu = player(data, 'p-007');
    expect(saiu.leftAt).toBe('2026-11-25T00:00:00-03:00');

    addPlayer(data, 'ta', {
      id: 'p-023',
      nickname: 'Zoe',
      position: 'linha',
      joinedAt: '2026-11-26T00:00:00-03:00',
      leftAt: null,
    });

    expect(codes(validateCompetition(data))).toEqual([]);
    expect(activePlayers(team(data, 'ta') as any).map((item) => item.id)).not.toContain(
      'p-007',
    );
    expect(activePlayers(team(data, 'ta') as any)).toHaveLength(8);
  });

  it('TST-046: bloqueia jogadora que entra no mesmo instante da partida', () => {
    const data = validData();
    player(data, 'p-002').joinedAt = '2026-11-24T19:00:00-03:00';
    expect(codes(validateCompetition(data))).toContain('VAL-020');
  });

  it('TST-048: bloqueia sobreposição de 10 ativas antes da saída', () => {
    const data = validData();
    addPlayer(data, 'ta', {
      id: 'p-023',
      nickname: 'Zoe',
      position: 'linha',
      joinedAt: '2026-11-20T00:00:00-03:00',
      leftAt: null,
    });
    addPlayer(data, 'ta', {
      id: 'p-024',
      nickname: 'Zara',
      position: 'linha',
      joinedAt: '2026-11-20T00:00:00-03:00',
      leftAt: null,
    });

    expect(codes(validateCompetition(data))).toContain('VAL-009');

    player(data, 'p-023').joinedAt = '2026-11-26T00:00:00-03:00';
    expect(codes(validateCompetition(data))).toEqual([]);
  });
});
