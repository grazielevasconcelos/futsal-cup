import { buildSuspensions } from '../domain/discipline';
import {
  EXPECTED_GROUP_MATCHUPS,
  ORIGINAL_MATCH_DATES,
  canonicalOrder,
} from '../domain/order';
import { buildPlayerTeamMap, isEligibleAt } from '../domain/players';
import { isGroupComplete, isSemiComplete } from '../domain/playoffs';
import { resolveMatchTeams, winnerOf } from '../domain/score';
import { DrawRequiredError, rankTeams } from '../domain/standings';
import { localDateInSaoPaulo } from '../domain/time';
import type {
  Competition,
  Event,
  GroupMatch,
  Match,
  MatchId,
  Player,
  PlayerId,
  Team,
  TeamId,
} from '../domain/types';
import {
  type ValidationIssue,
  formatValue,
  issue,
  warning,
} from './issues';
import { isValidCalendarDate } from './schema';
import { normalizeText, uniqueKey } from './text';

const TEAM_IDS: readonly TeamId[] = ['ta', 'tb', 'tc'];
const GROUP_IDS: readonly MatchId[] = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
const MATCH_IDS: readonly MatchId[] = [...GROUP_IDS, 'semi', 'final'];

export interface SemanticValidationOptions {
  readonly now?: Date;
}

export interface SemanticValidationResult {
  readonly errors: readonly ValidationIssue[];
  readonly warnings: readonly ValidationIssue[];
}

function matchIndex(matches: readonly Match[], matchId: MatchId): number {
  return matches.findIndex((match) => match.id === matchId);
}

function isGroupMatch(match: Match): match is GroupMatch {
  return match.stage === 'group';
}

function matchParticipants(
  match: Match,
  competition: Competition,
): { readonly homeTeamId: TeamId; readonly awayTeamId: TeamId } | null {
  try {
    return resolveMatchTeams(match, {
      semifinalists: competition.semifinalists,
      finalists: competition.finalists,
    });
  } catch {
    return null;
  }
}

function eventReferences(event: Event): readonly PlayerId[] {
  if (event.type === 'goal' && event.assistPlayerId !== null) {
    return [event.playerId, event.assistPlayerId];
  }
  return [event.playerId];
}

function reasonLabel(reason: 'direct' | 'secondYellow'): string {
  return reason === 'direct' ? 'vermelho direto' : 'segundo amarelo';
}

function stageForId(matchId: MatchId): Match['stage'] {
  if (matchId === 'semi') return 'semi';
  if (matchId === 'final') return 'final';
  return 'group';
}

