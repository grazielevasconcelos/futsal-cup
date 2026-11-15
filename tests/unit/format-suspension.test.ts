import { describe, expect, it } from 'vitest';

import { buildSuspensionLabels, positionLabel } from '../../src/lib/format/suspension';
import {
  domainPlayer,
  domainTeam,
  makeCompetition,
  makeGroupMatch,
  red,
} from '../factories/domain';

function teamsWith() {
  return (['ta', 'tb', 'tc'] as const).map((teamId) =>
    domainTeam(teamId, [
      domainPlayer(teamId, 1, { nickname: `${teamId.toUpperCase()} 1` }),
      domainPlayer(teamId, 2, { nickname: `${teamId.toUpperCase()} 2` }),
    ]),
  );
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
    expect(labels.get('p-ta1')).toBe(
      'Suspensa na partida contra Time TC de 26/11/2026',
    );
    expect(labels.get('p-ta2')).toBe('Sem suspensão');
  });

  it('indica suspensão pendente quando a final ainda depende dos finalistas', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      finalists: null,
      matches: [
        makeGroupMatch({
          id: 'g6',
          home: 'tc',
          away: 'tb',
          events: [red('p-tc1', 24)],
        }),
      ],
    });

    expect(buildSuspensionLabels(competition).get('p-tc1')).toBe(
      'Suspensão pendente — final a definir',
    );
  });

  it('indica suspensão sem efeito quando o time não tem próxima partida', () => {
    const competition = makeCompetition({
      teams: teamsWith(),
      finalists: { final: ['ta', 'tb'] },
      matches: [
        makeGroupMatch({
          id: 'g6',
          home: 'tc',
          away: 'tb',
          events: [red('p-tc1', 24)],
        }),
      ],
    });

    expect(buildSuspensionLabels(competition).get('p-tc1')).toBe(
      'Suspensão sem efeito — sem próxima partida',
    );
  });
});

describe('positionLabel', () => {
  it('traduz posições e usa travessão quando ausente', () => {
    expect(positionLabel('goleira')).toBe('Goleira');
    expect(positionLabel('linha')).toBe('Linha');
    expect(positionLabel(null)).toBe('—');
  });
});
