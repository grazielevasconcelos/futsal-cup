import { describe, expect, it } from 'vitest';

import { validateCompetition } from '../../src/lib/data/load';
import { codes, match, player, validData } from '../factories/competition';

describe('validação semântica de eventos', () => {
  it('VAL-019: bloqueia jogadora fora do elenco dos times da partida', () => {
    const data = validData();
    match(data, 'g3').events.push({ type: 'yellow', playerId: 'p-009', minute: 15 });
    expect(codes(validateCompetition(data))).toContain('VAL-019');
  });

  it('VAL-020: bloqueia jogadora inelegível no início da partida', () => {
    const data = validData();
    player(data, 'p-003').leftAt = '2026-11-26T19:00:00-03:00';
    expect(codes(validateCompetition(data))).toContain('VAL-020');
  });

  it('VAL-021: bloqueia assistência da própria marcadora', () => {
    const data = validData();
    match(data, 'g1').events[1].assistPlayerId = 'p-002';
    expect(codes(validateCompetition(data))).toContain('VAL-021');
  });

  it('VAL-021: bloqueia assistência de jogadora de outro time', () => {
    const data = validData();
    match(data, 'g1').events[1].assistPlayerId = 'p-009';
    expect(codes(validateCompetition(data))).toContain('VAL-021');
  });

  it('VAL-021: bloqueia assistência em gol de pênalti', () => {
    const data = validData();
    const penalty = match(data, 'final').events.find(
      (event: Record<string, any>) => event.type === 'goal' && event.penalty === true,
    );
    penalty.assistPlayerId = 'p-006';
    expect(codes(validateCompetition(data))).toContain('VAL-021');
  });

  it('VAL-022: bloqueia terceiro amarelo no mesmo jogo', () => {
    const data = validData();
    const g3 = match(data, 'g3');
    g3.events.push({ type: 'yellow', playerId: 'p-005', minute: 16 });
    g3.events.push({ type: 'yellow', playerId: 'p-005', minute: 24 });
    expect(codes(validateCompetition(data))).toContain('VAL-022');
  });

  it('VAL-022: bloqueia mais de um vermelho direto no mesmo jogo', () => {
    const data = validData();
    match(data, 'g6').events.push({ type: 'red', playerId: 'p-014', minute: 28 });
    expect(codes(validateCompetition(data))).toContain('VAL-022');
  });

  it('VAL-022: bloqueia vermelho explícito junto de dois amarelos', () => {
    const data = validData();
    match(data, 'g3').events.push({ type: 'red', playerId: 'p-016', minute: 25 });
    expect(codes(validateCompetition(data))).toContain('VAL-022');
  });

  it('VAL-023: bloqueia evento de jogadora suspensa na partida da suspensão', () => {
    const data = validData();
    match(data, 'g5').events.push({ type: 'yellow', playerId: 'p-016', minute: 10 });
    expect(codes(validateCompetition(data))).toContain('VAL-023');
  });

  it('VAL-028: bloqueia referência a jogadora inexistente', () => {
    const data = validData();
    match(data, 'g1').events.push({
      type: 'goal',
      playerId: 'p-999',
      assistPlayerId: null,
      minute: 30,
      penalty: false,
    });

    expect(codes(validateCompetition(data))).toContain('VAL-028');
  });
});