export function validateSemantics(
  competition: Competition,
  options: SemanticValidationOptions = {},
): SemanticValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const now = options.now ?? new Date();

  const playerTeams = buildPlayerTeamMap(competition);
  const matchById = new Map<MatchId, Match>(competition.matches.map((match) => [match.id, match]));
  const groupMatches = competition.matches.filter(isGroupMatch);

  /* VAL-003 — edição/fuso */
  const edition: unknown = competition.edition;
  const timezone: unknown = competition.timezone;
  if (edition !== 2026) {
    errors.push(
      issue(
        'VAL-003',
        ['edition'],
        '2026',
        formatValue(edition),
        'A edição deve ser 2026. Corrija `edition` na fonte de dados.',
      ),
    );
  }
  if (timezone !== 'America/Sao_Paulo') {
    errors.push(
      issue(
        'VAL-003',
        ['timezone'],
        'America/Sao_Paulo',
        formatValue(timezone),
        'O fuso da competição deve ser America/Sao_Paulo.',
      ),
    );
  }

  /* VAL-004 — times */
  const teamIds = competition.teams.map((team) => team.id);
  const uniqueTeamIds = new Set(teamIds);
  const teamSetValid =
    teamIds.length === 3 &&
    uniqueTeamIds.size === 3 &&
    TEAM_IDS.every((teamId) => uniqueTeamIds.has(teamId));
  if (!teamSetValid) {
    errors.push(
      issue(
        'VAL-004',
        ['teams'],
        'Exatamente 3 times com IDs ta, tb e tc.',
        teamIds.join(', ') || '<lista vazia>',
        `A competição deve ter exatamente 3 times com IDs ta, tb e tc, sem duplicatas. Encontrado: ${teamIds.join(', ') || '<lista vazia>'}.`,
      ),
    );
  }

  /* VAL-005 — abreviações */
  const abbreviations = new Map<string, Team[]>();
  for (const team of competition.teams) {
    const key = uniqueKey(team.abbreviation);
    const group = abbreviations.get(key);
    if (group === undefined) abbreviations.set(key, [team]);
    else group.push(team);
  }
  for (const group of abbreviations.values()) {
    if (group.length < 2) continue;
    const index = competition.teams.findIndex((team) => team.id === group[1]?.id);
    errors.push(
      issue(
        'VAL-005',
        ['teams', index, 'abbreviation'],
        'Abreviações únicas entre os 3 times.',
        group.map((team) => `${team.id}: ${team.abbreviation}`).join(', '),
        `A abreviação "${group[1]?.abbreviation ?? ''}" se repete nos times ${group.map((team) => team.id).join(', ')}. Use uma abreviação única.`,
      ),
    );
  }

  /* VAL-006 — IDs de jogadora */
  const playerOccurrences = new Map<PlayerId, { team: Team; player: Player; index: number }[]>();
  for (const team of competition.teams) {
    team.players.forEach((player, index) => {
      const occurrences = playerOccurrences.get(player.id);
      const occurrence = { team, player, index };
      if (occurrences === undefined) playerOccurrences.set(player.id, [occurrence]);
      else occurrences.push(occurrence);
    });
  }
  for (const [playerId, occurrences] of playerOccurrences) {
    if (occurrences.length < 2) continue;
    const last = occurrences[occurrences.length - 1];
    if (last === undefined) continue;
    const teamIndex = competition.teams.findIndex((team) => team.id === last.team.id);
    errors.push(
      issue(
        'VAL-006',
        ['teams', teamIndex, 'players', last.index, 'id'],
        'ID de jogadora único na edição.',
        occurrences.map((item) => `${item.team.id}`).join(', '),
        `O ID de jogadora ${playerId} aparece em mais de um time (${occurrences.map((item) => item.team.id).join(', ')}). Cada ID deve ser único na edição.`,
      ),
    );
  }

  /* VAL-007 — apelidos */
  for (const [teamIndex, team] of competition.teams.entries()) {
    const seen = new Map<string, Player>();
    team.players.forEach((player, playerIndex) => {
      const normalized = normalizeText(player.nickname);
      if (normalized === '') {
        errors.push(
          issue(
            'VAL-007',
            ['teams', teamIndex, 'players', playerIndex, 'nickname'],
            'Apelido não vazio.',
            formatValue(player.nickname),
            `O apelido da jogadora ${player.id} está vazio após a normalização. Preencha um apelido público.`,
          ),
        );
        return;
      }

      const key = uniqueKey(player.nickname);
      const previous = seen.get(key);
      if (previous !== undefined) {
        errors.push(
          issue(
            'VAL-007',
            ['teams', teamIndex, 'players', playerIndex, 'nickname'],
            'Apelido único dentro do time.',
            formatValue(player.nickname),
            `O apelido "${player.nickname}" se repete no time ${team.id}. Apelidos são únicos dentro do time, sem diferenciar maiúsculas de minúsculas.`,
          ),
        );
      } else {
        seen.set(key, player);
      }
    });
  }

  /* VAL-008 — intervalos do elenco */
  for (const [teamIndex, team] of competition.teams.entries()) {
    team.players.forEach((player, playerIndex) => {
      if (player.leftAt === null) return;
      if (Date.parse(player.leftAt) > Date.parse(player.joinedAt)) return;
      errors.push(
        issue(
          'VAL-008',
          ['teams', teamIndex, 'players', playerIndex, 'leftAt'],
          'leftAt posterior a joinedAt.',
          `joinedAt=${player.joinedAt}, leftAt=${player.leftAt}`,
          `A saída de ${player.id} deve ser posterior à entrada. Ajuste \`leftAt\` ou deixe o campo nulo.`,
        ),
      );
    });
  }

  /* VAL-009 — máximo de 8 ativas simultaneamente */
  const instantFormatter = (value: string): string => value;
  for (const [teamIndex, team] of competition.teams.entries()) {
    const events = team.players.flatMap((player) => {
      const list = [{ at: Date.parse(player.joinedAt), delta: 1, label: player.joinedAt }];
      if (player.leftAt !== null) {
        list.push({ at: Date.parse(player.leftAt), delta: -1, label: player.leftAt });
      }
      return list;
    });
    events.sort((a, b) => a.at - b.at || a.delta - b.delta);

    let active = 0;
    for (const event of events) {
      active += event.delta;
      if (active > 8) {
        errors.push(
          issue(
            'VAL-009',
            ['teams', teamIndex],
            'No máximo 8 jogadoras ativas simultaneamente.',
            `${active} ativas em ${instantFormatter(event.label)}`,
            `O elenco de ${team.id} tem ${active} jogadoras ativas em ${instantFormatter(event.label)}; o máximo é 8. Registre a saída de uma jogadora com \`leftAt\`.`,
          ),
        );
        break;
      }
    }
  }

  /* VAL-010 — vínculo após atuação */
  for (const [playerId, occurrence] of playerOccurrences) {
    if (occurrence.length !== 1) continue;
    const current = occurrence[0];
    if (current === undefined) continue;

    for (const [index, match] of competition.matches.entries()) {
      const participants = matchParticipants(match, competition);
      if (participants === null) continue;
      if (participants.homeTeamId === current.team.id || participants.awayTeamId === current.team.id) {
        continue;
      }

      const eventIndex = match.events.findIndex((event) =>
        eventReferences(event).includes(playerId),
      );
      if (eventIndex === -1) continue;

      errors.push(
        issue(
          'VAL-010',
          ['matches', index, 'events', eventIndex],
          `Eventos apenas em partidas do time atual (${current.team.id}).`,
          `Partida ${match.id} dos times ${participants.homeTeamId} e ${participants.awayTeamId}`,
          `A jogadora ${playerId} tem evento em uma partida de outro time, mas o vínculo atual é com ${current.team.id}. O vínculo é imutável após a primeira atuação.`,
        ),
      );
      break;
    }
  }

  /* VAL-011 — conjunto de partidas */
  const matchIds = competition.matches.map((match) => match.id);
  const uniqueMatchIds = new Set(matchIds);
  const duplicates = matchIds.filter((id, index) => matchIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(
      issue(
        'VAL-011',
        ['matches'],
        'IDs de partida únicos.',
        duplicates.join(', '),
        `Há IDs de partida duplicados: ${[...new Set(duplicates)].join(', ')}. Cada partida deve aparecer uma única vez.`,
      ),
    );
  }
  const missingMatches = MATCH_IDS.filter((id) => !uniqueMatchIds.has(id));
  const extraMatches = [...uniqueMatchIds].filter((id) => !MATCH_IDS.includes(id));
  if (
    missingMatches.length > 0 ||
    extraMatches.length > 0 ||
    matchIds.length !== MATCH_IDS.length
  ) {
    errors.push(
      issue(
        'VAL-011',
        ['matches'],
        'Exatamente g1, g2, g3, g4, g5, g6, semi e final.',
        matchIds.join(', ') || '<lista vazia>',
        `O conjunto de partidas deve ser exatamente g1…g6, semi e final. Ausentes: ${missingMatches.join(', ') || 'nenhuma'}. Inesperadas: ${extraMatches.join(', ') || 'nenhuma'}.`,
      ),
    );
  }
  for (const [index, match] of competition.matches.entries()) {
    const expectedStage = stageForId(match.id);
    if (match.stage !== expectedStage) {
      errors.push(
        issue(
          'VAL-011',
          ['matches', index, 'stage'],
          `stage "${expectedStage}" para ${match.id}.`,
          formatValue(match.stage),
          `A partida ${match.id} deve ter stage "${expectedStage}".`,
        ),
      );
    }
    if (match.stage === 'group') {
      const expected = EXPECTED_GROUP_MATCHUPS[match.id as keyof typeof EXPECTED_GROUP_MATCHUPS];
      if (expected !== undefined && match.round !== expected.round) {
        errors.push(
          issue(
            'VAL-011',
            ['matches', index, 'round'],
            `Rodada ${expected.round} para ${match.id}.`,
            formatValue(match.round),
            `A partida ${match.id} pertence à rodada ${expected.round}. Corrija \`round\`.`,
          ),
        );
      }
    }
  }

  /* VAL-012 — confrontos do grupo */
  for (const [matchId, expected] of Object.entries(EXPECTED_GROUP_MATCHUPS)) {
    const index = matchIndex(competition.matches, matchId as MatchId);
    if (index === -1) continue;
    const match = competition.matches[index];
    if (match === undefined || match.stage !== 'group') continue;

    if (match.homeTeamId === match.awayTeamId) {
      errors.push(
        issue(
          'VAL-012',
          ['matches', index],
          'Dois times diferentes.',
          `${match.homeTeamId} x ${match.awayTeamId}`,
          `A partida ${matchId} tem o mesmo time dos dois lados. Corrija os participantes.`,
        ),
      );
      continue;
    }

    if (match.homeTeamId !== expected.homeTeamId || match.awayTeamId !== expected.awayTeamId) {
      errors.push(
        issue(
          'VAL-012',
          ['matches', index],
          `${expected.homeTeamId} x ${expected.awayTeamId}`,
          `${match.homeTeamId} x ${match.awayTeamId}`,
          `O confronto de ${matchId} deve ser ${expected.homeTeamId} x ${expected.awayTeamId}. O turno e o returno têm mando definido.`,
        ),
      );
    }
  }
  for (const [first, second] of [
    ['ta', 'tb'],
    ['tb', 'tc'],
    ['ta', 'tc'],
  ] as const) {
    const pairMatches = groupMatches.filter(
      (match) =>
        (match.homeTeamId === first && match.awayTeamId === second) ||
        (match.homeTeamId === second && match.awayTeamId === first),
    );
    if (pairMatches.length !== 2) {
      errors.push(
        issue(
          'VAL-012',
          ['matches'],
          `Dois jogos entre ${first} e ${second}.`,
          `${pairMatches.length} jogo(s)`,
          `O par ${first} x ${second} deve ter um jogo em casa para cada lado (turno e returno).`,
        ),
      );
    }
  }

  /* VAL-013 — datas e horas */
  for (const [index, match] of competition.matches.entries()) {
    if (!isValidCalendarDate(match.date)) {
      errors.push(
        issue(
          'VAL-013',
          ['matches', index, 'date'],
          'Data real no formato AAAA-MM-DD.',
          formatValue(match.date),
          `A data de ${match.id} não é uma data válida.`,
        ),
      );
    }

    if (match.startsAt !== null) {
      const instant = Date.parse(match.startsAt);
      if (!Number.isFinite(instant)) {
        errors.push(
          issue(
            'VAL-013',
            ['matches', index, 'startsAt'],
            'Data/hora ISO 8601 com fuso.',
            formatValue(match.startsAt),
            `O horário de ${match.id} é inválido. Use o formato 2026-11-24T19:00:00-03:00.`,
          ),
        );
      } else {
        const localDate = localDateInSaoPaulo(new Date(instant));
        if (localDate !== match.date) {
          errors.push(
            issue(
              'VAL-013',
              ['matches', index, 'startsAt'],
              `Data local ${match.date} em America/Sao_Paulo.`,
              localDate,
              `O horário de ${match.id} cai em ${localDate} no fuso America/Sao_Paulo, mas a data da partida é ${match.date}.`,
            ),
          );
        }
      }
    }
  }
  competition.notices.forEach((notice, index) => {
    if (isValidCalendarDate(notice.date)) return;
    errors.push(
      issue(
        'VAL-013',
        ['notices', index, 'date'],
        'Data real no formato AAAA-MM-DD.',
        formatValue(notice.date),
        'A data do aviso não é uma data válida.',
      ),
    );
  });

  /* VAL-014 — status × eventos/W.O. */
  for (const [index, match] of competition.matches.entries()) {
    if (match.status === 'finished' && match.startsAt === null) {
      errors.push(
        issue(
          'VAL-014',
          ['matches', index, 'startsAt'],
          'Horário obrigatório em partida finished.',
          'null',
          `A partida ${match.id} está encerrada, mas não tem \`startsAt\`. Informe o horário real.`,
        ),
      );
    }

    if (match.status !== 'finished') {
      if (match.events.length > 0 || match.walkover !== null) {
        errors.push(
          issue(
            'VAL-014',
            ['matches', index],
            'Partida não encerrada sem eventos ou W.O.',
            [
              `${match.events.length} evento(s)`,
              match.walkover === null ? null : 'W.O.',
            ]
              .filter((item): item is string => item !== null)
              .join(', '),
            `A partida ${match.id} está ${match.status === 'postponed' ? 'adiada' : 'agendada'} e não pode ter eventos ou W.O.`,
          ),
        );
      }
    }
  }

  /* VAL-015 — ordem canônica e horários */
  const orderedWithTime = competition.matches
    .filter((match) => match.startsAt !== null)
    .slice()
    .sort((a, b) => canonicalOrder(a.id) - canonicalOrder(b.id));

  for (let index = 1; index < orderedWithTime.length; index += 1) {
    const previous = orderedWithTime[index - 1];
    const current = orderedWithTime[index];
    if (previous === undefined || current === undefined) continue;
    if (previous.startsAt === null || current.startsAt === null) continue;

    const previousInstant = Date.parse(previous.startsAt);
    const currentInstant = Date.parse(current.startsAt);
    if (!Number.isFinite(previousInstant) || !Number.isFinite(currentInstant)) continue;

    if (currentInstant <= previousInstant) {
      const currentIndex = matchIndex(competition.matches, current.id);
      errors.push(
        issue(
          'VAL-015',
          ['matches', currentIndex, 'startsAt'],
          `${current.id} depois de ${previous.id} na ordem canônica.`,
          `${current.startsAt} (${previous.id}: ${previous.startsAt})`,
          `A ordem canônica é g1 → g2 → g3 → g4 → g5 → g6 → semi → final, com horários distintos. ${current.id} não pode começar em ${current.startsAt} depois de ${previous.id} em ${previous.startsAt}.`,
        ),
      );
      break;
    }
  }

  /* VAL-016 — progressão do mata-mata */
  const groupComplete = isGroupComplete(competition);
  const semiComplete = isSemiComplete(competition);
  const semiMatch = matchById.get('semi');
  const finalMatch = matchById.get('final');

  if (semiMatch !== undefined) {
    if (semiMatch.status === 'finished' && !groupComplete) {
      errors.push(
        issue(
          'VAL-016',
          ['matches', matchIndex(competition.matches, 'semi')],
          'Grupo completo antes da semifinal.',
          'Semifinal encerrada com partidas de grupo pendentes.',
          'A semifinal não pode ser encerrada antes de as 6 partidas de grupo terminarem.',
        ),
      );
    }

    if (
      competition.semifinalists === null &&
      (semiMatch.events.length > 0 || semiMatch.walkover !== null)
    ) {
      errors.push(
        issue(
          'VAL-016',
          ['matches', matchIndex(competition.matches, 'semi')],
          'Semifinal sem dados competitivos enquanto semifinalists é nulo.',
          'Eventos ou W.O. presentes.',
          'A semifinal só pode ter eventos ou W.O. quando `semifinalists` estiver definido.',
        ),
      );
    }
  }

  if (finalMatch !== undefined) {
    if (finalMatch.status === 'finished' && !semiComplete) {
      errors.push(
        issue(
          'VAL-016',
          ['matches', matchIndex(competition.matches, 'final')],
          'Semifinal encerrada antes da final.',
          'Final encerrada com a semifinal pendente.',
          'A final não pode ser encerrada antes de a semifinal terminar.',
        ),
      );
    }

    if (
      competition.finalists === null &&
      (finalMatch.events.length > 0 || finalMatch.walkover !== null)
    ) {
      errors.push(
        issue(
          'VAL-016',
          ['matches', matchIndex(competition.matches, 'final')],
          'Final sem dados competitivos enquanto finalists é nulo.',
          'Eventos ou W.O. presentes.',
          'A final só pode ter eventos ou W.O. quando `finalists` estiver definido.',
        ),
      );
    }
  }

  /* VAL-018 (parte 1) — drawOrder válido */
  let drawOrderValid = true;
  if (competition.drawOrder !== null) {
    const drawOrder = competition.drawOrder;
    const unique = new Set(drawOrder);
    drawOrderValid =
      drawOrder.length === 3 &&
      unique.size === 3 &&
      TEAM_IDS.every((teamId) => unique.has(teamId));
    if (!drawOrderValid) {
      errors.push(
        issue(
          'VAL-018',
          ['drawOrder'],
          'Permutação dos 3 times ou null.',
          drawOrder.join(', ') || '<lista vazia>',
          '`drawOrder` deve ser uma permutação de ta, tb e tc, sem repetição, ou null.',
        ),
      );
    }
  }

  /* VAL-017 / VAL-018 — snapshots do mata-mata e sorteio */
  let ranking: ReturnType<typeof rankTeams> | null = null;
  let drawRequired = false;
  try {
    ranking = rankTeams(competition);
  } catch (error) {
    if (error instanceof DrawRequiredError) {
      drawRequired = true;
      if (groupComplete && competition.drawOrder === null) {
        errors.push(
          issue(
            'VAL-018',
            ['drawOrder'],
            'Ordem de sorteio registrada quando a classificação final empata.',
            'null',
            'A classificação final chegou ao sorteio, mas `drawOrder` não foi informado. Registre a ordem do sorteio em `drawOrder`.',
          ),
        );
      }
    } else {
      throw error;
    }
  }

  if (groupComplete) {
    if (!drawRequired && ranking !== null) {
      const second = ranking.rows[1];
      const third = ranking.rows[2];
      if (second !== undefined && third !== undefined) {
        const expected: readonly [TeamId, TeamId] = [second.teamId, third.teamId];
        if (competition.semifinalists === null) {
          errors.push(
            issue(
              'VAL-017',
              ['semifinalists'],
              `semifinalists: [${expected[0]}, ${expected[1]}]`,
              'null',
              'As 6 partidas de grupo terminaram; informe `semifinalists` com o 2º e o 3º da classificação.',
            ),
          );
        } else if (
          competition.semifinalists[0] !== expected[0] ||
          competition.semifinalists[1] !== expected[1]
        ) {
          const oldSemifinalists = competition.semifinalists.join(', ');
          errors.push(
            issue(
              'VAL-017',
              ['semifinalists'],
              `semifinalists: [${expected[0]}, ${expected[1]}]`,
              `semifinalists: [${oldSemifinalists}]`,
              `Semifinalistas divergentes da classificação. Antigos: [${oldSemifinalists}]. Novos: [${expected[0]}, ${expected[1]}]. Atualize \`semifinalists\` para confirmar a correção e explique a mudança em \`notices\`.`,
            ),
          );
        }
      }
    }
  } else if (competition.semifinalists !== null) {
    errors.push(
      issue(
        'VAL-017',
        ['semifinalists'],
        'null enquanto o grupo não termina.',
        `semifinalists: [${competition.semifinalists.join(', ')}]`,
        '`semifinalists` deve ser null enquanto as 6 partidas de grupo não terminarem.',
      ),
    );
  }

  if (semiComplete) {
    if (competition.semifinalists === null) {
      errors.push(
        issue(
          'VAL-017',
          ['semifinalists'],
          'semifinalists definidos antes de encerrar a semifinal.',
          'null',
          'A semifinal foi encerrada, mas `semifinalists` está nulo. Preencha o snapshot com o 2º e o 3º da classificação.',
        ),
      );
    } else if (!drawRequired && ranking !== null && semiMatch !== undefined) {
      const first = ranking.rows[0];
      if (first !== undefined) {
        const winner = winnerOf(
          semiMatch,
          {
            semifinalists: competition.semifinalists,
            finalists: competition.finalists,
          },
          playerTeams,
        );
        if (winner !== null) {
          const expected: readonly [TeamId, TeamId] = [first.teamId, winner];
          if (competition.finalists === null) {
            errors.push(
              issue(
                'VAL-017',
                ['finalists'],
                `finalists: [${expected[0]}, ${expected[1]}]`,
                'null',
                'A semifinal terminou; informe `finalists` com o 1º da classificação e a vencedora da semifinal.',
              ),
            );
          } else if (
            competition.finalists[0] !== expected[0] ||
            competition.finalists[1] !== expected[1]
          ) {
            const oldFinalists = competition.finalists.join(', ');
            errors.push(
              issue(
                'VAL-017',
                ['finalists'],
                `finalists: [${expected[0]}, ${expected[1]}]`,
                `finalists: [${oldFinalists}]`,
                `Finalistas divergentes da classificação e do resultado da semifinal. Antigos: [${oldFinalists}]. Novos: [${expected[0]}, ${expected[1]}]. Atualize \`finalists\` para confirmar a correção e explique a mudança em \`notices\`.`,
              ),
            );
          }
        }
      }
    }
  } else if (competition.finalists !== null) {
    errors.push(
      issue(
        'VAL-017',
        ['finalists'],
        'null enquanto a semifinal não termina.',
        `finalists: [${competition.finalists.join(', ')}]`,
        '`finalists` deve ser null enquanto a semifinal não terminar.',
      ),
    );
  }

  /* VAL-019 — elenco da partida */
  for (const [index, match] of competition.matches.entries()) {
    const participants = matchParticipants(match, competition);
    if (participants === null) continue;

    match.events.forEach((event, eventIndex) => {
      for (const reference of eventReferences(event)) {
        const occurrence = playerOccurrences.get(reference);
        const current = occurrence?.[0];
        if (current === undefined) continue;
        if (
          current.team.id === participants.homeTeamId ||
          current.team.id === participants.awayTeamId
        ) {
          continue;
        }

        errors.push(
          issue(
            'VAL-019',
            ['matches', index, 'events', eventIndex],
            `Jogadora do elenco de ${participants.homeTeamId} ou ${participants.awayTeamId}.`,
            `${reference} (time ${current.team.id})`,
            `O evento de ${match.id} referencia ${reference}, que não pertence a nenhum dos times da partida.`,
          ),
        );
      }
    });
  }

  /* VAL-020 — elegibilidade */
  for (const [index, match] of competition.matches.entries()) {
    if (match.startsAt === null) continue;
    const startsAt = Date.parse(match.startsAt);
    if (!Number.isFinite(startsAt)) continue;
    const participants = matchParticipants(match, competition);
    if (participants === null) continue;

    const checked = new Set<PlayerId>();
    match.events.forEach((event, eventIndex) => {
      for (const reference of eventReferences(event)) {
        if (checked.has(reference)) continue;
        const occurrence = playerOccurrences.get(reference);
        const current = occurrence?.[0];
        if (current === undefined) continue;
        if (
          current.team.id !== participants.homeTeamId &&
          current.team.id !== participants.awayTeamId
        ) {
          continue;
        }
        checked.add(reference);

        if (isEligibleAt(current.player, startsAt)) continue;

        errors.push(
          issue(
            'VAL-020',
            ['matches', index, 'events', eventIndex],
            'Jogadora elegível no início da partida.',
            `joinedAt=${current.player.joinedAt}, leftAt=${current.player.leftAt ?? 'null'}`,
            `${reference} não está elegível em ${match.id} (${match.startsAt}). A jogadora precisa ter joinedAt anterior e leftAt posterior ao início da partida.`,
          ),
        );
      }
    });
  }

  /* VAL-021 — assistências */
  for (const [index, match] of competition.matches.entries()) {
    match.events.forEach((event, eventIndex) => {
      if (event.type !== 'goal' || event.assistPlayerId === null) return;

      if (event.assistPlayerId === event.playerId) {
        errors.push(
          issue(
            'VAL-021',
            ['matches', index, 'events', eventIndex, 'assistPlayerId'],
            'Assistente diferente da marcadora.',
            event.assistPlayerId,
            'A assistência deve ser de outra jogadora, não da própria marcadora.',
          ),
        );
        return;
      }

      if (event.penalty) {
        errors.push(
          issue(
            'VAL-021',
            ['matches', index, 'events', eventIndex, 'assistPlayerId'],
            'Sem assistência em gol de pênalti.',
            event.assistPlayerId,
            'Gols de pênalti não têm assistência. Remova `assistPlayerId`.',
          ),
        );
        return;
      }

      const scorer = playerOccurrences.get(event.playerId)?.[0];
      const assistant = playerOccurrences.get(event.assistPlayerId)?.[0];
      if (scorer === undefined || assistant === undefined) return;

      if (scorer.team.id !== assistant.team.id) {
        errors.push(
          issue(
            'VAL-021',
            ['matches', index, 'events', eventIndex, 'assistPlayerId'],
            `Jogadora do time da marcadora (${scorer.team.id}).`,
            `${event.assistPlayerId} (time ${assistant.team.id})`,
            'A assistência deve ser do mesmo time da marcadora e não pode ser a própria marcadora.',
          ),
        );
      }
    });
  }

  /* VAL-022 — cartões */
  for (const [index, match] of competition.matches.entries()) {
    const cards = new Map<PlayerId, { yellow: number; red: number }>();
    for (const event of match.events) {
      if (event.type !== 'yellow' && event.type !== 'red') continue;
      const current = cards.get(event.playerId) ?? { yellow: 0, red: 0 };
      if (event.type === 'yellow') current.yellow += 1;
      else current.red += 1;
      cards.set(event.playerId, current);
    }

    for (const [playerId, summary] of cards) {
      const yellow = summary.yellow;
      const red = summary.red;
      if (yellow > 2) {
        errors.push(
          issue(
            'VAL-022',
            ['matches', index],
            'No máximo 2 amarelos por jogadora no mesmo jogo.',
            `${yellow} amarelos`,
            `A jogadora ${playerId} tem ${yellow} amarelos em ${match.id}. O segundo amarelo vira vermelho e não pode haver terceiro.`,
          ),
        );
      }
      if (red > 1) {
        errors.push(
          issue(
            'VAL-022',
            ['matches', index],
            'No máximo 1 vermelho direto por jogadora no mesmo jogo.',
            `${red} vermelhos`,
            `A jogadora ${playerId} tem ${red} vermelhos diretos em ${match.id}. Use no máximo um vermelho ou dois amarelos.`,
          ),
        );
      }
      if (red >= 1 && yellow >= 2) {
        errors.push(
          issue(
            'VAL-022',
            ['matches', index],
            'Sem vermelho explícito junto de dois amarelos.',
            `${red} vermelho(s) e ${yellow} amarelo(s)`,
            `A jogadora ${playerId} tem vermelho explícito e dois amarelos em ${match.id}. O segundo amarelo já deriva o vermelho.`,
          ),
        );
      }
    }
  }

  /* VAL-023 — suspensão */
  for (const suspension of buildSuspensions(competition)) {
    if (suspension.suspendedFor === null) continue;
    const suspendedMatch = matchById.get(suspension.suspendedFor);
    if (suspendedMatch === undefined) continue;
    const index = matchIndex(competition.matches, suspendedMatch.id);

    const eventIndex = suspendedMatch.events.findIndex((event) =>
      eventReferences(event).includes(suspension.playerId),
    );
    if (eventIndex === -1) continue;

    errors.push(
      issue(
        'VAL-023',
        ['matches', index, 'events', eventIndex],
        `Nenhum evento de ${suspension.playerId} em ${suspendedMatch.id}.`,
        suspension.playerId,
        `${suspension.playerId} (${suspension.teamId}) está suspensa por ${reasonLabel(suspension.reason)} em ${suspension.sentOffIn} e não pode ter eventos em ${suspendedMatch.id}.`,
      ),
    );
  }

  /* VAL-024 — W.O. */
  for (const [index, match] of competition.matches.entries()) {
    if (match.walkover === null) continue;
    const walkover = match.walkover;

    if (match.status !== 'finished') {
      errors.push(
        issue(
          'VAL-024',
          ['matches', index, 'walkover'],
          'W.O. apenas em partida finished.',
          match.status,
          `A partida ${match.id} tem W.O., mas não está encerrada.`,
        ),
      );
    }

    const participants = matchParticipants(match, competition);
    if (participants === null) {
      errors.push(
        issue(
          'VAL-024',
          ['matches', index, 'walkover'],
          'Participantes definidos pelo snapshot antes do W.O.',
          'Sem participantes definidos.',
          `A partida ${match.id} tem W.O., mas os participantes ainda não estão definidos. Preencha o snapshot correspondente.`,
        ),
      );
      continue;
    }
    if (
      walkover.winnerTeamId !== participants.homeTeamId &&
      walkover.winnerTeamId !== participants.awayTeamId
    ) {
      errors.push(
        issue(
          'VAL-024',
          ['matches', index, 'walkover', 'winnerTeamId'],
          `Vencedor entre ${participants.homeTeamId} e ${participants.awayTeamId}.`,
          walkover.winnerTeamId,
          `O W.O. de ${match.id} aponta um vencedor que não participa da partida.`,
        ),
      );
    }
  }

  /* VAL-028 — referências */
  for (const [index, match] of competition.matches.entries()) {
    match.events.forEach((event, eventIndex) => {
      for (const reference of eventReferences(event)) {
        if (playerOccurrences.has(reference)) continue;
        errors.push(
          issue(
            'VAL-028',
            ['matches', index, 'events', eventIndex, 'playerId'],
            'ID de jogadora existente na edição.',
            reference,
            `O evento de ${match.id} referencia ${reference}, que não existe em nenhum time. Corrija o ID ou remova o evento.`,
          ),
        );
      }
    });
  }

  /* VAL-029 — eventos de W.O. */
  for (const [index, match] of competition.matches.entries()) {
    if (match.walkover === null) continue;

    if (match.walkover.reason === 'no_show' && match.events.length > 0) {
      errors.push(
        issue(
          'VAL-029',
          ['matches', index, 'events'],
          'Nenhum evento em W.O. por no_show.',
          `${match.events.length} evento(s)`,
          `O W.O. de ${match.id} é por não comparecimento e não pode ter cartões, gols ou assistências.`,
        ),
      );
    }

    if (
      (match.walkover.reason === 'insufficient_players' ||
        match.walkover.reason === 'withdrawal') &&
      match.events.some((event) => event.type === 'goal' || event.type === 'ownGoal')
    ) {
      errors.push(
        issue(
          'VAL-029',
          ['matches', index, 'events'],
          'Apenas cartões em W.O. por elenco insuficiente ou desistência.',
          'Gol ou gol contra presente.',
          `O W.O. de ${match.id} não pode ter gols ou assistências; apenas cartões são permitidos nesse motivo.`,
        ),
      );
    }
  }

  /* VAL-031 — avisos */
  competition.notices.forEach((notice, index) => {
    const normalized = normalizeText(notice.message);
    if (normalized !== '' && notice.message.length <= 300) return;
    errors.push(
      issue(
        'VAL-031',
        ['notices', index, 'message'],
        'Mensagem não vazia, com até 300 caracteres.',
        formatValue(notice.message),
        'O texto do aviso está vazio ou longo demais. Use uma mensagem curta e informativa.',
      ),
    );
  });

  /* VAL-W01 — elenco abaixo de 7 ativas */
  for (const team of competition.teams) {
    const active = team.players.filter((player) => player.leftAt === null).length;
    if (active >= 7) continue;
    warnings.push(
      warning(
        'VAL-W01',
        ['teams', competition.teams.findIndex((item) => item.id === team.id)],
        '7 ou 8 jogadoras ativas.',
        `${active} ativas`,
        `Time ${team.name} tem ${active} jogadoras ativas; o alvo é 7 ou 8. A publicação não é bloqueada.`,
      ),
    );
  }

  /* VAL-W02 — fora do calendário original */
  for (const [index, match] of competition.matches.entries()) {
    if (match.status === 'postponed') continue;
    const originalDate = ORIGINAL_MATCH_DATES[match.id];
    if (match.date === originalDate) continue;
    warnings.push(
      warning(
        'VAL-W02',
        ['matches', index, 'date'],
        `Data original ${originalDate}.`,
        match.date,
        `Partida ${match.id} está em ${match.date}, fora do calendário original (${originalDate}). Confirme o adiamento.`,
      ),
    );
  }

  /* VAL-W03 — nomes de time duplicados */
  for (let first = 0; first < competition.teams.length; first += 1) {
    const a = competition.teams[first];
    if (a === undefined) continue;
    for (let second = first + 1; second < competition.teams.length; second += 1) {
      const b = competition.teams[second];
      if (b === undefined) continue;
      if (uniqueKey(a.name) !== uniqueKey(b.name)) continue;
      warnings.push(
        warning(
          'VAL-W03',
          ['teams', second, 'name'],
          'Nomes públicos distintos.',
          formatValue(b.name),
          `Os times ${a.id} e ${b.id} têm o mesmo nome; a abreviação distingue, mas confirme o nome público.`,
        ),
      );
    }
  }

  /* VAL-W04 — partida agendada no passado */
  const today = localDateInSaoPaulo(now);
  for (const [index, match] of competition.matches.entries()) {
    if (match.status !== 'scheduled') continue;
    const past =
      match.startsAt !== null
        ? Date.parse(match.startsAt) < now.getTime()
        : match.date < today;
    if (!past) continue;
    warnings.push(
      warning(
        'VAL-W04',
        ['matches', index],
        'Partida agendada no futuro.',
        match.startsAt ?? match.date,
        `Partida ${match.id} está agendada, mas a data passou. A UI mostrará “Resultado pendente”.`,
      ),
    );
  }

  return { errors, warnings };
}
