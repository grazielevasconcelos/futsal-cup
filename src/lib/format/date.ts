import { COMPETITION_TIME_ZONE } from '../domain/time';

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

const calendarDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  weekday: 'long',
});

const timestampDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: COMPETITION_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: COMPETITION_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function calendarDate(date: string): Date | null {
  const match = dateOnlyPattern.exec(date);
  if (match === null) return null;

  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function timestamp(iso: string): Date | null {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Data de calendário (AAAA-MM-DD) no formato 24/11/2026. */
export function formatDate(date: string): string {
  const parsed = calendarDate(date);
  return parsed === null ? '' : calendarDateFormatter.format(parsed);
}

/** Dia da semana por extenso, como "terça-feira". */
export function formatWeekday(date: string): string {
  const parsed = calendarDate(date);
  return parsed === null ? '' : weekdayFormatter.format(parsed);
}

/** Cabeçalho de data por extenso, como "Terça-feira, 24/11/2026". */
export function formatDateHeading(date: string): string {
  const weekday = formatWeekday(date);
  const day = formatDate(date);
  if (weekday === '' || day === '') return day;

  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized}, ${day}`;
}

/** Horário de um timestamp ISO no fuso America/Sao_Paulo, como "19:00". */
export function formatTime(iso: string): string {
  const parsed = timestamp(iso);
  return parsed === null ? '' : timeFormatter.format(parsed);
}

/** Data e hora no fuso America/Sao_Paulo, como "24/11/2026 às 19:00". */
export function formatDateTime(iso: string): string {
  const parsed = timestamp(iso);
  if (parsed === null) return '';
  return `${timestampDateFormatter.format(parsed)} às ${timeFormatter.format(parsed)}`;
}
