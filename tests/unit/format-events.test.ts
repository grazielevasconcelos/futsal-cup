import { describe, expect, it } from 'vitest';

import { sortEvents } from '../../src/lib/domain/events';
import { buildPlayerTeamMap, buildTeamMap } from '../../src/lib/domain/players';
import { formatStage } from '../../src/lib/format/match';
import { buildEventViews } from '../../src/lib/format/events';
import {
  domainPlayer,
  domainTeam,
  goal,
  makeCompetition,
  makeFinal,
  makeGroupMatch,
  ownGoal,
  red,
  yellow,
} from '../factories/domain';

describe('sortEvents', () => {
  it('TST-072: ordena por minuto e mantém a ordem do arquivo no empate', () => {
    const first = goal('p-ta1', { minute: 10 });
    const second = goal('p-ta1', { minute: null });
    const third = goal('p-ta1', { minute: 10 });

    expect(sortEvents([first, second, third])).toEqual([first, third, second]);
  });
});

describe('buildEventViews', () => {
  it('descreve gol, pênalti e assistência', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: [goal('p-ta1', { assistPlayerId: 'p-ta2', minute: 12, penalty: true })],
    });
    const competition = makeCompetition({
      teams: [
        domainTeam('ta', [domainPlayer('ta', 1), domainPlayer('ta', 2)]),
        domainTeam('tb'),
        domainTeam('tc'),
      ],
      matches: [match],
    });
    const views = buildEventViews(
      match,
      null,
      buildPlayerTeamMap(competition),
      buildTeamMap(competition),
    );

    expect(views).toHaveLength(1);
    expect(views[0]?.kind).toBe('goal');
    expect(views[0]?.minute).toBe('12 min');
    expect(views[0]?.description).toBe('Gol de TA 1 (Time TA)');
    expect(views[0]?.tags).toEqual(['Pênalti', 'Assistência de TA 2 (Time TA)']);
  });

  it('descreve gol contra com o time beneficiado', () => {
    const match = makeGroupMatch({
      id: 'g4',
      home: 'tb',
      away: 'ta',
      events: [ownGoal('p-ta1', 11)],
    });
    const competition = makeCompetition({ matches: [match] });
    const views = buildEventViews(
      match,
      null,
      buildPlayerTeamMap(competition),
      buildTeamMap(competition),
    );

    expect(views[0]?.description).toBe(
      'Gol contra de TA 1 (Time TA) — gol para Time TB',
    );
  });

  it('mostra o segundo amarelo como vermelho derivado', () => {
    const match = makeGroupMatch({
      id: 'g3',
      home: 'ta',
      away: 'tc',
      events: [yellow('p-tc1', 14), yellow('p-tc1', 22), red('p-tb1', 24)],
    });
    const competition = makeCompetition({ matches: [match] });
    const views = buildEventViews(
      match,
      null,
      buildPlayerTeamMap(competition),
      buildTeamMap(competition),
    );

    expect(views.map((view) => view.kind)).toEqual(['yellow', 'secondYellow', 'red']);
    expect(views[1]?.description).toBe(
      '2º amarelo → vermelho para TC 1 (Time TC)',
    );
  });

  it('não descreve eventos da final sem finalistas', () => {
    const match = makeFinal({ events: [goal('p-ta1')] });
    const competition = makeCompetition({ matches: [match] });

    expect(
      buildEventViews(match, null, buildPlayerTeamMap(competition), buildTeamMap(competition)),
    ).toEqual([]);
  });

  it('indica minuto não informado', () => {
    const match = makeGroupMatch({
      id: 'g1',
      home: 'ta',
      away: 'tb',
      events: [yellow('p-ta1', null)],
    });
    const competition = makeCompetition({ matches: [match] });
    const views = buildEventViews(
      match,
      null,
      buildPlayerTeamMap(competition),
      buildTeamMap(competition),
    );

    expect(views[0]?.minute).toBe('Minuto não informado');
  });
});

describe('formatStage', () => {
  it('nomeia rodadas e final', () => {
    expect(formatStage(makeGroupMatch({ id: 'g1', home: 'ta', away: 'tb' }))).toBe(
      'Rodada 1',
    );
    expect(formatStage(makeGroupMatch({ id: 'g5', home: 'tc', away: 'ta' }))).toBe(
      'Rodada 3',
    );
    expect(formatStage(makeFinal())).toBe('Final');
  });
});
