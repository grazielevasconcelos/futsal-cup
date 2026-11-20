import { z } from 'zod';

import type { PlayerId } from '../domain/types';

/* ---------- primitivos ---------- */

export function isValidCalendarDate(value: string): boolean {
  const parts = value.split('-');
  if (parts.length !== 3) return false;
  const [yearPart, monthPart, dayPart] = parts;
  if (yearPart === undefined || monthPart === undefined || dayPart === undefined) return false;
  const y = Number(yearPart);
  const m = Number(monthPart);
  const d = Number(dayPart);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

const isoDateTime = z.string().refine((value) => {
  const match =
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(
      value,
    );
  if (!match) return false;
  const [, date, hh, mm, ss, , offH, offM] = match;
  if (date === undefined || hh === undefined || mm === undefined || ss === undefined) return false;
  if (!isValidCalendarDate(date)) return false;
  if (Number(hh) > 23 || Number(mm) > 59 || Number(ss) > 59) return false;
  if (offH !== undefined && (Number(offH) > 23 || Number(offM) > 59)) return false;
  return Number.isFinite(Date.parse(value));
}, 'Data/hora inválida: use ISO 8601 com fuso, como 2026-11-24T19:00:00-03:00.');

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida: use AAAA-MM-DD.')
  .refine(isValidCalendarDate, 'Data inválida: use AAAA-MM-DD com dia real.');

export const teamId = z.enum(['ta', 'tb', 'tc']);
export const playerId = z
  .string()
  .regex(/^p-\d{3}$/, 'ID de jogadora inválido: esperado p-001.')
  .transform((value): PlayerId => value as PlayerId);
const position = z.enum(['goleira', 'linha']).nullable();
const status = z.enum(['scheduled', 'finished', 'postponed']);
const walkoverReason = z.enum(['no_show', 'insufficient_players', 'withdrawal']);
const minute = z.number().int().min(0).nullable().default(null);

/* ---------- jogadora e time ---------- */

const playerSchema = z
  .object({
    id: playerId,
    nickname: z.string().min(1).max(40),
    position,
    joinedAt: isoDateTime,
    leftAt: isoDateTime.nullable(),
  })
  .strict();

const teamSchema = z
  .object({
    id: teamId,
    name: z.string().min(1).max(60),
    abbreviation: z
      .string()
      .regex(/^[A-Z0-9]{1,5}$/, 'Abreviação inválida: use 1 a 5 caracteres A-Z ou 0-9.'),
    players: z.array(playerSchema),
  })
  .strict();

/* ---------- eventos ---------- */

const goalEventSchema = z
  .object({
    type: z.literal('goal'),
    playerId,
    assistPlayerId: playerId.nullable().default(null),
    minute,
    penalty: z.boolean(),
  })
  .strict();

const ownGoalEventSchema = z
  .object({
    type: z.literal('ownGoal'),
    playerId,
    minute,
  })
  .strict();

const cardEventSchema = z
  .object({
    type: z.enum(['yellow', 'red']),
    playerId,
    minute,
  })
  .strict();

const eventSchema = z.discriminatedUnion('type', [
  goalEventSchema,
  ownGoalEventSchema,
  cardEventSchema,
]);

/* ---------- partidas ---------- */

const walkoverSchema = z
  .object({
    winnerTeamId: teamId,
    reason: walkoverReason,
    note: z.string().min(1).max(200).nullable().default(null),
  })
  .strict();

const matchBaseShape = {
  date: dateOnly,
  startsAt: isoDateTime.nullable(),
  venue: z.string().min(1).max(120).nullable(),
  status,
  walkover: walkoverSchema.nullable(),
  events: z.array(eventSchema),
} as const;

const groupMatchSchema = z
  .object({
    id: z.enum(['g1', 'g2', 'g3', 'g4', 'g5', 'g6']),
    stage: z.literal('group'),
    round: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    homeTeamId: teamId,
    awayTeamId: teamId,
    ...matchBaseShape,
  })
  .strict();

const semiFinalMatchSchema = z
  .object({
    id: z.literal('semi'),
    stage: z.literal('semi'),
    round: z.null(),
    ...matchBaseShape,
  })
  .strict();

const finalMatchSchema = z
  .object({
    id: z.literal('final'),
    stage: z.literal('final'),
    round: z.null(),
    ...matchBaseShape,
  })
  .strict();

const matchSchema = z.discriminatedUnion('stage', [
  groupMatchSchema,
  semiFinalMatchSchema,
  finalMatchSchema,
]);

/* ---------- envelope ---------- */

const semifinalistsSchema = z.tuple([teamId, teamId]);
const finalistsSchema = z.tuple([teamId, teamId]);

const noticeSchema = z
  .object({
    date: dateOnly,
    message: z.string().min(1).max(300),
  })
  .strict();

export const competitionSchema = z
  .object({
    edition: z.literal(2026),
    timezone: z.literal('America/Sao_Paulo'),
    teams: z.array(teamSchema).length(3),
    matches: z.array(matchSchema).length(8),
    semifinalists: semifinalistsSchema.nullable(),
    finalists: finalistsSchema.nullable(),
    drawOrder: z.array(teamId).length(3).nullable(),
    notices: z.array(noticeSchema),
  })
  .strict();

export type CompetitionInput = z.input<typeof competitionSchema>;
