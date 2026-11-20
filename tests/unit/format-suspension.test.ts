import { describe, expect, it } from 'vitest';

import { buildSuspensionLabels, positionLabel } from '../../src/lib/format/suspension';
import type { PlayerId } from '../../src/lib/domain/types';
import {
  domainPlayer,
  domainTeam,
  makeCompetition,
  makeFinal,
  makeGroupMatch,
  makeSemi,
  red,
} from '../factories/domain';

const FORBIDDEN_KNOCKOUT_WORDS = /shootout|p[êe]nalt/i;

function teamsWith() {
  return (['ta', 'tb', 'tc'] as const).map((teamId) =>
    domainTeam(teamId, [
      domainPlayer(teamId, 1, { nickname: `${teamId.toUpperCase()} 1` }),
      domainPlayer(teamId, 2, { nickname: `${teamId.toUpperCase()} 2` }),
    ]),
  );
}

function expectLabel(
  labels: ReadonlyMap<PlayerId, string>,
  playerId: PlayerId,
  expected: string,
): void {
  const label = labels.get(playerId);
  expect(label).toBe(expected);
  expect(label).not.toMatch(FORBIDDEN_KNOCKOUT_WORDS);
}

describe('buildSuspensionLabels', () => {
  it('indica a próxima partida da jogadora suspensa', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      matches: [
        makeGroupMatch({
          id: 'g1',
          home: 'ta',
          away: 'tb',
          date: '2026-11-24',
          events: [red('p-ta1', 18)],
        }),
        makeGroupMatch({
          id: 'g3',
          home: 'ta',
          away: 'tc',
          date: '2026-11-26',
          status: 'scheduled',
        }),
      ],
    });

    const labels = buildSuspensionLabels(competition);
    expectLabel(labels, 'p-ta1', 'Suspensa na partida contra Time TC de 26/11/2026');
    expect(labels.get('p-ta2')).toBe('Sem suspensão');
  });

  it('mantém a suspensão pendente quando o 1º colocado ainda aguarda a final', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      semifinalists: ['tb', 'tc'],
      finalists: null,
      matches: [
        makeGroupMatch({
          id: 'g5',
          home: 'tc',
          away: 'ta',
          events: [red('p-ta1', 24)],
        }),
        makeSemi({ status: 'scheduled', startsAt: null }),
      ],
    });

    expectLabel(
      buildSuspensionLabels(competition),
      'p-ta1',
      'Suspensão pendente — fase final a definir',
    );
  });

  it('cumpre na semifinal a suspensão do 2º ou do 3º colocado', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      semifinalists: ['tb', 'tc'],
      finalists: null,
      matches: [
        makeGroupMatch({
          id: 'g6',
          home: 'tc',
          away: 'tb',
          events: [red('p-tc1', 24)],
        }),
        makeSemi({ status: 'scheduled', startsAt: null }),
      ],
    });

    expectLabel(
      buildSuspensionLabels(competition),
      'p-tc1',
      'Suspensa na partida contra Time TB de 02/12/2026',
    );
  });

  it('cumpre na final a suspensão do 1º colocado quando os finalistas são definidos', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      semifinalists: ['tb', 'tc'],
      finalists: ['ta', 'tb'],
      matches: [
        makeGroupMatch({
          id: 'g5',
          home: 'tc',
          away: 'ta',
          events: [red('p-ta1', 24)],
        }),
        makeSemi(),
        makeFinal({ status: 'scheduled', startsAt: null }),
      ],
    });

    expectLabel(
      buildSuspensionLabels(competition),
      'p-ta1',
      'Suspensa na partida contra Time TB de 03/12/2026',
    );
  });

  it('cumpre na final a suspensão da semifinal quando o time avança', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      semifinalists: ['tb', 'tc'],
      finalists: ['ta', 'tb'],
      matches: [
        makeGroupMatch({ id: 'g6', home: 'tc', away: 'tb' }),
        makeSemi({ events: [red('p-tb1', 12)] }),
        makeFinal({ status: 'scheduled', startsAt: null }),
      ],
    });

    expectLabel(
      buildSuspensionLabels(competition),
      'p-tb1',
      'Suspensa na partida contra Time TA de 03/12/2026',
    );
  });

  it('marca a suspensão da semifinal como pendente enquanto a final não é definida', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      semifinalists: ['tb', 'tc'],
      finalists: null,
      matches: [makeSemi({ events: [red('p-tb1', 12)] })],
    });

    expectLabel(
      buildSuspensionLabels(competition),
      'p-tb1',
      'Suspensão pendente — fase final a definir',
    );
  });

  it('não deixa pendente a suspensão de quem perdeu a semifinal', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      semifinalists: ['tb', 'tc'],
      finalists: null,
      matches: [makeSemi({ events: [red('p-tc1', 12)] })],
    });

    expectLabel(
      buildSuspensionLabels(competition),
      'p-tc1',
      'Suspensão sem efeito — sem próxima partida',
    );
  });

  it('não dá efeito à suspensão de quem foi eliminado na semifinal', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      semifinalists: ['tb', 'tc'],
      finalists: ['ta', 'tb'],
      matches: [
        makeSemi({ events: [red('p-tc1', 12)] }),
        makeFinal({ status: 'scheduled', startsAt: null }),
      ],
    });

    expectLabel(
      buildSuspensionLabels(competition),
      'p-tc1',
      'Suspensão sem efeito — sem próxima partida',
    );
  });

  it('não dá efeito à suspensão na final, que não tem partida seguinte', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      semifinalists: ['tb', 'tc'],
      finalists: ['ta', 'tb'],
      matches: [makeSemi(), makeFinal({ events: [red('p-ta1', 30)] })],
    });

    expectLabel(
      buildSuspensionLabels(competition),
      'p-ta1',
      'Suspensão sem efeito — sem próxima partida',
    );
  });

  it('não menciona shootout nem pênaltis em nenhum estado de suspensão', () => {
    const competitions = [
      makeCompetition({
        teams: teamsWith(),
        semifinalists: ['tb', 'tc'],
        finalists: null,
        matches: [makeSemi({ events: [red('p-tb1', 12)] })],
      }),
      makeCompetition({
        teams: teamsWith(),
        semifinalists: ['tb', 'tc'],
        finalists: ['ta', 'tb'],
        matches: [
          makeGroupMatch({
            id: 'g5',
            home: 'tc',
            away: 'ta',
            events: [red('p-ta1', 24)],
          }),
          makeGroupMatch({
            id: 'g6',
            home: 'tc',
            away: 'tb',
            events: [red('p-tc1', 24)],
          }),
          makeSemi({ events: [red('p-tb1', 12)] }),
          makeFinal({ status: 'scheduled', startsAt: null }),
        ],
      }),
      makeCompetition({
        teams: teamsWith(),
        semifinalists: ['tb', 'tc'],
        finalists: ['ta', 'tb'],
        matches: [makeSemi(), makeFinal({ events: [red('p-ta1', 30)] })],
      }),
    ];

    for (const competition of competitions) {
      for (const label of buildSuspensionLabels(competition).values()) {
        expect(label).not.toMatch(FORBIDDEN_KNOCKOUT_WORDS);
      }
    }
  });
});

describe('positionLabel', () => {
  it('traduz posições e usa travessão quando ausente', () => {
    expect(positionLabel('goleira')).toBe('Goleira');
    expect(positionLabel('linha')).toBe('Linha');
    expect(positionLabel(null)).toBe('—');
  });
});
