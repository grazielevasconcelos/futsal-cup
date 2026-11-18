import { describe, expect, it } from 'vitest';

import { loadCompetition } from '../../src/lib/data/load';
import { buildPlayerTeamMap } from '../../src/lib/domain/players';
import {
  formatScore,
  formatScoreAccessible,
  formatStatus,
  walkoverReasonLabel,
} from '../../src/lib/format/match';
import type { Competition, Finalists, Match } from '../../src/lib/domain/types';
import {
  goal,
  goalsFor,
  makeCompetition,
  makeFinal,
  makeGroupMatch,
} from '../factories/domain';

const finalists: Finalists = { final: ['ta', 'tb'] };

function cupWith(...matches: readonly Match[]): Competition {
  return makeCompetition({ matches });
}

function playerTeams(competition: Competition) {
  return buildPlayerTeamMap(competition);
}

describe('formatScore', () => {
  it('mostra o placar normal derivado dos gols', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: [...goalsFor('ta', 2), ...goalsFor('tb', 1)],
    });

    expect(formatScore(match, null, playerTeams(cupWith(match)))).toBe('2 x 1');
  });

  it('mostra "A definir" para partida agendada', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'scheduled',
    });

    expect(formatScore(match, null, playerTeams(cupWith(match)))).toBe('A definir');
  });

  it('mostra "Adiada" para partida adiada', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'postponed',
      startsAt: null,
    });

    expect(formatScore(match, null, playerTeams(cupWith(match)))).toBe('Adiada');
  });

  it('mostra "Confrontos a definir" para a final sem finalistas', () => {
    const match = makeFinal();

    expect(formatScore(match, null, playerTeams(cupWith(match)))).toBe(
      'Confrontos a definir',
    );
  });

  it('TST-073: mostra W.O. na ordem mandante/visitante', () => {
    const match = makeGroupMatch({
      id: 'g2',
      home: 'tb',
      away: 'tc',
      walkover: { winnerTeamId: 'tc', reason: 'no_show', note: null },
      events: [],
    });

    expect(formatScore(match, null, playerTeams(cupWith(match)))).toBe('0 x 1 (W.O.)');
  });

  it('mostra o W.O. com o vencedor mandante em 1 x 0', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      walkover: { winnerTeamId: 'ta', reason: 'withdrawal', note: null },
      events: [],
    });

    expect(formatScore(match, null, playerTeams(cupWith(match)))).toBe('1 x 0 (W.O.)');
  });

  it('TST-074: mostra o placar dos pênaltis entre parênteses', () => {
    const match = makeFinal({
      events: [goal('p-ta1'), goal('p-tb1')],
      shootout: { home: 4, away: 3 },
    });

    expect(formatScore(match, finalists, playerTeams(cupWith(match)))).toBe(
      '1 (4) x (3) 1',
    );
  });

  it('formata o W.O. e o shootout da fonte real', () => {
    const competition = loadCompetition('tests/fixtures/valida.yaml');
    const teams = playerTeams(competition);
    const walkover = competition.matches.find((match) => match.id === 'g2') as Match;
    const final = competition.matches.find((match) => match.id === 'final') as Match;

    expect(formatScore(walkover, null, teams)).toBe('0 x 1 (W.O.)');
    expect(formatScore(final, competition.finalists, teams)).toBe('1 (4) x (3) 1');
  });
});

describe('formatScoreAccessible', () => {
  it('descreve o placar normal com os nomes dos times', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: [...goalsFor('ta', 2), ...goalsFor('tb', 1)],
    });

    expect(formatScoreAccessible(match, null, 'Time TA', 'Time TB', playerTeams(cupWith(match)))).toBe(
      'Time TA 2 a 1 Time TB.',
    );
  });

  it('descreve o W.O. com o motivo', () => {
    const match = makeGroupMatch({
      id: 'g2',
      home: 'tb',
      away: 'tc',
      walkover: { winnerTeamId: 'tc', reason: 'insufficient_players', note: null },
      events: [],
    });

    expect(formatScoreAccessible(match, null, 'Time TB', 'Time TC', playerTeams(cupWith(match)))).toBe(
      'Time TB 0 a 1 Time TC por W.O. — Menos de 3 jogadoras em quadra.',
    );
  });

  it('descreve o shootout com o vencedor', () => {
    const match = makeFinal({
      events: [goal('p-ta1'), goal('p-tb1')],
      shootout: { home: 4, away: 3 },
    });

    expect(
      formatScoreAccessible(match, finalists, 'Time TA', 'Time TB', playerTeams(cupWith(match))),
    ).toBe(
      'Time TA 1 a 1 Time TB no tempo normal; 4 a 3 nos pênaltis; vitória de Time TA.',
    );
  });

  it('descreve partida agendada sem placar', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'scheduled',
    });

    expect(formatScoreAccessible(match, null, 'Time TA', 'Time TB', playerTeams(cupWith(match)))).toBe(
      'Partida agendada; placar a definir.',
    );
  });

  it('descreve partida adiada', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'postponed',
      startsAt: null,
    });

    expect(formatScoreAccessible(match, null, 'Time TA', 'Time TB', playerTeams(cupWith(match)))).toBe(
      'Partida adiada.',
    );
  });

  it('explica a final sem finalistas', () => {
    const match = makeFinal({ status: 'scheduled' });

    expect(formatScoreAccessible(match, null, 'A definir', 'A definir', playerTeams(cupWith(match)))).toBe(
      'Confrontos a definir; a fase final depende das 6 partidas da classificatória.',
    );
  });
});

describe('formatStatus', () => {
  const now = new Date('2026-11-24T18:00:00-03:00');

  it('mostra "Encerrada" para partida finalizada', () => {
    expect(formatStatus(makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb' }), now)).toBe(
      'Encerrada',
    );
  });

  it('mostra "Adiada" para partida adiada', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'postponed',
      startsAt: null,
    });

    expect(formatStatus(match, now)).toBe('Adiada');
  });

  it('mostra "Agendada" para partida futura', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'scheduled',
      startsAt: '2026-11-24T19:00:00-03:00',
    });

    expect(formatStatus(match, now)).toBe('Agendada');
  });

  it('mostra "Resultado pendente" para partida agendada vencida', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'scheduled',
      startsAt: '2026-11-24T17:00:00-03:00',
    });

    expect(formatStatus(match, now)).toBe('Resultado pendente');
  });

  it('considera a data local de São Paulo quando não há horário', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      status: 'scheduled',
      date: '2026-11-24',
      startsAt: null,
    });

    expect(formatStatus(match, new Date('2026-11-25T02:00:00Z'))).toBe('Agendada');
    expect(formatStatus(match, new Date('2026-11-25T03:00:00Z'))).toBe(
      'Resultado pendente',
    );
  });
});

describe('walkoverReasonLabel', () => {
  it('traduz os motivos de W.O.', () => {
    expect(walkoverReasonLabel('no_show')).toBe('Não compareceu');
    expect(walkoverReasonLabel('insufficient_players')).toBe(
      'Menos de 3 jogadoras em quadra',
    );
    expect(walkoverReasonLabel('withdrawal')).toBe('Desistência');
  });
});
