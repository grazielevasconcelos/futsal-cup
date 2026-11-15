export type TeamId = 'ta' | 'tb' | 'tc';
export type PlayerId = `p-${string}`;
export type MatchId = 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'final';
export type GroupMatchId = Exclude<MatchId, 'final'>;
export type Stage = 'group' | 'final';
export type MatchStatus = 'scheduled' | 'finished' | 'postponed';
export type Position = 'goleira' | 'linha' | null;
export type WalkoverReason = 'no_show' | 'insufficient_players' | 'withdrawal';

export interface Player {
  readonly id: PlayerId;
  readonly nickname: string;
  readonly position: Position;
  readonly joinedAt: string;
  readonly leftAt: string | null;
}

export interface Team {
  readonly id: TeamId;
  readonly name: string;
  readonly abbreviation: string;
  readonly players: readonly Player[];
}

export interface Walkover {
  readonly winnerTeamId: TeamId;
  readonly reason: WalkoverReason;
  readonly note: string | null;
}

export interface Shootout {
  readonly home: number;
  readonly away: number;
}

export type Event =
  | {
      readonly type: 'goal';
      readonly playerId: PlayerId;
      readonly assistPlayerId: PlayerId | null;
      readonly minute: number | null;
      readonly penalty: boolean;
    }
  | { readonly type: 'ownGoal'; readonly playerId: PlayerId; readonly minute: number | null }
  | { readonly type: 'yellow'; readonly playerId: PlayerId; readonly minute: number | null }
  | { readonly type: 'red'; readonly playerId: PlayerId; readonly minute: number | null };

interface MatchBase {
  readonly id: MatchId;
  readonly stage: Stage;
  readonly date: string;
  readonly startsAt: string | null;
  readonly venue: string | null;
  readonly status: MatchStatus;
  readonly walkover: Walkover | null;
  readonly shootout: Shootout | null;
  readonly events: readonly Event[];
}

export interface GroupMatch extends MatchBase {
  readonly stage: 'group';
  readonly round: 1 | 2 | 3;
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
}

export interface FinalStageMatch extends MatchBase {
  readonly stage: 'final';
  readonly round: null;
}

export type Match = GroupMatch | FinalStageMatch;

export type ResolvedMatch = Match & {
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
};

export interface Finalists {
  readonly final: readonly [TeamId, TeamId];
}

export interface Friendly {
  readonly date: string;
  readonly startsAt: string;
  readonly venue: string;
  readonly note: string;
}

export interface Notice {
  readonly date: string;
  readonly message: string;
}

export interface Competition {
  readonly edition: 2026;
  readonly timezone: 'America/Sao_Paulo';
  readonly teams: readonly Team[];
  readonly matches: readonly Match[];
  readonly finalists: Finalists | null;
  readonly drawOrder: readonly TeamId[] | null;
  readonly friendly: Friendly | null;
  readonly notices: readonly Notice[];
}

/* ---------- tipos derivados ---------- */

export interface Score {
  readonly home: number;
  readonly away: number;
  readonly kind: 'normal' | 'walkover';
}

export interface StandingRow {
  readonly position: number;
  readonly teamId: TeamId;
  readonly points: number;
  readonly played: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly yellow: number;
  readonly red: number;
  readonly disciplinaryPoints: number;
  readonly decidedByDraw: boolean;
}

export interface RankingResult {
  readonly rows: readonly StandingRow[];
  readonly drawTeams: ReadonlySet<TeamId>;
  readonly provisional: boolean;
}

export interface PlayerStats {
  readonly playerId: PlayerId;
  readonly nickname: string;
  readonly teamId: TeamId;
  readonly goals: number;
  readonly assists: number;
  readonly ownGoals: number;
  readonly yellow: number;
  readonly red: number;
  readonly disciplinaryPoints: number;
  readonly active: boolean;
}

export interface TeamStats {
  readonly teamId: TeamId;
  readonly played: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly shootoutWins: number;
  readonly shootoutLosses: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly yellow: number;
  readonly red: number;
  readonly disciplinaryPoints: number;
}

export interface Suspension {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly reason: 'direct' | 'secondYellow';
  readonly sentOffIn: MatchId;
  readonly suspendedFor: MatchId | null;
  readonly pendingFinalists: boolean;
}

export interface Podium {
  readonly champion: TeamId | null;
  readonly runnerUp: TeamId | null;
  readonly third: TeamId | null;
}

export interface FriendlyCard {
  readonly title: string;
  readonly date: string;
  readonly startsAt: string;
  readonly venue: string;
  readonly note: string;
  readonly informational: true;
}

/* ---------- contexto de elenco ---------- */

export interface PlayerTeam {
  readonly player: Player;
  readonly team: Team;
}

export type PlayerTeamMap = ReadonlyMap<PlayerId, PlayerTeam>;
