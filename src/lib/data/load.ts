import { readFileSync } from 'node:fs';

import { parseDocument, type Document } from 'yaml';

import type { Competition } from '../domain/types';
import {
  DataValidationError,
  type ValidationIssue,
  type ValidationResult,
  issue,
} from './issues';
import { competitionSchema } from './schema';
import { mapSchemaIssues } from './schema-issues';
import { validateSemantics } from './validate';

export interface ValidationOptions {
  readonly now?: Date;
  readonly source?: string;
}

function yamlIssues(document: Document, source: string): ValidationIssue[] {
  return document.errors.map((error) => {
    const position = error.linePos?.[0];
    const location =
      position === undefined ? 'local desconhecido' : `linha ${position.line}, coluna ${position.col}`;
    return issue(
      'VAL-001',
      [],
      'YAML 1.2 válido.',
      `${location}: ${error.message}`,
      `Não foi possível ler ${source} como YAML 1.2. Verifique indentação, dois-pontos e chaves duplicadas (${location}).`,
    );
  });
}

export function validateCompetition(
  raw: unknown,
  options: ValidationOptions = {},
): ValidationResult {
  const source = options.source ?? 'data/2026/copa.yaml';
  const parsed = competitionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: mapSchemaIssues(parsed.error, raw, source),
      warnings: [],
      competition: null,
    };
  }

  const competition = parsed.data;
  const semantic = validateSemantics(
    competition,
    options.now === undefined ? {} : { now: options.now },
  );
  const errors = [...semantic.errors];
  const warnings = [...semantic.warnings];

  return {
    errors,
    warnings,
    competition: errors.length === 0 ? deepFreeze(competition) : null,
  };
}

export function validateSource(
  rawText: string,
  source = 'data/2026/copa.yaml',
  options: Omit<ValidationOptions, 'source'> = {},
): ValidationResult {
  const document = parseDocument(rawText, {
    version: '1.2',
    uniqueKeys: true,
    prettyErrors: false,
  });

  if (document.errors.length > 0) {
    return {
      errors: yamlIssues(document, source),
      warnings: [],
      competition: null,
    };
  }

  return validateCompetition(document.toJS(), { ...options, source });
}

export function parseCompetition(
  rawText: string,
  source = 'data/2026/copa.yaml',
  options: Omit<ValidationOptions, 'source'> = {},
): Competition {
  const result = validateSource(rawText, source, options);

  if (result.errors.length > 0 || result.competition === null) {
    throw new DataValidationError(source, result.errors);
  }

  return result.competition;
}

export function loadCompetition(
  filePath = 'data/2026/copa.yaml',
  options: Omit<ValidationOptions, 'source'> = {},
): Competition {
  const rawText = readFileSync(filePath, 'utf8');
  return parseCompetition(rawText, filePath, options);
}

export function loadCompetitionResult(
  filePath = 'data/2026/copa.yaml',
  options: Omit<ValidationOptions, 'source'> = {},
): ValidationResult {
  const rawText = readFileSync(filePath, 'utf8');
  return validateSource(rawText, filePath, options);
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;

  Object.freeze(value);
  for (const key of Object.keys(value)) {
    deepFreeze((value as Record<string, unknown>)[key]);
  }
  return value;
}
