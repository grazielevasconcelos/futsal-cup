import { describe, expect, it } from 'vitest';

import { loadCompetition } from '../../src/lib/data/load';
import { buildPlayerTeamMap } from '../../src/lib/domain/players';
import {
  formatScore,
  formatScoreAccessible,
  formatStatus,
  walkoverReasonLabel,
} from '../../src/lib/format/match';
import type { Competition, Match, PlayoffSnapshots } from '../../src/lib/domain/types';
import {
  goal,
  goalsFor,
  makeCompetition,
  makeFinal,
  makeGroupMatch,
  makeSemi,
} from '../factories/domain';

const snapshots: PlayoffSnapshots = {
  semifinalists: ['ta', 'tb'],
  finalists: ['tc', 'ta'],
};

function cupWith(...matches: readonly Match[]): Competition {
  return makeCompetition({ matches });
}

function playerTeams(competition: Competition) {
  return buildPlayerTeamMap(competition);
}

function snapshotsOf(competition: Competition): PlayoffSnapshots {
  return {
    semifinalists: competition.semifinalists,
    finalists: competition.finalists,
  };
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

  it('mostra "Confrontos a definir" para a semifinal sem semifinalistas', () => {
    const match = makeSemi();

    expect(
      formatScore(
        match,
        { semifinalists: null, finalists: ['tc', 'ta'] },
        playerTeams(cupWith(match)),
      ),
    ).toBe('Confrontos a definir');
  });

  it('mostra "Confrontos a definir" para a final sem finalistas', () => {
    const match = makeFinal();

    expect(
      formatScore(
        match,
        { semifinalists: ['ta', 'tb'], finalists: null },
        playerTeams(cupWith(match)),
      ),
    ).toBe('Confrontos a definir');
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

  it('mostra o W.O. da final na ordem mandante/visitante', () => {
    const match = makeFinal({
      walkover: { winnerTeamId: 'ta', reason: 'no_show', note: null },
      events: [],
    });

    expect(formatScore(match, snapshots, playerTeams(cupWith(match)))).toBe('0 x 1 (W.O.)');
  });

  it('resolve a semifinal pela ordem dos semifinalistas', () => {
    const match = makeSemi({
      events: [...goalsFor('ta', 2), ...goalsFor('tb', 1)],
    });

    expect(
      formatScore(
        match,
        { semifinalists: ['ta', 'tb'], finalists: null },
        playerTeams(cupWith(match)),
      ),
    ).toBe('2 x 1');
  });

  it('resolve a final pela ordem dos finalistas', () => {
    const match = makeFinal({
      events: [...goalsFor('tc', 1), ...goalsFor('ta', 1)],
    });

    expect(
      formatScore(
        match,
        { semifinalists: ['ta', 'tb'], finalists: ['tc', 'ta'] },
        playerTeams(cupWith(match)),
      ),
    ).toBe('1 x 1');
  });

  it('usa a ordem dos finalistas para o mando da final', () => {
    const match = makeFinal({ events: [goal('p-tc1')] });
    const teams = playerTeams(cupWith(match));

    expect(
      formatScore(
        match,
        { semifinalists: ['ta', 'tb'], finalists: ['tc', 'ta'] },
        teams,
      ),
    ).toBe('1 x 0');
    expect(
      formatScore(
        match,
        { semifinalists: ['ta', 'tb'], finalists: ['ta', 'tc'] },
        teams,
      ),
    ).toBe('0 x 1');
  });

  it('formata o W.O. e o empate da final da fonte real', () => {
    const competition = loadCompetition('tests/fixtures/valida.yaml');
    const teams = playerTeams(competition);
    const walkover = competition.matches.find((match) => match.id === 'g3') as Match;
    const final = competition.matches.find((match) => match.id === 'final') as Match;

    expect(formatScore(walkover, null, teams)).toBe('0 x 1 (W.O.)');
    expect(formatScore(final, snapshotsOf(competition), teams)).toBe('1 x 1');
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

  it('descreve a semifinal resolvida pelos semifinalistas', () => {
    const match = makeSemi({
      events: [...goalsFor('ta', 1), ...goalsFor('tb', 2)],
    });

    expect(
      formatScoreAccessible(
        match,
        { semifinalists: ['ta', 'tb'], finalists: null },
        'Time TA',
        'Time TB',
        playerTeams(cupWith(match)),
      ),
    ).toBe('Time TA 1 a 2 Time TB.');
  });

  it('descreve a final resolvida pelos finalistas', () => {
    const match = makeFinal({ events: [goal('p-tc1')] });

    expect(
      formatScoreAccessible(
        match,
        { semifinalists: ['ta', 'tb'], finalists: ['tc', 'ta'] },
        'Time TC',
        'Time TA',
        playerTeams(cupWith(match)),
      ),
    ).toBe('Time TC 1 a 0 Time TA.');
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

  it('explica a semifinal sem semifinalistas', () => {
    const match = makeSemi({ status: 'scheduled' });

    expect(
      formatScoreAccessible(
        match,
        { semifinalists: null, finalists: ['tc', 'ta'] },
        'A definir',
        'A definir',
        playerTeams(cupWith(match)),
      ),
    ).toBe('Confrontos a definir; a fase final depende da etapa anterior.');
  });

  it('explica a final sem finalistas', () => {
    const match = makeFinal({ status: 'scheduled' });

    expect(
      formatScoreAccessible(
        match,
        { semifinalists: ['ta', 'tb'], finalists: null },
        'A definir',
        'Vencedora da semifinal',
        playerTeams(cupWith(match)),
      ),
    ).toBe('Confrontos a definir; a fase final depende da etapa anterior.');
  });

  it('explica a semifinal empatada com a vantagem do 2º colocado', () => {
    const match = makeSemi({
      events: [...goalsFor('ta', 1), ...goalsFor('tb', 1)],
    });

    expect(
      formatScoreAccessible(match, snapshots, 'Time TA', 'Time TB', playerTeams(cupWith(match))),
    ).toBe('Time TA 1 a 1 Time TB no tempo normal; Time TA avança pela vantagem do empate.');
  });

  it('explica a final empatada com a vantagem do 1º colocado', () => {
    const match = makeFinal({
      events: [...goalsFor('tc', 1), ...goalsFor('ta', 1)],
    });

    expect(
      formatScoreAccessible(match, snapshots, 'Time TC', 'Time TA', playerTeams(cupWith(match))),
    ).toBe(
      'Time TC 1 a 1 Time TA no tempo normal; Time TC conquista o título pela vantagem do empate.',
    );
  });

  it('descreve o W.O. da final com vencedor visitante', () => {
    const match = makeFinal({
      walkover: { winnerTeamId: 'ta', reason: 'no_show', note: null },
      events: [],
    });

    expect(
      formatScoreAccessible(match, snapshots, 'Time TC', 'Time TA', playerTeams(cupWith(match))),
    ).toBe('Time TC 0 a 1 Time TA por W.O. — Não compareceu.');
  });

  it('descreve o empate da final da fonte real', () => {
    const competition = loadCompetition('tests/fixtures/valida.yaml');
    const match = competition.matches.find((item) => item.id === 'final') as Match;

    expect(
      formatScoreAccessible(
        match,
        snapshotsOf(competition),
        'Time C',
        'Time B',
        playerTeams(competition),
      ),
    ).toBe(
      'Time C 1 a 1 Time B no tempo normal; Time C conquista o título pela vantagem do empate.',
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
