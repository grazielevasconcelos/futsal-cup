import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

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

export const PRODUCTION_DATA_FILE = 'data/2026/copa.yaml';

export function defaultDataFile(): string {
  return process.env.COPA_DATA_FILE ?? PRODUCTION_DATA_FILE;
}

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
  filePath = defaultDataFile(),
  options: Omit<ValidationOptions, 'source'> = {},
): Competition {
  const result = loadCompetitionResult(filePath, options);
  if (result.errors.length > 0 || result.competition === null) {
    throw new DataValidationError(filePath, result.errors);
  }
  return result.competition;
}

export function loadCompetitionResult(
  filePath = defaultDataFile(),
  options: Omit<ValidationOptions, 'source'> = {},
): ValidationResult {
  const rawText = readFileSync(filePath, 'utf8');
  const result = validateSource(rawText, filePath, options);
  if (result.competition === null) return result;

  const logoErrors = result.competition.teams.flatMap((team, index) => {
    if (team.logo === null) return [];
    const publicFile = resolve(process.cwd(), 'public', team.logo.slice(1));
    if (existsSync(publicFile) && statSync(publicFile).isFile()) return [];
    return [
      issue(
        'VAL-002',
        ['teams', index, 'logo'],
        `Arquivo local existente em public${team.logo}.`,
        team.logo,
        `O logo do time ${team.id} aponta para ${team.logo}, mas o arquivo não existe em ${publicFile}. Adicione o asset ou use null.`,
      ),
    ];
  });

  if (logoErrors.length === 0) return result;
  return {
    ...result,
    errors: [...result.errors, ...logoErrors],
    competition: null,
  };
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;

  Object.freeze(value);
  for (const key of Object.keys(value)) {
    deepFreeze((value as Record<string, unknown>)[key]);
  }
  return value;
}
