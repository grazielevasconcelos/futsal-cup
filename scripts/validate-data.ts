import { appendFileSync, existsSync } from 'node:fs';

import { loadCompetitionResult } from '../src/lib/data/load';
import type { ValidationIssue, ValidationResult } from '../src/lib/data/issues';

const dataPath = 'data/2026/copa.yaml';

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function issueTable(title: string, issues: readonly ValidationIssue[]): string[] {
  if (issues.length === 0) return [];

  return [
    `### ${title}`,
    '',
    '| Código | Caminho | Mensagem |',
    '|---|---|---|',
    ...issues.map(
      (item) => `| ${item.code} | \`${escapeCell(item.path)}\` | ${escapeCell(item.message)} |`,
    ),
    '',
  ];
}

function buildSummary(result: ValidationResult): string {
  const lines = [
    '## Validação da Copa 2026',
    '',
    `- Erros bloqueantes: ${result.errors.length}`,
    `- Avisos: ${result.warnings.length}`,
    '',
  ];

  if (result.errors.length === 0) {
    lines.push('Validação concluída sem erros.', '');
  } else {
    lines.push(...issueTable('Erros', result.errors));
  }

  lines.push(...issueTable('Avisos', result.warnings));

  return `${lines.join('\n').trimEnd()}\n`;
}

function printIssue(item: ValidationIssue): void {
  console.log(`${item.code} · ${item.path}`);
  console.log(`Esperado: ${item.expected}`);
  console.log(`Encontrado: ${item.found}`);
  console.log(item.message);
  console.log('');
}

if (!existsSync(dataPath)) {
  console.error(`Fonte de dados não encontrada: ${dataPath}`);
  process.exit(1);
}

const result = loadCompetitionResult(dataPath);
const summary = buildSummary(result);

console.log(`Validação de ${dataPath}`);
console.log(`Erros bloqueantes: ${result.errors.length}`);
console.log(`Avisos: ${result.warnings.length}`);
console.log('');

for (const item of result.errors) printIssue(item);
for (const item of result.warnings) printIssue(item);

if (result.errors.length === 0) {
  console.log('Validação concluída sem erros.');
}

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath !== undefined && summaryPath !== '') {
  appendFileSync(summaryPath, summary, 'utf8');
}

process.exitCode = result.errors.length > 0 ? 1 : 0;
