import { readFileSync } from 'node:fs';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stringify } from 'yaml';

import { describe, expect, it } from 'vitest';

import {
  loadCompetition,
  loadCompetitionResult,
  parseCompetition,
  validateCompetition,
  validateSource,
} from '../../src/lib/data/load';
import { DataValidationError } from '../../src/lib/data/issues';
import {
  codes,
  match,
  player,
  validData,
  validSource,
} from '../factories/competition';

const syntaxFixture = readFileSync(
  new URL('../fixtures/invalida-sintaxe.yaml', import.meta.url),
  'utf8',
);
const schemaFixture = readFileSync(
  new URL('../fixtures/invalida-schema.yaml', import.meta.url),
  'utf8',
);

describe('pipeline de dados', () => {
  it('aceita a fixture válida sem erros nem avisos', () => {
    const result = validateSource(validSource(), 'tests/fixtures/valida.yaml');
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.competition?.teams).toHaveLength(3);
    expect(result.competition?.matches).toHaveLength(8);
  });

  it('aceita a fonte pública da edição 2026', () => {
    const result = loadCompetitionResult('data/2026/copa.yaml');
    expect(result.errors).toEqual([]);
    expect(result.competition?.teams).toHaveLength(3);
    expect(result.competition?.matches).toHaveLength(8);
    expect(result.competition?.teams.find((item) => item.id === 'ta')).toMatchObject({
      name: 'Time A',
      displayName: 'De primeira FC',
      logo: '/images/times/ta.webp',
    });
    expect(result.competition?.teams.find((item) => item.id === 'tb')).toMatchObject({
      name: 'Time B',
      displayName: null,
      logo: null,
    });
  });

  it('VAL-002: bloqueia logo local que não existe em public/', () => {
    const data = validData();
    data.teams[0].logo = '/images/times/nao-existe.webp';
    const directory = mkdtempSync(join(tmpdir(), 'copa-logo-'));
    const file = join(directory, 'copa.yaml');
    writeFileSync(file, stringify(data), 'utf8');

    try {
      const result = loadCompetitionResult(file);
      expect(codes(result)).toContain('VAL-002');
      expect(result.competition).toBeNull();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('congela a competição validada', () => {
    const competition = loadCompetition('data/2026/copa.yaml');
    expect(Object.isFrozen(competition)).toBe(true);
    expect(Object.isFrozen(competition.teams)).toBe(true);
    expect(Object.isFrozen(competition.matches)).toBe(true);
  });

  it('VAL-001: rejeita YAML com sintaxe inválida', () => {
    const result = validateSource(syntaxFixture, 'tests/fixtures/invalida-sintaxe.yaml');
    expect(codes(result)).toContain('VAL-001');
    expect(result.competition).toBeNull();
  });

  it('VAL-001: rejeita chave duplicada no YAML', () => {
    const result = validateSource('edition: 2026\nedition: 2027\n', 'duplicada.yaml');
    expect(codes(result)).toContain('VAL-001');
  });

  it('VAL-002: rejeita campo desconhecido', () => {
    const data = validData();
    match(data, 'g1').foo = 'bar';
    expect(codes(validateCompetition(data))).toContain('VAL-002');
  });

  it('VAL-002: rejeita tipo errado e campo obrigatório ausente', () => {
    const data = validData();
    match(data, 'g1').round = 4;
    delete match(data, 'g2').startsAt;

    const errorCodes = codes(validateCompetition(data));
    expect(errorCodes).toContain('VAL-002');
    expect(errorCodes.filter((code) => code === 'VAL-002').length).toBeGreaterThanOrEqual(2);
  });

  it('VAL-002: agrega vários erros de schema de uma vez', () => {
    const data = validData();
    match(data, 'g1').foo = true;
    match(data, 'g1').bar = true;
    delete player(data, 'p-001').nickname;

    const result = validateCompetition(data);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
    expect(codes(result)).toContain('VAL-002');
  });

  it('VAL-002: rejeita data de calendário inválida e horário sem fuso', () => {
    const invalidDate = validData();
    match(invalidDate, 'g1').date = '2026-02-31';
    expect(codes(validateCompetition(invalidDate))).toContain('VAL-002');

    const noOffset = validData();
    match(noOffset, 'g1').startsAt = '2026-11-24T19:00:00';
    expect(codes(validateCompetition(noOffset))).toContain('VAL-002');
  });

  it('VAL-002: rejeita a fixture de schema incompleto, com campos legados e proibidos', () => {
    const result = validateSource(schemaFixture, 'tests/fixtures/invalida-schema.yaml');
    const errorCodes = codes(result);
    expect(errorCodes).toContain('VAL-002');
    expect(errorCodes).toContain('VAL-027');
  });

  it('VAL-026: rejeita placar materializado', () => {
    const data = validData();
    match(data, 'g1').score = { home: 1, away: 0 };
    expect(codes(validateCompetition(data))).toContain('VAL-026');
  });

  it('VAL-027: rejeita homeTeamId e round na final', () => {
    const withTeams = validData();
    match(withTeams, 'final').homeTeamId = 'tc';
    expect(codes(validateCompetition(withTeams))).toContain('VAL-027');

    const withRound = validData();
    match(withRound, 'final').round = 1;
    expect(codes(validateCompetition(withRound))).toContain('VAL-027');
  });

  it('VAL-027: rejeita awayTeamId na semifinal', () => {
    const data = validData();
    match(data, 'semi').awayTeamId = 'tb';
    expect(codes(validateCompetition(data))).toContain('VAL-027');
  });

  it('VAL-032: rejeita campos de privacidade', () => {
    const data = validData();
    player(data, 'p-001').fullName = 'Nome Completo';
    player(data, 'p-002').photo = 'foto.jpg';

    const result = validateCompetition(data);
    expect(codes(result).filter((code) => code === 'VAL-032')).toHaveLength(2);
    expect(result.errors.every((item) => !item.message.includes('Nome Completo'))).toBe(true);
  });

  it('VAL-002: rejeita campo legado friendly com mensagem de migração', () => {
    const data = validData();
    data.friendly = null;

    const result = validateCompetition(data);
    expect(codes(result)).toContain('VAL-002');

    const friendly = result.errors.find((item) => item.path === 'friendly');
    expect(friendly?.message).toContain('removido na v2.0');
    expect(friendly?.message).toContain('amistoso');
  });

  it('VAL-002: rejeita campo legado shootout com mensagem de migração', () => {
    const data = validData();
    match(data, 'g1').shootout = { home: 1, away: 0 };

    const result = validateCompetition(data);
    expect(codes(result)).toContain('VAL-002');

    const shootout = result.errors.find((item) => item.path.endsWith('.shootout'));
    expect(shootout?.message).toContain('removido na v2.0');
    expect(shootout?.message).toContain('shootout');
  });

  it('normaliza campos opcionais ausentes para null', () => {
    const data = validData();
    delete match(data, 'g1').events[0].minute;
    delete match(data, 'g1').events[1].assistPlayerId;
    delete match(data, 'g3').walkover.note;

    const result = validateCompetition(data);
    expect(result.errors).toEqual([]);
    const g1 = match({ matches: result.competition?.matches } as any, 'g1');
    const g3 = match({ matches: result.competition?.matches } as any, 'g3');
    expect(g1.events[0].minute).toBeNull();
    expect(g1.events[1].assistPlayerId).toBeNull();
    expect(g3.walkover.note).toBeNull();
  });

  it('parseCompetition lança DataValidationError com os issues agregados', () => {
    const data = validData();
    match(data, 'g1').score = { home: 1, away: 0 };
    delete match(data, 'g2').startsAt;

    expect(() => parseCompetition(JSON.stringify(data), 'inline.json')).toThrow(
      DataValidationError,
    );

    try {
      parseCompetition(JSON.stringify(data), 'inline.json');
    } catch (error) {
      expect(error).toBeInstanceOf(DataValidationError);
      expect((error as DataValidationError).issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});
