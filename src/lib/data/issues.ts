import type { Competition } from '../domain/types';

export type IssueSeverity = 'error' | 'warning';

export interface ValidationIssue {
  readonly code: string;
  readonly severity: IssueSeverity;
  readonly path: string;
  readonly expected: string;
  readonly found: string;
  readonly message: string;
}

export type IssuePath = readonly (string | number)[];

export function formatPath(path: IssuePath): string {
  if (path.length === 0) return '$';

  return path.reduce<string>((formatted, segment) => {
    if (typeof segment === 'number') return `${formatted}[${segment}]`;
    return formatted === '' ? segment : `${formatted}.${segment}`;
  }, '');
}

export function formatValue(value: unknown): string {
  if (value === undefined) return '<ausente>';
  if (value === null) return 'null';
  if (typeof value === 'string') {
    const normalized = value.length > 80 ? `${value.slice(0, 77)}...` : value;
    return JSON.stringify(normalized);
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `[lista com ${value.length} item(ns)]`;
  return '[objeto]';
}

export function issue(
  code: string,
  path: IssuePath,
  expected: string,
  found: string,
  message: string,
): ValidationIssue {
  return {
    code,
    severity: 'error',
    path: formatPath(path),
    expected,
    found,
    message,
  };
}

export function warning(
  code: string,
  path: IssuePath,
  expected: string,
  found: string,
  message: string,
): ValidationIssue {
  return {
    code,
    severity: 'warning',
    path: formatPath(path),
    expected,
    found,
    message,
  };
}

export function getAtPath(value: unknown, path: IssuePath): unknown {
  let current = value;
  for (const segment of path) {
    if (typeof segment === 'number') {
      if (!Array.isArray(current)) return undefined;
      current = current[segment];
      continue;
    }
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

export interface ValidationResult {
  readonly errors: readonly ValidationIssue[];
  readonly warnings: readonly ValidationIssue[];
  readonly competition: Competition | null;
}

export class DataValidationError extends Error {
  readonly issues: readonly ValidationIssue[];

  constructor(source: string, issues: readonly ValidationIssue[]) {
    const details = issues
      .map(
        (item) =>
          `${item.code} · ${item.path}\nEsperado: ${item.expected}\nEncontrado: ${item.found}\n${item.message}`,
      )
      .join('\n\n');

    super(
      `A validação de ${source} encontrou ${issues.length} erro(s) bloqueante(s).\n\n${details}`,
    );
    this.name = 'DataValidationError';
    this.issues = issues;
  }
}
