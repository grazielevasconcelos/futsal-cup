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

  it('VAL-016: bloqueia semifinal encerrada antes de o grupo terminar', () => {
    const data = validData();
    const g1 = match(data, 'g1');
    g1.status = 'scheduled';
    g1.events = [];
    g1.walkover = null;

    expect(codes(validateCompetition(data))).toContain('VAL-016');
  });

  it('VAL-016: bloqueia eventos de semifinal sem semifinalists', () => {
    const data = validData();
    data.semifinalists = null;
    expect(codes(validateCompetition(data))).toContain('VAL-016');
  });

  it('VAL-016: bloqueia final encerrada antes da semifinal', () => {
    const data = validData();
    const semi = match(data, 'semi');
    semi.status = 'scheduled';
    semi.events = [];
    semi.walkover = null;

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

  it('VAL-024: aceita W.O. válido na semifinal e na final', () => {
    const data = validData();
    const semi = match(data, 'semi');
    semi.walkover = { winnerTeamId: 'tb', reason: 'withdrawal', note: null };
    semi.events = [];

    const final = match(data, 'final');
    final.walkover = { winnerTeamId: 'tc', reason: 'no_show', note: null };
    final.events = [];

    const result = validateCompetition(data);
    expect(result.errors).toEqual([]);
  });

  it('VAL-024: bloqueia W.O. na semifinal com vencedor fora dos participantes', () => {
    const data = validData();
    const semi = match(data, 'semi');
    semi.walkover = { winnerTeamId: 'tc', reason: 'withdrawal', note: null };
    semi.events = [];

    expect(codes(validateCompetition(data))).toContain('VAL-024');
  });

  it('VAL-027: bloqueia homeTeamId na semifinal', () => {
    const data = validData();
    match(data, 'semi').homeTeamId = 'ta';
    expect(codes(validateCompetition(data))).toContain('VAL-027');
  });

  it('VAL-027: bloqueia round na semifinal', () => {
    const data = validData();
    match(data, 'semi').round = 1;
    expect(codes(validateCompetition(data))).toContain('VAL-027');
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
