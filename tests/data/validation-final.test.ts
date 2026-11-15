import { describe, expect, it } from 'vitest';

import { validateCompetition } from '../../src/lib/data/load';
import { validateSemantics } from '../../src/lib/data/validate';
import type { Competition } from '../../src/lib/domain/types';
import {
  codes,
  makeAllGroupDraws,
  match,
  validData,
} from '../factories/competition';

describe('validação semântica da fase final', () => {
  it('VAL-003: bloqueia edição ou fuso diferentes', () => {
    const data = validData();
    data.edition = 2025;
    data.timezone = 'UTC';
    const result = validateSemantics(data as unknown as Competition);
    expect(result.errors.map((item) => item.code)).toContain('VAL-003');
  });

  it('VAL-017: aceita finalists nulo enquanto o grupo não termina', () => {
    const data = validData();
    data.finalists = null;

    const g1 = match(data, 'g1');
    g1.status = 'scheduled';
    g1.events = [];
    g1.walkover = null;
    g1.shootout = null;

    const final = match(data, 'final');
    final.status = 'scheduled';
    final.events = [];
    final.walkover = null;
    final.shootout = null;

    const result = validateCompetition(data, {
      now: new Date('2026-11-13T12:00:00-03:00'),
    });
    expect(result.errors).toEqual([]);
  });

  it('VAL-017: bloqueia finalistas divergentes da classificação', () => {
    const data = validData();
    data.finalists = { final: ['ta', 'tc'] };
    const errorCodes = codes(validateCompetition(data));
    expect(errorCodes).toContain('VAL-017');
  });

  it('VAL-017: bloqueia finalists nulo com grupo completo', () => {
    const data = validData();
    data.finalists = null;
    expect(codes(validateCompetition(data))).toContain('VAL-017');
  });

  it('VAL-017: bloqueia finalists preenchido com grupo incompleto', () => {
    const data = validData();
    const g1 = match(data, 'g1');
    g1.status = 'scheduled';
    g1.events = [];
    g1.walkover = null;
    g1.shootout = null;

    expect(codes(validateCompetition(data))).toContain('VAL-017');
  });

  it('VAL-018: exige drawOrder quando a classificação final chega ao sorteio', () => {
    const data = validData();
    makeAllGroupDraws(data);

    const result = validateCompetition(data);
    expect(codes(result)).toContain('VAL-018');
    expect(codes(result)).not.toContain('VAL-017');
  });

  it('VAL-018: aceita sorteio registrado e finalistas coerentes', () => {
    const data = validData();
    makeAllGroupDraws(data);
    data.drawOrder = ['ta', 'tb', 'tc'];
    data.finalists = { final: ['ta', 'tb'] };

    const result = validateCompetition(data);
    expect(result.errors).toEqual([]);
  });

  it('VAL-018: bloqueia drawOrder que não é permutação', () => {
    const data = validData();
    makeAllGroupDraws(data);
    data.drawOrder = ['ta', 'ta', 'tb'];
    expect(codes(validateCompetition(data))).toContain('VAL-018');
  });

  it('VAL-031: bloqueia aviso com mensagem vazia após normalização', () => {
    const data = validData();
    data.notices = [{ date: '2026-11-20', message: '   ' }];
    expect(codes(validateCompetition(data))).toContain('VAL-031');
  });

  it('VAL-033: bloqueia amistoso em data diferente da final', () => {
    const data = validData();
    data.friendly.date = '2026-12-02';
    expect(codes(validateCompetition(data))).toContain('VAL-033');
  });

  it('VAL-033: bloqueia amistoso depois do horário da final', () => {
    const data = validData();
    data.friendly.startsAt = '2026-12-03T21:00:00-03:00';
    expect(codes(validateCompetition(data))).toContain('VAL-033');
  });

  it('VAL-033: bloqueia local vazio no amistoso', () => {
    const data = validData();
    data.friendly.venue = '   ';
    expect(codes(validateCompetition(data))).toContain('VAL-033');
  });
});
