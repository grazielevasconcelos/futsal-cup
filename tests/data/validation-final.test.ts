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

  it('aceita a fixture válida com a fase final encerrada e os snapshots preenchidos', () => {
    const result = validateCompetition(validData());
    expect(result.errors).toEqual([]);
  });

  it('aceita snapshots nulos enquanto o grupo não termina', () => {
    const data = validData();
    data.semifinalists = null;
    data.finalists = null;

    const g1 = match(data, 'g1');
    g1.status = 'scheduled';
    g1.events = [];
    g1.walkover = null;

    for (const id of ['semi', 'final']) {
      const item = match(data, id);
      item.status = 'scheduled';
      item.events = [];
      item.walkover = null;
    }

    const result = validateCompetition(data, {
      now: new Date('2026-11-13T12:00:00-03:00'),
    });
    expect(result.errors).toEqual([]);
  });

  it('VAL-017: bloqueia semifinalists nulo com o grupo completo', () => {
    const data = validData();
    data.semifinalists = null;
    data.finalists = null;

    for (const id of ['semi', 'final']) {
      const item = match(data, id);
      item.status = 'scheduled';
      item.events = [];
      item.walkover = null;
    }

    const result = validateCompetition(data);
    expect(codes(result)).toContain('VAL-017');
    expect(codes(result)).not.toContain('VAL-016');
  });

  it('VAL-017: bloqueia semifinalists preenchido com o grupo incompleto', () => {
    const data = validData();
    const g1 = match(data, 'g1');
    g1.status = 'scheduled';
    g1.events = [];
    g1.walkover = null;

    for (const id of ['semi', 'final']) {
      const item = match(data, id);
      item.status = 'scheduled';
      item.events = [];
      item.walkover = null;
    }
    data.finalists = null;
    // semifinalists permanece ["ta", "tb"].

    expect(codes(validateCompetition(data))).toContain('VAL-017');
  });

  it('VAL-017: bloqueia semifinalistas divergentes listando antigos e novos', () => {
    const data = validData();
    data.semifinalists = ['tb', 'ta'];

    const result = validateCompetition(data);
    const problem = result.errors.find((item) => item.code === 'VAL-017');
    expect(problem?.message).toContain('Antigos');
    expect(problem?.message).toContain('Novos');
  });

  it('VAL-017: bloqueia finalists nulo com a semifinal encerrada', () => {
    const data = validData();
    data.finalists = null;

    const final = match(data, 'final');
    final.status = 'scheduled';
    final.events = [];
    final.walkover = null;

    expect(codes(validateCompetition(data))).toContain('VAL-017');
  });

  it('VAL-017: bloqueia finalists preenchido com a semifinal pendente', () => {
    const data = validData();
    const semi = match(data, 'semi');
    semi.status = 'scheduled';
    semi.events = [];
    semi.walkover = null;
    // finalists permanece ["tc", "tb"].

    expect(codes(validateCompetition(data))).toContain('VAL-017');
  });

  it('VAL-017: bloqueia finalistas divergentes listando antigos e novos', () => {
    const data = validData();
    data.finalists = ['tc', 'ta'];

    const result = validateCompetition(data);
    const problem = result.errors.find((item) => item.code === 'VAL-017');
    expect(problem?.message).toContain('Antigos');
    expect(problem?.message).toContain('Novos');
  });

  it('VAL-018: exige drawOrder quando a classificação final chega ao sorteio', () => {
    const data = validData();
    makeAllGroupDraws(data);

    const result = validateCompetition(data);
    expect(codes(result)).toContain('VAL-018');
    expect(codes(result)).not.toContain('VAL-017');
  });

  it('VAL-018: aceita sorteio registrado e snapshots coerentes', () => {
    const data = validData();
    makeAllGroupDraws(data);
    data.drawOrder = ['ta', 'tb', 'tc'];
    // Com todos empatados, o sorteio define ta 1º, tb 2º e tc 3º.
    data.semifinalists = ['tb', 'tc'];
    data.finalists = null;

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
});
