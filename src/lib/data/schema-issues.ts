import type { ZodError } from 'zod';

import {
  formatPath,
  formatValue,
  getAtPath,
  issue,
  type IssuePath,
  type ValidationIssue,
} from './issues';

const PRIVACY_FIELDS = new Set([
  'fullName',
  'fullname',
  'photo',
  'photoUrl',
  'contact',
  'shirtNumber',
  'jersey',
  'birthDate',
  'phone',
  'email',
  'address',
  'instagram',
]);

const SCORE_FIELDS = new Set([
  'score',
  'homeScore',
  'awayScore',
  'result',
  'points',
  'standings',
  'classification',
  'tabela',
  'placar',
  'goalsHome',
  'goalsAway',
  'goalsFor',
  'goalsAgainst',
]);

const FINAL_FORBIDDEN_FIELDS = new Set(['homeTeamId', 'awayTeamId']);

function isFinalMatchAt(raw: unknown, path: IssuePath): boolean {
  const [collection, index] = path;
  if (collection !== 'matches' || typeof index !== 'number') return false;
  const match = getAtPath(raw, ['matches', index]);
  return (
    match !== null && typeof match === 'object' && (match as Record<string, unknown>).id === 'final'
  );
}

function toIssuePath(path: readonly PropertyKey[]): IssuePath {
  return path.map((segment) =>
    typeof segment === 'symbol' ? segment.toString() : segment,
  );
}

function expectedForIssue(item: ZodError['issues'][number]): string {
  switch (item.code) {
    case 'invalid_type':
      return `tipo ${item.expected}`;
    case 'too_small':
      return `valor mínimo ${String(item.minimum)}`;
    case 'too_big':
      return `valor máximo ${String(item.maximum)}`;
    case 'unrecognized_keys':
      return 'campo previsto no schema';
    default:
      return 'valor válido segundo o schema';
  }
}

function genericSchemaIssue(
  item: ZodError['issues'][number],
  raw: unknown,
  source: string,
): ValidationIssue {
  const path = toIssuePath(item.path);
  const expected = expectedForIssue(item);
  const found = formatValue(getAtPath(raw, path));
  const readablePath = formatPath(path);

  if (item.code === 'unrecognized_keys') {
    return issue(
      'VAL-002',
      path,
      expected,
      item.keys.map((key) => formatValue(key)).join(', '),
      `Campo desconhecido em ${readablePath}: ${item.keys.join(', ')}. Remova o campo ou use apenas os campos previstos na SPEC §5.4.`,
    );
  }

  return issue(
    'VAL-002',
    path,
    expected,
    found,
    `Valor inválido em ${readablePath}: esperado ${expected}, encontrado ${found}. Corrija o valor em ${source}.`,
  );
}

export function mapSchemaIssues(error: ZodError, raw: unknown, source: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const item of error.issues) {
    const path = toIssuePath(item.path);

    if (item.code === 'unrecognized_keys') {
      for (const key of item.keys) {
        const fieldPath = [...path, key];
        const readablePath = formatPath(fieldPath);

        if (PRIVACY_FIELDS.has(key)) {
          issues.push(
            issue(
              'VAL-032',
              fieldPath,
              'Apenas id, nickname, position, joinedAt e leftAt.',
              formatValue(key),
              `Campo de privacidade proibido em ${readablePath}: \`${key}\`. Remova o campo; a privacidade permite apenas id, nickname, position, joinedAt e leftAt.`,
            ),
          );
          continue;
        }

        if (item.path[0] === 'friendly') {
          issues.push(
            issue(
              'VAL-033',
              fieldPath,
              'Apenas date, startsAt, venue e note.',
              formatValue(key),
              `Campo de partida não é permitido no amistoso: \`${key}\` em ${readablePath}. O amistoso é um metadado informativo e não tem status, eventos, placar, W.O. ou shootout.`,
            ),
          );
          continue;
        }

        if (SCORE_FIELDS.has(key)) {
          issues.push(
            issue(
              'VAL-026',
              fieldPath,
              'Nenhum campo de placar, pontuação ou classificação.',
              formatValue(key),
              `Campo de placar ou classificação proibido em ${readablePath}: \`${key}\`. O placar é sempre derivado dos eventos e não pode ser armazenado.`,
            ),
          );
          continue;
        }

        if (FINAL_FORBIDDEN_FIELDS.has(key) && isFinalMatchAt(raw, path)) {
          issues.push(
            issue(
              'VAL-027',
              fieldPath,
              'A final usa finalists e round: null.',
              formatValue(key),
              `A partida final não possui \`${key}\`. Os times vêm de \`finalists\`; remova o campo e mantenha \`round: null\`.`,
            ),
          );
          continue;
        }

        issues.push(genericSchemaIssue(item, raw, source));
      }
      continue;
    }

    if (
      item.path[item.path.length - 1] === 'round' &&
      isFinalMatchAt(raw, path.slice(0, 2))
    ) {
      const fieldPath = path;
      issues.push(
        issue(
          'VAL-027',
          fieldPath,
          'round: null para a final.',
          formatValue(getAtPath(raw, fieldPath)),
          'A partida final deve ter `round: null`. Os times vêm de `finalists`; não há rodada na final.',
        ),
      );
      continue;
    }

    issues.push(genericSchemaIssue(item, raw, source));
  }

  return issues;
}
