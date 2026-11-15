import type {
  Competition,
  Event,
  FinalStageMatch,
  GroupMatch,
  GroupMatchId,
  MatchStatus,
  Player,
  PlayerId,
  Shootout,
  Team,
  TeamId,
  Walkover,
} from '../../src/lib/domain/types';

export const DOMAIN_TEAM_IDS: readonly TeamId[] = ['ta', 'tb', 'tc'];

const DEFAULT_JOINED_AT = '2026-01-01T00:00:00-03:00';

const ROUNDS: Readonly<Record<GroupMatchId, 1 | 2 | 3>> = {
  g1: 1,
  g2: 1,
  g3: 2,
  g4: 2,
  g5: 3,
  g6: 3,
};

export function domainPlayer(
  teamId: TeamId,
  index = 1,
  overrides: Partial<Player> = {},
): Player {
  return {
    id: `p-${teamId}${index}` as PlayerId,
    nickname: `${teamId.toUpperCase()} ${index}`,
    position: 'linha',
    joinedAt: DEFAULT_JOINED_AT,
    leftAt: null,
    ...overrides,
  };
}

export function domainTeam(id: TeamId, players?: readonly Player[]): Team {
  return {
    id,
    name: `Time ${id.toUpperCase()}`,
    abbreviation: id.toUpperCase(),
    players: players ?? [domainPlayer(id)],
  };
}

export function domainTeams(): readonly Team[] {
  return DOMAIN_TEAM_IDS.map((id) => domainTeam(id));
}

export function goal(
  playerId: PlayerId,
  options: {
    readonly assistPlayerId?: PlayerId | null;
    readonly minute?: number | null;
    readonly penalty?: boolean;
  } = {},
): Event {
  return {
    type: 'goal',
    playerId,
    assistPlayerId: options.assistPlayerId ?? null,
    minute: options.minute ?? null,
    penalty: options.penalty ?? false,
  };
}

export function ownGoal(playerId: PlayerId, minute: number | null = null): Event {
  return { type: 'ownGoal', playerId, minute };
}

export function yellow(playerId: PlayerId, minute: number | null = null): Event {
  return { type: 'yellow', playerId, minute };
}

export function red(playerId: PlayerId, minute: number | null = null): Event {
  return { type: 'red', playerId, minute };
}

export function goalsFor(
  teamId: TeamId,
  count: number,
  options: Parameters<typeof goal>[1] = {},
): readonly Event[] {
  return Array.from({ length: count }, () => goal(`p-${teamId}1` as PlayerId, options));
}

export interface GroupMatchInput {
  readonly id: GroupMatchId;
  readonly home: TeamId;
  readonly away: TeamId;
  readonly events?: readonly Event[];
  readonly status?: MatchStatus;
  readonly date?: string;
  readonly startsAt?: string | null;
  readonly walkover?: Walkover | null;
  readonly shootout?: Shootout | null;
}

export function makeGroupMatch(input: GroupMatchInput): GroupMatch {
  return {
    id: input.id,
    stage: 'group',
    round: ROUNDS[input.id],
    homeTeamId: input.home,
    awayTeamId: input.away,
    date: input.date ?? '2026-11-24',
    startsAt:
      input.startsAt === undefined ? '2026-11-24T19:00:00-03:00' : input.startsAt,
    venue: null,
    status: input.status ?? 'finished',
    walkover: input.walkover ?? null,
    shootout: input.shootout ?? null,
    events: input.events ?? [],
  };
}

export interface FinalMatchInput {
  readonly events?: readonly Event[];
  readonly status?: MatchStatus;
  readonly date?: string;
  readonly startsAt?: string | null;
  readonly walkover?: Walkover | null;
  readonly shootout?: Shootout | null;
}

export function makeFinal(input: FinalMatchInput = {}): FinalStageMatch {
  return {
    id: 'final',
    stage: 'final',
    round: null,
    date: input.date ?? '2026-12-03',
    startsAt:
      input.startsAt === undefined ? '2026-12-03T20:30:00-03:00' : input.startsAt,
    venue: null,
    status: input.status ?? 'finished',
    walkover: input.walkover ?? null,
    shootout: input.shootout ?? null,
    events: input.events ?? [],
  };
}

export function makeCompetition(overrides: Partial<Competition> = {}): Competition {
  return {
    edition: 2026,
    timezone: 'America/Sao_Paulo',
    teams: domainTeams(),
    matches: [],
    finalists: null,
    drawOrder: null,
    friendly: null,
    notices: [],
    ...overrides,
  };
}
