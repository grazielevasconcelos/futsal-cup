import { readFileSync } from 'node:fs';

import { parse } from 'yaml';

import type { ValidationResult } from '../../src/lib/data/issues';

export const VALID_YAML = readFileSync(
  new URL('../fixtures/valida.yaml', import.meta.url),
  'utf8',
);

export type MutableCompetition = Record<string, any>;

export function validData(): MutableCompetition {
  return structuredClone(parse(VALID_YAML)) as MutableCompetition;
}

export function validSource(): string {
  return VALID_YAML;
}

export function match(data: MutableCompetition, id: string): Record<string, any> {
  const found = (data.matches as Record<string, any>[]).find((item) => item.id === id);
  if (found === undefined) throw new Error(`Partida ${id} não encontrada no fixture.`);
  return found;
}

export function team(data: MutableCompetition, id: string): Record<string, any> {
  const found = (data.teams as Record<string, any>[]).find((item) => item.id === id);
  if (found === undefined) throw new Error(`Time ${id} não encontrado no fixture.`);
  return found;
}

export function player(data: MutableCompetition, id: string): Record<string, any> {
  for (const item of data.teams as Record<string, any>[]) {
    const found = (item.players as Record<string, any>[]).find((entry) => entry.id === id);
    if (found !== undefined) return found;
  }
  throw new Error(`Jogadora ${id} não encontrada no fixture.`);
}

export function codes(result: ValidationResult): string[] {
  return result.errors.map((item) => item.code);
}

export function warningCodes(result: ValidationResult): string[] {
  return result.warnings.map((item) => item.code);
}

export function makeAllGroupDraws(data: MutableCompetition): void {
  for (const id of ['g1', 'g2', 'g3', 'g4', 'g5', 'g6']) {
    const item = match(data, id);
    item.status = 'finished';
    item.walkover = null;
    item.events = [];
  }

  const semi = match(data, 'semi');
  semi.status = 'scheduled';
  semi.walkover = null;
  semi.events = [];

  const final = match(data, 'final');
  final.status = 'scheduled';
  final.walkover = null;
  final.events = [];

  data.semifinalists = null;
  data.finalists = null;
  data.drawOrder = null;
}
