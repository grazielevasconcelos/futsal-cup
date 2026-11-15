import { describe, expect, it } from 'vitest';

import { validateCompetition } from '../../src/lib/data/load';
import { codes, match, validData } from '../factories/competition';

describe('validação semântica de partidas', () => {
  it('VAL-011: bloqueia ID de partida duplicado', () => {
    const data = validData();
    match(data, 'g5').id = 'g4';
    expect(codes(validateCompetition(data))).toContain('VAL-011');
  });

  it('VAL-011: bloqueia rodada incompatível com o ID', () => {
    const data = validData();
    match(data, 'g1').round = 2;
    expect(codes(validateCompetition(data))).toContain('VAL-011');
  });

  it('VAL-012: bloqueia confronto com mando invertido', () => {
    const data = validData();
    const g4 = match(data, 'g4');
    g4.homeTeamId = 'ta';
    g4.awayTeamId = 'tb';
    expect(codes(validateCompetition(data))).toContain('VAL-012');
  });

  it('VAL-013: bloqueia data local do horário diferente da data da partida', () => {
    const data = validData();
    match(data, 'g1').startsAt = '2026-11-23T19:00:00-03:00';
    expect(codes(validateCompetition(data))).toContain('VAL-013');
  });

  it('VAL-014: bloqueia partida finished sem startsAt', () => {
    const data = validData();
    match(data, 'g1').startsAt = null;
    expect(codes(validateCompetition(data))).toContain('VAL-014');
  });

  it('VAL-014: bloqueia partida agendada com eventos', () => {
    const data = validData();
    match(data, 'g1').status = 'scheduled';
    expect(codes(validateCompetition(data))).toContain('VAL-014');
  });

  it('VAL-015: bloqueia ordem canônica incompatível com os horários', () => {
    const data = validData();
    const g1 = match(data, 'g1');
    const g2 = match(data, 'g2');
    const g1StartsAt = g1.startsAt;
    g1.startsAt = g2.startsAt;
    g2.startsAt = g1StartsAt;

    expect(codes(validateCompetition(data))).toContain('VAL-015');
  });

  it('VAL-016: bloqueia final encerrada antes do grupo terminar', () => {
    const data = validData();
    const g1 = match(data, 'g1');
    g1.status = 'scheduled';
    g1.events = [];
    g1.walkover = null;
    g1.shootout = null;

    expect(codes(validateCompetition(data))).toContain('VAL-016');
  });

  it('VAL-016: bloqueia eventos de final sem finalists', () => {
    const data = validData();
    data.finalists = null;
    expect(codes(validateCompetition(data))).toContain('VAL-016');
  });

  it('VAL-024: bloqueia W.O. com vencedor fora da partida', () => {
    const data = validData();
    match(data, 'g2').walkover.winnerTeamId = 'ta';
    expect(codes(validateCompetition(data))).toContain('VAL-024');
  });

  it('VAL-024: bloqueia W.O. em partida não encerrada', () => {
    const data = validData();
    match(data, 'g2').status = 'scheduled';
    expect(codes(validateCompetition(data))).toContain('VAL-024');
  });

  it('VAL-024 e VAL-025: bloqueiam W.O. com shootout', () => {
    const data = validData();
    match(data, 'g2').shootout = { home: 1, away: 0 };
    const errorCodes = codes(validateCompetition(data));
    expect(errorCodes).toContain('VAL-024');
    expect(errorCodes).toContain('VAL-025');
  });

  it('VAL-025: bloqueia shootout em partida de grupo', () => {
    const data = validData();
    match(data, 'g1').shootout = { home: 1, away: 0 };
    expect(codes(validateCompetition(data))).toContain('VAL-025');
  });

  it('VAL-025: bloqueia shootout empatado', () => {
    const data = validData();
    match(data, 'final').shootout = { home: 4, away: 4 };
    expect(codes(validateCompetition(data))).toContain('VAL-025');
  });

  it('VAL-030: bloqueia final empatada sem shootout', () => {
    const data = validData();
    match(data, 'final').shootout = null;
    expect(codes(validateCompetition(data))).toContain('VAL-030');
  });

  it('VAL-030: bloqueia shootout com tempo normal não empatado', () => {
    const data = validData();
    match(data, 'final').events.push({
      type: 'goal',
      playerId: 'p-017',
      assistPlayerId: null,
      minute: 30,
      penalty: false,
    });

    expect(codes(validateCompetition(data))).toContain('VAL-030');
  });

  it('VAL-029: bloqueia evento em W.O. por no_show', () => {
    const data = validData();
    match(data, 'g2').events.push({ type: 'yellow', playerId: 'p-009', minute: 5 });
    expect(codes(validateCompetition(data))).toContain('VAL-029');
  });

  it('VAL-029: bloqueia gol em W.O. por elenco insuficiente', () => {
    const data = validData();
    const g2 = match(data, 'g2');
    g2.walkover.reason = 'insufficient_players';
    g2.events.push({
      type: 'goal',
      playerId: 'p-012',
      assistPlayerId: null,
      minute: 5,
      penalty: false,
    });

    expect(codes(validateCompetition(data))).toContain('VAL-029');
  });
});
